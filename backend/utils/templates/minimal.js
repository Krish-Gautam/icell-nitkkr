// backend/utils/templates/minimal.js
// Template 2: Clean Minimal — white background, black typography, single accent line
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const meta = {
  name: "minimal",
  description: "Clean minimal certificate — white background, black typography",
};

export async function build({ participantName, eventTitle, date }) {
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Pure white background
  page.drawRectangle({ x:0, y:0, width, height, color: rgb(1, 1, 1) });

  // Single thick top accent bar (black)
  page.drawRectangle({ x:0, y:height-8, width, height:8, color:rgb(0.05,0.05,0.05) });

  // Single thin bottom line
  page.drawRectangle({ x:0, y:0, width, height:3, color:rgb(0.05,0.05,0.05) });

  // Thin left side accent
  page.drawRectangle({ x:0, y:0, width:4, height, color:rgb(0.05,0.05,0.05) });

  // Org name — top left beside the bar
  const orgName = "IIC — NIT KURUKSHETRA";
  page.drawText(orgName, {
    x: 24, y: height - 38,
    size: 10, font: fontBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Date — top right
  const dateStr  = date;
  const dateStrW = fontRegular.widthOfTextAtSize(dateStr, 10);
  page.drawText(dateStr, {
    x: width - dateStrW - 24, y: height - 38,
    size: 10, font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Thin horizontal divider under header area
  page.drawLine({
    start:{x:24,y:height-50}, end:{x:width-24,y:height-50},
    thickness:0.5, color:rgb(0.85,0.85,0.85),
  });

  // "CERTIFICATE" — huge light grey watermark style word
  const bgWord  = "CERTIFICATE";
  const bgWordW = fontBold.widthOfTextAtSize(bgWord, 90);
  page.drawText(bgWord, {
    x:(width-bgWordW)/2, y:height*0.38,
    size:90, font:fontBold,
    color:rgb(0.94,0.94,0.94),
    opacity:1,
  });

  // "of Participation" — centered, medium
  const subHead  = "of Participation";
  const subHeadW = fontRegular.widthOfTextAtSize(subHead, 20);
  page.drawText(subHead, {
    x:(width-subHeadW)/2, y:height*0.76,
    size:20, font:fontRegular,
    color:rgb(0.4,0.4,0.4),
  });

  // "This is to proudly certify that"
  const certify  = "This is to proudly certify that";
  const certifyW = fontItalic.widthOfTextAtSize(certify, 13);
  page.drawText(certify, {
    x:(width-certifyW)/2, y:height*0.64,
    size:13, font:fontItalic,
    color:rgb(0.5,0.5,0.5),
  });

  // Participant name — very large, bold, black
  const nameSize = 44;
  const nameW    = fontBold.widthOfTextAtSize(participantName, nameSize);
  page.drawText(participantName, {
    x:(width-nameW)/2, y:height*0.515,
    size:nameSize, font:fontBold,
    color:rgb(0.05,0.05,0.05),
  });

  // Single clean underline under name (black, short)
  page.drawLine({
    start:{x:width*0.3,y:height*0.500}, end:{x:width*0.7,y:height*0.500},
    thickness:1.5, color:rgb(0.05,0.05,0.05),
  });

  // "has successfully participated in"
  const hasText  = "has successfully participated in";
  const hasTextW = fontRegular.widthOfTextAtSize(hasText, 13);
  page.drawText(hasText, {
    x:(width-hasTextW)/2, y:height*0.41,
    size:13, font:fontRegular,
    color:rgb(0.5,0.5,0.5),
  });

  // Event title — bold, slightly smaller
  const titleSize = 18;
  const titleW    = fontBold.widthOfTextAtSize(eventTitle, titleSize);
  page.drawText(eventTitle, {
    x:(width-titleW)/2, y:height*0.355,
    size:titleSize, font:fontBold,
    color:rgb(0.1,0.1,0.1),
  });

  // "organised by IIC NIT Kurukshetra"
  const orgBy  = "organised by IIC — NIT Kurukshetra";
  const orgByW = fontRegular.widthOfTextAtSize(orgBy, 11);
  page.drawText(orgBy, {
    x:(width-orgByW)/2, y:height*0.285,
    size:11, font:fontRegular,
    color:rgb(0.55,0.55,0.55),
  });

  // Bottom divider
  page.drawLine({
    start:{x:24,y:height*0.19}, end:{x:width-24,y:height*0.19},
    thickness:0.5, color:rgb(0.85,0.85,0.85),
  });

  // Signature line (right)
  page.drawLine({
    start:{x:width*0.62,y:height*0.145}, end:{x:width*0.88,y:height*0.145},
    thickness:0.8, color:rgb(0.3,0.3,0.3),
  });
  const sigText  = "Authorised Signatory";
  const sigTextW = fontRegular.widthOfTextAtSize(sigText, 9);
  const sigCX    = (width*0.62 + width*0.88)/2;
  page.drawText(sigText, {
    x:sigCX-sigTextW/2, y:height*0.115,
    size:9, font:fontRegular,
    color:rgb(0.5,0.5,0.5),
  });

  return Buffer.from(await pdfDoc.save());
}