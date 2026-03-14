


// backend/routes/eventsRoutes.js
import { Router } from "express";
import multer from "multer";

import verifyUser from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  listParticipants,
  addParticipant,
  removeParticipant,
  uploadCertificate,
  myCertificate,
  checkMyCertificate,
  generateCertificates,
  sendCertificates,
  revokeCertificates,
  importParticipants,
} from "../controllers/eventsController.js";

const router = Router();
const memory = multer.memoryStorage();

// PDF — 10 MB
const uploadPdf = multer({
  storage: memory,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    file.mimetype === "application/pdf" ? cb(null, true) : cb(new Error("Only PDF files are allowed."));
  },
});

// Image — 6 MB
const uploadImage = multer({
  storage: memory,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only image files are allowed."));
  },
});

// CSV — 2 MB
const uploadCsv = multer({
  storage: memory,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = file.mimetype === "text/csv" || file.originalname.endsWith(".csv");
    ok ? cb(null, true) : cb(new Error("Only CSV files are allowed."));
  },
});

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/",    listEvents);
router.get("/:id", getEvent);

// ── Student — MUST be before /:id so Express won't treat these as event ids ──
router.get("/:eventId/my-certificate",       verifyUser, myCertificate);
router.get("/:eventId/check-my-certificate", verifyUser, checkMyCertificate);

// ── Admin – Events CRUD ───────────────────────────────────────────────────────
router.post("/",      verifyUser, isAdmin, createEvent);
router.put("/:id",    verifyUser, isAdmin, updateEvent);
router.delete("/:id", verifyUser, isAdmin, deleteEvent);

// ── Admin – Upload event image ────────────────────────────────────────────────
router.post("/:id/image", verifyUser, isAdmin, uploadImage.single("image"), uploadEventImage);

// ── Admin – Participants ──────────────────────────────────────────────────────
router.get("/:eventId/participants",                   verifyUser, isAdmin, listParticipants);
router.post("/:eventId/participants",                  verifyUser, isAdmin, addParticipant);
router.delete("/:eventId/participants/:participantId", verifyUser, isAdmin, removeParticipant);

// ── Admin – Single certificate upload (manual) ────────────────────────────────
router.post(
  "/:eventId/participants/:participantId/certificate",
  verifyUser, isAdmin,
  uploadPdf.single("certificate"),
  uploadCertificate,
);

// ── Admin – CSV import ────────────────────────────────────────────────────────
router.post(
  "/:eventId/import-participants",
  verifyUser, isAdmin,
  uploadCsv.single("csv"),
  importParticipants,
);

// ── Admin – Bulk certificate generation ──────────────────────────────────────
router.post("/:eventId/generate-certificates", verifyUser, isAdmin, generateCertificates);

// ── Admin – Send (publish) / Revoke (unpublish) certificates ─────────────────
router.post("/:eventId/send-certificates",   verifyUser, isAdmin, sendCertificates);
router.post("/:eventId/revoke-certificates", verifyUser, isAdmin, revokeCertificates);

export default router;