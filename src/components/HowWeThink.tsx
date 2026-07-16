import { Spotlight } from "./ui/spotlight";
import { motion } from "framer-motion";

const steps = [
  {
    title: 'Find the Bottleneck',
    description: 'We analyze your shop floor to find actual constraints, not just symptoms.',
  },
  {
    title: 'Map the Workflow',
    description: 'We design a process tailored to how your team actually works.',
  },
  {
    title: 'Build Custom Tools',
    description: 'We engineer precise ERP and CAD systems to solve your specific problems.',
  },
  {
    title: 'Deploy & Handover',
    description: 'We integrate the system on the floor and train your operators.',
  }
];

export default function HowWeThink() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-transparent overflow-hidden flex flex-col items-center justify-center">
      {/* Signature Blue Spotlight */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#3F618C"
      />
      <Spotlight
        className="top-0 right-0 md:right-60 md:top-20"
        fill="#274060"
      />

      <div className="container mx-auto px-4 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
              <div className="h-[1px] w-12 md:w-20 bg-neutral-800" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#3F618C]">
                  How we work
              </span>
              <div className="h-[1px] w-12 md:w-20 bg-neutral-800" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-4">
            Your exact bottlenecks.<br/>
            <span className="text-neutral-400">Solved by custom systems.</span>
          </h2>
        </motion.div>

        <div className="relative w-full max-w-6xl mx-auto mt-12 md:mt-24">
          {/* Horizontal Line for Desktop */}
          <div className="absolute top-[20px] left-[20px] right-[20px] h-px bg-white/10 hidden md:block z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((item, index) => {
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative flex flex-row md:flex-col items-start"
                >
                  
                  {/* Timeline Square Node */}
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 bg-black md:bg-transparent border border-white/20 shrink-0">
                    <span className="text-white text-sm font-semibold">0{index + 1}</span>
                  </div>

                  {/* Mobile Line segment */}
                  {index !== steps.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-[-3rem] w-px bg-white/10 md:hidden z-0"></div>
                  )}

                  {/* Content Box */}
                  <div className="ml-6 md:ml-0 md:mt-6 w-full">
                    <div className="flex flex-col">
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-white">
                        {item.title}
                      </h3>
                      <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
