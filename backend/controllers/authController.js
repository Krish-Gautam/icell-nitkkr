import supabase from "../services/supabaseClient.js"


export const signup = async (req, res) => {
  const { email, password } = req.body

  try {

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      message: "User created",
      user: data.user
    })

  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
}


export const login = async (req, res) => {

  const { email, password } = req.body

  try {

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      message: "Login successful",
      session: data.session,
      user: data.user
    })

  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }

}