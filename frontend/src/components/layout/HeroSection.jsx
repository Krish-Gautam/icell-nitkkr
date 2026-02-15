import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-6">

      {/* Animated Glow Background */}
      <div className="absolute w-[500px] h-[500px] bg-yellow-500/10 blur-[120px] rounded-full top-20 left-1/2 -translate-x-1/2 animate-pulse"></div>

      <div className="relative max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT TEXT */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Igniting Ideas <br />
            <span className="text-yellow-400">Into Innovation</span>
          </h1>

          <p className="mt-6 text-white/60 text-lg">
            At I-Cell, we transform creativity into impactful solutions.
            From ideation to execution — we build tomorrow.
          </p>
        </motion.div>

        {/* RIGHT BULB IMAGE */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex justify-center"
        >
          <img
            src="https://images.unsplash.com/photo-1492724441997-5dc865305da7"
            alt="Innovation Bulb"
            className="w-[300px] md:w-[400px] drop-shadow-[0_0_40px_rgba(255,200,0,0.4)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
