/**
 * BACKUP: Original Logo Colors for Header.jsx
 * Date: August 27, 2025
 *
 * Original colors before Saudi National Day theme update:
 * - Red stripe: #ee2e3a (className="[data-color='1'] dark:fill-white")
 * - Blue text: #243e87 (className="[data-color='2'] dark:fill-white")
 *
 * TO RESTORE ORIGINAL COLORS, replace in Header.jsx:
 *
 * 1. Find this line:
 *    className="[data-color='1'] fill-[#1a3d1a] dark:fill-white"
 *    fill="#1a3d1a"
 *
 *    Replace with:
 *    className="[data-color='1'] dark:fill-white"
 *    fill="#ee2e3a"
 *
 * 2. Find all instances of:
 *    className="[data-color='2'] fill-[#2d5a2d] dark:fill-white"
 *    fill="#2d5a2d"
 *
 *    Replace with:
 *    className="[data-color='2'] dark:fill-white"
 *    fill="#243e87"
 *
 * QUICK RESTORE COMMANDS:
 *
 * cd "d:\clients\faisel\greeting-cards-2.0"
 *
 * # Restore red color
 * sed -i 's/className="\[data-color='\''1'\''\] fill-\[#1a3d1a\] dark:fill-white"/className="[data-color='\''1'\''] dark:fill-white"/g' src/components/Header.jsx
 * sed -i 's/fill="#1a3d1a"/fill="#ee2e3a"/g' src/components/Header.jsx
 *
 * # Restore blue color
 * sed -i 's/className="\[data-color='\''2'\''\] fill-\[#2d5a2d\] dark:fill-white"/className="[data-color='\''2'\''] dark:fill-white"/g' src/components/Header.jsx
 * sed -i 's/fill="#2d5a2d"/fill="#243e87"/g' src/components/Header.jsx
 */

// Original Logo Component with ORIGINAL COLORS (for reference only - DO NOT USE)
const OriginalLogo = ({ className, ariaLabel }) => (
  <svg
    preserveAspectRatio="xMidYMid meet"
    data-bbox="159.96 404.44 275.35 43.99"
    viewBox="159.96 404.44 275.35 43.99"
    xmlns="http://www.w3.org/2000/svg"
    data-type="color"
    role="presentation"
    aria-hidden="true"
    aria-label={ariaLabel}
    className={className}
  >
    <g>
      {/* ORIGINAL RED COLOR: #ee2e3a */}
      <path
        className="[data-color='1'] dark:fill-white"
        fill="#ee2e3a"
        d="M271.79 438.93v9.46H159.96v-9.46h111.83z"
        data-color="1"
      />
      {/* ORIGINAL BLUE COLOR: #243e87 */}
      <path
        className="[data-color='2'] dark:fill-white"
        fill="#243e87"
        d="M167.88 432.28H160v-27.83h13.79c2.33 0 4.24.34 5.72 1.02 1.48.68 2.55 1.56 3.21 2.65.66 1.09.99 2.27.99 3.54 0 .99-.22 1.93-.67 2.84-.45.91-1.11 1.69-2 2.34-.88.65-1.91 1.07-3.08 1.28l7.4 14.17h-8.86l-7.96-15.03h3.07c1.44 0 2.58-.55 3.44-1.64.86-1.1 1.29-2.41 1.29-3.95 0-1-.19-1.93-.58-2.8-.38-.86-.93-1.55-1.65-2.07-.72-.51-1.55-.77-2.5-.77h-3.75v26.25z"
        data-color="2"
      />
      {/* Continue with all other paths using #243e87 fill... */}
    </g>
  </svg>
);

export { OriginalLogo };
