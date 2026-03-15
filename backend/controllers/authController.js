

// authController.js
import {
  createAuthUser,
  insertUserProfile,
  loginUser
} from "../models/authModel.js";

export const signup = async (req, res) => {
  // include the new fields from the request body
  const {
    name,
    email,
    password,
    is_member,
    branch,
    year,
    roll_number
  } = req.body;

  try {
    // create auth user (Supabase admin.createUser or similar) – unchanged
    const { data, error } = await createAuthUser(email, password);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;

    // insert base profile plus optional member details
    // adjust insertUserProfile implementation to accept the new fields
    const { error: profileError } = await insertUserProfile(
      user.id,
      name,
      email,
      is_member ? true : false,   // ensure boolean
      branch || null,
      year || null,
      roll_number || null
    );

    if (profileError) {
      // log but still send a clear response
      console.error("Profile insert/update error:", profileError.message);
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(201).json({
      message: "User created successfully",
      user
    });

  } catch (err) {
    console.error("Signup controller error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await loginUser(email, password);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: "Login successful",
      session: data.session,
      user: data.user
    });

  } catch (err) {
    console.error("Login controller error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};