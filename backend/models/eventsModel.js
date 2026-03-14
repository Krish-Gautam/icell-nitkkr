// import supabase from "../services/supabaseClient.js";

// // ── Events ────────────────────────────────────────────────────────────────────

// export async function getAllEvents() {
//   const { data, error } = await supabase
//     .from("events")
//     .select("*")
//     .order("created_at", { ascending: false });
//   if (error) throw error;
//   return data;
// }

// export async function getEventById(id) {
//   const { data, error } = await supabase
//     .from("events")
//     .select("*")
//     .eq("id", id)
//     .single();
//   if (error) throw error;
//   return data;
// }

// export async function createEvent(payload) {
//   // payload: { title, subtitle, description, long_description, tag, tag_color,
//   //            accent_color, status, prize_pool, format, rounds, duration,
//   //            venue, tags, image_url }
//   const { data, error } = await supabase
//     .from("events")
//     .insert([payload])
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }

// export async function updateEvent(id, payload) {
//   const { data, error } = await supabase
//     .from("events")
//     .update(payload)
//     .eq("id", id)
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }

// export async function deleteEvent(id) {
//   const { error } = await supabase.from("events").delete().eq("id", id);
//   if (error) throw error;
// }

// // ── Participants & Certificates ───────────────────────────────────────────────

// export async function getParticipantsByEvent(eventId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("event_id", eventId);
//   if (error) throw error;
//   return data;
// }

// export async function addParticipant(eventId, { name, email, userId }) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .insert([{ event_id: eventId, name, email, user_id: userId ?? null }])
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }

// export async function removeParticipant(participantId) {
//   const { error } = await supabase
//     .from("event_participants")
//     .delete()
//     .eq("id", participantId);
//   if (error) throw error;
// }

// // Upload certificate PDF to Supabase Storage and store the public URL
// export async function uploadCertificate(participantId, fileBuffer, fileName, mimeType) {
//   const storagePath = `certificates/${participantId}/${fileName}`;

//   const { error: uploadError } = await supabase.storage
//     .from("event-assets")
//     .upload(storagePath, fileBuffer, {
//       contentType: mimeType,
//       upsert: true,
//     });
//   if (uploadError) throw uploadError;

//   const { data: urlData } = supabase.storage
//     .from("event-assets")
//     .getPublicUrl(storagePath);

//   const publicUrl = urlData.publicUrl;

//   const { data, error } = await supabase
//     .from("event_participants")
//     .update({ certificate_url: publicUrl, certificate_name: fileName })
//     .eq("id", participantId)
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }

// // Get a participant row by event + user_id (used by students to check their cert)
// export async function getParticipantByUserAndEvent(userId, eventId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("user_id", userId)
//     .eq("event_id", eventId)
//     .single();
//   if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
//   return data ?? null;
// }

// // Get signed (temporary) download URL for a certificate
// export async function getCertificateSignedUrl(participantId) {
//   const { data: participant, error: fetchErr } = await supabase
//     .from("event_participants")
//     .select("certificate_url, certificate_name")
//     .eq("id", participantId)
//     .single();
//   if (fetchErr) throw fetchErr;
//   if (!participant?.certificate_url) throw new Error("No certificate uploaded yet.");

//   // Extract path from public URL
//   const url = new URL(participant.certificate_url);
//   const storagePath = url.pathname.split("/object/public/event-assets/")[1];

//   const { data, error } = await supabase.storage
//     .from("event-assets")
//     .createSignedUrl(storagePath, 60 * 60); // 1-hour expiry
//   if (error) throw error;

//   return { signedUrl: data.signedUrl, fileName: participant.certificate_name };
// }

















// import supabase from "../services/supabaseClient.js";

// const BUCKET = "event-assets";

// // 7 days for event images (public page). Certificates are 1 hour (download).
// const IMAGE_SIGNED_URL_EXP = 60 * 60 * 24 * 7;
// const CERT_SIGNED_URL_EXP = 60 * 60; // 1 hour

// function isHttpUrl(value) {
//   return typeof value === "string" && /^https?:\/\//i.test(value);
// }

// function cleanFileName(name = "file") {
//   return name
//     .replace(/[^\w.\-]+/g, "_")
//     .replace(/_+/g, "_")
//     .slice(0, 120);
// }

