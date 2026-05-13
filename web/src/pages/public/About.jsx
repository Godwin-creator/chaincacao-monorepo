import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Code2, Globe, Mail, ExternalLink,
  Smartphone, Monitor, Hexagon,
  Target, Sprout, Users, ShoppingBag,
} from 'lucide-react';

// Alias pour la lisibilité
const Github = Code2;
const Linkedin = Globe;
import TeamAvatar from '../../components/team/TeamAvatar';

// ─── Helper animation ─────────────────────────────────────────────────────────
function FadeSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Données équipe ───────────────────────────────────────────────────────────
const TEAM = [
  {
    name: 'EDOH BEDI Komi Godwin',
    role: 'Développeur Web + Architecture',
    school: 'EPL',
    subteam: 'Web',
  },
  {
    name: 'FOLIKPO-AWUTE Dzogoedzikpe Sophos',
    role: 'Développeur Web',
    school: 'IAI Togo',
    subteam: 'Web',
  },
  {
    name: 'KOUYOM Bikala',
    role: 'Développeur Mobile',
    school: 'Lomé Business School',
    subteam: 'Mobile',
  },
  {
    name: 'QUENUM Abla Anne-Marie',
    role: 'Développeuse Mobile',
    school: 'ESA',
    subteam: 'Mobile',
  },
];

// ─── Données ODD ──────────────────────────────────────────────────────────────
const ODDS = [
  {
    number: '1',
    color: '#e5243b',
    Icon: Target,
    title: 'Pas de pauvreté',
    desc: 'Plus-value de 20-40 % pour les producteurs certifiés',
  },
  {
    number: '2',
    color: '#dda63a',
    Icon: Sprout,
    title: 'Faim zéro',
    desc: 'Sécurisation des revenus agricoles familiaux',
  },
  {
    number: '8',
    color: '#a21942',
    Icon: Users,
    title: 'Travail décent',
    desc: 'Lutte contre les fraudes sur les pesées',
  },
  {
    number: '12',
    color: '#bf8b2e',
    Icon: ShoppingBag,
    title: 'Consommation responsable',
    desc: 'Transparence totale pour le consommateur final',
  },
];

