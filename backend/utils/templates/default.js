// // backend/utils/templates/default.js
// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// export const meta = {
//   name: "default",
//   description: "IIC NITKR gold border certificate",
// };

// export async function build({ participantName, eventTitle, date }) {
//   const pdfDoc = await PDFDocument.create();
//   const page   = pdfDoc.addPage([842, 595]);
//   const { width, height } = page.getSize();

//   const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//   const fontItalic  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
//   const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   // Background
//   page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.988, 0.976, 0.945) });

//   // Gold edge strips
//   for (const rect of [
//     { x: 0,          y: height - 12, width,     height: 12 },
//     { x: 0,          y: 0,           width,     height: 12 },
//     { x: 0,          y: 0,           width: 12, height      },
//     { x: width - 12, y: 0,           width: 12, height      },
//   ]) page.drawRectangle({ ...rect, color: rgb(0.55, 0.42, 0.15) });

//   // Outer border
//   page.drawRectangle({
//     x: 20, y: 20, width: width - 40, height: height - 40,
//     borderColor: rgb(0.72, 0.58, 0.22), borderWidth: 2.5,
//     color: rgb(0.988, 0.976, 0.945),
//   });

//   // Inner border
//   page.drawRectangle({
//     x: 30, y: 30, width: width - 60, height: height - 60,
//     borderColor: rgb(0.72, 0.58, 0.22), borderWidth: 0.75,
//     color: rgb(0.988, 0.976, 0.945),
//   });

//   // Corner ornaments
//   for (const [x, y] of [
//     [38, 38], [width - 38, 38], [38, height - 38], [width - 38, height - 38],
//   ]) page.drawCircle({ x, y, size: 3.5, color: rgb(0.72, 0.58, 0.22) });

//   // Org name
//   const orgName = "IIC — NIT KURUKSHETRA";
//   const orgW    = fontBold.widthOfTextAtSize(orgName, 11);
//   page.drawText(orgName, {
//     x: (width - orgW) / 2, y: height - 52,
//     size: 11, font: fontBold, color: rgb(0.55, 0.42, 0.15),
//   });

//   // Main heading
//   const heading = "CERTIFICATE OF PARTICIPATION";
//   const headW   = fontBold.widthOfTextAtSize(heading, 30);
//   page.drawText(heading, {
//     x: (width - headW) / 2, y: height - 105,
//     size: 30, font: fontBold, color: rgb(0.35, 0.25, 0.05),
//   });

//   // Gold rules under heading
//   page.drawLine({ start: { x: width * 0.15, y: height - 118 }, end: { x: width * 0.85, y: height - 118 }, thickness: 1.2, color: rgb(0.72, 0.58, 0.22) });
//   page.drawLine({ start: { x: width * 0.20, y: height - 122 }, end: { x: width * 0.80, y: height - 122 }, thickness: 0.4, color: rgb(0.72, 0.58, 0.22) });

//   // "This is to certify that"
//   const certify = "This is to certify that";
//   const certW   = fontItalic.widthOfTextAtSize(certify, 15);
//   page.drawText(certify, {
//     x: (width - certW) / 2, y: height - 175,
//     size: 15, font: fontItalic, color: rgb(0.4, 0.4, 0.4),
//   });

//   // Participant name
//   const nameW = fontBold.widthOfTextAtSize(participantName, 40);
//   page.drawText(participantName, {
//     x: (width - nameW) / 2, y: height * 0.535,
//     size: 40, font: fontBold, color: rgb(0.12, 0.10, 0.06),
//   });
//   page.drawLine({
//     start: { x: (width - nameW) / 2,           y: height * 0.525 },
//     end:   { x: (width - nameW) / 2 + nameW,   y: height * 0.525 },
//     thickness: 1, color: rgb(0.72, 0.58, 0.22),
//   });

//   // "has successfully participated in"
//   const hasText = "has successfully participated in";
//   const hasW    = fontItalic.widthOfTextAtSize(hasText, 14);
//   page.drawText(hasText, {
//     x: (width - hasW) / 2, y: height * 0.415,
//     size: 14, font: fontItalic, color: rgb(0.4, 0.4, 0.4),
//   });

