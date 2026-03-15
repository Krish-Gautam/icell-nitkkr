// backend/utils/templates/dark.js
// Template 3: Dark Professional — dark background, gold/white text
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const meta = {
  name: "dark",
  description: "Dark professional certificate — navy background, gold accents",
};

export async function build({ participantName, eventTitle, date }) {
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Dark navy background
  page.drawRectangle({ x:0, y:0, width, height, color:rgb(0.07,0.09,0.16) });

  // Slightly lighter inner area
  page.drawRectangle({
    x:18, y:18, width:width-36, height:height-36,
    color:rgb(0.09,0.11,0.20),
  });

  // Gold top border bar
  page.drawRectangle({ x:0, y:height-10, width, height:10, color:rgb(0.72,0.58,0.22) });

  // Gold bottom border bar
  page.drawRectangle({ x:0, y:0, width, height:10, color:rgb(0.72,0.58,0.22) });

  // Gold left stripe
  page.drawRectangle({ x:0, y:0, width:6, height, color:rgb(0.72,0.58,0.22) });

  // Gold right stripe
  page.drawRectangle({ x:width-6, y:0, width:6, height, color:rgb(0.72,0.58,0.22) });

  // Corner squares (gold)
  for (const [x, y] of [[18,18],[width-36,18],[18,height-36],[width-36,height-36]])
    page.drawRectangle({ x, y, width:18, height:18, color:rgb(0.72,0.58,0.22) });

  // Subtle diagonal lines pattern in corners (decorative)
  for (let i = 0; i < 5; i++) {
    page.drawLine({
      start:{x:42+i*6,y:height-18}, end:{x:18,y:height-42-i*6},
      thickness:0.3, color:rgb(0.72,0.58,0.22),
    });
    page.drawLine({
      start:{x:width-42-i*6,y:18}, end:{x:width-18,y:42+i*6},
      thickness:0.3, color:rgb(0.72,0.58,0.22),
    });
  }

  // Org name — top center in gold
  const orgName = "IIC — NIT KURUKSHETRA";
  const orgW    = fontBold.widthOfTextAtSize(orgName, 11);
  page.drawText(orgName, {
    x:(width-orgW)/2, y:height-48,
    size:11, font:fontBold,
    color:rgb(0.72,0.58,0.22),
  });

  // Thin gold horizontal rule
  page.drawLine({
    start:{x:width*0.2,y:height-58}, end:{x:width*0.8,y:height-58},
    thickness:0.6, color:rgb(0.72,0.58,0.22),
  });

  // "CERTIFICATE OF PARTICIPATION" — white, large
  const heading = "CERTIFICATE OF PARTICIPATION";
  const headW   = fontBold.widthOfTextAtSize(heading, 28);
  page.drawText(heading, {
    x:(width-headW)/2, y:height-100,
    size:28, font:fontBold,
    color:rgb(1,1,1),
  });

  // Gold double rule under heading
  page.drawLine({ start:{x:width*0.15,y:height-113}, end:{x:width*0.85,y:height-113}, thickness:1, color:rgb(0.72,0.58,0.22) });
  page.drawLine({ start:{x:width*0.22,y:height-117}, end:{x:width*0.78,y:height-117}, thickness:0.3, color:rgb(0.72,0.58,0.22) });

  // "This is to certify that" — light grey italic
  const certify  = "This is to certify that";
  const certifyW = fontItalic.widthOfTextAtSize(certify, 14);
  page.drawText(certify, {
    x:(width-certifyW)/2, y:height-165,
    size:14, font:fontItalic,
    color:rgb(0.65,0.65,0.75),
  });

  // Participant name — large gold
  const nameSize = 42;
  const nameW    = fontBold.widthOfTextAtSize(participantName, nameSize);
  page.drawText(participantName, {
    x:(width-nameW)/2, y:height*0.528,
    size:nameSize, font:fontBold,
    color:rgb(0.92,0.78,0.42),
  });

  // Gold underline under name
  page.drawLine({
    start:{x:(width-nameW)/2,        y:height*0.517},
    end:  {x:(width-nameW)/2+nameW,  y:height*0.517},
    thickness:1.2, color:rgb(0.72,0.58,0.22),
  });

  // "has successfully participated in" — white
  const hasText  = "has successfully participated in";
  const hasTextW = fontItalic.widthOfTextAtSize(hasText, 13);
  page.drawText(hasText, {
    x:(width-hasTextW)/2, y:height*0.41,
    size:13, font:fontItalic,
    color:rgb(0.75,0.75,0.85),
  });

  // Event title — white bold
  const titleSize = 18;
  const titleW    = fontBold.widthOfTextAtSize(eventTitle, titleSize);
  page.drawText(eventTitle, {
    x:(width-titleW)/2, y:height*0.358,
    size:titleSize, font:fontBold,
    color:rgb(1,1,1),
  });

  // Thin gold rule under event title
  page.drawLine({
    start:{x:(width-titleW)/2,       y:height*0.345},
    end:  {x:(width-titleW)/2+titleW,y:height*0.345},
    thickness:0.7, color:rgb(0.72,0.58,0.22),
  });

  // "organised by" — muted
  const orgBy  = "organised by IIC — NIT Kurukshetra";
  const orgByW = fontItalic.widthOfTextAtSize(orgBy, 11);
  page.drawText(orgBy, {
    x:(width-orgByW)/2, y:height*0.285,
    size:11, font:fontItalic,
    color:rgb(0.55,0.55,0.65),
  });

  // Bottom divider
  page.drawLine({
    start:{x:width*0.18,y:height*0.205}, end:{x:width*0.82,y:height*0.205},
    thickness:0.5, color:rgb(0.3,0.32,0.5),
  });

  // Date (left) — gold
  const dateCenter = (width*0.14 + width*0.38)/2;
  page.drawLine({
    start:{x:width*0.14,y:height*0.158}, end:{x:width*0.38,y:height*0.158},
    thickness:0.8, color:rgb(0.72,0.58,0.22),
  });
  const dateStr  = `Date: ${date}`;
  const dateStrW = fontRegular.widthOfTextAtSize(dateStr, 10);
  page.drawText(dateStr, {
    x:dateCenter-dateStrW/2, y:height*0.172,
    size:10, font:fontRegular,
    color:rgb(0.8,0.8,0.9),
  });
  const dateLbl  = "Date";
  const dateLblW = fontRegular.widthOfTextAtSize(dateLbl, 9);
  page.drawText(dateLbl, {
    x:dateCenter-dateLblW/2, y:height*0.128,
    size:9, font:fontRegular,
    color:rgb(0.5,0.5,0.6),
  });

  // Signature (right) — gold line
  const sigCenter = (width*0.62 + width*0.86)/2;
  page.drawLine({
    start:{x:width*0.62,y:height*0.158}, end:{x:width*0.86,y:height*0.158},
    thickness:0.8, color:rgb(0.72,0.58,0.22),
  });
  const sigText  = "Authorised Signatory";
  const sigTextW = fontRegular.widthOfTextAtSize(sigText, 9);
  page.drawText(sigText, {
    x:sigCenter-sigTextW/2, y:height*0.128,
    size:9, font:fontRegular,
    color:rgb(0.5,0.5,0.6),
  });

  return Buffer.from(await pdfDoc.save());
}