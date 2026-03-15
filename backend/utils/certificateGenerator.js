

// // backend/utils/certificateGenerator.js
// import { getTemplate } from "./templates/index.js";

// /**
//  * Generate a certificate PDF buffer for one participant.
//  * Pass template: "default" or any key registered in templates/index.js
//  */
// export async function generateCertificate({
//   participantName,
//   eventTitle,
//   date,
//   template = "default",
// }) {
//   const { build } = getTemplate(template);
//   return build({ participantName, eventTitle, date });
// }





// backend/utils/certificateGenerator.js
// ── Zero design logic here — all templates live in ./templates/ ───────────────
import { getTemplate } from "./templates/index.js";

/**
 * Generate a certificate PDF buffer for a single participant.
 *
 * @param {string} participantName  - Full name printed on the certificate
 * @param {string} eventTitle       - Event name printed on the certificate
 * @param {string} date             - Date string printed on the certificate
 * @param {string} [template]       - Template key: "default" | "minimal" | "dark"
 *                                    Defaults to "default" if not provided or unknown.
 * @returns {Promise<Buffer>}        - PDF as a Node.js Buffer
 */
export async function generateCertificate({ participantName, eventTitle, date, template = "dark" }) {
  const { build } = getTemplate(template);
  return build({ participantName, eventTitle, date });
}