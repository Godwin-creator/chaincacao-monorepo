import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Hexagon, ArrowRightLeft, Eye,
  Sprout, Users, Factory, Ship, ShieldCheck,
  DollarSign, Zap, Leaf, Globe,
} from 'lucide-react';
import Accordion from '../../components/ui/Accordion';
import StepDetail from '../../components/howitworks/StepDetail';
import FlowDiagram from '../../components/howitworks/FlowDiagram';

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

// ─── Données ──────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    Icon: Hexagon,
    title: 'Chaque lot est un NFT unique',
    desc: "À sa création, le lot reçoit un identifiant immuable sur Polygon. Aucun doublon, aucune fusion possible.",
  },
  {
    Icon: ArrowRightLeft,
    title: 'Chaque transfert est signé on-chain',
    desc: "Pesée, qualité, exportation : chaque acteur enregistre son intervention par une transaction blockchain horodatée.",
  },
  {
    Icon: Eye,
    title: 'Chaque vérification est publique',
    desc: "Un scan QR, et l'importateur UE consulte toute la chaîne. Sans inscription. Sans intermédiaire.",
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Récolte & Enregistrement',
    actor: 'Producteur',
    platform: 'Mobile · hors-ligne possible',
    Icon: Sprout,
    description:
      "Le producteur enregistre sa parcelle en marchant autour de son champ pour capturer le contour GPS. À chaque récolte, il crée un nouveau lot : photo du sac, poids, espèce, date. L'application fonctionne sans connexion.",
    dataPoints: [
      'Coordonnées GPS de la parcelle (polygone si > 4 ha)',
      'Espèce (cacao, robusta, arabica)',
      'Poids net en grammes',
      'Date de récolte (UNIX timestamp)',
      'Hash SHA-256 du GeoJSON',
      'Hash SHA-256 des photos',
    ],
  },
  {
    number: '02',
    title: 'Collecte & Vérification',
    actor: 'Coopérative',
    platform: 'Web · 4G stable',
    Icon: Users,
    description:
      "La coopérative scanne le QR du lot apporté par le producteur. Pesée de vérification : tout écart supérieur à 2 % déclenche une alerte automatique. Le transfert est validé sur blockchain.",
    dataPoints: [
      'Identité de la coopérative réceptrice',
      'Poids constaté (vs poids producteur)',
      'Écart calculé (%)',
      'Timestamp du transfert',
    ],
  },
  {
    number: '03',
    title: 'Transformation',
    actor: 'Transformateur',
    platform: 'Web · PC',
    Icon: Factory,
    description:
      "L'unité de transformation enregistre les paramètres qualité : durée de fermentation, taux d'humidité finale, profil de saveur. Chaque lot conserve son historique unique.",
    dataPoints: [
      'Durée de fermentation (jours)',
      "Taux d'humidité finale (%)",
      'Notes profil de saveur (hash)',
      'Photos étapes (hash)',
    ],
  },
  {
    number: '04',
    title: 'Exportation & Certificat EUDR',
    actor: 'Exportateur',
    platform: 'Web · PC',
    Icon: Ship,
    description:
      "L'exportateur sélectionne les lots et génère le certificat EUDR en un clic : compilation automatique des GeoJSON, hashes blockchain, déclaration de non-déforestation. Format conforme TRACES UE.",
    dataPoints: [
      "Identité de l'exportateur",
      'Numéro de certificat CC-EUDR-2026-XXXXXX',
      'Liste des lots concernés',
      'Pays destinataire',
    ],
  },
  {
    number: '05',
    title: 'Vérification Publique',
    actor: 'Vérificateur UE',
    platform: 'Web public · sans compte',
    Icon: ShieldCheck,
    description:
      "L'importateur européen, l'autorité douanière ou un organisme de certification scanne le QR. La page de vérification affiche l'historique complet, la carte de la parcelle, et les liens directs vers Polygonscan. Sans inscription, sans friction.",
    dataPoints: [
      'Toute la chaîne (anonymisée selon RGPD)',
      'GeoJSON téléchargeable',
      'Certificat EUDR PDF',
      'Liens Polygonscan vers chaque transaction',
    ],
    dataLabel: 'Données accessibles',
  },
];

const POLYGON_CARDS = [
  {
    Icon: DollarSign,
    title: 'Coût négligeable',
    desc: "Une transaction coûte moins de 0,001 USD. Économiquement viable pour des dizaines de milliers de lots.",
  },
  {
    Icon: Zap,
    title: 'Rapidité',
    desc: "Confirmation en 2-3 secondes. Compatible avec l'usage terrain.",
  },
  {
    Icon: Leaf,
    title: 'Empreinte carbone réduite',
    desc: "Polygon PoS consomme 99,99 % moins d'énergie qu'Ethereum. Cohérent avec l'EUDR.",
  },
  {
    Icon: Globe,
    title: 'Écosystème mature',
    desc: "Standard ERC-721 éprouvé, outils de vérification publics (Polygonscan).",
  },
];

