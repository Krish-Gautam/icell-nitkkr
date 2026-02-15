import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

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

  const duplicatedTeam = [...team, ...team];

  return (
    <section className="relative overflow-hidden bg-black  py-12">
      {/* Subtle background glow */}
      <div className="absolute inset-0  pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative text-center mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-yellow-400 tracking-tight">
          Meet Our Leadership
        </h2>
        <p className="mt-3 text-white/60 text-lg max-w-xl mx-auto">
          The people behind the innovation
        </p>
      </motion.div>

      {/* Auto-scrolling marquee container */}
      <div className="relative w-full  overflow-hidden">
        {/* Gradient masks for smooth fade at edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-8 md:gap-12 pb-4"
          animate={{
            x: [0, -(team.length * 180 + (team.length - 1) * 32)] /* one full set width */
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear"
            }
          }}
        >
          {duplicatedTeam.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ scale: 1.04, y: 10 }}
              className="flex-shrink-0 w-[180px] flex flex-col items-center group cursor-default"
            >
              {/* Circular card with ring */}
              <div className="relative">
                <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-yellow-400/50   transition-all duration-300">
                  <img
                    src={member.image}
                    alt={member.person}
                    className="w-full h-full object-cover bg-white/5"
                  />
                </div>
                {/* Decorative outer ring on hover */}
                <motion.div
                  className="absolute inset-[-4px] rounded-full border border-yellow-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </div>

              {/* Name & role - compact below circle */}
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400/90 transition-colors">
                  {member.person}
                </h3>
                <p className="text-yellow-400/90 text-sm mt-0.5">{member.name}</p>
              </div>

              <a
                href={member.linkedin}
                className="mt-2 inline-flex items-center gap-1.5 text-white/50 hover:text-yellow-400 transition-colors text-sm"
                aria-label={`${member.person} LinkedIn`}
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>

     
    </section>
  );
}
