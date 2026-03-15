

// backend/controllers/eventsController.js
import * as EventsModel from "../models/eventsModel.js";
import { generateCertificate } from "../utils/certificateGenerator.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

// ── Public ────────────────────────────────────────────────────────────────────

export async function listEvents(req, res) {
  try {
    const events = await EventsModel.getAllEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getEvent(req, res) {
  try {
    const event = await EventsModel.getEventById(req.params.id);
    res.json(event);
  } catch (err) {
    res.status(404).json({ error: "Event not found." });
  }
}

// ── Admin – Events CRUD ───────────────────────────────────────────────────────

export async function createEvent(req, res) {
  try {
    const {
      title, subtitle, description, long_description,
      tag, tag_color, accent_color, status, prize_pool,
      format, rounds, duration, venue, tags, image_url,
    } = req.body;

    if (!title) return res.status(400).json({ error: "title is required." });

    const event = await EventsModel.createEvent({
      title, subtitle, description, long_description,
      tag, tag_color, accent_color,
      status: status || "Upcoming",
      prize_pool, format, rounds, duration, venue,
      tags: Array.isArray(tags) ? tags : tags ?? null,
      image_url: image_url ?? null,
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateEvent(req, res) {
  try {
    const event = await EventsModel.updateEvent(req.params.id, req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteEvent(req, res) {
  try {
    await EventsModel.deleteEvent(req.params.id);
    res.json({ message: "Event deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Admin – Upload event image ────────────────────────────────────────────────

export async function uploadEventImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const updatedEvent = await EventsModel.uploadEventImage(
      req.params.id,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Admin – Participants ──────────────────────────────────────────────────────

export async function listParticipants(req, res) {
  try {
    const participants = await EventsModel.getParticipantsByEvent(req.params.eventId);
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addParticipant(req, res) {
  try {
    const { name, email, roll_number, user_id } = req.body;
    if (!name) return res.status(400).json({ error: "name is required." });

    let resolvedUserId = user_id ?? null;
    if (!resolvedUserId && email) {
      resolvedUserId = await EventsModel.findProfileIdByEmail(email);
    }

    const participant = await EventsModel.addParticipant(req.params.eventId, {
      name,
      email,
      roll_number: roll_number ?? null,
      userId: resolvedUserId,
    });

    res.status(201).json(participant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeParticipant(req, res) {
  try {
    await EventsModel.removeParticipant(req.params.participantId);
    res.json({ message: "Participant removed." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Admin – Upload single certificate manually ────────────────────────────────

export async function uploadCertificate(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const participant = await EventsModel.uploadCertificate(
      req.params.participantId,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    res.json(participant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Student – Check certificate availability (lightweight) ───────────────────

export async function checkMyCertificate(req, res) {
  try {
    const { eventId } = req.params;
    const userId      = req.user.id;

    const participant = await EventsModel.checkCertificateAvailability(userId, eventId);

    if (!participant) return res.json({ isParticipant: false, hasCertificate: false, released: false });

    res.json({
      isParticipant:   true,
      hasCertificate:  !!participant.certificate_url,
      released:        !!participant.certificate_url && participant.certificates_sent === true,
      participantName: participant.name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Student – Download certificate ───────────────────────────────────────────

export async function myCertificate(req, res) {
  try {
    const { eventId } = req.params;
    const userId      = req.user.id;

    const participant = await EventsModel.checkCertificateAvailability(userId, eventId);

    if (!participant) {
      return res.status(404).json({ error: "You are not registered for this event." });
    }
    if (!participant.certificate_url) {
      return res.status(404).json({ error: "Certificate not yet generated." });
    }
    if (!participant.certificates_sent) {
      return res.status(403).json({ error: "Certificates have not been released yet." });
    }

    const { signedUrl, fileName } = await EventsModel.getCertificateSignedUrl(participant.id);
    res.json({ signedUrl, fileName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Admin – CSV Participant Import ────────────────────────────────────────────

export async function importParticipants(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No CSV file uploaded." });

    const { eventId } = req.params;
    const rows = [];

    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
        .pipe(csvParser())
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    if (rows.length === 0) {
      return res.status(400).json({ error: "CSV is empty or malformed." });
    }

    const result = await EventsModel.importParticipantsFromCSV(eventId, rows);

    res.json({
      message:  `Import complete. ${result.inserted} inserted, ${result.skipped} skipped.`,
      inserted: result.inserted,
      skipped:  result.skipped,
      errors:   result.errors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Admin – Bulk Certificate Generation ──────────────────────────────────────

export async function generateCertificates(req, res) {
  try {
    const { eventId } = req.params;

    const eventTitle   = await EventsModel.getEventTitleById(eventId);
    const participants = await EventsModel.getParticipantsByEvent(eventId);

    if (participants.length === 0) {
      return res.status(400).json({ error: "No participants found for this event." });
    }

    const date = new Date().toLocaleDateString("en-IN", {
      day:   "2-digit",
      month: "long",
      year:  "numeric",
    });

    const results = { generated: 0, failed: [] };

    for (const participant of participants) {
      try {
        const pdfBuffer = await generateCertificate({
          participantName: participant.name,
          eventTitle,
          date,
        });

        await EventsModel.saveBulkCertificate(
          eventId,
          participant.id,
          pdfBuffer,
          participant.name,
        );

        results.generated++;
      } catch (err) {
        results.failed.push({
          id:    participant.id,
          name:  participant.name,
          error: err.message,
        });
      }
    }

    // If every single participant failed, return 500 with the first error
    // so the frontend knows generation truly failed
    if (results.generated === 0) {
      return res.status(500).json({
        error:   `Certificate generation failed for all participants. First error: ${results.failed[0]?.error ?? "Unknown error"}`,
        failed:  results.failed,
        hint:    "Make sure backend/utils/certificateTemplate.pdf exists.",
      });
    }

    res.json({
      message:   `Generated ${results.generated} of ${participants.length} certificates.`,
      generated: results.generated,
      failed:    results.failed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Admin – Send Certificates (publish) ──────────────────────────────────────

export async function sendCertificates(req, res) {
  try {
    const { eventId } = req.params;
    const result = await EventsModel.markCertificatesSent(eventId);

    res.json({
      message:   `Certificates released to ${result.certCount} participants.`,
      certCount: result.certCount,
      event:     result.event,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ── Admin – Revoke Certificates (unpublish) ───────────────────────────────────

export async function revokeCertificates(req, res) {
  try {
    const { eventId } = req.params;
    const event = await EventsModel.revokeCertificates(eventId);

    res.json({
      message: "Certificates hidden from participants.",
      event,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}