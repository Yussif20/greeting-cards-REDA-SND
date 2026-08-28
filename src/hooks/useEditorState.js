import { useCallback, useMemo, useReducer } from "react";
import { layoutFingerprint } from "../lib/draft.js";
import {
  NAME_LAYER,
  JOB_LAYER,
  LOGO_LAYER,
  clampSize,
  clampPosition,
} from "../lib/layers.js";

/**
 * Editor state.
 *
 * Layers are built from the design's `layout`, which stores every position as a
 * fraction of the native image. That is what keeps preview, export and
 * thumbnail in agreement, and it is why Reset can never reproduce the old
 * `{x: 540, y: 540}` bug -- there are no absolute pixel defaults to go stale.
 */

export function buildLayers(design, { name = "", jobTitle = "", brand = null } = {}) {
  const l = design.layout;
  return [
    {
      id: NAME_LAYER,
      type: "text",
      z: 10,
      visible: true,
      locked: false,
      text: name,
      x: l.name.x,
      y: l.name.y,
      size: l.name.size,
      align: l.name.align,
      maxWidth: l.name.maxWidth,
      rotation: 0,
      lineHeight: 1.15,
      dir: "auto",
      weight: 700,
      color: l.defaultColor,
      fontId: l.fontId,
    },
    {
      id: JOB_LAYER,
      type: "text",
      z: 20,
      visible: true,
      locked: false,
      text: jobTitle,
      x: l.jobTitle.x,
      y: l.jobTitle.y,
      size: l.jobTitle.size,
      align: l.jobTitle.align,
      maxWidth: l.jobTitle.maxWidth,
      rotation: 0,
      lineHeight: 1.2,
      dir: "auto",
      weight: 400,
      color: l.jobTitle.color ?? l.defaultColor,
      fontId: l.fontId,
    },
    {
      id: LOGO_LAYER,
      type: "image",
      z: 30,
      // Hidden while the brand logo is baked into the artwork.
      visible: !design.brandBakedIn,
      locked: false,
      src: brand?.logo?.light ?? null,
      aspect: brand?.aspect ?? 4.2,
      x: l.logo.x,
      y: l.logo.y,
      width: l.logo.width,
      rotation: 0,
    },
  ];
}

export function buildInitialState({ design, draft }) {
  const base = {
    layers: buildLayers(design),
    selectedLayerId: NAME_LAYER,
    activeTool: "move",
    brandId: design.brand ?? null,
    fontId: design.layout.fontId,
    color: design.layout.defaultColor,
    past: [],
    future: [],
  };

  if (!draft) return base;

  // Whether the draft's coordinates still describe this design.
  //
  // A draft records where the customer dragged their name, and restoring that
  // is the point of saving one. But an admin can change a design's default
  // layout, and coordinates placed against the old one would then quietly
  // defeat the fix -- for the very people who had used the card enough to save
  // a draft in the first place.
  //
  // So: unchanged layout, restore everything. Changed layout, keep what the
  // customer typed and chose, and take the new geometry. Drafts saved before
  // this field existed have no fingerprint and are treated as stale, which
  // costs one repositioning once and never again.
  const geometryIsCurrent =
    Boolean(draft.layout) && draft.layout === layoutFingerprint(design.layout);

  const CONTENT = ["text", "color", "fontId"];
  const restore = (saved) =>
    geometryIsCurrent
      ? saved
      : Object.fromEntries(Object.entries(saved).filter(([k]) => CONTENT.includes(k)));

  return {
    ...base,
    layers: base.layers.map((layer) => {
      const saved = draft.layers?.[layer.id];
      return saved ? { ...layer, ...restore(saved) } : layer;
    }),
    brandId: draft.brandId ?? base.brandId,
    fontId: draft.fontId ?? base.fontId,
    color: draft.color ?? base.color,
  };
}

const withHistory = (state, next) => ({
  ...next,
  past: [...state.past.slice(-19), { layers: state.layers }],
  future: [],
});

const mapLayer = (state, id, patch) =>
  state.layers.map((l) => (l.id === id ? { ...l, ...patch } : l));

function reducer(state, action) {
  switch (action.type) {
    case "select":
      return { ...state, selectedLayerId: action.id };

    case "tool":
      return { ...state, activeTool: action.tool };

    // Typing must not push a history entry per keystroke.
    case "text":
      return { ...state, layers: mapLayer(state, action.id, { text: action.text }) };

    case "move":
      return {
        ...state,
        layers: mapLayer(state, action.id, {
          x: clampPosition(action.x),
          y: clampPosition(action.y),
        }),
      };

    case "resize":
      return {
        ...state,
        layers: mapLayer(state, action.id, { size: clampSize(action.size) }),
      };

    case "resizeImage":
      return {
        ...state,
        layers: mapLayer(state, action.id, {
          width: Math.min(0.9, Math.max(0.05, action.width)),
        }),
      };

    case "rotate":
      return { ...state, layers: mapLayer(state, action.id, { rotation: action.rotation }) };

    case "patchLayer":
      return withHistory(state, {
        ...state,
        layers: mapLayer(state, action.id, action.patch),
      });

    case "patchMany":
      return withHistory(state, {
        ...state,
        layers: state.layers.map((l) =>
          action.patches[l.id] ? { ...l, ...action.patches[l.id] } : l,
        ),
      });

    case "color":
      return withHistory(state, {
        ...state,
        color: action.color,
        // The job title tracks the name's colour unless it was given its own.
        layers: state.layers.map((l) =>
          l.type === "text" ? { ...l, color: action.color } : l,
        ),
      });

    case "font":
      return withHistory(state, {
        ...state,
        fontId: action.fontId,
        layers: state.layers.map((l) =>
          l.type === "text" ? { ...l, fontId: action.fontId } : l,
        ),
      });

    case "brand":
      return { ...state, brandId: action.brandId };

    case "logoSrc":
      return {
        ...state,
        layers: mapLayer(state, LOGO_LAYER, {
          src: action.src,
          aspect: action.aspect,
        }),
      };

    // Push history so a slider drag records one entry, not one per frame.
    case "commit":
      return withHistory(state, state);

    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        layers: previous.layers,
        past: state.past.slice(0, -1),
        future: [{ layers: state.layers }, ...state.future].slice(0, 20),
      };
    }

    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        ...state,
        layers: next.layers,
        past: [...state.past, { layers: state.layers }],
        future: rest,
      };
    }

    case "reset":
      return buildInitialState({ design: action.design, draft: null });

    default:
      return state;
  }
}

export function useEditorState(design, draft) {
  const [state, dispatch] = useReducer(reducer, { design, draft }, buildInitialState);

  const selectedLayer = useMemo(
    () => state.layers.find((l) => l.id === state.selectedLayerId) ?? null,
    [state.layers, state.selectedLayerId],
  );

  const getLayer = useCallback(
    (id) => state.layers.find((l) => l.id === id) ?? null,
    [state.layers],
  );

  return { state, dispatch, selectedLayer, getLayer };
}
