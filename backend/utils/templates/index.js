// // backend/utils/templates/index.js
// import { build as buildDefault, meta as metaDefault } from "./default.js";

// // ─────────────────────────────────────────────────────────────────────────────
// // TEMPLATE REGISTRY
// // To add a new certificate design in future:
// //   1. Create  backend/utils/templates/yourname.js  (must export build + meta)
// //   2. Import it below and add ONE line to the TEMPLATES object
// //   3. That's it — nothing else in the codebase needs to change
// // ─────────────────────────────────────────────────────────────────────────────

// const TEMPLATES = {
//   default: { build: buildDefault, meta: metaDefault },
//   // example of future entry:
//   // minimal: { build: buildMinimal, meta: metaMinimal },
// };

// export function getTemplate(name = "default") {
//   return TEMPLATES[name] ?? TEMPLATES["default"];
// }

// export function listTemplates() {
//   return Object.entries(TEMPLATES).map(([key, { meta }]) => ({ key, ...meta }));
// }







// backend/utils/templates/index.js
// ── Template Registry ─────────────────────────────────────────────────────────
// To add a new template in future:
//   1. Create  backend/utils/templates/yourname.js  (export build + meta)
//   2. Add one import line below
//   3. Add one entry to TEMPLATES map
//   That's it — nothing else in the codebase needs to change.
// ─────────────────────────────────────────────────────────────────────────────

import { build as buildDefault, meta as metaDefault } from "./default.js";
import { build as buildMinimal, meta as metaMinimal } from "./minimal.js";
import { build as buildDark,    meta as metaDark    } from "./dark.js";

const TEMPLATES = {
  default: { build: buildDefault, meta: metaDefault },
  minimal: { build: buildMinimal, meta: metaMinimal },
  dark:    { build: buildDark,    meta: metaDark    },
};

/**
 * Get a template builder by name.
 * Falls back to "default" if the name is not found.
 */
export function getTemplate(name = "dark") {
  return TEMPLATES[name] ?? TEMPLATES["dark"];
}

/**
 * List all available templates — useful for admin UI or API response.
 */
export function listTemplates() {
  return Object.entries(TEMPLATES).map(([key, { meta }]) => ({ key, ...meta }));
}