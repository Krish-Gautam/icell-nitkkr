

import React, { useState } from "react";
import { Mail, Lock, User, Users, CheckCircle2 } from "lucide-react";

const Register = () => {
  const [role]      = useState("member");
  const [loading, setLoading]   = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError]       = useState("");
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     formData.name,
          email:    formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      // ✅ Your signup uses admin.createUser so there's no session returned.
      // The user needs to LOGIN after signup to get a token.
      // So just show popup and redirect to login.
      setShowPopup(true);

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (err) {
      setLoading(false);
      setError("Network error — is the backend running?");
    }
  };

  return (
    <>
      {/* Popup */}
      {showPopup && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-yellow-400 text-black px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span className="font-semibold">Account created! Please log in.</span>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
        <div className="w-full max-w-md space-y-8 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-white/60">Join the iCell community</p>
          </div>

          {/* Role tab (single option) */}
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium bg-yellow-400 text-black shadow-lg">
              <Users size={14} />
              Club Member
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  name="name" type="text" required
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                  placeholder="Full Name"
                  onChange={handleChange}
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  name="email" type="email" required
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                  placeholder="Email address"
                  onChange={handleChange}
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  name="password" type="password" required
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                  placeholder="Password (min 8 characters)"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group cursor-pointer relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Register as Member"}
            </button>

            <p className="text-center text-sm text-white/60">
              Already have an account?{" "}
              <a href="/login" className="text-yellow-400 font-medium hover:text-yellow-300">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default Register;