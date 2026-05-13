import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle, ArrowRight, Award, BarChart3, Check,
  CheckCircle2, Factory, FileCheck, MapPin, Play,
  QrCode, Scale, Ship, ShieldCheck, Sprout, Users,
} from 'lucide-react'
import HeroChain from '../../components/home/HeroChain'
import StatCounter from '../../components/home/StatCounter'

// ── Données ───────────────────────────────────────────────────────────────────

const STATS = [
  {
    numericTarget: 40000,
    staticDisplay: null,
    suffix: '',
    label: "familles d'agriculteurs concernées au Togo",
  },
  {
    numericTarget: null,
    staticDisplay: '30–40 M$',
    suffix: '',
    label: 'de pertes annuelles sur les fraudes de pesée',
  },
  {
    numericTarget: 5,
    staticDisplay: null,
    suffix: ' %',
    label: "seul pourcentage d'exportations togolaises certifiées",
  },
  {
    numericTarget: 100,
    staticDisplay: null,
    suffix: ' %',
    label: 'des lots ChainCacao conformes EUDR',
  },
]

const PROBLEMS = [
  {
    Icon: Award,
    title: 'Exclusion des certifications premium',
    desc: "Sans traçabilité documentée, les coopératives togolaises ne peuvent accéder aux certifications Fairtrade, Bio ou Rainforest Alliance — qui multiplient les prix par 1,5 à 3.",
  },
  {
    Icon: Scale,
    title: 'Fraudes sur les pesées',
    desc: "L'absence d'enregistrement immuable des transferts de lots coûte entre 30 et 40 millions de dollars par an à la filière togolaise.",
  },
  {
    Icon: AlertTriangle,
    title: "Menace d'exclusion du marché UE",
    desc: "Le règlement EUDR 2025 impose une preuve géographique et de non-déforestation pour toute importation de cacao en UE. Sans système, c'est l'interdiction d'exporter.",
  },
]

const SOLUTIONS = [
  {
    Icon: MapPin,
    title: 'Géolocalisation GPS immuable',
    desc: "Les coordonnées GPS de chaque parcelle (6 décimales) et les polygones de délimitation sont inscrits sur Polygon, vérifiables publiquement.",
  },
  {
    Icon: BarChart3,
    title: 'Pesées on-chain',
    desc: "Chaque transfert de lot est enregistré automatiquement. Tout écart supérieur à 2 % déclenche une alerte immédiate pour toutes les parties.",
  },
  {
    Icon: FileCheck,
    title: 'Certificat EUDR automatique',
    desc: "PDF conforme + GeoJSON au format TRACES générés en un clic depuis le tableau de bord Exportateur. Zéro papier, zéro délai.",
  },
]

const HOW_IT_WORKS = [
  {
    Icon: Sprout,
    title: 'Enregistrement de la parcelle',
    desc: 'Le producteur crée le lot depuis son smartphone — coordonnées GPS, superficie, variété — même hors connexion.',
    badge: 'Mobile',
  },
  {
    Icon: Users,
    title: 'Réception coopérative',
    desc: 'La coopérative réceptionne le lot, vérifie la pesée et valide le transfert sur la blockchain.',
    badge: 'Web',
  },
  {
    Icon: Factory,
    title: 'Saisie qualité',
    desc: 'Le transformateur enregistre les données : séchage, fermentation, taux d\'humidité.',
    badge: 'Web',
  },
  {
    Icon: Ship,
    title: 'Génération EUDR',
    desc: "L'exportateur génère le certificat conforme et prépare les documents d'exportation en un clic.",
    badge: 'Web',
  },
  {
    Icon: ShieldCheck,
    title: 'Vérification UE',
    desc: "Le vérificateur scanne le QR code et consulte l'historique on-chain complet en 3 secondes.",
    badge: 'Public',
  },
]