// ─── Données stack technique ──────────────────────────────────────────────────
const TECH_STACK = [
  {
    category: 'Blockchain',
    Icon: Hexagon,
    items: ['Polygon PoS (Amoy testnet)', 'Solidity ^0.8.20', 'ERC-721 (NFT)', 'OpenZeppelin Contracts'],
  },
  {
    category: 'Web',
    Icon: Monitor,
    items: ['React 19 + Vite', 'Tailwind CSS v4', 'Supabase (BDD + Auth)', 'Framer Motion'],
  },
  {
    category: 'Mobile',
    Icon: Smartphone,
    items: ['Flutter', 'SQLite (offline first)', 'GPS natif', 'Scanner QR intégré'],
  },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label }) {
  return (
    <div className="bg-chain-bg rounded-2xl p-5 text-center">
      <p className="text-2xl sm:text-3xl font-sans font-bold text-chain-cyan mb-1">{value}</p>
      <p className="text-xs text-chain-cyan-light leading-snug">{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function About() {
  return (
    <div className="bg-cream">

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-4 border-b border-cacao-brown/8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-semibold bg-chain-cyan/10 text-chain-cyan border border-chain-cyan/20 px-3 py-1 rounded-full mb-5">
              À propos
            </span>
            <h1 className="text-3xl sm:text-4xl font-sans font-bold text-chain-bg mb-4 leading-tight">
              ChainCacao — La technologie au service de la terre
            </h1>
            <p className="text-cacao-brown-light text-base sm:text-lg leading-relaxed">
              Une initiative étudiante togolaise pour reconnecter les producteurs au marché mondial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. MISSION ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-cream">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg mb-12">
              Notre mission
            </h2>
          </FadeSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Texte prose */}
            <FadeSection>
              <div className="space-y-4 text-sm text-cacao-brown leading-relaxed">
                <p>
                  ChainCacao est né d'un constat simple : le Togo produit du cacao et du café de
                  qualité, mais ses producteurs sont exclus des marchés premium par manque de
                  traçabilité. Le règlement européen EUDR 2025 menace même l'accès au marché de
                  l'Union Européenne, principal débouché de la filière.
                </p>
                <p>
                  Notre mission est de fournir aux 40 000 familles d'agriculteurs togolais une
                  infrastructure de traçabilité accessible, fiable et conforme aux exigences
                  internationales. Une infrastructure pensée pour le terrain : utilisable sur un
                  smartphone d'entrée de gamme, en zone à faible connectivité, par un producteur
                  sans formation technique.
                </p>
                <p>
                  Nous croyons que la blockchain doit servir ceux qui en ont le plus besoin — et
                  non rester l'apanage des marchés financiers occidentaux.
                </p>
              </div>
            </FadeSection>

            {/* Chiffres clés */}
            <FadeSection delay={0.08}>
              <div className="grid grid-cols-2 gap-3">
                <StatCard value="40 000" label="familles d'agriculteurs au Togo" />
                <StatCard value="30-40 M$" label="perdus chaque année sur les fraudes" />
                <StatCard value="< 5 %" label="des exportations actuellement certifiées" />
                <StatCard value="2025" label="entrée en vigueur de l'EUDR" />
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── 3. POURQUOI LE TOGO ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-chain-bg">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white text-center mb-12">
              Pourquoi le Togo ?
            </h2>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: 'Une filière stratégique',
                desc: "Le café et le cacao représentent une part essentielle des exportations agricoles togolaises. La région des Plateaux (Wawa, Akébou, Kloto, Danyi, Amou, Agou) concentre l'essentiel de la production.",
              },
              {
                title: 'Une urgence réglementaire',
                desc: "L'EUDR 2025 impose une preuve géographique de non-déforestation pour chaque importation. Sans système de traçabilité, le marché européen devient inaccessible.",
              },
              {
                title: 'Un potentiel premium',
                desc: "Avec une traçabilité fiable, les producteurs togolais peuvent prétendre aux certifications Bio, Fairtrade, Rainforest Alliance — soit 20 à 40 % de plus-value sur le prix de vente.",
              },
            ].map(({ title, desc }, idx) => (
              <FadeSection key={idx} delay={idx * 0.08}>
                <div className="bg-white/8 border border-white/10 rounded-2xl p-6 h-full">
                  <h3 className="font-semibold text-chain-cyan mb-3">{title}</h3>
                  <p className="text-sm text-chain-cyan-light leading-relaxed">{desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. ÉQUIPE ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg mb-2">
                L'équipe Shadow Garden
              </h2>
              <p className="text-cacao-brown-light text-sm">
                Quatre étudiants togolais — Miabé Hackathon 2026
              </p>
            </div>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((member, idx) => (
              <FadeSection key={idx} delay={idx * 0.07}>
                <div className="bg-cream rounded-2xl p-6 flex flex-col items-center text-center h-full">
                  <TeamAvatar name={member.name} size="xl" />

                  <div className="mt-4 flex-1">
                    <p className="font-semibold text-chain-bg text-sm leading-snug mb-0.5">
                      {member.name}
                    </p>
                    <p className="text-xs text-cacao-brown-light mb-1">{member.role}</p>
                    <p className="text-xs text-cacao-brown font-medium mb-3">{member.school}</p>

                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        member.subteam === 'Web'
                          ? 'bg-chain-cyan/10 text-chain-cyan border border-chain-cyan/20'
                          : 'bg-success/10 text-success border border-success/20'
                      }`}
                    >
                      {member.subteam}
                    </span>
                  </div>

                  {/* Liens sociaux */}
                  <div className="flex items-center gap-2 mt-4">
                    {[
                      { Icon: Github, label: 'GitHub' },
                      { Icon: Linkedin, label: 'LinkedIn' },
                      { Icon: Mail, label: 'Email' },
                    ].map(({ Icon: SocialIcon, label }) => (
                      <a
                        key={label}
                        href="#"
                        aria-label={label}
                        className="w-7 h-7 rounded-lg bg-cacao-brown/8 flex items-center justify-center text-cacao-brown-light hover:text-chain-cyan hover:bg-chain-cyan/10 transition-colors"
                      >
                        <SocialIcon className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. HACKATHON ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-cream">
        <div className="max-w-3xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg text-center mb-8">
              Miabé Hackathon 2026
            </h2>
          </FadeSection>
          <FadeSection delay={0.05}>
            <div className="bg-white rounded-2xl p-8 border border-cacao-brown/10 shadow-sm">
              {/* Logo placeholder */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-chain-bg flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-[10px] font-bold text-chain-cyan font-mono leading-tight text-center">
                    MBH{' '}2026
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-chain-bg">Miabé Hackathon 2026</p>
                  <p className="text-xs text-cacao-brown-light">
                    Organisé par Darollo Technologies Corporation (DTC)
                  </p>
                </div>
              </div>

              <p className="text-sm text-cacao-brown mb-4 leading-relaxed">
                ChainCacao est développé dans le cadre du Miabé Hackathon 2026, organisé par
                Darollo Technologies Corporation (DTC).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Code projet', value: 'T-01' },
                  { label: 'Domaine', value: 'D01 Agriculture & Traçabilité' },
                  { label: 'Phase actuelle', value: 'Phase 3 — Finale' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-cream rounded-xl p-3">
                    <p className="text-[10px] text-cacao-brown-light mb-0.5 uppercase tracking-wide">{label}</p>
                    <p className="text-xs font-semibold text-chain-bg">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-cacao-brown/8">
                <a
                  href="https://www.miabehackathon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-chain-cyan hover:underline font-medium"
                >
                  Site officiel du hackathon
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── 6. ODD ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg text-center mb-12">
              Alignement avec les Objectifs de Développement Durable
            </h2>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ODDS.map(({ number, color, Icon, title, desc }, idx) => (
              <FadeSection key={idx} delay={idx * 0.07}>
                <div className="bg-cream rounded-2xl p-5 h-full border border-cacao-brown/8">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color }}
                      >
                        ODD {number}
                      </p>
                      <p className="text-xs font-bold text-chain-bg leading-tight">{title}</p>
                    </div>
                  </div>
                  <p className="text-xs text-cacao-brown-light leading-relaxed">{desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. STACK TECHNIQUE ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-cream">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg text-center mb-3">
              Notre stack technique
            </h2>
            <p className="text-center text-sm text-cacao-brown-light mb-12">
              Open-source et conçu pour la résilience en zone à faible connectivité.
            </p>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TECH_STACK.map(({ category, Icon, items }, idx) => (
              <FadeSection key={idx} delay={idx * 0.08}>
                <div className="bg-white rounded-2xl p-6 h-full border border-cacao-brown/8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-chain-bg flex items-center justify-center shadow-sm flex-shrink-0">
                      <Icon className="w-4 h-4 text-chain-cyan" />
                    </div>
                    <h3 className="font-semibold text-chain-bg">{category}</h3>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-cacao-brown">
                        <span className="w-1.5 h-1.5 rounded-full bg-chain-cyan flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeSection>
            ))}
          </div>
          <FadeSection delay={0.1}>
            <p className="text-center text-xs text-cacao-brown-light mt-6">
              Code source open-source disponible sur{' '}
              <a
                href="#"
                className="text-chain-cyan hover:underline inline-flex items-center gap-1"
              >
                <Github className="w-3 h-3" />
                GitHub
              </a>
            </p>
          </FadeSection>
        </div>
      </section>

      {/* ── 8. CTA FINAL ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-chain-bg">
        <FadeSection>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white mb-3">
              Une question, un partenariat, une proposition ?
            </h2>
            <p className="text-chain-cyan-light text-sm mb-8">
              L'équipe Shadow Garden est disponible pour tout échange sur le projet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:contact@chaincacao.tg"
                className="flex items-center justify-center gap-2 bg-chain-cyan text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-chain-bg transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                Contactez l'équipe
              </a>
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-chain-bg transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </FadeSection>
      </section>

    </div>
  );
}