// async function signStoragePath(path, expiresIn) {
//   if (!path) return null;
//   if (isHttpUrl(path)) return path; // backwards compatible if you previously stored public URLs

//   const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
//   if (error) throw error;
//   return data.signedUrl;
// }

// // ── Events ────────────────────────────────────────────────────────────────────

// export async function getAllEvents() {
//   const { data, error } = await supabase
//     .from("events")
//     .select("*")
//     .order("created_at", { ascending: false });

//   if (error) throw error;

//   // Replace image_url with a signed URL (no change required on EventsPage.jsx)
//   const signed = await Promise.all(
//     (data ?? []).map(async (e) => {
//       try {
//         const signedUrl = await signStoragePath(e.image_url, IMAGE_SIGNED_URL_EXP);
//         return { ...e, image_url: signedUrl ?? null };
//       } catch {
//         // if file missing / signing fails, keep original
//         return e;
//       }
//     }),
//   );

//   return signed;
// }

// export async function getEventById(id) {
//   const { data, error } = await supabase
//     .from("events")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (error) throw error;

//   // Signed image URL
//   try {
//     const signedUrl = await signStoragePath(data.image_url, IMAGE_SIGNED_URL_EXP);
//     return { ...data, image_url: signedUrl ?? null };
//   } catch {
//     return data;
//   }
// }