const ACTORS = [
  {
    Icon: Sprout,
    role: 'Producteur',
    desc: 'Enregistre ses parcelles et lots depuis son smartphone, y compris hors-ligne en zone rurale.',
    badge: 'Mobile',
    badgeClass: 'text-gold-premium bg-gold-premium/10',
  },
  {
    Icon: Users,
    role: 'Coopérative',
    desc: 'Reçoit les lots, vérifie les pesées et transfère vers les transformateurs partenaires.',
    badge: 'Web',
    badgeClass: 'text-chain-cyan bg-chain-cyan/10',
  },
  {
    Icon: Factory,
    role: 'Transformateur',
    desc: 'Saisit les données qualité — séchage, fermentation, humidité — à chaque étape.',
    badge: 'Web',
    badgeClass: 'text-chain-cyan bg-chain-cyan/10',
  },
  {
    Icon: Ship,
    role: 'Exportateur',
    desc: 'Génère les certificats EUDR conformes TRACES et gère le registre d\'exportations.',
    badge: 'Web',
    badgeClass: 'text-chain-cyan bg-chain-cyan/10',
  },
  {
    Icon: ShieldCheck,
    role: 'Vérificateur UE',
    desc: 'Scanne le QR, vérifie l\'origine et télécharge les preuves on-chain en quelques secondes.',
    badge: 'Web public',
    badgeClass: 'text-success bg-success/10',
  },
]

const EUDR_CHECKLIST = [
  'Coordonnées GPS de chaque parcelle (6 décimales)',
  'Polygones conformes pour les parcelles de plus de 4 ha',
  'GeoJSON exportable au format TRACES',
  'Hash SHA-256 inscrit sur Polygon, vérifiable publiquement',
  'Rapport de due diligence PDF automatique',
  'Déclaration de non-déforestation horodatée',
]

const TEAM = [
  {
    initials: 'KG',
    name: 'EDOH BEDI Komi Godwin',
    role: 'Dev Web + Architecture',
    school: 'EPL',
    gradient: 'from-chain-cyan to-chain-bg',
  },
  {
    initials: 'DS',
    name: 'FOLIKPO-AWUTE Dzogoedzikpe Sophos',
    role: 'Dev Web',
    school: 'IAI Togo',
    gradient: 'from-cacao-green to-chain-cyan',
  },
  {
    initials: 'BK',
    name: 'KOUYOM Bikala',
    role: 'Dev Mobile',
    school: 'Lomé Business School',
    gradient: 'from-gold-link to-cacao-brown',
  },
  {
    initials: 'AA',
    name: 'QUENUM Abla Anne-Marie',
    role: 'Dev Mobile',
    school: 'ESA',
    gradient: 'from-chain-cyan-light to-cacao-green',
  },
]

// ── Utilitaire animation ──────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.48, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function badgeClass(badge) {
  if (badge === 'Mobile') return 'text-gold-premium bg-gold-premium/10'
  if (badge === 'Public') return 'text-success bg-success/10'
  return 'text-chain-cyan bg-chain-cyan/10'
}

// ── Sections ──────────────────────────────────────────────────────────────────

