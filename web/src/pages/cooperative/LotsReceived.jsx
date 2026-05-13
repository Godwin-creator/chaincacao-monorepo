import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  QrCode, Search, RotateCcw, List, Map, AlertTriangle,
  ExternalLink, Truck, Eye, ChevronRight, Package,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { fetchCooperativeLots } from '../../lib/api'
import Badge from '../../components/ui/Badge'
import TeamAvatar from '../../components/team/TeamAvatar'
import ReceptionModal from '../../components/cooperative/ReceptionModal'
import { formatWeight, formatRelativeDate, formatFullDate, formatDelta } from '../../utils/format'

// ─── helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  pending: 'En attente',
  received: 'Reçu',
  transferred: 'Transféré',
  alert: 'Alerte',
}

const STATUS_BADGE = {
  pending: 'neutral',
  received: 'success',
  transferred: 'info',
  alert: 'danger',
}

const SPECIES_BADGE = {
  cacao: 'cacao',
  robusta: 'robusta',
  arabica: 'arabica',
}

function speciesBadgeVariant(s) {
  return SPECIES_BADGE[(s ?? '').toLowerCase()] ?? 'neutral'
}

// ─── Row / Card ───────────────────────────────────────────────────────────────

function LotActions({ lot, onReceive }) {
  if (lot.status === 'pending') {
    return (
      <button
        onClick={() => onReceive(lot)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-chain-cyan text-white text-xs font-sans font-semibold hover:bg-chain-cyan/90 transition-colors"
      >
        <QrCode size={12} />
        Réceptionner
      </button>
    )
  }
  if (lot.status === 'alert') {
    return (
      <button
        onClick={() => onReceive(lot)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-error/30 text-error text-xs font-sans font-semibold hover:bg-error/10 transition-colors"
      >
        <AlertTriangle size={12} />
        Voir l'écart
      </button>
    )
  }
  if (lot.status === 'received') {
    return (
      <div className="flex items-center gap-1">
        <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-text-dark/60 text-xs font-body hover:bg-gray-50 transition-colors">
          <Eye size={11} />
          Détails
        </button>
        <Link
          to="/cooperative/transfer-lot"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-chain-bg/10 text-chain-bg text-xs font-sans font-semibold hover:bg-chain-bg/20 transition-colors"
        >
          <Truck size={11} />
          Transférer
        </Link>
      </div>
    )
  }
  // transferred
  return (
    <a
      href={`/verify/${lot.lotUuid}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-text-dark/60 text-xs font-body hover:bg-gray-50 transition-colors"
    >
      <ExternalLink size={11} />
      Traçabilité
    </a>
  )
}

function DeltaBadge({ pct }) {
  if (pct === null || pct === undefined) return <span className="text-text-dark/30">—</span>
  const abs = Math.abs(pct)
  const variant = abs > 2 ? 'warning' : 'success'
  return <Badge variant={variant}>{formatDelta(pct)}</Badge>
}

function LotRow({ lot, onReceive }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="py-3 px-4 whitespace-nowrap">
        <Badge variant={STATUS_BADGE[lot.status] ?? 'neutral'}>
          {STATUS_LABEL[lot.status] ?? lot.status}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <a
          href={`/verify/${lot.lotUuid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-chain-cyan hover:underline"
        >
          {lot.lotUuid}
        </a>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <TeamAvatar name={lot.producer.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-body font-medium text-text-dark truncate max-w-[140px]">
              {lot.producer.name}
            </p>
            <p className="text-xs font-body text-text-dark/50">{lot.producer.commune}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant={speciesBadgeVariant(lot.species)}>{lot.species}</Badge>
      </td>
      <td className="py-3 px-4 text-sm font-body text-text-dark">
        {formatWeight(lot.weightAnnouncedKg)}
      </td>
      <td className="py-3 px-4 text-sm font-body text-text-dark">
        {lot.weightVerifiedKg != null ? formatWeight(lot.weightVerifiedKg) : '—'}
      </td>
      <td className="py-3 px-4">
        <DeltaBadge pct={lot.weightDeltaPct} />
      </td>
      <td className="py-3 px-4 text-xs font-body text-text-dark/60 whitespace-nowrap">
        <span title={formatFullDate(lot.receivedAt ?? lot.harvestDate)}>
          {formatRelativeDate(lot.receivedAt ?? lot.harvestDate)}
        </span>
      </td>
      <td className="py-3 px-4">
        <LotActions lot={lot} onReceive={onReceive} />
      </td>
    </tr>
  )
}

function LotCard({ lot, onReceive }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <TeamAvatar name={lot.producer.name} size="sm" />
          <div>
            <p className="text-sm font-sans font-semibold text-text-dark">{lot.producer.name}</p>
            <p className="text-xs font-body text-text-dark/50">{lot.producer.commune}</p>
          </div>
        </div>
        <Badge variant={STATUS_BADGE[lot.status] ?? 'neutral'}>
          {STATUS_LABEL[lot.status] ?? lot.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-body">
        <div>
          <p className="text-text-dark/40 mb-0.5">Espèce</p>
          <Badge variant={speciesBadgeVariant(lot.species)}>{lot.species}</Badge>
        </div>
        <div>
          <p className="text-text-dark/40 mb-0.5">Annoncé</p>
          <p className="font-medium text-text-dark">{formatWeight(lot.weightAnnouncedKg)}</p>
        </div>
        <div>
          <p className="text-text-dark/40 mb-0.5">Vérifié</p>
          <p className="font-medium text-text-dark">
            {lot.weightVerifiedKg != null ? formatWeight(lot.weightVerifiedKg) : '—'}
          </p>
        </div>
      </div>

      {lot.weightDeltaPct != null && (
        <div className="flex items-center gap-1.5">
          {Math.abs(lot.weightDeltaPct) > 2 && <AlertTriangle size={12} className="text-warning shrink-0" />}
          <DeltaBadge pct={lot.weightDeltaPct} />
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-body text-text-dark/40">
          {formatRelativeDate(lot.receivedAt ?? lot.harvestDate)}
        </span>
        <LotActions lot={lot} onReceive={onReceive} />
      </div>
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-chain-cyan/10 flex items-center justify-center">
        <Package size={28} className="text-chain-cyan/40" />
      </div>
      <div>
        <p className="text-base font-sans font-semibold text-text-dark">Aucun lot ne correspond</p>
        <p className="text-sm font-body text-text-dark/50 mt-1">Essayez d'ajuster vos filtres.</p>
      </div>
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-sm font-body text-chain-cyan hover:underline"
      >
        <RotateCcw size={14} />
        Réinitialiser les filtres
      </button>
    </div>
  )
}

// ─── Map placeholder ──────────────────────────────────────────────────────────

function MapPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
      <Map size={48} className="text-gray-200" />
      <div>
        <p className="text-base font-sans font-semibold text-text-dark">Vue cartographique</p>
        <p className="text-sm font-body text-text-dark/50 mt-1">
          Carte des parcelles fournisseurs — Disponible prochainement
        </p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LotsReceived() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState(null)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    status: searchParams.get('filter') ?? 'all',
    species: 'all',
    search: '',
  })
  const [view, setView] = useState(searchParams.get('view') === 'map' ? 'map' : 'list')

  const [modalOpen, setModalOpen] = useState(searchParams.get('action') === 'new')
  const [selectedLot, setSelectedLot] = useState(null)

  const hasActiveFilters =
    filters.status !== 'all' || filters.species !== 'all' || filters.search !== ''

  const loadLots = useCallback(() => {
    let cancelled = false
    setLoading(true)
    fetchCooperativeLots(user?.id, filters).then(({ source: src, lots: data }) => {
      if (cancelled) return
      setLots(data ?? [])
      setSource(src)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) { setError('Impossible de charger les lots.'); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [user?.id, filters])

  useEffect(() => loadLots(), [loadLots])

  function resetFilters() {
    setFilters({ status: 'all', species: 'all', search: '' })
  }

  function openReception(lot) {
    setSelectedLot(lot ?? null)
    setModalOpen(true)
  }

  function handleModalSuccess(updatedLot) {
    setLots((prev) =>
      prev.map((l) => (l.lotUuid === updatedLot.lotUuid ? { ...l, status: updatedLot.status } : l)),
    )
  }

  const totalCount = lots.length
  const pendingCount = lots.filter((l) => l.status === 'pending').length
  const alertCount = lots.filter((l) => l.status === 'alert').length

  return (
    <div className="flex flex-col gap-6">
      {/* ── A. En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <nav className="flex items-center gap-1.5 text-xs font-body text-text-dark/40 mb-1">
            <Link to="/cooperative" className="hover:text-chain-cyan transition-colors">
              Tableau de bord
            </Link>
            <ChevronRight size={12} />
            <span className="text-text-dark/70">Lots reçus</span>
          </nav>
          <h1 className="text-2xl font-sans font-bold text-text-dark">Lots reçus</h1>
          {!loading && (
            <p className="text-sm font-body text-text-dark/50 mt-0.5">
              {totalCount} lots
              {pendingCount > 0 && <> · <span className="text-warning font-medium">{pendingCount} en attente</span></>}
              {alertCount > 0 && <> · <span className="text-error font-medium">{alertCount} alerte{alertCount > 1 ? 's' : ''}</span></>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {source === 'mock' && (
            <Badge variant="warning">Mode démonstration</Badge>
          )}
          <button
            onClick={() => openReception(null)}
            className="flex items-center gap-2 bg-chain-cyan text-white rounded-xl px-4 py-2.5 text-sm font-sans font-semibold hover:bg-chain-cyan/90 transition-colors whitespace-nowrap"
          >
            <QrCode size={15} />
            Réceptionner un lot
          </button>
        </div>
      </div>

      {/* ── B. Barre filtres ────────────────────────────────────────────────── */}
      <div className="sticky top-0 md:top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-4 md:-mx-8 px-4 md:px-8 py-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dark/30" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="UUID, producteur, commune…"
            className="w-full pl-9 pr-4 py-2 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-chain-cyan/40"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-chain-cyan/40 bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="received">Reçus</option>
          <option value="transferred">Transférés</option>
          <option value="alert">Alertes</option>
        </select>

        <select
          value={filters.species}
          onChange={(e) => setFilters((f) => ({ ...f, species: e.target.value }))}
          className="px-3 py-2 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-chain-cyan/40 bg-white"
        >
          <option value="all">Toutes les espèces</option>
          <option value="Cacao">Cacao</option>
          <option value="Robusta">Robusta</option>
          <option value="Arabica">Arabica</option>
        </select>

        {/* Vue toggle */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden ml-auto">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-2 text-sm transition-colors ${view === 'list' ? 'bg-chain-cyan text-white' : 'text-text-dark/50 hover:bg-gray-50'}`}
            aria-label="Vue liste"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-3 py-2 text-sm transition-colors ${view === 'map' ? 'bg-chain-cyan text-white' : 'text-text-dark/50 hover:bg-gray-50'}`}
            aria-label="Vue carte"
          >
            <Map size={16} />
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-sm font-body text-text-dark/50 hover:text-error transition-colors px-2"
          >
            <RotateCcw size={13} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* ── C / D. Contenu ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-error bg-error/10 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-chain-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && view === 'map' && <MapPlaceholder />}

      {!loading && !error && view === 'list' && (
        <>
          {lots.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <>
              {/* Desktop : tableau */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      {['Statut', 'UUID', 'Producteur', 'Espèce', 'Annoncé', 'Vérifié', 'Écart', 'Date', 'Actions'].map((h) => (
                        <th key={h} className="py-3 px-4 text-xs font-body font-semibold text-text-dark/50 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot) => (
                      <LotRow key={lot.id} lot={lot} onReceive={openReception} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile : cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {lots.map((lot) => (
                  <LotCard key={lot.id} lot={lot} onReceive={openReception} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Modal réception ────────────────────────────────────────────────── */}
      <ReceptionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedLot(null) }}
        onSuccess={handleModalSuccess}
        initialUuid={selectedLot?.lotUuid ?? null}
      />
    </div>
  )
}
