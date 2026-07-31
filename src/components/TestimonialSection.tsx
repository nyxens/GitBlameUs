import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface WordProps {
  word: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}

const Word: React.FC<WordProps> = ({ word, progress, index, total }) => {
  // Calculate range for sequential reveal
  const start = index / total;
  const end = (index + 1) / total;

  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  const color = useTransform(progress, [start, end], ['hsl(0 0% 35%)', 'hsl(0 0% 100%)']);

  return (
    <motion.span
      style={{ opacity, color }}
      className="mr-[0.3em] inline-block transition-colors duration-150"
    >
      {word}
    </motion.span>
  );
};

export const TestimonialSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end center'],
  });

  const testimonialText =
    'LifeVault transformed how our hospital network handles critical blood logistics during emergency trauma cases. We are now able to locate, request, and track life-saving blood units across regional vaults in minutes!';

  const words = testimonialText.split(' ');

  return (
    <section
      ref={containerRef}
      id="reviews"
      className="min-h-screen w-full flex items-center justify-center py-24 md:py-32 px-8 md:px-28 bg-black relative border-t border-white/10"
    >
      <div className="max-w-3xl mx-auto flex flex-col items-start gap-10">
        {/* Quote symbol image */}
        <div className="w-14 h-10 flex items-center justify-start">
          <img
            src="/quote-symbol.png"
            alt="Quote mark"
            className="w-14 h-10 object-contain filter invert opacity-90"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Testimonial text with matching opening and closing quotation marks */}
        <div className="text-4xl md:text-5xl font-medium leading-[1.2] flex flex-wrap items-center">
          <span className="text-muted-foreground mr-2">"</span>
          {words.map((word, i) => (
            <Word
              key={i}
              word={word}
              progress={scrollYProgress}
              index={i}
              total={words.length}
            />
          ))}
          <span className="text-muted-foreground ml-1">"</span>
        </div>

        {/* Author row */}
        <div className="flex items-center gap-4 pt-4">
          <img
            src="/testimonial-avatar.png"
            alt="Brooklyn Simmons"
            className="w-14 h-14 rounded-full border-[3px] border-foreground object-cover shadow-lg"
          />
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-7 text-foreground">
              Brooklyn Simmons
            </span>
            <span className="text-sm font-normal leading-5 text-muted-foreground">
              Director of Critical Logistics, Metro Healthcare Network
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