const FAQ_ITEMS = [
  {
    question: "Et si le producteur n'a pas de connexion ?",
    answer:
      "L'application mobile fonctionne entièrement hors-ligne. Les données sont stockées localement et synchronisées automatiquement dès qu'une connexion 3G/4G est disponible.",
  },
  {
    question: 'Qui paie les frais de transaction blockchain ?',
    answer:
      "ChainCacao utilise un wallet maître qui finance toutes les transactions au nom des acteurs. Aucun acteur de la filière n'a besoin de cryptomonnaies.",
  },
  {
    question: "Comment garantir qu'un producteur ne triche pas sur la pesée initiale ?",
    answer:
      "La coopérative effectue une pesée de contrôle à réception. Tout écart supérieur à 2 % déclenche une alerte. Le poids final retenu est celui de la coopérative.",
  },
  {
    question: 'Les données personnelles des producteurs sont-elles publiques ?',
    answer:
      "Non. La page de vérification publique affiche le nom de l'organisation (coopérative) mais pas les coordonnées personnelles. Conforme RGPD.",
  },
  {
    question: "Comment l'UE peut-elle être sûre que les coordonnées GPS sont exactes ?",
    answer:
      "Les coordonnées sont capturées par le GPS du smartphone du producteur, avec précision à 6 décimales (~10 cm). Le hash du GeoJSON est inscrit sur blockchain au moment de l'enregistrement — toute altération ultérieure devient détectable.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HowItWorks() {
  return (
    <div className="bg-cream">

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="bg-chain-bg py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-semibold bg-chain-cyan/15 text-chain-cyan border border-chain-cyan/20 px-3 py-1 rounded-full mb-5">
              Pédagogie · Le parcours complet
            </span>
            <h1 className="text-3xl sm:text-4xl font-sans font-bold text-white mb-4">
              Comment fonctionne ChainCacao ?
            </h1>
            <p className="text-chain-cyan-light text-base sm:text-lg leading-relaxed">
              Suivez un sac de cacao de 50 kg, du champ de Wawa au chocolatier européen.
              Cinq étapes, cinq preuves blockchain.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. 3 PILIERS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg text-center mb-12">
              Le principe en 3 idées
            </h2>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PILLARS.map(({ Icon, title, desc }, idx) => (
              <FadeSection key={idx} delay={idx * 0.08}>
                <div className="bg-cream rounded-2xl p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-chain-bg flex items-center justify-center mb-4 shadow-sm">
                    <Icon className="w-5 h-5 text-chain-cyan" />
                  </div>
                  <h3 className="font-sans font-bold text-chain-bg mb-2 leading-snug">{title}</h3>
                  <p className="text-sm text-cacao-brown-light leading-relaxed">{desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. 5 ÉTAPES ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg text-center mb-16">
              Les 5 étapes du parcours
            </h2>
          </FadeSection>

          <div className="space-y-24">
            {STEPS.map((step, idx) => (
              <StepDetail
                key={step.number}
                {...step}
                reversed={idx % 2 === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FLOW DIAGRAM ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg text-center mb-3">
              Vue d'ensemble du flux
            </h2>
            <p className="text-center text-sm text-cacao-brown-light mb-12">
              De la récolte à la vérification douanière — chaque flèche est une transaction Polygon.
            </p>
          </FadeSection>
          <FlowDiagram />
        </div>
      </section>

      {/* ── 5. POURQUOI POLYGON ───────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg text-center mb-12">
              Pourquoi avoir choisi Polygon ?
            </h2>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POLYGON_CARDS.map(({ Icon, title, desc }, idx) => (
              <FadeSection key={idx} delay={idx * 0.07}>
                <div className="bg-white rounded-2xl p-5 h-full shadow-sm border border-cacao-brown/8">
                  <Icon className="w-6 h-6 text-chain-cyan mb-3" />
                  <h3 className="font-semibold text-chain-bg mb-1.5 text-sm">{title}</h3>
                  <p className="text-xs text-cacao-brown-light leading-relaxed">{desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg text-center mb-10">
              Questions fréquentes
            </h2>
          </FadeSection>
          <FadeSection delay={0.05}>
            <Accordion items={FAQ_ITEMS} />
          </FadeSection>
        </div>
      </section>

      {/* ── 7. CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-chain-bg">
        <FadeSection>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white mb-4">
              Prêt à explorer ChainCacao ?
            </h2>
            <p className="text-chain-cyan-light text-sm mb-8">
              Vérifiez un lot de démonstration ou créez votre compte pour rejoindre la filière.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/verify/LOT-001"
                className="bg-chain-cyan text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-chain-bg transition-colors text-sm"
              >
                Vérifier un lot de démo
              </Link>
              <Link
                to="/signup"
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-chain-bg transition-colors text-sm"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </FadeSection>
      </section>

    </div>
  );
}
