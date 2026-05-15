import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSearch,
  Search,
} from 'lucide-react'
import { fetchLotForInspection, fetchVerifierLots, verifyLotOnChain } from '../../lib/api'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import BlockchainProofCard from '../../components/verifier/BlockchainProofCard'
import { formatFullDate, formatWeight } from '../../utils/format'

const ParcelMap = lazy(() => import('../../components/maps/ParcelMap'))

async function sha256Text(value) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function statusLabel(status) {
  return status === 'verified' ? 'Lot vérifié' : 'Lot exporté'
}

function statusClasses(status) {
  return status === 'verified'
    ? 'bg-cacao-green/10 text-cacao-green border border-cacao-green/20'
    : 'bg-chain-cyan/10 text-chain-cyan border border-chain-cyan/20'
}

function InspectionSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchVerifierLots()
      .then(({ lots }) => {
        if (!cancelled) setSuggestions(lots.slice(0, 5))
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`/verifier/lot-inspection/${trimmed}`)
  }

  return (
    <div className="mx-auto max-w-3xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="p-6 md:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-chain-cyan/10">
              <FileSearch size={28} className="text-chain-cyan" />
            </div>
            <h1 className="mt-5 text-2xl md:text-3xl font-sans font-bold text-text-dark">
              Inspection détaillée d'un lot
            </h1>
            <p className="mt-3 text-sm md:text-base font-body text-text-dark/60">
              Saisissez l'UUID du lot exporté pour consulter la preuve blockchain, le GeoJSON et l'historique de vérification.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dark/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ex : EUDR-LOT-2026-001"
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-body text-text-dark placeholder:text-text-dark/35 focus:outline-none focus:border-chain-cyan transition-colors"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-chain-cyan px-5 py-3 text-sm font-sans font-semibold text-white hover:bg-chain-cyan/90 transition-colors"
              >
                Ouvrir le dossier
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-body text-text-dark/45">Exemples :</span>
              {suggestions.map((lot) => (
                <button
                  key={lot.id}
                  type="button"
                  onClick={() => navigate(`/verifier/lot-inspection/${lot.lotUuid}`)}
                  className="rounded-full border border-chain-cyan/20 bg-chain-cyan/5 px-3 py-1.5 text-xs font-mono font-semibold text-chain-cyan hover:bg-chain-cyan hover:text-white transition-colors"
                >
                  {lot.lotUuid}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function InspectionDetail({ uuid }) {
  const [lot, setLot] = useState(null)
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [rehashMessage, setRehashMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchLotForInspection(uuid)
      .then(({ source: src, lot: data }) => {
        if (cancelled) return
        if (!data) {
          setError('Le lot demandé est introuvable dans le registre de vérification.')
          setLoading(false)
          return
        }
        setLot(data)
        setSource(src)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message ?? 'Impossible de charger le dossier de vérification.')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [uuid])

  async function handleVerify() {
    if (!lot) return
    setVerifying(true)
    setError(null)
    const result = await verifyLotOnChain(lot.id)
    if (!result.success) {
      setError(result.error?.message ?? 'La verification on-chain a echoue.')
      setVerifying(false)
      return
    }
    setLot(result.lot)
    setVerifying(false)
  }

  async function handleRehashCurrentGeoJson() {
    if (!lot?.parcel?.geoJson) return
    const recalculated = await sha256Text(JSON.stringify(lot.parcel.geoJson))
    setRehashMessage(
      recalculated === lot.hashes.geoJsonHashOnChain
        ? 'Le GeoJSON courant correspond strictement à la preuve inscrite on-chain.'
        : 'Le GeoJSON courant ne correspond pas à la preuve inscrite on-chain.',
    )
  }

  function handleGenerateAuditReport() {
    if (!lot) return
    const html = `
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>Audit ${lot.lotUuid}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1A1612; }
            h1 { color: #1A4A5A; }
            .card { border: 1px solid #d9e1e6; border-radius: 12px; padding: 16px; margin-top: 16px; }
            ul { padding-left: 18px; }
          </style>
        </head>
        <body>
          <h1>Rapport d'audit ${lot.lotUuid}</h1>
          <p>Exportateur : ${lot.exporter.name}</p>
          <p>Producteur anonymisé : ${lot.anonymizedProducer}</p>
          <p>Certificat : ${lot.certificate.number}</p>
          <div class="card">
            <strong>Intégrité GeoJSON</strong>
            <p>${lot.geoJsonHashMatches ? 'Correspondance' : 'Divergence'} entre le hash on-chain et le GeoJSON courant.</p>
          </div>
          <div class="card">
            <strong>Alertes</strong>
            <ul>${(lot.alerts ?? []).map((alert) => `<li>${alert.message}</li>`).join('') || '<li>Aucune alerte</li>'}</ul>
          </div>
        </body>
      </html>
    `

    downloadBlob(html, `${lot.lotUuid}-audit-report.html`, 'text/html')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-chain-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !lot) {
    return (
      <div className="space-y-4">
        <Link to="/verifier" className="inline-flex items-center gap-2 text-sm font-body font-semibold text-chain-cyan hover:underline">
          <ArrowLeft size={15} />
          Retour au tableau de bord
        </Link>
        <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-4 text-sm font-body text-error">
          {error ?? 'Lot introuvable.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm font-body text-text-dark/55">
        <Link to="/verifier" className="hover:text-chain-cyan transition-colors">Dashboard</Link>
        <ArrowRight size={14} />
        <Link to="/verifier/lot-inspection" className="hover:text-chain-cyan transition-colors">Inspection</Link>
        <ArrowRight size={14} />
        <span className="font-mono text-text-dark">{lot.lotUuid}</span>
      </div>

      <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-sans font-bold text-text-dark">{lot.lotUuid}</h1>
            {source === 'mock' && <Badge variant="warning">Mode démonstration</Badge>}
          </div>
          <p className="mt-2 text-sm md:text-base font-body text-text-dark/60">
            Dossier d'inspection EUDR et preuve blockchain consolidée.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-body font-semibold ${statusClasses(lot.status)}`}>
              {statusLabel(lot.status)}
            </span>
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-body font-semibold ${
              lot.geoJsonHashMatches
                ? 'bg-cacao-green/10 text-cacao-green border border-cacao-green/20'
                : 'bg-error/10 text-error border border-error/20'
            }`}>
              {lot.geoJsonHashMatches ? 'Match on-chain' : 'Mismatch on-chain'}
            </span>
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-body font-semibold ${
              lot.conformityStatus === 'compliant'
                ? 'bg-gold-premium/10 text-cacao-brown border border-gold-premium/30'
                : 'bg-error/10 text-error border border-error/20'
            }`}>
              {lot.conformityStatus === 'compliant' ? 'Conforme EUDR' : 'Non conforme'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
          {lot.status === 'exported' && !lot.verified ? (
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-chain-cyan px-4 py-3 text-sm font-sans font-semibold text-white hover:bg-chain-cyan/90 disabled:opacity-60 transition-colors"
            >
              <BadgeCheck size={16} />
              {verifying ? 'Vérification en cours…' : 'Marquer comme vérifié'}
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleGenerateAuditReport}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-chain-cyan/20 px-4 py-3 text-sm font-sans font-semibold text-chain-cyan hover:bg-chain-cyan/5 transition-colors"
          >
            <Download size={16} />
            Générer rapport d'audit
          </button>

          <a
            href={lot.certificate.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-sans font-semibold text-text-dark hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={16} />
            Certificat EUDR
          </a>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">Producteur anonymise</p>
          <p className="mt-2 text-sm font-sans font-semibold text-text-dark">{lot.anonymizedProducer}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">Exportateur</p>
          <p className="mt-2 text-sm font-sans font-semibold text-text-dark">{lot.exporter.name}</p>
          <p className="text-xs font-body text-text-dark/60">{lot.exporter.port}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">Export</p>
          <p className="mt-2 text-sm font-sans font-semibold text-text-dark">{formatFullDate(lot.exportDate)}</p>
          <p className="text-xs font-body text-text-dark/60">{lot.destination.port}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">Produit</p>
          <p className="mt-2 text-sm font-sans font-semibold text-text-dark">{formatWeight(lot.product.weightKg)}</p>
          <p className="text-xs font-body text-text-dark/60">{lot.product.species} · Grade {lot.product.grade}</p>
        </Card>
      </section>

      {(lot.alerts ?? []).length > 0 ? (
        <Card className="p-5 border-gold-premium/30 bg-gold-premium/5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-gold-premium mt-0.5 shrink-0" />
            <div>
              <h2 className="text-base font-sans font-semibold text-text-dark">Alertes détectées</h2>
              <div className="mt-2 space-y-2">
                {lot.alerts.map((alert) => (
                  <p key={alert.code} className="text-sm font-body text-text-dark/75">
                    <span className="font-semibold">{alert.code}</span> · {alert.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5 border-cacao-green/20 bg-cacao-green/5">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-cacao-green mt-0.5 shrink-0" />
            <div>
              <h2 className="text-base font-sans font-semibold text-text-dark">Aucune alerte bloquante</h2>
              <p className="mt-2 text-sm font-body text-text-dark/70">
                Le dossier ne presente pas d ecart critique sur les preuves cryptographiques actuellement chargees.
              </p>
            </div>
          </div>
        </Card>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <BlockchainProofCard lot={lot} onRehashCurrentGeoJson={handleRehashCurrentGeoJson} />
          {rehashMessage ? (
            <div className={`rounded-2xl border px-4 py-3 text-sm font-body ${
              lot.geoJsonHashMatches
                ? 'border-cacao-green/20 bg-cacao-green/5 text-cacao-green'
                : 'border-error/20 bg-error/5 text-error'
            }`}>
              {rehashMessage}
            </div>
          ) : null}

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-sans font-semibold text-text-dark">Historique des vérifications</h2>
            <div className="mt-4 space-y-4">
              {lot.verificationHistory.map((entry, index) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-chain-cyan mt-1" />
                    {index < lot.verificationHistory.length - 1 ? <div className="w-px flex-1 bg-chain-cyan/20 mt-2" /> : null}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-sans font-semibold text-text-dark">{entry.action}</p>
                    <p className="text-xs font-body text-text-dark/60">
                      {entry.actor} · {formatFullDate(entry.timestamp)}
                    </p>
                    {entry.txHash ? (
                      <a
                        href={`https://amoy.polygonscan.com/tx/${entry.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-body font-semibold text-chain-cyan hover:underline"
                      >
                        Voir la transaction
                        <ExternalLink size={13} />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-sans font-semibold text-text-dark">Carte de la parcelle</h2>
            <p className="mt-1 text-sm font-body text-text-dark/60">
              GeoJSON actif utilise pour la verification documentaire.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl">
              <Suspense fallback={<div className="h-[320px] animate-pulse rounded-2xl bg-gray-100" />}>
                <ParcelMap geoJson={lot.parcel.geoJson} height="320px" />
              </Suspense>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-sans font-semibold text-text-dark">Synthèse du dossier</h2>
            <dl className="mt-4 space-y-3 text-sm font-body">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-text-dark/55">Numéro de certificat</dt>
                <dd className="font-semibold text-text-dark text-right">{lot.certificate.number}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-text-dark/55">Destination UE</dt>
                <dd className="font-semibold text-text-dark text-right">
                  {lot.destination.buyer} · {lot.destination.city}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-text-dark/55">Verification</dt>
                <dd className="font-semibold text-text-dark text-right">
                  {lot.verified ? `${lot.verifiedBy} · ${formatFullDate(lot.verifiedAt)}` : 'Non vérifié'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-text-dark/55">Source</dt>
                <dd className="font-semibold text-text-dark text-right">{source}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-body text-text-dark/70">
              {lot.auditNotes}
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default function LotInspection() {
  const { uuid } = useParams()

  if (!uuid) return <InspectionSearch />
  return <InspectionDetail key={uuid} uuid={uuid} />
}
