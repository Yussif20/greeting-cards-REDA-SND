import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

/**
 * Refuse to build if the key destined for the browser is a service-role key.
 *
 * A service-role JWT bypasses row level security entirely. Shipping one in the
 * bundle would hand every visitor full write access to the client's content,
 * and nothing about the running app would look wrong. The two keys are similar
 * strings sitting next to each other in the Supabase dashboard, so this is a
 * realistic paste error with an unrecoverable blast radius -- worth ten lines.
 */
function assertNotServiceRoleKey(key) {
  if (!key) return;
  try {
    const payload = JSON.parse(
      Buffer.from(key.split(".")[1], "base64url").toString("utf8"),
    );
    if (payload.role === "service_role") {
      throw new Error(
        "VITE_SUPABASE_ANON_KEY is a SERVICE ROLE key. It bypasses row level " +
          "security and must never reach the browser. Use the anon/publishable key.",
      );
    }
  } catch (err) {
    // Only re-throw our own verdict. An unparseable key is not proof of
    // anything -- Supabase also issues non-JWT publishable keys.
    if (err instanceof Error && err.message.includes("SERVICE ROLE")) throw err;
  }
}

/**
 * Stand in for the host's /media/* proxy during dev and preview.
 *
 * In production Netlify (or Vercel) rewrites /media/* onto Supabase Storage.
 * Locally there is no such host, so without this every uploaded image and the
 * registry snapshot itself would 404 -- and, worse, the obvious workaround of
 * pointing straight at supabase.co would make local images cross-origin while
 * production images are same-origin. Canvas tainting is precisely the thing
 * that would then behave differently in dev than in the deployed app, which is
 * the one bug class we cannot afford to only discover after shipping.
 *
 * Mirroring the rewrite here keeps both environments the same shape.
 */
const mediaProxy = (supabaseUrl) =>
  supabaseUrl
    ? {
        "/media": {
          target: supabaseUrl,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/media/, "/storage/v1/object/public/media"),
        },
      }
    : undefined;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  assertNotServiceRoleKey(env.VITE_SUPABASE_ANON_KEY);

  const proxy = mediaProxy(env.SUPABASE_URL);

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
  };
});
