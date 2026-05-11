import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

/**
 * Props:
 *   number     – '01' | '02' … '05'
 *   title      – titre de l'étape
 *   actor      – nom du rôle (ex: "Producteur")
 *   platform   – contexte technique (ex: "Mobile · hors-ligne possible")
 *   Icon       – composant lucide-react
 *   description – string
 *   dataPoints  – string[]
 *   dataLabel   – label de la liste (default: "Données enregistrées on-chain")
 *   reversed    – bool : visuel à gauche si true, à droite sinon
 */
export default function StepDetail({
  number,
  title,
  actor,
  platform,
  Icon,
  description,
  dataPoints,
  dataLabel = 'Données enregistrées on-chain',
  reversed = false,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  // ── Bloc visuel (fond chain-bg + icône géante) ──────────────────────────────
  const visual = (
    <div className="relative rounded-2xl overflow-hidden bg-chain-bg flex items-center justify-center min-h-[260px] md:min-h-[320px] shadow-lg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(33,150,199,0.18) 0%, transparent 65%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 rounded-full border border-chain-cyan/10" />
        <div className="absolute w-52 h-52 rounded-full border border-chain-cyan/6" />
        <div className="absolute w-72 h-72 rounded-full border border-chain-cyan/3" />
      </div>
      <Icon
        className="relative z-10 w-24 h-24 text-chain-cyan/50"
        strokeWidth={0.75}
      />
    </div>
  );

  // ── Bloc texte ──────────────────────────────────────────────────────────────
  const textContent = (
    <div className="relative flex flex-col justify-center py-2">
      {/* Watermark numéro */}
      <span
        aria-hidden="true"
        className="absolute -top-8 -left-2 text-[6.5rem] font-bold leading-none pointer-events-none select-none font-sans"
        style={{ color: 'rgba(33, 150, 199, 0.10)' }}
      >
        {number}
      </span>

      <div className="relative z-10">
        <h3 className="text-xl sm:text-2xl font-sans font-bold text-chain-bg mb-3 leading-tight">
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold bg-chain-cyan/10 text-chain-cyan border border-chain-cyan/20 px-2.5 py-1 rounded-full">
            {actor}
          </span>
          <span className="text-xs text-cacao-brown-light bg-white border border-cacao-brown/15 px-2.5 py-1 rounded-full">
            {platform}
          </span>
        </div>

        <p className="text-sm text-cacao-brown leading-relaxed mb-5">{description}</p>

        <p className="text-xs font-semibold text-chain-bg uppercase tracking-wide mb-2">
          {dataLabel}
        </p>
        <ul className="space-y-1.5">
          {dataPoints.map((pt, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-cacao-brown">
              <CheckCircle className="w-4 h-4 text-chain-cyan flex-shrink-0 mt-0.5" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
    >
      {reversed ? (
        <>
          {visual}
          {textContent}
        </>
      ) : (
        <>
          {textContent}
          {visual}
        </>
      )}
    </motion.div>
  );
}
