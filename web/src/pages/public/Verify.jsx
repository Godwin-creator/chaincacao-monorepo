import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Search, AlertCircle, CheckCircle, Clock, XCircle,
  MapPin, Copy, Check, ExternalLink, Download, Shield,
  Lock, Sprout, Users, Factory, Ship, ShieldCheck,
  ChevronRight, QrCode, FileText, FileJson, FileCheck,
} from 'lucide-react';
import { fetchLotById } from '../../lib/api';
import LoadingState from '../../components/ui/LoadingState';

const ParcelMap = lazy(() => import('../../components/maps/ParcelMap'));

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}

function formatRelative(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diffMs / 86400000);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return 'hier';
  if (d < 30) return `il y a ${d} jour${d > 1 ? 's' : ''}`;
  const m = Math.floor(d / 30);
  if (m < 12) return `il y a ${m} mois`;
  const y = Math.floor(d / 365);
  return `il y a ${y} an${y > 1 ? 's' : ''}`;
}

function truncateHash(hash, start = 8, end = 6) {
  if (!hash || hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}…${hash.slice(-end)}`;
}

function getCenter(geoJson) {
  if (!geoJson) return { lat: 6.95, lng: 0.73 };
  const coords =
    geoJson.type === 'FeatureCollection'
      ? geoJson.features?.[0]?.geometry?.coordinates?.[0]
      : geoJson.type === 'Feature'
      ? geoJson.geometry?.coordinates?.[0]
      : geoJson.coordinates?.[0];
  if (!coords?.length) return { lat: 6.95, lng: 0.73 };
  const n = coords.length - 1;
  const lat = coords.slice(0, n).reduce((s, c) => s + c[1], 0) / n;
  const lng = coords.slice(0, n).reduce((s, c) => s + c[0], 0) / n;
  return { lat, lng };
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Composants atomiques ─────────────────────────────────────────────────────

function CopyButton({ text, title = 'Copier' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };
  return (
    <button
      onClick={handleCopy}
      title={title}
      className="ml-2 p-1 rounded hover:bg-chain-cyan/10 transition-colors text-chain-cyan"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-success" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function HashDisplay({ label, hash }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-cacao-brown-light">{label} :</span>
      <span
        className="font-mono text-xs text-chain-cyan cursor-pointer break-all"
        title={hash}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? hash : truncateHash(hash)}
      </span>
      <CopyButton text={hash} title="Copier le hash" />
    </div>
  );
}

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

// Badge de statut coloré
const STATUS_MAP = {
  Harvested:  { label: 'Récolte',         cls: 'bg-chain-cyan/15 text-chain-cyan border border-chain-cyan/30' },
  Collected:  { label: 'Collecte',         cls: 'bg-chain-cyan/15 text-chain-cyan border border-chain-cyan/30' },
  Processed:  { label: 'Transformation',   cls: 'bg-gold-premium/15 text-cacao-brown border border-gold-premium/30' },
  Exported:   { label: 'Exporté',          cls: 'bg-success/15 text-success border border-success/30' },
  Verified:   { label: 'Vérifié',          cls: 'bg-success text-white' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: 'bg-cream text-cacao-brown border border-cacao-brown/20' };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// Étapes de la chaîne
const ALL_STEPS = [
  { key: 'Harvested', label: 'Récolte',         Icon: Sprout },
  { key: 'Collected', label: 'Collecte',         Icon: Users },
  { key: 'Processed', label: 'Transformation',   Icon: Factory },
  { key: 'Exported',  label: 'Export',           Icon: Ship },
  { key: 'Verified',  label: 'Vérification UE',  Icon: ShieldCheck },
];

// ─── Modal QR Scanner ─────────────────────────────────────────────────────────
function QrModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <QrCode className="w-12 h-12 text-chain-cyan mx-auto mb-4" />
        <h3 className="text-lg font-semibold font-sans text-chain-bg mb-2">
          Scanner un QR code
        </h3>
        <p className="text-sm text-cacao-brown-light mb-6">
          Cette fonctionnalité est disponible sur l'application mobile ChainCacao.
          Scannez le code QR imprimé sur l'emballage du lot.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-chain-cyan text-white py-2.5 rounded-xl font-semibold hover:bg-chain-bg transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ─── Page de recherche (route /verify sans lotId) ─────────────────────────────
function VerifySearch() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) navigate(`/verify/${trimmed}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-cream px-4 py-16">
      {showQrModal && <QrModal onClose={() => setShowQrModal(false)} />}

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg text-center"
      >
        {/* Icône */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-chain-bg mb-6 shadow-lg">
          <Shield className="w-8 h-8 text-chain-cyan" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-chain-bg mb-3">
          Vérifier un lot ChainCacao
        </h1>
        <p className="text-cacao-brown-light text-base mb-8">
          Saisissez l'identifiant du lot ou scannez son QR code pour accéder
          à l'intégralité de la chaîne de traçabilité.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cacao-brown-light pointer-events-none" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex : LOT-001 ou UUID complet"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-cacao-brown/20 bg-white text-text-dark placeholder-cacao-brown-light focus:outline-none focus:ring-2 focus:ring-chain-cyan/50 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-chain-cyan text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-chain-bg transition-colors text-sm whitespace-nowrap"
          >
            Vérifier
          </button>
        </form>

        <button
          onClick={() => setShowQrModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-cacao-brown/20 bg-white text-cacao-brown hover:border-chain-cyan hover:text-chain-cyan transition-colors text-sm font-medium mb-8"
        >
          <QrCode className="w-4 h-4" />
          Scanner un QR code
        </button>

        {/* Chips mocks */}
        <div className="flex items-center justify-center flex-wrap gap-2">
          <span className="text-xs text-cacao-brown-light">Essayer :</span>
          {['LOT-001', 'LOT-002', 'LOT-003'].map((id) => (
            <button
              key={id}
              onClick={() => navigate(`/verify/${id}`)}
              className="text-xs px-3 py-1.5 rounded-full bg-chain-cyan/10 text-chain-cyan border border-chain-cyan/20 hover:bg-chain-cyan hover:text-white transition-colors font-mono font-medium"
            >
              {id}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page complète de vérification d'un lot ───────────────────────────────────
function VerifyLot({ lotId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({ source: null, lot: null });

  useEffect(() => {
    setLoading(true);
    fetchLotById(lotId).then((r) => {
      setResult(r);
      setLoading(false);
    });
  }, [lotId]);

  if (loading) return <LoadingState />;

  const { source, lot } = result;

  // ── État erreur ────────────────────────────────────────────────────────────
  if (!lot) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-cream">
        <AlertCircle className="w-14 h-14 text-error mb-4" />
        <h2 className="text-2xl font-sans font-bold text-chain-bg mb-2">Lot introuvable</h2>
        <p className="text-cacao-brown-light max-w-sm mb-8">
          L'identifiant <span className="font-mono text-cacao-brown">{lotId}</span> n'existe
          pas dans le registre ChainCacao.
        </p>
        <button
          onClick={() => navigate('/verify')}
          className="bg-chain-cyan text-white px-6 py-3 rounded-xl font-semibold hover:bg-chain-bg transition-colors"
        >
          Réessayer une autre recherche
        </button>
      </div>
    );
  }

  // ── Détermination du badge de conformité ────────────────────────────────────
  const isFullyVerified = lot.eudrCompliant && lot.status === 'Verified';
  const isExported = lot.status === 'Exported' && lot.eudrCompliant;
  const isInProgress = ['Harvested', 'Collected', 'Processed'].includes(lot.status);

  const complianceBadge = isFullyVerified
    ? { text: '✓ Conforme EUDR · Vérifié on-chain', cls: 'bg-success text-white', Icon: CheckCircle }
    : isExported
    ? { text: '✓ Conforme EUDR', cls: 'bg-white border-2 border-success text-success', Icon: CheckCircle }
    : isInProgress
    ? { text: '⏳ En cours de traçabilité', cls: 'bg-chain-cyan text-white', Icon: Clock }
    : { text: '✗ Non vérifié', cls: 'bg-error text-white', Icon: XCircle };

  const weightKg = (lot.weightGrams / 1000).toLocaleString('fr-FR');
  const center = getCenter(lot.parcel?.geoJson);
  const displayId = lot.shortId ?? lotId;

  const completedSteps = new Set(lot.chain.map((t) => t.step));

  return (
    <div className="bg-cream min-h-screen pb-16">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-cacao-brown/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-cacao-brown-light">
          <Link to="/" className="hover:text-chain-cyan transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/verify" className="hover:text-chain-cyan transition-colors">Vérification</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-mono text-cacao-brown">{displayId}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8">

        {/* ── A. BADGE CONFORMITÉ ──────────────────────────────────────────── */}
        <FadeSection>
          <div className="relative mb-10">
            {source === 'mock' && (
              <span className="absolute top-0 right-0 text-xs font-semibold bg-warning/20 text-cacao-brown border border-warning/30 px-2.5 py-0.5 rounded-full">
                Mode démonstration
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-chain-bg mb-5 pr-36">
              Vérification du lot{' '}
              <span className="font-mono text-chain-cyan">{displayId}</span>
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center gap-2 text-sm sm:text-base font-bold px-5 py-3 rounded-2xl shadow-sm ${complianceBadge.cls}`}
              >
                <complianceBadge.Icon className="w-5 h-5 flex-shrink-0" />
                {complianceBadge.text}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-cacao-brown-light max-w-xl">
              Cette information est immuable et vérifiable publiquement sur la blockchain Polygon.
            </p>
          </div>
        </FadeSection>

        {/* ── B. INFORMATIONS DU LOT ───────────────────────────────────────── */}
        <FadeSection delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Caractéristiques */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-cacao-brown/8">
              <h2 className="text-sm font-semibold text-chain-bg uppercase tracking-wide mb-4">
                Caractéristiques du lot
              </h2>
              <dl className="space-y-3">
                <DetailRow label="Espèce" value={lot.species} />
                <DetailRow label="Poids net" value={`${weightKg} kg`} />
                <DetailRow label="Date de récolte" value={formatDate(lot.harvestDate)} />
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-xs text-cacao-brown-light">Statut</dt>
                  <dd><StatusBadge status={lot.status} /></dd>
                </div>
                <div className="pt-2 border-t border-cacao-brown/8">
                  <dt className="text-xs text-cacao-brown-light mb-1">Identifiant blockchain</dt>
                  <dd className="flex items-center">
                    <span
                      className="font-mono text-xs text-chain-cyan break-all"
                      title={lot.lotUuid}
                    >
                      {truncateHash(lot.lotUuid, 12, 8)}
                    </span>
                    <CopyButton text={lot.lotUuid} title="Copier l'identifiant complet" />
                  </dd>
                </div>
              </dl>
            </div>

            {/* Acteurs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-cacao-brown/8">
              <h2 className="text-sm font-semibold text-chain-bg uppercase tracking-wide mb-4">
                Acteurs de la chaîne
              </h2>
              <ul className="space-y-2.5">
                {ALL_STEPS.map(({ key, label, Icon }) => {
                  const transfer = lot.chain.find((t) => t.step === key);
                  const isDone = !!transfer;
                  return (
                    <li
                      key={key}
                      className={`flex items-start gap-3 ${!isDone ? 'opacity-40' : ''}`}
                    >
                      <span className={`mt-0.5 p-1.5 rounded-lg ${isDone ? 'bg-chain-cyan/10 text-chain-cyan' : 'bg-cacao-brown/10 text-cacao-brown-light'}`}>
                        {isDone ? <Icon className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-chain-bg">{label}</p>
                        <p className="text-xs text-cacao-brown-light truncate">
                          {isDone
                            ? `${transfer.actor} · ${transfer.organization}`
                            : 'Étape non atteinte'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </FadeSection>

        {/* ── C. PARCELLE ─────────────────────────────────────────────────── */}
        <FadeSection delay={0.05}>
          <section className="mb-8">
            <h2 className="text-xl font-sans font-bold text-chain-bg mb-4">
              Parcelle géolocalisée
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carte */}
              <Suspense
                fallback={
                  <div className="h-[450px] bg-cream animate-pulse rounded-xl flex items-center justify-center">
                    <p className="text-sm text-cacao-brown-light">Chargement de la carte…</p>
                  </div>
                }
              >
                <ParcelMap geoJson={lot.parcel?.geoJson} height="450px" showAreaBadge />
              </Suspense>

              {/* Infos parcelle */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-cacao-brown/8 flex flex-col gap-4">
                <h3 className="font-semibold text-chain-bg">{lot.parcel?.name ?? '—'}</h3>

                <dl className="space-y-3">
                  <DetailRow label="Superficie" value={`${lot.parcel?.areaHa ?? '—'} ha`} />
                  <DetailRow label="Commune" value={lot.producer?.commune ?? '—'} />
                  <DetailRow label="Région" value={lot.producer?.region ?? '—'} icon={<MapPin className="w-3 h-3" />} />
                  <div>
                    <dt className="text-xs text-cacao-brown-light mb-1">Coordonnées centre</dt>
                    <dd className="font-mono text-xs text-cacao-brown">
                      {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto pt-4 border-t border-cacao-brown/8 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      downloadBlob(
                        JSON.stringify(lot.parcel.geoJson, null, 2),
                        `${displayId}_parcelle.geojson`,
                        'application/geo+json'
                      )
                    }
                    className="flex items-center gap-2 text-xs font-medium text-chain-cyan hover:text-chain-bg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger le GeoJSON
                  </button>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lng}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-medium text-chain-cyan hover:text-chain-bg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Voir sur OpenStreetMap
                  </a>
                </div>
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── D. TIMELINE ─────────────────────────────────────────────────── */}
        <FadeSection delay={0.05}>
          <section className="mb-8">
            <h2 className="text-xl font-sans font-bold text-chain-bg mb-6">
              Parcours du lot
            </h2>
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-cacao-brown/10" />

              <ul className="space-y-0">
                {ALL_STEPS.map(({ key, label, Icon }, idx) => {
                  const transfer = lot.chain.find((t) => t.step === key);
                  const isDone = !!transfer;
                  const isLast = idx === ALL_STEPS.length - 1;

                  return (
                    <li
                      key={key}
                      className={`relative flex gap-4 pb-6 ${isLast ? 'pb-0' : ''}`}
                    >
                      {/* Icône */}
                      <div
                        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 shadow-sm ${
                          isDone
                            ? 'bg-chain-cyan text-white'
                            : 'bg-white border-2 border-dashed border-cacao-brown/20 text-cacao-brown-light'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Contenu */}
                      <div className={`flex-1 pt-1.5 ${!isDone ? 'opacity-40' : ''}`}>
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                          <span className="font-semibold text-sm text-chain-bg">{label}</span>
                          {isDone && (
                            <span className="text-xs text-cacao-brown-light" title={formatDate(transfer.timestamp)}>
                              {formatRelative(transfer.timestamp)}
                            </span>
                          )}
                        </div>

                        {isDone ? (
                          <>
                            <p className="text-xs text-cacao-brown mb-1.5">
                              {transfer.actor}
                              <span className="text-cacao-brown-light"> · {transfer.organization}</span>
                            </p>
                            {transfer.txHash && (
                              <a
                                href={transfer.txUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-xs text-chain-cyan hover:underline"
                                title={transfer.txHash}
                              >
                                {truncateHash(transfer.txHash)}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-cacao-brown-light">Étape non encore enregistrée</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </FadeSection>

        {/* ── E. PREUVES BLOCKCHAIN ────────────────────────────────────────── */}
        <FadeSection delay={0.05}>
          <section className="mb-8">
            <h2 className="text-xl font-sans font-bold text-chain-bg mb-4">
              Preuves cryptographiques
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Hash GeoJSON */}
              <div className="bg-chain-bg/5 rounded-2xl p-5 border border-cacao-brown/8">
                <div className="flex items-center gap-2 mb-3">
                  <FileJson className="w-4 h-4 text-chain-cyan" />
                  <span className="text-xs font-semibold text-chain-bg uppercase tracking-wide">Hash GeoJSON</span>
                </div>
                <div className="flex items-start gap-1 mb-3">
                  <span className="font-mono text-xs text-chain-cyan break-all leading-relaxed" title={lot.hashes.geoJsonHash}>
                    {truncateHash(lot.hashes.geoJsonHash, 10, 8)}
                  </span>
                  <CopyButton text={lot.hashes.geoJsonHash} />
                </div>
                <p className="text-xs text-cacao-brown-light leading-snug">
                  Téléchargez le fichier GeoJSON et recalculez le SHA-256 pour vérifier l'intégrité de la parcelle.
                </p>
              </div>

              {/* Hash photos */}
              <div className="bg-chain-bg/5 rounded-2xl p-5 border border-cacao-brown/8">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="w-4 h-4 text-chain-cyan" />
                  <span className="text-xs font-semibold text-chain-bg uppercase tracking-wide">Hash Photos</span>
                </div>
                <div className="flex items-start gap-1 mb-3">
                  <span className="font-mono text-xs text-chain-cyan break-all leading-relaxed" title={lot.hashes.photoHash}>
                    {truncateHash(lot.hashes.photoHash, 10, 8)}
                  </span>
                  <CopyButton text={lot.hashes.photoHash} />
                </div>
                <p className="text-xs text-cacao-brown-light leading-snug">
                  Empreinte cryptographique des photos de récolte soumises lors de l'enregistrement du lot.
                </p>
              </div>

              {/* Smart contract */}
              <div className="bg-chain-bg/5 rounded-2xl p-5 border border-cacao-brown/8">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-chain-cyan" />
                  <span className="text-xs font-semibold text-chain-bg uppercase tracking-wide">Smart Contract</span>
                </div>
                <div className="flex items-start gap-1 mb-1">
                  <span className="font-mono text-xs text-chain-cyan break-all" title={lot.hashes.contractAddress}>
                    {truncateHash(lot.hashes.contractAddress, 10, 6)}
                  </span>
                  <CopyButton text={lot.hashes.contractAddress} />
                </div>
                <p className="text-xs text-cacao-brown-light mb-3">Réseau : Polygon Amoy Testnet</p>
                <a
                  href={`https://amoy.polygonscan.com/address/${lot.hashes.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-chain-cyan hover:underline"
                >
                  Ouvrir dans Polygonscan
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <p className="mt-4 text-xs text-cacao-brown-light italic text-center">
              Toutes les données ci-dessus sont inscrites de manière permanente sur la blockchain
              Polygon et ne peuvent être modifiées.
            </p>
          </section>
        </FadeSection>

        {/* ── F. TÉLÉCHARGEMENTS ───────────────────────────────────────────── */}
        <FadeSection delay={0.05}>
          <section className="mb-10">
            <div className="bg-chain-bg rounded-2xl p-6 sm:p-8 text-white">
              <div className="mb-5">
                <h2 className="text-lg font-sans font-bold mb-1">Documents officiels pour l'importation</h2>
                <p className="text-chain-cyan-light text-xs">
                  Conformes au règlement (UE) 2023/1115 — EUDR
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={lot.certificateUrl}
                  download
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium px-4 py-3 rounded-xl border border-white/20"
                >
                  <FileText className="w-4 h-4" />
                  Certificat EUDR (PDF)
                </a>
                <button
                  onClick={() =>
                    downloadBlob(
                      JSON.stringify(lot.parcel.geoJson, null, 2),
                      `${displayId}_TRACES.geojson`,
                      'application/geo+json'
                    )
                  }
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium px-4 py-3 rounded-xl border border-white/20"
                >
                  <FileJson className="w-4 h-4" />
                  GeoJSON conforme TRACES
                </button>
                <button
                  onClick={() => alert('Rapport en cours de génération — disponible prochainement.')}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium px-4 py-3 rounded-xl border border-white/20"
                >
                  <Download className="w-4 h-4" />
                  Rapport de due diligence (PDF)
                </button>
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── G. FOOTER VÉRIFICATION ──────────────────────────────────────── */}
        <FadeSection delay={0.05}>
          <div className="text-center text-xs text-cacao-brown-light space-y-2 pt-4 border-t border-cacao-brown/10">
            <p>
              Cette page a été générée automatiquement par ChainCacao le{' '}
              {formatDate(new Date().toISOString())}.
            </p>
            <p>
              Pour signaler une anomalie :{' '}
              <a
                href="mailto:contact@chaincacao.tg"
                className="text-chain-cyan hover:underline"
              >
                contact@chaincacao.tg
              </a>
            </p>
            <button
              onClick={() => navigate('/verify')}
              className="inline-flex items-center gap-1 text-chain-cyan hover:underline mt-2"
            >
              ← Nouvelle recherche
            </button>
          </div>
        </FadeSection>

      </div>
    </div>
  );
}

// ─── Composant auxiliaire ligne de détail ─────────────────────────────────────
function DetailRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="flex items-center gap-1 text-xs text-cacao-brown-light">
        {icon}
        {label}
      </dt>
      <dd className="text-xs font-medium text-chain-bg text-right">{value}</dd>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function Verify() {
  const { lotId } = useParams();
  return lotId ? <VerifyLot lotId={lotId} /> : <VerifySearch />;
}