function SectionHero() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-cream to-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">

          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-chain-cyan/10 text-chain-cyan rounded-full px-4 py-1.5 text-sm font-body font-medium mb-8">
                <span>🇹🇬</span>
                <span>Miabé Hackathon 2026 · Projet T-01</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold leading-[1.07] text-text-dark">
                La traçabilité{' '}
                <span className="text-chain-cyan">blockchain</span>{' '}
                du café et cacao togolais
              </h1>
            </FadeIn>

            <FadeIn delay={0.12}>
              <p className="mt-6 text-lg md:text-xl font-body text-gray-500 leading-relaxed max-w-xl">
                ChainCacao permet à chaque acteur de la filière — du producteur de Wawa à
                l'importateur européen — de vérifier l'origine, le parcours et la conformité
                EUDR d'un lot. Immuablement. En 3 secondes.
              </p>
            </FadeIn>

            <FadeIn delay={0.18}>
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  to="/verify"
                  className="inline-flex items-center gap-2.5 px-7 py-4 bg-chain-cyan text-white font-sans font-semibold rounded-xl hover:bg-chain-cyan-light transition-colors text-base"
                >
                  <QrCode size={20} />
                  Vérifier un lot
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-2.5 px-7 py-4 border border-gray-200 text-text-dark font-sans font-semibold rounded-xl hover:border-chain-cyan hover:text-chain-cyan transition-colors text-base"
                >
                  <Play size={18} />
                  Voir la démo
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
                {['Conforme EUDR 2025', 'Blockchain Polygon', 'Open source'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 text-sm font-body text-gray-400">
                    <Check size={14} className="text-success" />
                    {item}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: 'easeOut' }}
          >
            <HeroChain />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function SectionStats() {
  return (
    <section className="bg-chain-bg py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionProblemSolution() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-text-dark">
            Pourquoi la filière togolaise a-t-elle besoin de ChainCacao ?
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <FadeIn>
            <h3 className="text-xl font-sans font-bold text-error mb-6 flex items-center gap-2">
              <AlertTriangle size={22} />
              Le problème
            </h3>
            <div className="flex flex-col gap-4">
              {PROBLEMS.map((p) => (
                <div key={p.title} className="bg-error/5 border border-error/15 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                      <p.Icon size={20} className="text-error" />
                    </div>
                    <div>
                      <h4 className="font-sans font-semibold text-text-dark text-sm">{p.title}</h4>
                      <p className="mt-1.5 text-sm font-body text-gray-500 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h3 className="text-xl font-sans font-bold text-success mb-6 flex items-center gap-2">
              <CheckCircle2 size={22} />
              Notre solution
            </h3>
            <div className="flex flex-col gap-4">
              {SOLUTIONS.map((s) => (
                <div key={s.title} className="bg-success/5 border border-success/15 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                      <s.Icon size={20} className="text-success" />
                    </div>
                    <div>
                      <h4 className="font-sans font-semibold text-text-dark text-sm">{s.title}</h4>
                      <p className="mt-1.5 text-sm font-body text-gray-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function SectionHowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-cream/40">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-text-dark">
            Le parcours d'un lot, du champ au consommateur
          </h2>
          <p className="mt-4 text-lg font-body text-gray-500">
            Cinq étapes, un enregistrement blockchain par transfert.
          </p>
        </FadeIn>

        {/* Mobile : timeline verticale */}
        <div className="flex flex-col lg:hidden">
          {HOW_IT_WORKS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.06}>
              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-chain-cyan/40 flex items-center justify-center shadow-sm shrink-0">
                    <step.Icon size={20} className="text-chain-cyan" />
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 my-2 min-h-8" />
                  )}
                </div>
                <div className="pb-8 pt-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono text-chain-cyan/60">Étape {i + 1}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${badgeClass(step.badge)}`}>
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="font-sans font-semibold text-text-dark">{step.title}</h3>
                  <p className="mt-1 text-sm font-body text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Desktop : timeline horizontale */}
        <div className="hidden lg:block relative">
          <div className="absolute top-7 left-[10%] right-[10%] h-0.5 bg-gray-200" />
          <div className="grid grid-cols-5 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.08} className="flex flex-col items-center text-center">
                <div className="relative z-10 w-14 h-14 rounded-full bg-white border-2 border-chain-cyan/40 flex items-center justify-center shadow-sm mb-4">
                  <step.Icon size={22} className="text-chain-cyan" />
                </div>
                <span className="text-xs font-mono text-chain-cyan/60 mb-1">Étape {i + 1}</span>
                <h3 className="font-sans font-semibold text-text-dark text-sm leading-snug">{step.title}</h3>
                <p className="mt-2 text-xs font-body text-gray-500 leading-relaxed">{step.desc}</p>
                <span className={`mt-3 text-xs font-mono px-2.5 py-1 rounded-full ${badgeClass(step.badge)}`}>
                  {step.badge}
                </span>
              </FadeIn>
            ))}
          </div>
        </div>

        <FadeIn className="mt-12 text-center">
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 text-chain-cyan font-body font-medium hover:underline"
          >
            Voir le processus détaillé
            <ArrowRight size={16} />
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}

function SectionActors() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-text-dark">
            Une plateforme, cinq acteurs
          </h2>
          <p className="mt-4 text-lg font-body text-gray-500">
            Chaque partie prenante dispose de son espace dédié, adapté à ses besoins.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {ACTORS.map((actor, i) => (
            <FadeIn key={actor.role} delay={i * 0.06}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full flex flex-col hover:border-chain-cyan/30 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-xl bg-chain-bg/5 flex items-center justify-center mb-4">
                  <actor.Icon size={24} className="text-chain-bg" />
                </div>
                <h3 className="font-sans font-bold text-text-dark mb-2">{actor.role}</h3>
                <p className="text-sm font-body text-gray-500 leading-relaxed flex-1">{actor.desc}</p>
                <span className={`mt-4 self-start text-xs font-mono px-2.5 py-1 rounded-full ${actor.badgeClass}`}>
                  {actor.badge}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionEUDR() {
  return (
    <section className="py-20 md:py-28 bg-chain-bg">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-white mb-6">
              Conforme au règlement EUDR 2025
            </h2>
            <p className="text-lg font-body text-white/60 leading-relaxed mb-8">
              Depuis 2025, l'Union Européenne exige une preuve de géolocalisation et de
              non-déforestation pour chaque importation de cacao et café. ChainCacao automatise
              cette conformité de bout en bout — sans saisie manuelle, sans risque d'erreur.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-body font-medium rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              <FileCheck size={18} />
              Télécharger un exemple de certificat
            </a>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ul className="space-y-5">
              {EUDR_CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <CheckCircle2 size={22} className="text-success shrink-0 mt-0.5" />
                  <span className="text-base font-body text-white/80 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function SectionTeam() {
  return (
    <section className="py-20 md:py-28 bg-cream/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-text-dark">
            L'équipe Shadow Garden — TG-16
          </h2>
          <p className="mt-4 text-lg font-body text-gray-500">
            4 étudiants togolais — Hackathon Miabé 2026
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member, i) => (
            <FadeIn key={member.name} delay={i * 0.07}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-sm transition-shadow">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-5`}
                >
                  <span className="text-white font-sans font-bold text-xl">{member.initials}</span>
                </div>
                <p className="font-sans font-semibold text-text-dark text-sm leading-snug">{member.name}</p>
                <p className="mt-1 text-chain-cyan text-sm font-body">{member.role}</p>
                <p className="mt-0.5 text-xs font-body text-gray-400">{member.school}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionCTAFinal() {
  return (
    <section className="py-24 md:py-32 bg-chain-bg">
      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-white leading-tight max-w-3xl mx-auto">
            Prêt à rendre votre filière traçable ?
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="mt-6 text-lg font-body text-white/60 max-w-2xl mx-auto leading-relaxed">
            Rejoignez les coopératives, transformateurs et exportateurs togolais qui sécurisent
            leur accès au marché européen grâce à la blockchain.
          </p>
        </FadeIn>
        <FadeIn delay={0.14}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-chain-bg font-sans font-bold rounded-xl hover:bg-chain-cyan-light hover:text-white transition-colors text-base"
            >
              Créer un compte
            </Link>
            <Link
              to="/verify"
              className="px-8 py-4 border-2 border-white/25 text-white font-sans font-semibold rounded-xl hover:border-white/50 transition-colors text-base"
            >
              Vérifier un lot
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <SectionHero />
      <SectionStats />
      <SectionProblemSolution />
      <SectionHowItWorks />
      <SectionActors />
      <SectionEUDR />
      <SectionTeam />
      <SectionCTAFinal />
    </>
  )
}
