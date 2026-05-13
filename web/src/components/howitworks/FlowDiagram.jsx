import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Sprout, Users, Factory, Ship, ShieldCheck,
  Link as ChainLink,
} from 'lucide-react';

const NODES = [
  {
    Icon: Sprout,
    label: 'Récolte',
    time: 'J+0',
    data: ['GPS parcelle', 'Poids net', 'Photos hash'],
  },
  {
    Icon: Users,
    label: 'Collecte',
    time: 'J+3',
    data: ['Pesée contrôle', 'ID Coopérative'],
  },
  {
    Icon: Factory,
    label: 'Transf.',
    time: 'J+15',
    data: ['Fermentation', 'Humidité (%)'],
  },
  {
    Icon: Ship,
    label: 'Export',
    time: 'J+45',
    data: ['N° EUDR', 'Pays dest.'],
  },
  {
    Icon: ShieldCheck,
    label: 'Vérif. UE',
    time: 'J+90',
    data: ['Public · sans compte', 'GeoJSON · PDF'],
  },
];

// ─── Nœud ─────────────────────────────────────────────────────────────────────
function Node({ Icon, label, time, data, delay, isInView }) {
  return (
    <div className="flex flex-col items-center" style={{ width: '72px', flexShrink: 0 }}>
      <span className="font-mono text-[10px] text-chain-cyan mb-1.5 whitespace-nowrap">
        {time}
      </span>
      <motion.div
        className="w-11 h-11 rounded-full bg-chain-bg border-2 border-chain-cyan flex items-center justify-center shadow-lg"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay, duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Icon className="w-5 h-5 text-chain-cyan" />
      </motion.div>
      <span className="text-[10px] font-semibold text-chain-bg mt-1.5 text-center leading-tight">
        {label}
      </span>
      <div className="mt-1.5 space-y-1 w-full">
        {data.map((d, i) => (
          <motion.span
            key={i}
            className="block text-center text-[9px] bg-chain-cyan/10 text-chain-cyan px-1 py-0.5 rounded leading-snug"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: delay + 0.35 + i * 0.05 }}
          >
            {d}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// ─── Connecteur (ligne animée + badge Tx Polygon) ─────────────────────────────
function Connector({ delay, isInView }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{ flex: '1 1 0%', minWidth: '40px', paddingTop: '14px' }}
    >
      <motion.div
        className="flex items-center gap-0.5 mb-1.5 px-1.5 py-0.5 rounded-full bg-chain-bg border border-chain-cyan/25"
        initial={{ opacity: 0, y: -4 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: delay + 0.28, duration: 0.3 }}
      >
        <ChainLink className="w-2 h-2 text-chain-cyan flex-shrink-0" />
        <span className="text-[8px] font-mono text-chain-cyan whitespace-nowrap tracking-tight">
          Tx Polygon
        </span>
      </motion.div>

      <div className="w-full h-0.5 bg-cacao-brown/10 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-chain-cyan"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          style={{ transformOrigin: 'left center' }}
          transition={{ delay, duration: 0.45, ease: 'easeOut' }}
        />
      </div>

      {/* Pointe de flèche */}
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: '5px solid #2196C7',
          alignSelf: 'flex-end',
          marginTop: '-2px',
        }}
      />
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function FlowDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref}>
      {/* ── Mobile : timeline verticale ──────────────────────────────────── */}
      <div className="md:hidden space-y-0">
        {NODES.map(({ Icon, label, time, data }, idx) => (
          <div key={idx} className="flex gap-4">
            {/* Colonne gauche : cercle + trait vertical */}
            <div className="flex flex-col items-center">
              <motion.div
                className="w-10 h-10 rounded-full bg-chain-bg border-2 border-chain-cyan flex items-center justify-center shadow-md flex-shrink-0"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: idx * 0.1, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Icon className="w-4 h-4 text-chain-cyan" />
              </motion.div>
              {idx < NODES.length - 1 && (
                <div className="w-0.5 flex-1 mt-2 mb-0 relative overflow-hidden" style={{ minHeight: '48px' }}>
                  <motion.div
                    className="absolute inset-0 bg-chain-cyan/30"
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    style={{ transformOrigin: 'top center' }}
                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                  />
                </div>
              )}
            </div>

            {/* Contenu */}
            <motion.div
              className="pb-6 flex-1"
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: idx * 0.1 + 0.05, duration: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-chain-cyan">{time}</span>
                <span className="text-sm font-semibold text-chain-bg">{label}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.map((d, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-chain-cyan/10 text-chain-cyan px-1.5 py-0.5 rounded"
                  >
                    {d}
                  </span>
                ))}
              </div>
              {idx < NODES.length - 1 && (
                <div className="flex items-center gap-1 mt-2">
                  <ChainLink className="w-3 h-3 text-chain-cyan" />
                  <span className="text-[10px] font-mono text-chain-cyan">Tx Polygon</span>
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* ── Desktop : frise horizontale ───────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <div style={{ minWidth: '580px' }}>
          {/* Barre temporelle */}
          <div className="flex items-center gap-2 px-9 mb-4">
            <span className="text-xs font-mono text-chain-cyan flex-shrink-0">J+0</span>
            <div className="flex-1 relative h-px bg-cacao-brown/10">
              <motion.div
                className="absolute inset-0 bg-chain-cyan/40"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                style={{ transformOrigin: 'left center' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-mono text-chain-cyan flex-shrink-0">J+90</span>
          </div>

          {/* Nœuds + connecteurs */}
          <div className="flex items-start">
            {NODES.map(({ Icon, label, time, data }, idx) => (
              <React.Fragment key={idx}>
                <Node
                  Icon={Icon}
                  label={label}
                  time={time}
                  data={data}
                  delay={idx * 0.13}
                  isInView={isInView}
                />
                {idx < NODES.length - 1 && (
                  <Connector delay={idx * 0.2} isInView={isInView} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
