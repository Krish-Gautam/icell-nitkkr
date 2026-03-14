


import supabase from "../services/supabaseClient.js";

export const getTeams = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("team")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    // ✅ Normalise "insta" → "instagram" so the frontend never needs to know
    //    about the DB column name. One place to fix, everywhere works.
    const normalised = (data ?? []).map((m) => ({
      ...m,
      instagram: m.instagram ?? m.insta ?? null,
    }));

    res.json(normalised);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};