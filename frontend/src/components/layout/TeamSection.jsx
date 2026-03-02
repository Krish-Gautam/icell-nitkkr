import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Linkedin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeamSection() {
  const team = [
    { name: "President", person: "Vansh", image: "", linkedin: "#" },
    { name: "Vice President", person: "Riya Mehta", image: "", linkedin: "#" },
    { name: "Tech Head", person: "Naveen Beniwal", image: "", linkedin: "#" },
    { name: "Tech Head", person: "Naveen Beniwal", image: "", linkedin: "#" },
    { name: "Tech Head", person: "Naveen Beniwal", image: "", linkedin: "#" },
    { name: "Tech Head", person: "Naveen Beniwal", image: "", linkedin: "#" },
    { name: "Tech Head", person: "Naveen Beniwal", image: "", linkedin: "#" },
  ];

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const tripleTeam = [...team, ...team, ...team];

  return (
    <section className="relative overflow-hidden bg-black py-20">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative text-center mb-16 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">Our Team</span>
        </motion.div>
        
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Meet Our
          </span>
          
          <span className="text-white"> Leadership</span>
        </h2>
        
        <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          Visionaries driving innovation and excellence in everything we do
        </p>
      </motion.div>

      {/* Smooth infinite scroll container */}
      <div className="relative w-full overflow-hidden">
        {/* Enhanced gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-black via-black/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-black via-black/90 to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-6 md:gap-10"
          animate={{
            x: [0, -(team.length * 220 + (team.length - 1) * 40)]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear"
            }
          }}
        >
          {tripleTeam.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.5,
                delay: (index % team.length) * 0.05,
                ease: "easeOut"
              }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="flex-shrink-0 w-[220px] group cursor-pointer"
            >
              <motion.div
                whileHover={{ y: -12 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                <div className="relative p-6 rounded-3xl border border-white/10 group-hover:border-yellow-400/30 transition-all duration-500">
                  {/* Profile image */}
                  <div className="relative mx-auto w-40 h-40 mb-5">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-yellow-400/40">
                      <img
                        src={member.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.person}`}
                        alt={member.person}
                        className="w-full h-full object-cover group-hover:shadow-lg transition-shadow duration-500"
                      />
                    </div>
                  </div>

                  {/* Name & role */}
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
                      {member.person}
                    </h3>
                    <p className="text-yellow-400/80 text-sm font-medium tracking-wide uppercase">
                      {member.name}
                    </p>
                  </div>

                  {/* LinkedIn button */}
                  <motion.a
                    href={member.linkedin}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-400/30 text-white/60 hover:text-yellow-400 transition-all duration-300 group/btn"
                    aria-label={`${member.person} LinkedIn`}
                  >
                    <Linkedin size={18} className="group-hover/btn:rotate-12 transition-transform" />
                    <span className="text-sm font-medium">Connect</span>
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}