//   // Event title
//   const titleW = fontBold.widthOfTextAtSize(eventTitle, 17);
//   page.drawText(eventTitle, {
//     x: (width - titleW) / 2, y: height * 0.372,
//     size: 17, font: fontBold, color: rgb(0.2, 0.16, 0.05),
//   });
//   page.drawLine({
//     start: { x: (width - titleW) / 2,         y: height * 0.360 },
//     end:   { x: (width - titleW) / 2 + titleW, y: height * 0.360 },
//     thickness: 0.8, color: rgb(0.72, 0.58, 0.22),
//   });

//   // "organised by"
//   const orgBy  = "organised by IIC — NIT Kurukshetra";
//   const orgByW = fontItalic.widthOfTextAtSize(orgBy, 12);
//   page.drawText(orgBy, {
//     x: (width - orgByW) / 2, y: height * 0.3,
//     size: 12, font: fontItalic, color: rgb(0.5, 0.45, 0.3),
//   });

//   // Middle divider
//   page.drawLine({
//     start: { x: width * 0.3, y: height * 0.255 },
//     end:   { x: width * 0.7, y: height * 0.255 },
//     thickness: 0.6, color: rgb(0.72, 0.58, 0.22),
//   });

//   // Date — left side
//   const dateCenter = (width * 0.12 + width * 0.36) / 2;
//   page.drawLine({ start: { x: width * 0.12, y: height * 0.16 }, end: { x: width * 0.36, y: height * 0.16 }, thickness: 0.8, color: rgb(0.6, 0.6, 0.6) });
//   const dateStr  = `Date: ${date}`;
//   const dateStrW = fontRegular.widthOfTextAtSize(dateStr, 11);
//   page.drawText(dateStr, { x: dateCenter - dateStrW / 2, y: height * 0.175, size: 11, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
//   const dateLbl  = "Date";
//   const dateLblW = fontRegular.widthOfTextAtSize(dateLbl, 10);
//   page.drawText(dateLbl, { x: dateCenter - dateLblW / 2, y: height * 0.135, size: 10, font: fontRegular, color: rgb(0.55, 0.55, 0.55) });

//   // Signature — right side
//   const sigCenter = (width * 0.64 + width * 0.88) / 2;
//   page.drawLine({ start: { x: width * 0.64, y: height * 0.16 }, end: { x: width * 0.88, y: height * 0.16 }, thickness: 0.8, color: rgb(0.6, 0.6, 0.6) });
//   const sigText  = "Authorised Signatory";
//   const sigTextW = fontRegular.widthOfTextAtSize(sigText, 10);
//   page.drawText(sigText, { x: sigCenter - sigTextW / 2, y: height * 0.135, size: 10, font: fontRegular, color: rgb(0.55, 0.55, 0.55) });

//   return Buffer.from(await pdfDoc.save());
// }












// backend/utils/templates/default.js
// Template 1: IIC NITKR Gold Border Certificate
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const meta = {
  name: "default",
  description: "IIC NITKR classic gold border certificate",
};

