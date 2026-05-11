import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Props:
 *   items         – [{ question: string, answer: string }]
 *   allowMultiple – bool (default false : un seul ouvert à la fois)
 */
export default function Accordion({ items = [], allowMultiple = false }) {
  const [open, setOpen] = useState([]);

  const toggle = (idx) => {
    if (allowMultiple) {
      setOpen((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else {
      setOpen((prev) => (prev[0] === idx ? [] : [idx]));
    }
  };

  return (
    <div className="divide-y divide-cacao-brown/10">
      {items.map((item, idx) => {
        const isOpen = open.includes(idx);
        return (
          <div key={idx}>
            <button
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-semibold text-sm sm:text-base text-chain-bg">
                {item.question}
              </span>
              <motion.span
                className="flex-shrink-0 text-chain-cyan"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="pb-5 text-sm text-cacao-brown-light leading-relaxed pr-9">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