// export async function createEvent(payload) {
//   const { data, error } = await supabase
//     .from("events")
//     .insert([payload])
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function updateEvent(id, payload) {
//   const { data, error } = await supabase
//     .from("events")
//     .update(payload)
//     .eq("id", id)
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function deleteEvent(id) {
//   const { error } = await supabase.from("events").delete().eq("id", id);
//   if (error) throw error;
// }

// // Upload event image to Supabase Storage and save *storage path* in events.image_url
// export async function uploadEventImage(eventId, fileBuffer, fileName, mimeType) {
//   const safeName = cleanFileName(fileName);
//   const storagePath = `event-images/${eventId}/${Date.now()}-${safeName}`;

//   const { error: uploadError } = await supabase.storage
//     .from(BUCKET)
//     .upload(storagePath, fileBuffer, {
//       contentType: mimeType,
//       upsert: true,
//     });

//   if (uploadError) throw uploadError;

//   // Store storage path in DB (not a public URL)
//   const { data, error } = await supabase
//     .from("events")
//     .update({ image_url: storagePath })
//     .eq("id", eventId)
//     .select()
//     .single();

//   if (error) throw error;

//   // Return event with signed URL (useful for admin UI immediate update)
//   const signedUrl = await signStoragePath(storagePath, IMAGE_SIGNED_URL_EXP);
//   return { ...data, image_url: signedUrl };
// }

// // ── Participants & Certificates ───────────────────────────────────────────────

// export async function getParticipantsByEvent(eventId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("event_id", eventId)
//     .order("created_at", { ascending: true });

//   if (error) throw error;
//   return data;
// }

// export async function findProfileIdByEmail(email) {
//   if (!email) return null;

//   const { data, error } = await supabase
//     .from("profiles")
//     .select("id")
//     .eq("email", email)
//     .maybeSingle();

//   if (error) throw error;
//   return data?.id ?? null;
// }

// export async function addParticipant(eventId, { name, email, userId }) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .insert([{ event_id: eventId, name, email, user_id: userId ?? null }])
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function removeParticipant(participantId) {
//   const { error } = await supabase
//     .from("event_participants")
//     .delete()
//     .eq("id", participantId);

//   if (error) throw error;
// }

// export async function getParticipantById(participantId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("id", participantId)
//     .single();

//   if (error) throw error;
//   return data;
// }

// // Upload certificate PDF to Supabase Storage and store *storage path* in DB.
// // We enforce: participant must be linked to a user_id, otherwise that user can never download it.
// export async function uploadCertificate(participantId, fileBuffer, fileName, mimeType) {
//   const participant = await getParticipantById(participantId);
//   if (!participant.user_id) {
//     throw new Error("Participant is not linked to a user_id. Add user_id to allow user download.");
//   }

//   const safeName = cleanFileName(fileName);
//   const storagePath = `certificates/${participantId}/${Date.now()}-${safeName}`;

//   const { error: uploadError } = await supabase.storage
//     .from(BUCKET)
//     .upload(storagePath, fileBuffer, {
//       contentType: mimeType,
//       upsert: true,
//     });

//   if (uploadError) throw uploadError;

//   const { data, error } = await supabase
//     .from("event_participants")
//     .update({ certificate_url: storagePath, certificate_name: safeName })
//     .eq("id", participantId)
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// // Student check: get participant row by event + user_id
// export async function getParticipantByUserAndEvent(userId, eventId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("user_id", userId)
//     .eq("event_id", eventId)
//     .maybeSingle();

//   if (error) throw error;
//   return data ?? null;
// }

// // Signed URL for certificate download
// export async function getCertificateSignedUrl(participantId) {
//   const { data: participant, error } = await supabase
//     .from("event_participants")
//     .select("certificate_url, certificate_name")
//     .eq("id", participantId)
//     .single();

//   if (error) throw error;
//   if (!participant?.certificate_url) throw new Error("No certificate uploaded yet.");

//   // certificate_url is now a storage path (or legacy http URL)
//   let storagePath = participant.certificate_url;

//   // legacy support: if it was a public URL, extract path
//   if (isHttpUrl(storagePath)) {
//     const url = new URL(storagePath);
//     storagePath = url.pathname.split(`/object/public/${BUCKET}/`)[1];
//   }

//   const signedUrl = await signStoragePath(storagePath, CERT_SIGNED_URL_EXP);
//   return { signedUrl, fileName: participant.certificate_name };
// }












// import supabase from "../services/supabaseClient.js";

// const BUCKET = "event-assets";

// // 7 days for event images (public page). Certificates are 1 hour (download).
// const IMAGE_SIGNED_URL_EXP = 60 * 60 * 24 * 7;
// const CERT_SIGNED_URL_EXP = 60 * 60; // 1 hour

// function isHttpUrl(value) {
//   return typeof value === "string" && /^https?:\/\//i.test(value);
// }

// function cleanFileName(name = "file") {
//   return name
//     .replace(/[^\w.\-]+/g, "_")
//     .replace(/_+/g, "_")
//     .slice(0, 120);
// }

// async function signStoragePath(path, expiresIn) {
//   if (!path) return null;
//   // backwards compatible if you previously stored public URLs
//   if (isHttpUrl(path)) return path;

//   const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
//   if (error) throw error;
//   return data.signedUrl;
// }

// // ── Events ────────────────────────────────────────────────────────────────────

// export async function getAllEvents() {
//   const { data, error } = await supabase
//     .from("events")
//     .select("*")
//     .order("created_at", { ascending: false });

//   if (error) throw error;

//   // Replace image_url with a signed URL (no change required on EventsPage.jsx)
//   const signed = await Promise.all(
//     (data ?? []).map(async (e) => {
//       try {
//         const signedUrl = await signStoragePath(e.image_url, IMAGE_SIGNED_URL_EXP);
//         return { ...e, image_url: signedUrl ?? null };
//       } catch {
//         // if file missing / signing fails, keep original
//         return e;
//       }
//     }),
//   );

//   return signed;
// }

// export async function getEventById(id) {
//   const { data, error } = await supabase
//     .from("events")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (error) throw error;

//   // Signed image URL
//   try {
//     const signedUrl = await signStoragePath(data.image_url, IMAGE_SIGNED_URL_EXP);
//     return { ...data, image_url: signedUrl ?? null };
//   } catch {
//     return data;
//   }
// }

// export async function createEvent(payload) {
//   const { data, error } = await supabase
//     .from("events")
//     .insert([payload])
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function updateEvent(id, payload) {
//   const { data, error } = await supabase
//     .from("events")
//     .update(payload)
//     .eq("id", id)
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function deleteEvent(id) {
//   const { error } = await supabase.from("events").delete().eq("id", id);
//   if (error) throw error;
// }

// // Upload event image to Supabase Storage and save *storage path* in events.image_url
// export async function uploadEventImage(eventId, fileBuffer, fileName, mimeType) {
//   const safeName = cleanFileName(fileName);
//   const storagePath = `event-images/${eventId}/${Date.now()}-${safeName}`;

//   const { error: uploadError } = await supabase.storage
//     .from(BUCKET)
//     .upload(storagePath, fileBuffer, {
//       contentType: mimeType,
//       upsert: true,
//     });

//   if (uploadError) throw uploadError;

//   // Store storage path in DB (not a public URL)
//   const { data, error } = await supabase
//     .from("events")
//     .update({ image_url: storagePath })
//     .eq("id", eventId)
//     .select()
//     .single();

//   if (error) throw error;

//   // Return event with signed URL (useful for admin UI immediate update)
//   const signedUrl = await signStoragePath(storagePath, IMAGE_SIGNED_URL_EXP);
//   return { ...data, image_url: signedUrl };
// }

// // ── Participants & Certificates ───────────────────────────────────────────────

// export async function getParticipantsByEvent(eventId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("event_id", eventId)
//     .order("created_at", { ascending: true });

//   if (error) throw error;
//   return data;
// }

// export async function findProfileIdByEmail(email) {
//   if (!email) return null;

//   const { data, error } = await supabase
//     .from("profiles")
//     .select("id")
//     .eq("email", email)
//     .maybeSingle();

//   if (error) throw error;
//   return data?.id ?? null;
// }

// export async function addParticipant(eventId, { name, email, userId }) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .insert([{ event_id: eventId, name, email, user_id: userId ?? null }])
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function removeParticipant(participantId) {
//   const { error } = await supabase
//     .from("event_participants")
//     .delete()
//     .eq("id", participantId);

//   if (error) throw error;
// }

// export async function getParticipantById(participantId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("id", participantId)
//     .single();

//   if (error) throw error;
//   return data;
// }

// // Upload certificate PDF to Supabase Storage and store *storage path* in DB.
// // Participant must be linked to a user_id, otherwise that user can never download it.
// export async function uploadCertificate(participantId, fileBuffer, fileName, mimeType) {
//   const participant = await getParticipantById(participantId);
//   if (!participant.user_id) {
//     throw new Error("Participant is not linked to a user_id. Add user_id to allow user download.");
//   }

//   const safeName = cleanFileName(fileName);
//   const storagePath = `certificates/${participantId}/${Date.now()}-${safeName}`;

//   const { error: uploadError } = await supabase.storage
//     .from(BUCKET)
//     .upload(storagePath, fileBuffer, {
//       contentType: mimeType,
//       upsert: true,
//     });

//   if (uploadError) throw uploadError;

//   const { data, error } = await supabase
//     .from("event_participants")
//     .update({ certificate_url: storagePath, certificate_name: safeName })
//     .eq("id", participantId)
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// // Student check: get participant row by event + user_id
// export async function getParticipantByUserAndEvent(userId, eventId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("user_id", userId)
//     .eq("event_id", eventId)
//     .maybeSingle();

//   if (error) throw error;
//   return data ?? null;
// }

// // Signed URL for certificate download
// export async function getCertificateSignedUrl(participantId) {
//   const { data: participant, error } = await supabase
//     .from("event_participants")
//     .select("certificate_url, certificate_name")
//     .eq("id", participantId)
//     .single();

//   if (error) throw error;
//   if (!participant?.certificate_url) throw new Error("No certificate uploaded yet.");

//   let storagePath = participant.certificate_url;

//   // Legacy support: if it was a public URL, extract path
//   if (isHttpUrl(storagePath)) {
//     const url = new URL(storagePath);
//     storagePath = url.pathname.split(`/object/public/${BUCKET}/`)[1];
//   }

//   const signedUrl = await signStoragePath(storagePath, CERT_SIGNED_URL_EXP);
//   return { signedUrl, fileName: participant.certificate_name };
// }







// // backend/models/eventsModel.js
// import supabase from "../services/supabaseClient.js";

// const BUCKET = "event-assets";
// const IMAGE_SIGNED_URL_EXP = 60 * 60 * 24 * 7; // 7 days
// const CERT_SIGNED_URL_EXP  = 60 * 60;           // 1 hour

// function isHttpUrl(value) {
//   return typeof value === "string" && /^https?:\/\//i.test(value);
// }

// function cleanFileName(name = "file") {
//   return name
//     .replace(/[^\w.\-]+/g, "_")
//     .replace(/_+/g, "_")
//     .slice(0, 120);
// }

// async function signStoragePath(path, expiresIn) {
//   if (!path) return null;
//   if (isHttpUrl(path)) return path;

//   const { data, error } = await supabase.storage
//     .from(BUCKET)
//     .createSignedUrl(path, expiresIn);

//   if (error) throw error;
//   return data.signedUrl;
// }

// // ── Events ────────────────────────────────────────────────────────────────────

// export async function getAllEvents() {
//   const { data, error } = await supabase
//     .from("events")
//     .select("*")
//     .order("created_at", { ascending: false });

//   if (error) throw error;

//   const signed = await Promise.all(
//     (data ?? []).map(async (e) => {
//       try {
//         const signedUrl = await signStoragePath(e.image_url, IMAGE_SIGNED_URL_EXP);
//         return { ...e, image_url: signedUrl ?? null };
//       } catch {
//         return e;
//       }
//     }),
//   );

//   return signed;
// }

// export async function getEventById(id) {
//   const { data, error } = await supabase
//     .from("events")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (error) throw error;

//   try {
//     const signedUrl = await signStoragePath(data.image_url, IMAGE_SIGNED_URL_EXP);
//     return { ...data, image_url: signedUrl ?? null };
//   } catch {
//     return data;
//   }
// }

// export async function createEvent(payload) {
//   const { data, error } = await supabase
//     .from("events")
//     .insert([payload])
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function updateEvent(id, payload) {
//   const { data, error } = await supabase
//     .from("events")
//     .update(payload)
//     .eq("id", id)
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function deleteEvent(id) {
//   const { error } = await supabase.from("events").delete().eq("id", id);
//   if (error) throw error;
// }

// export async function uploadEventImage(eventId, fileBuffer, fileName, mimeType) {
//   const safeName    = cleanFileName(fileName);
//   const storagePath = `event-images/${eventId}/${Date.now()}-${safeName}`;

//   const { error: uploadError } = await supabase.storage
//     .from(BUCKET)
//     .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

//   if (uploadError) throw uploadError;

//   const { data, error } = await supabase
//     .from("events")
//     .update({ image_url: storagePath })
//     .eq("id", eventId)
//     .select()
//     .single();

//   if (error) throw error;

//   const signedUrl = await signStoragePath(storagePath, IMAGE_SIGNED_URL_EXP);
//   return { ...data, image_url: signedUrl };
// }

// // ── Participants ──────────────────────────────────────────────────────────────

// export async function getParticipantsByEvent(eventId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("event_id", eventId)
//     .order("created_at", { ascending: true });

//   if (error) throw error;
//   return data;
// }

// export async function findProfileIdByEmail(email) {
//   if (!email) return null;

//   const { data, error } = await supabase
//     .from("profiles")
//     .select("id")
//     .eq("email", email)
//     .maybeSingle();

//   if (error) throw error;
//   return data?.id ?? null;
// }

// export async function addParticipant(eventId, { name, email, roll_number, userId }) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .insert([{
//       event_id:    eventId,
//       name,
//       email,
//       roll_number: roll_number ?? null,
//       user_id:     userId ?? null,
//     }])
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function removeParticipant(participantId) {
//   const { error } = await supabase
//     .from("event_participants")
//     .delete()
//     .eq("id", participantId);

//   if (error) throw error;
// }

// export async function getParticipantById(participantId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("id", participantId)
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function uploadCertificate(participantId, fileBuffer, fileName, mimeType) {
//   const safeName    = cleanFileName(fileName);
//   const storagePath = `certificates/${participantId}/${Date.now()}-${safeName}`;

//   const { error: uploadError } = await supabase.storage
//     .from(BUCKET)
//     .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

//   if (uploadError) throw uploadError;

//   const { data, error } = await supabase
//     .from("event_participants")
//     .update({ certificate_url: storagePath, certificate_name: fileName })
//     .eq("id", participantId)
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// // ── Student certificate lookup ────────────────────────────────────────────────

// export async function getParticipantByUserAndEvent(userId, eventId) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("user_id", userId)
//     .eq("event_id", eventId)
//     .maybeSingle();

//   if (error) throw error;
//   return data ?? null;
// }

// export async function getRollNumberByUserId(userId) {
//   const { data, error } = await supabase
//     .from("profiles")
//     .select("roll_number")
//     .eq("id", userId)
//     .maybeSingle();

//   if (error) throw error;
//   return data?.roll_number ?? null;
// }

// export async function getParticipantByRollAndEvent(eventId, rollNumber) {
//   const { data, error } = await supabase
//     .from("event_participants")
//     .select("*")
//     .eq("event_id", eventId)
//     .eq("roll_number", rollNumber)
//     .maybeSingle();

//   if (error) throw error;
//   return data ?? null;
// }

// export async function linkUserIdToParticipant(participantId, userId) {
//   const { error } = await supabase
//     .from("event_participants")
//     .update({ user_id: userId })
//     .eq("id", participantId);

//   if (error) throw error;
// }

// export async function getCertificateSignedUrl(participantId) {
//   const { data: participant, error } = await supabase
//     .from("event_participants")
//     .select("certificate_url, certificate_name")
//     .eq("id", participantId)
//     .single();

//   if (error) throw error;
//   if (!participant?.certificate_url) throw new Error("No certificate uploaded yet.");

//   let storagePath = participant.certificate_url;

//   if (isHttpUrl(storagePath)) {
//     const url   = new URL(storagePath);
//     storagePath = url.pathname.split(`/object/public/${BUCKET}/`)[1];
//   }

//   const signedUrl = await signStoragePath(storagePath, CERT_SIGNED_URL_EXP);
//   return { signedUrl, fileName: participant.certificate_name };
// }

// export async function getEventTitleById(eventId) {
//   const { data, error } = await supabase
//     .from("events")
//     .select("title")
//     .eq("id", eventId)
//     .single();

//   if (error) throw error;
//   return data.title;
// }

// // ── CSV Import ────────────────────────────────────────────────────────────────
// // Required columns: name, roll_number   Optional: email

// export async function importParticipantsFromCSV(eventId, rows) {
//   const results = { inserted: 0, skipped: 0, errors: [] };

//   for (const row of rows) {
//     try {
//       const name        = (row.name        ?? row.Name        ?? "").trim();
//       const email       = (row.email       ?? row.Email       ?? "").trim();
//       const roll_number = (row.roll_number ?? row.Roll_Number ?? row.roll ?? row.Roll ?? "").trim();

//       if (!name || !roll_number) {
//         results.skipped++;
//         results.errors.push(`Skipped — missing name or roll_number: ${JSON.stringify(row)}`);
//         continue;
//       }

//       // Check duplicate roll_number for this event
//       const { data: existing } = await supabase
//         .from("event_participants")
//         .select("id")
//         .eq("event_id", eventId)
//         .eq("roll_number", roll_number)
//         .maybeSingle();

//       if (existing) {
//         results.skipped++;
//         results.errors.push(`Duplicate roll_number skipped: ${roll_number}`);
//         continue;
//       }

//       // Resolve user_id: email first, then roll_number
//       let userId = null;
//       if (email) userId = await findProfileIdByEmail(email);
//       if (!userId && roll_number) {
//         const { data: profileByRoll } = await supabase
//           .from("profiles")
//           .select("id")
//           .eq("roll_number", roll_number)
//           .maybeSingle();
//         userId = profileByRoll?.id ?? null;
//       }

//       const { error } = await supabase.from("event_participants").insert([{
//         event_id:    eventId,
//         name,
//         email:       email || null,
//         roll_number,
//         user_id:     userId ?? null,
//       }]);

//       if (error) throw error;
//       results.inserted++;
//     } catch (err) {
//       results.skipped++;
//       results.errors.push(`Error for ${row.roll_number ?? row.name ?? "unknown"}: ${err.message}`);
//     }
//   }

//   return results;
// }

// // ── Bulk certificate generation ───────────────────────────────────────────────

// export async function saveBulkCertificate(eventId, participantId, pdfBuffer, participantName) {
//   const safeName    = participantName
//     .replace(/[^\w\s-]/g, "")
//     .replace(/\s+/g, "_")
//     .slice(0, 60);

//   const fileName    = `${safeName}_certificate.pdf`;
//   const storagePath = `certificates/${eventId}/${participantId}.pdf`;

//   const { error: uploadError } = await supabase.storage
//     .from(BUCKET)
//     .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

//   if (uploadError) throw uploadError;

//   const { data, error } = await supabase
//     .from("event_participants")
//     .update({ certificate_url: storagePath, certificate_name: fileName })
//     .eq("id", participantId)
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// // ── Combined availability check ───────────────────────────────────────────────

// export async function checkCertificateAvailability(userId, eventId) {
//   // 1. Fast path: user_id is already linked
//   let participant = await getParticipantByUserAndEvent(userId, eventId);

//   // 2. Fallback: match by roll_number from profiles
//   if (!participant) {
//     const rollNumber = await getRollNumberByUserId(userId);
//     if (rollNumber) {
//       participant = await getParticipantByRollAndEvent(eventId, rollNumber);
//       // Auto-link for instant future lookups
//       if (participant && !participant.user_id) {
//         await linkUserIdToParticipant(participant.id, userId);
//         participant = { ...participant, user_id: userId };
//       }
//     }
//   }

//   return participant ?? null;
// }






















// backend/models/eventsModel.js
import supabase from "../services/supabaseClient.js";

const BUCKET = "event-assets";
const IMAGE_SIGNED_URL_EXP = 60 * 60 * 24 * 7; // 7 days
const CERT_SIGNED_URL_EXP  = 60 * 60;           // 1 hour

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function cleanFileName(name = "file") {
  return name
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

async function signStoragePath(path, expiresIn) {
  if (!path) return null;
  if (isHttpUrl(path)) return path;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function getAllEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const signed = await Promise.all(
    (data ?? []).map(async (e) => {
      try {
        const signedUrl = await signStoragePath(e.image_url, IMAGE_SIGNED_URL_EXP);
        return { ...e, image_url: signedUrl ?? null };
      } catch {
        return e;
      }
    }),
  );

  return signed;
}

export async function getEventById(id) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  try {
    const signedUrl = await signStoragePath(data.image_url, IMAGE_SIGNED_URL_EXP);
    return { ...data, image_url: signedUrl ?? null };
  } catch {
    return data;
  }
}

export async function createEvent(payload) {
  const { data, error } = await supabase
    .from("events")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(id, payload) {
  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadEventImage(eventId, fileBuffer, fileName, mimeType) {
  const safeName    = cleanFileName(fileName);
  const storagePath = `event-images/${eventId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("events")
    .update({ image_url: storagePath })
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;

  const signedUrl = await signStoragePath(storagePath, IMAGE_SIGNED_URL_EXP);
  return { ...data, image_url: signedUrl };
}

// ── Send Certificates (publish toggle) ───────────────────────────────────────
// Sets certificates_sent = true on the event, making certs visible to students.

export async function markCertificatesSent(eventId) {
  // Guard: ensure at least one participant has a certificate before publishing
  const { count, error: countError } = await supabase
    .from("event_participants")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .not("certificate_url", "is", null);

  if (countError) throw countError;
  if (!count || count === 0) {
    throw new Error("No certificates have been generated yet. Run 'Generate Certificates' first.");
  }

  const { data, error } = await supabase
    .from("events")
    .update({ certificates_sent: true })
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return { event: data, certCount: count };
}

export async function revokeCertificates(eventId) {
  const { data, error } = await supabase
    .from("events")
    .update({ certificates_sent: false })
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Participants ──────────────────────────────────────────────────────────────

export async function getParticipantsByEvent(eventId) {
  const { data, error } = await supabase
    .from("event_participants")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function findProfileIdByEmail(email) {
  if (!email) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function addParticipant(eventId, { name, email, roll_number, userId }) {
  const { data, error } = await supabase
    .from("event_participants")
    .insert([{
      event_id:    eventId,
      name,
      email,
      roll_number: roll_number ?? null,
      user_id:     userId ?? null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeParticipant(participantId) {
  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("id", participantId);

  if (error) throw error;
}

export async function getParticipantById(participantId) {
  const { data, error } = await supabase
    .from("event_participants")
    .select("*")
    .eq("id", participantId)
    .single();

  if (error) throw error;
  return data;
}

export async function uploadCertificate(participantId, fileBuffer, fileName, mimeType) {
  const safeName    = cleanFileName(fileName);
  const storagePath = `certificates/${participantId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("event_participants")
    .update({ certificate_url: storagePath, certificate_name: fileName })
    .eq("id", participantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Student certificate lookup ────────────────────────────────────────────────

export async function getParticipantByUserAndEvent(userId, eventId) {
  const { data, error } = await supabase
    .from("event_participants")
    .select("*")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function getRollNumberByUserId(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("roll_number")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.roll_number ?? null;
}

export async function getParticipantByRollAndEvent(eventId, rollNumber) {
  const { data, error } = await supabase
    .from("event_participants")
    .select("*")
    .eq("event_id", eventId)
    .eq("roll_number", rollNumber)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function linkUserIdToParticipant(participantId, userId) {
  const { error } = await supabase
    .from("event_participants")
    .update({ user_id: userId })
    .eq("id", participantId);

  if (error) throw error;
}

export async function getCertificateSignedUrl(participantId) {
  const { data: participant, error } = await supabase
    .from("event_participants")
    .select("certificate_url, certificate_name")
    .eq("id", participantId)
    .single();

  if (error) throw error;
  if (!participant?.certificate_url) throw new Error("No certificate uploaded yet.");

  let storagePath = participant.certificate_url;

  if (isHttpUrl(storagePath)) {
    const url   = new URL(storagePath);
    storagePath = url.pathname.split(`/object/public/${BUCKET}/`)[1];
  }

  const signedUrl = await signStoragePath(storagePath, CERT_SIGNED_URL_EXP);
  return { signedUrl, fileName: participant.certificate_name };
}

export async function getEventTitleById(eventId) {
  const { data, error } = await supabase
    .from("events")
    .select("title")
    .eq("id", eventId)
    .single();

  if (error) throw error;
  return data.title;
}

// ── CSV Import ────────────────────────────────────────────────────────────────
// Required columns: name, roll_number   Optional: email

export async function importParticipantsFromCSV(eventId, rows) {
  const results = { inserted: 0, skipped: 0, errors: [] };

  for (const row of rows) {
    try {
      const name        = (row.name        ?? row.Name        ?? "").trim();
      const email       = (row.email       ?? row.Email       ?? "").trim();
      const roll_number = (row.roll_number ?? row.Roll_Number ?? row.roll ?? row.Roll ?? "").trim();

      if (!name || !roll_number) {
        results.skipped++;
        results.errors.push(`Skipped — missing name or roll_number: ${JSON.stringify(row)}`);
        continue;
      }

      const { data: existing } = await supabase
        .from("event_participants")
        .select("id")
        .eq("event_id", eventId)
        .eq("roll_number", roll_number)
        .maybeSingle();

      if (existing) {
        results.skipped++;
        results.errors.push(`Duplicate roll_number skipped: ${roll_number}`);
        continue;
      }

      let userId = null;
      if (email) userId = await findProfileIdByEmail(email);
      if (!userId && roll_number) {
        const { data: profileByRoll } = await supabase
          .from("profiles")
          .select("id")
          .eq("roll_number", roll_number)
          .maybeSingle();
        userId = profileByRoll?.id ?? null;
      }

      const { error } = await supabase.from("event_participants").insert([{
        event_id:    eventId,
        name,
        email:       email || null,
        roll_number,
        user_id:     userId ?? null,
      }]);

      if (error) throw error;
      results.inserted++;
    } catch (err) {
      results.skipped++;
      results.errors.push(`Error for ${row.roll_number ?? row.name ?? "unknown"}: ${err.message}`);
    }
  }

  return results;
}

// ── Bulk certificate generation ───────────────────────────────────────────────

export async function saveBulkCertificate(eventId, participantId, pdfBuffer, participantName) {
  const safeName    = participantName
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60);

  const fileName    = `${safeName}_certificate.pdf`;
  const storagePath = `certificates/${eventId}/${participantId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("event_participants")
    .update({ certificate_url: storagePath, certificate_name: fileName })
    .eq("id", participantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Combined availability check ───────────────────────────────────────────────
// Also checks certificates_sent flag on the event before returning cert info

export async function checkCertificateAvailability(userId, eventId) {
  // First verify the event has certificates_sent = true
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("certificates_sent")
    .eq("id", eventId)
    .single();

  if (eventError) throw eventError;

  // 1. Fast path: user_id is already linked
  let participant = await getParticipantByUserAndEvent(userId, eventId);

  // 2. Fallback: match by roll_number from profiles
  if (!participant) {
    const rollNumber = await getRollNumberByUserId(userId);
    if (rollNumber) {
      participant = await getParticipantByRollAndEvent(eventId, rollNumber);
      if (participant && !participant.user_id) {
        await linkUserIdToParticipant(participant.id, userId);
        participant = { ...participant, user_id: userId };
      }
    }
  }

  if (!participant) return null;

  // Return participant with certificates_sent status attached
  return { ...participant, certificates_sent: event.certificates_sent ?? false };
}