export async function build({ participantName, eventTitle, date }) {
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Background — warm off-white
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.988, 0.976, 0.945) });

  // Gold edge strips (top, bottom, left, right)
  for (const rect of [
    { x: 0,          y: height - 12, width,     height: 12 },
    { x: 0,          y: 0,           width,     height: 12 },
    { x: 0,          y: 0,           width: 12, height      },
    { x: width - 12, y: 0,           width: 12, height      },
  ]) page.drawRectangle({ ...rect, color: rgb(0.55, 0.42, 0.15) });

  // Outer gold border
  page.drawRectangle({
    x: 20, y: 20, width: width - 40, height: height - 40,
    borderColor: rgb(0.72, 0.58, 0.22), borderWidth: 2.5,
    color: rgb(0.988, 0.976, 0.945),
  });

  // Inner thin border
  page.drawRectangle({
    x: 30, y: 30, width: width - 60, height: height - 60,
    borderColor: rgb(0.72, 0.58, 0.22), borderWidth: 0.75,
    color: rgb(0.988, 0.976, 0.945),
  });

  // Corner circle ornaments
  for (const [x, y] of [[38,38],[width-38,38],[38,height-38],[width-38,height-38]])
    page.drawCircle({ x, y, size: 3.5, color: rgb(0.72, 0.58, 0.22) });

  // Org name
  const orgName = "IIC — NIT KURUKSHETRA";
  const orgW    = fontBold.widthOfTextAtSize(orgName, 11);
  page.drawText(orgName, { x: (width-orgW)/2, y: height-52, size: 11, font: fontBold, color: rgb(0.55,0.42,0.15) });

  // Main heading
  const heading = "CERTIFICATE OF PARTICIPATION";
  const headW   = fontBold.widthOfTextAtSize(heading, 30);
  page.drawText(heading, { x: (width-headW)/2, y: height-105, size: 30, font: fontBold, color: rgb(0.35,0.25,0.05) });

  // Double gold rule
  page.drawLine({ start:{x:width*0.15,y:height-118}, end:{x:width*0.85,y:height-118}, thickness:1.2, color:rgb(0.72,0.58,0.22) });
  page.drawLine({ start:{x:width*0.20,y:height-122}, end:{x:width*0.80,y:height-122}, thickness:0.4, color:rgb(0.72,0.58,0.22) });

  // "This is to certify that"
  const certify = "This is to certify that";
  const certW   = fontItalic.widthOfTextAtSize(certify, 15);
  page.drawText(certify, { x:(width-certW)/2, y:height-175, size:15, font:fontItalic, color:rgb(0.4,0.4,0.4) });

  // Participant name
  const nameW = fontBold.widthOfTextAtSize(participantName, 40);
  page.drawText(participantName, { x:(width-nameW)/2, y:height*0.535, size:40, font:fontBold, color:rgb(0.12,0.10,0.06) });
  page.drawLine({ start:{x:(width-nameW)/2,y:height*0.525}, end:{x:(width-nameW)/2+nameW,y:height*0.525}, thickness:1, color:rgb(0.72,0.58,0.22) });

  // "has successfully participated in"
  const hasText = "has successfully participated in";
  const hasW    = fontItalic.widthOfTextAtSize(hasText, 14);
  page.drawText(hasText, { x:(width-hasW)/2, y:height*0.415, size:14, font:fontItalic, color:rgb(0.4,0.4,0.4) });

  // Event title
  const titleW = fontBold.widthOfTextAtSize(eventTitle, 17);
  page.drawText(eventTitle, { x:(width-titleW)/2, y:height*0.372, size:17, font:fontBold, color:rgb(0.2,0.16,0.05) });
  page.drawLine({ start:{x:(width-titleW)/2,y:height*0.360}, end:{x:(width-titleW)/2+titleW,y:height*0.360}, thickness:0.8, color:rgb(0.72,0.58,0.22) });

  // "organised by"
  const orgBy  = "organised by IIC — NIT Kurukshetra";
  const orgByW = fontItalic.widthOfTextAtSize(orgBy, 12);
  page.drawText(orgBy, { x:(width-orgByW)/2, y:height*0.3, size:12, font:fontItalic, color:rgb(0.5,0.45,0.3) });

  // Divider
  page.drawLine({ start:{x:width*0.3,y:height*0.255}, end:{x:width*0.7,y:height*0.255}, thickness:0.6, color:rgb(0.72,0.58,0.22) });

  // Date (left)
  const dateCenter = (width*0.12 + width*0.36)/2;
  page.drawLine({ start:{x:width*0.12,y:height*0.16}, end:{x:width*0.36,y:height*0.16}, thickness:0.8, color:rgb(0.6,0.6,0.6) });
  const dateStr  = `Date: ${date}`;
  const dateStrW = fontRegular.widthOfTextAtSize(dateStr, 11);
  page.drawText(dateStr, { x:dateCenter-dateStrW/2, y:height*0.175, size:11, font:fontRegular, color:rgb(0.4,0.4,0.4) });
  const dateLbl  = "Date";
  const dateLblW = fontRegular.widthOfTextAtSize(dateLbl, 10);
  page.drawText(dateLbl, { x:dateCenter-dateLblW/2, y:height*0.135, size:10, font:fontRegular, color:rgb(0.55,0.55,0.55) });

  // Signature (right)
  const sigCenter = (width*0.64 + width*0.88)/2;
  page.drawLine({ start:{x:width*0.64,y:height*0.16}, end:{x:width*0.88,y:height*0.16}, thickness:0.8, color:rgb(0.6,0.6,0.6) });
  const sigText  = "Authorised Signatory";
  const sigTextW = fontRegular.widthOfTextAtSize(sigText, 10);
  page.drawText(sigText, { x:sigCenter-sigTextW/2, y:height*0.135, size:10, font:fontRegular, color:rgb(0.55,0.55,0.55) });

  return Buffer.from(await pdfDoc.save());
}