import { useState } from "react";
import { motion } from "framer-motion";

export default function EventSection() {
  const [stackHover, setStackHover] = useState(false);

  // Smaller image URLs for faster decode and less layout shift
  const images = [
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80",
    "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=400&q=80",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&q=80",
  ];

 const cardOffsets = [
  {
    x: -200,
    y: -140,
    rotate: -8,
    hover: { x: -260, y: -100, rotate: -16 }
  },
  {
    x: -160,
    y: -160,
    rotate: -4,
    hover: { x: -170, y: -190, rotate: -6 }
  },
  {
    x: -120,
    y: -160,
    rotate: 4,
    hover: { x: -90, y: -190, rotate: 6 }
  },
  {
    x: -80,
    y: -140,
    rotate: 8,
    hover: { x: -10, y: -100, rotate: 16 }
  }
];



  return (
    <section className="min-h-screen bg-zinc-950 px-6 py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center min-h-[70vh]">
          {/* Left: Society text - light animation to avoid first-load lag */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true, margin: "0px" }}
            className="order-2 md:order-1"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-yellow-400 tracking-tight">
              InnoKshetra
            </h2>
            <p className="text-white/90 mt-6 text-lg leading-relaxed">
              Our flagship innovation event where minds collide, ideas ignite,
              and startups are born. Innovation Cell NIT Kurukshetra brings together
              students, mentors, and industry leaders to turn ideas into impact.
            </p>
            <p className="text-white/60 mt-4 text-base leading-relaxed">
              From hackathons and workshops to speaker sessions and networking,
              we build a culture of creativity and problem-solving. Join us to
              learn, build, and lead the next wave of innovation.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
                Hackathons
              </span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
                Workshops
              </span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
                Speaker Sessions
              </span>
            </motion.div>
          </motion.div>

          {/* Right: Four-pic folder / card stack - no entrance animation to avoid first-load lag */}
          <div className="relative order-1 md:order-2 flex justify-center md:justify-end items-center min-h-[320px] md:min-h-[380px]">
            <div
              className="relative w-[280px] h-[340px] md:w-[320px] md:h-[380px] cursor-pointer"
              onMouseEnter={() => setStackHover(true)}
              onMouseLeave={() => setStackHover(false)}
            >
              {images.map((img, index) => (
                <div
                  key={index}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <motion.div
                    variants={{
                      rest: {
                        x: cardOffsets[index].x,
                        y: cardOffsets[index].y,
                        rotate: cardOffsets[index].rotate,
                      },
                      hover: {
                        x: cardOffsets[index].hover.x,
                        y: cardOffsets[index].hover.y,
                        rotate: cardOffsets[index].hover.rotate,
                      },
                    }}
                    initial="rest"
                    animate={stackHover ? "hover" : "rest"}
                    transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute w-[85%] h-[85%] rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl origin-center"
                    style={{
                      left: "50%",
                      top: "50%",
                      x: "-50%",
                      y: "-50%",
                      pointerEvents: "none",
                      zIndex: stackHover ? index + 10 : index,
                      willChange: "transform",
                    }}
                  >
                    <img
                      src={img}
                      alt={`Event ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
