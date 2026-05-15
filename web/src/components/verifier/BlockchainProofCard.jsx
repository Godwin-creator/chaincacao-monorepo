import { useState } from 'react'
import { CheckCircle2, Copy, ExternalLink, FileJson, FileStack, RefreshCw, Shield, Upload, XCircle } from 'lucide-react'
import Card from '../ui/Card'

function truncateHash(value = '', start = 10, end = 8) {
  if (!value) return '—'
  if (value.length <= start + end + 3) return value
  return `${value.slice(0, start)}...${value.slice(-end)}`
}

async function sha256File(file) {
  const buffer = await file.arrayBuffer()
  const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

function HashRow({ label, value, href = null }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!value || value === '—') return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">{label}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs font-body font-semibold text-chain-cyan hover:underline"
        >
          <Copy size={13} />
          {copied ? 'Copié !' : 'Copier'}
        </button>
      </div>
      <p className="mt-2 break-all font-mono text-sm text-chain-cyan" title={value}>
        {truncateHash(value)}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-body font-semibold text-chain-cyan hover:underline"
        >
          Ouvrir la preuve
          <ExternalLink size={13} />
        </a>
      ) : null}
    </div>
  )
}

export default function BlockchainProofCard({ lot, onRehashCurrentGeoJson }) {
  const [uploadState, setUploadState] = useState({
    status: 'idle',
    hash: '',
    fileName: '',
    error: '',
  })

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const hash = await sha256File(file)
      setUploadState({
        status: hash === lot.hashes.geoJsonHashOnChain ? 'match' : 'mismatch',
        hash,
        fileName: file.name,
        error: '',
      })
    } catch {
      setUploadState({
        status: 'error',
        hash: '',
        fileName: file.name,
        error: "Le fichier n'a pas pu être rehaché.",
      })
    }
  }

  const geoJsonMatches = lot.geoJsonHashMatches

  return (
    <Card className="p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-chain-cyan" />
            <h3 className="text-lg font-sans font-semibold text-text-dark">Preuves blockchain</h3>
          </div>
          <p className="mt-1 text-sm font-body text-text-dark/60">
            Comparez les empreintes publiées on-chain avec les données actuellement présentes.
          </p>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-body font-semibold ${
          geoJsonMatches
            ? 'bg-cacao-green/10 text-cacao-green border border-cacao-green/20'
            : 'bg-error/10 text-error border border-error/20'
        }`}>
          {geoJsonMatches ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {geoJsonMatches ? 'Match GeoJSON' : 'Mismatch GeoJSON'}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <HashRow label="Hash GeoJSON on-chain" value={lot.hashes.geoJsonHashOnChain} href={lot.blockchain.lotTxUrl} />
        <HashRow label="Hash GeoJSON actuel" value={lot.hashes.geoJsonHashCurrent} />
        <HashRow label="Hash photo" value={lot.hashes.photoHash} />
        <HashRow label="Contrat" value={lot.hashes.contractAddress} href={lot.blockchain.contractUrl} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-gold-premium/25 bg-gold-premium/10 p-4">
          <div className="flex items-center gap-2">
            <FileJson size={16} className="text-gold-premium" />
            <p className="text-sm font-sans font-semibold text-text-dark">Recalcul du GeoJSON courant</p>
          </div>
          <p className="mt-2 text-sm font-body text-text-dark/70">
            Recalculez l'empreinte du GeoJSON actuellement disponible et comparez-la à la preuve on-chain.
          </p>
        </div>
        <button
          type="button"
          onClick={onRehashCurrentGeoJson}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-chain-cyan/20 px-4 py-3 text-sm font-sans font-semibold text-chain-cyan hover:bg-chain-cyan/5 transition-colors"
        >
          <RefreshCw size={16} />
          Rehasher le GeoJSON
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-chain-cyan" />
          <p className="text-sm font-sans font-semibold text-text-dark">Vérifier un fichier local</p>
        </div>
        <p className="mt-1 text-sm font-body text-text-dark/60">
          Importez un GeoJSON ou un document exporte pour comparer son SHA-256 au hash inscrit sur la blockchain.
        </p>

        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-chain-cyan px-4 py-3 text-sm font-sans font-semibold text-white hover:bg-chain-cyan/90 transition-colors">
          <FileStack size={16} />
          Charger un fichier
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>

        {uploadState.status !== 'idle' ? (
          <div className={`mt-4 rounded-2xl border p-4 ${
            uploadState.status === 'match'
              ? 'border-cacao-green/20 bg-cacao-green/5'
              : uploadState.status === 'mismatch'
                ? 'border-error/20 bg-error/5'
                : 'border-gold-premium/20 bg-gold-premium/5'
          }`}>
            <p className="text-sm font-sans font-semibold text-text-dark">{uploadState.fileName}</p>
            <p className="mt-1 break-all font-mono text-xs text-chain-cyan">{uploadState.hash || uploadState.error}</p>
            {uploadState.status === 'match' ? (
              <p className="mt-2 text-sm font-body text-cacao-green">Le hash du fichier correspond à la preuve on-chain.</p>
            ) : uploadState.status === 'mismatch' ? (
              <p className="mt-2 text-sm font-body text-error">Le hash du fichier ne correspond pas à la preuve on-chain.</p>
            ) : (
              <p className="mt-2 text-sm font-body text-gold-premium">{uploadState.error}</p>
            )}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
