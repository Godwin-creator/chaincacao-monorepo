import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, History, Search, ChevronRight, AlertTriangle, ExternalLink,
  CheckSquare, Square, RotateCcw, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import {
  fetchTransferableLots,
  fetchProcessors,
  fetchTransferHistory,
} from '../../lib/api'
import Badge from '../../components/ui/Badge'
import TeamAvatar from '../../components/team/TeamAvatar'
import KpiCard from '../../components/dashboard/KpiCard'
import ProcessorCard from '../../components/cooperative/ProcessorCard'
import SelectionSummary from '../../components/cooperative/SelectionSummary'
import TransferConfirmModal from '../../components/cooperative/TransferConfirmModal'
import { formatWeight, formatRelativeDate, formatFullDate, formatDelta } from '../../utils/format'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SPECIES_VARIANT = { cacao: 'cacao', robusta: 'robusta', arabica: 'arabica' }

function speciesVariant(s) {
  return SPECIES_VARIANT[(s ?? '').toLowerCase()] ?? 'neutral'
}

const STATUS_HISTORY_LABEL = {
  received_by_processor: 'Réceptionné',
  in_transit: 'En transit',
  pending: 'En attente',
}
const STATUS_HISTORY_BADGE = {
  received_by_processor: 'success',
  in_transit: 'info',
  pending: 'warning',
}

// ─── Lot row (tableau desktop) ────────────────────────────────────────────────

function LotRow({ lot, selected, onToggle }) {
  return (
    <tr
      onClick={onToggle}
      className={`border-b border-gray-50 cursor-pointer transition-colors ${
        selected ? 'bg-chain-bg/5' : 'hover:bg-gray-50/50'
      }`}
    >
      <td className="py-3 px-4 w-10">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            selected ? 'bg-chain-cyan border-chain-cyan' : 'border-gray-300'
          }`}
        >
          {selected && <span className="text-white text-xs leading-none">✓</span>}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs font-mono text-chain-cyan">{lot.lotUuid}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <TeamAvatar name={lot.producer.name} size="sm" />
          <div>
            <p className="text-sm font-body font-medium text-text-dark truncate max-w-[130px]">
              {lot.producer.name}
            </p>
            <p className="text-xs font-body text-text-dark/50">{lot.producer.commune}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant={speciesVariant(lot.species)}>{lot.species}</Badge>
      </td>
      <td className="py-3 px-4 text-sm font-body text-text-dark">
        {formatWeight(lot.weightVerifiedKg ?? lot.weightAnnouncedKg)}
      </td>
      <td className="py-3 px-4 text-xs font-body text-text-dark/60">
        <span title={formatFullDate(lot.receivedAt)}>{formatRelativeDate(lot.receivedAt)}</span>
      </td>
      <td className="py-3 px-4">
        {lot.weightDeltaPct != null ? (
          <Badge variant={Math.abs(lot.weightDeltaPct) > 2 ? 'warning' : 'success'}>
            {formatDelta(lot.weightDeltaPct)}
          </Badge>
        ) : (
          <span className="text-text-dark/30 text-xs">—</span>
        )}
      </td>
    </tr>
  )
}

// ─── Lot card (mobile) ────────────────────────────────────────────────────────

function LotCard({ lot, selected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`relative bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all ${
        selected ? 'border-chain-cyan bg-chain-bg/5 shadow-sm' : 'border-gray-100'
      }`}
    >
      <div className={`absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        selected ? 'bg-chain-cyan border-chain-cyan' : 'border-gray-300'
      }`}>
        {selected && <span className="text-white text-xs leading-none">✓</span>}
      </div>

      <div className="flex items-center gap-2 mb-2 pr-7">
        <TeamAvatar name={lot.producer.name} size="sm" />
        <div>
          <p className="text-sm font-sans font-semibold text-text-dark">{lot.producer.name}</p>
          <p className="text-xs font-body text-text-dark/50">{lot.producer.commune}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs font-body">
        <div>
          <p className="text-text-dark/40 mb-0.5">Espèce</p>
          <Badge variant={speciesVariant(lot.species)}>{lot.species}</Badge>
        </div>
        <div>
          <p className="text-text-dark/40 mb-0.5">Poids</p>
          <p className="font-medium text-text-dark">
            {formatWeight(lot.weightVerifiedKg ?? lot.weightAnnouncedKg)}
          </p>
        </div>
        <div>
          <p className="text-text-dark/40 mb-0.5">Reçu</p>
          <p className="text-text-dark/60">{formatRelativeDate(lot.receivedAt)}</p>
        </div>
      </div>
      <p className="text-xs font-mono text-text-dark/40 mt-2">{lot.lotUuid}</p>
    </div>
  )
}

// ─── Transfer history card ────────────────────────────────────────────────────

function HistoryCard({ transfer }) {
  const [expanded, setExpanded] = useState(false)
  const txShort = transfer.txHash
    ? transfer.txHash.slice(0, 8) + '…' + transfer.txHash.slice(-6)
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-body text-text-dark/40">
            {formatRelativeDate(transfer.transferredAt)}
          </p>
          <p className="text-base font-sans font-semibold text-text-dark mt-0.5">
            → {transfer.processor.name}
          </p>
          <p className="text-sm font-body text-text-dark/60">
            {transfer.lotsCount} lot{transfer.lotsCount > 1 ? 's' : ''} ·{' '}
            {formatWeight(transfer.totalWeightKg)}
          </p>
        </div>
        <Badge variant={STATUS_HISTORY_BADGE[transfer.status] ?? 'neutral'}>
          {STATUS_HISTORY_LABEL[transfer.status] ?? transfer.status}
        </Badge>
      </div>

      {/* Espèces */}
      {transfer.speciesBreakdown?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {transfer.speciesBreakdown.map((s) => (
            <Badge key={s.species} variant={speciesVariant(s.species)}>
              {s.species} · {formatWeight(s.weightKg)}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {txShort && (
          <a
            href={`https://polygonscan.com/tx/${transfer.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-mono text-chain-cyan hover:underline"
          >
            {txShort}
            <ExternalLink size={10} />
          </a>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs font-body text-text-dark/50 hover:text-text-dark transition-colors ml-auto"
        >
          Voir les lots
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-2 max-h-32 overflow-y-auto">
              {transfer.lotsUuids.map((uuid) => (
                <span key={uuid} className="text-xs font-mono text-text-dark/60 px-1">{uuid}</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TransferLot() {
  const { user } = useAuth()

  const [view, setView] = useState('new')
  const [source, setSource] = useState(null)

  // Onglet "nouveau transfert"
  const [transferableLots, setTransferableLots] = useState([])
  const [processors, setProcessors] = useState([])
  const [loadingNew, setLoadingNew] = useState(true)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectedProcessor, setSelectedProcessor] = useState(null)
  const [notes, setNotes] = useState('')
  const [lotSearch, setLotSearch] = useState('')
  const [lotSpecies, setLotSpecies] = useState('all')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Onglet "historique"
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [historySearch, setHistorySearch] = useState('')

  // Guard beforeunload
  const selectedCount = selectedIds.size
  useEffect(() => {
    if (selectedCount === 0) return
    const fn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', fn)
    return () => window.removeEventListener('beforeunload', fn)
  }, [selectedCount])

  // Chargement lots + transformateurs
  useEffect(() => {
    let cancelled = false
    setLoadingNew(true)
    Promise.all([fetchTransferableLots(user?.id), fetchProcessors()]).then(
      ([lotsRes, procRes]) => {
        if (cancelled) return
        setTransferableLots(lotsRes.lots ?? [])
        setProcessors(procRes.processors ?? [])
        setSource(lotsRes.source)
        setLoadingNew(false)
      },
    )
    return () => { cancelled = true }
  }, [user?.id])

  // Chargement historique (lazy — seulement au premier switch d'onglet)
  useEffect(() => {
    if (view !== 'history' || historyLoaded) return
    let cancelled = false
    setLoadingHistory(true)
    fetchTransferHistory(user?.id).then(({ transfers }) => {
      if (cancelled) return
      setHistory(transfers ?? [])
      setLoadingHistory(false)
      setHistoryLoaded(true)
    })
    return () => { cancelled = true }
  }, [view, historyLoaded, user?.id])

  // ── Sélection ───────────────────────────────────────────────────────────────

  const toggleLot = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filteredLots = transferableLots.filter((l) => {
    if (lotSpecies !== 'all' && l.species.toLowerCase() !== lotSpecies.toLowerCase()) return false
    if (lotSearch) {
      const q = lotSearch.toLowerCase()
      if (!l.lotUuid.toLowerCase().includes(q) && !l.producer.name.toLowerCase().includes(q)) return false
    }
    return true
  })

  const allVisibleSelected =
    filteredLots.length > 0 && filteredLots.every((l) => selectedIds.has(l.id))

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredLots.forEach((l) => next.delete(l.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredLots.forEach((l) => next.add(l.id))
        return next
      })
    }
  }

  function resetSelection() {
    if (selectedCount > 0 && !window.confirm('Réinitialiser la sélection ?')) return
    setSelectedIds(new Set())
    setSelectedProcessor(null)
    setNotes('')
  }

  const selectedLots = transferableLots.filter((l) => selectedIds.has(l.id))

  // Incompatibilité transformateur : espèces sélectionnées non supportées
  const selectedSpecies = [...new Set(selectedLots.map((l) => l.species))]

  function incompatibleSpeciesFor(processor) {
    if (selectedSpecies.length === 0) return []
    return selectedSpecies.filter(
      (s) => !processor.specialties.some((sp) => sp.toLowerCase() === s.toLowerCase()),
    )
  }

  // Historique filtré
  const filteredHistory = history.filter((t) => {
    if (!historySearch) return true
    const q = historySearch.toLowerCase()
    return t.processor.name.toLowerCase().includes(q) || t.processor.commune.toLowerCase().includes(q)
  })

  const monthlyTransfers = history.filter((t) => {
    const d = new Date(t.transferredAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthlyKg = monthlyTransfers.reduce((s, t) => s + t.totalWeightKg, 0)
  const activeProcessors = new Set(history.map((t) => t.processor.id)).size

  return (
    <div className="flex flex-col gap-6">
      {/* ── A. En-tête ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <nav className="flex items-center gap-1.5 text-xs font-body text-text-dark/40 mb-1">
            <Link to="/cooperative" className="hover:text-chain-cyan transition-colors">
              Tableau de bord
            </Link>
            <ChevronRight size={12} />
            <span className="text-text-dark/70">Transferts</span>
          </nav>
          <h1 className="text-2xl font-sans font-bold text-text-dark">
            Transferts vers transformateurs
          </h1>
          <p className="text-sm font-body text-text-dark/50 mt-0.5">
            {view === 'new'
              ? 'Sélectionnez les lots à expédier en transformation'
              : 'Consultez vos transferts effectués'}
          </p>
        </div>
        {source === 'mock' && <Badge variant="warning">Mode démonstration</Badge>}
      </div>

      {/* ── B. Onglets ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-100">
        {[
          { id: 'new', icon: Truck, label: 'Nouveau transfert' },
          {
            id: 'history',
            icon: History,
            label: 'Historique',
            count: history.length || undefined,
          },
        ].map(({ id, icon: Icon, label, count }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-sans font-semibold transition-colors ${
              view === id ? 'text-chain-cyan' : 'text-text-dark/50 hover:text-text-dark'
            }`}
          >
            <Icon size={15} />
            {label}
            {count != null && (
              <span className="text-xs font-body bg-chain-cyan/10 text-chain-cyan rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
            {view === id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-chain-cyan rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ONGLET NOUVEAU TRANSFERT
      ══════════════════════════════════════════════════════════════════════ */}
      {view === 'new' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Colonne principale */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* ── D. Sélection des lots ────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-sans font-bold text-text-dark">
                  Lots disponibles
                  {!loadingNew && (
                    <span className="text-text-dark/40 font-normal text-sm ml-2">
                      ({filteredLots.length})
                    </span>
                  )}
                </h2>
                <p className="text-sm font-body text-text-dark/50 mt-0.5">
                  Sélectionnez les lots à inclure dans ce transfert
                </p>
              </div>

              {/* Filtres compacts */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[160px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dark/30" />
                  <input
                    type="text"
                    value={lotSearch}
                    onChange={(e) => setLotSearch(e.target.value)}
                    placeholder="UUID ou producteur…"
                    className="w-full pl-8 pr-4 py-2 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-chain-cyan/40"
                  />
                </div>
                <select
                  value={lotSpecies}
                  onChange={(e) => setLotSpecies(e.target.value)}
                  className="px-3 py-2 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-chain-cyan/40 bg-white"
                >
                  <option value="all">Toutes espèces</option>
                  <option value="Cacao">Cacao</option>
                  <option value="Robusta">Robusta</option>
                  <option value="Arabica">Arabica</option>
                </select>
                {filteredLots.length > 0 && (
                  <button
                    onClick={toggleAllVisible}
                    className="flex items-center gap-1.5 text-sm font-body text-chain-cyan hover:underline px-1"
                  >
                    {allVisibleSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                    {allVisibleSelected ? 'Désélectionner tout' : 'Tout sélectionner'}
                  </button>
                )}
              </div>

              {/* Chargement */}
              {loadingNew && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-7 h-7 border-2 border-chain-cyan border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* État vide */}
              {!loadingNew && filteredLots.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center bg-white rounded-2xl border border-gray-100">
                  <Truck size={32} className="text-gray-200" />
                  {transferableLots.length === 0 ? (
                    <>
                      <p className="text-base font-sans font-semibold text-text-dark">Aucun lot prêt à être transféré</p>
                      <p className="text-sm font-body text-text-dark/50">Tous les lots reçus ont déjà été expédiés.</p>
                      <Link
                        to="/cooperative/lots-received?filter=pending"
                        className="text-sm font-body text-chain-cyan hover:underline"
                      >
                        Voir les lots en attente de réception →
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-body text-text-dark/60">Aucun lot ne correspond aux filtres.</p>
                      <button
                        onClick={() => { setLotSearch(''); setLotSpecies('all') }}
                        className="flex items-center gap-1 text-sm font-body text-chain-cyan hover:underline"
                      >
                        <RotateCcw size={13} />
                        Réinitialiser les filtres
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Desktop : tableau */}
              {!loadingNew && filteredLots.length > 0 && (
                <>
                  <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="py-3 px-4 w-10">
                            <div
                              onClick={toggleAllVisible}
                              className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center ${
                                allVisibleSelected ? 'bg-chain-cyan border-chain-cyan' : 'border-gray-300'
                              }`}
                            >
                              {allVisibleSelected && <span className="text-white text-xs">✓</span>}
                            </div>
                          </th>
                          {['UUID', 'Producteur', 'Espèce', 'Poids', 'Reçu le', 'Écart'].map((h) => (
                            <th key={h} className="py-3 px-4 text-xs font-body font-semibold text-text-dark/50">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLots.map((lot) => (
                          <LotRow
                            key={lot.id}
                            lot={lot}
                            selected={selectedIds.has(lot.id)}
                            onToggle={() => toggleLot(lot.id)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile : cards */}
                  <div className="flex flex-col gap-3 md:hidden">
                    {filteredLots.map((lot) => (
                      <LotCard
                        key={lot.id}
                        lot={lot}
                        selected={selectedIds.has(lot.id)}
                        onToggle={() => toggleLot(lot.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── E. Choix transformateur ──────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-sans font-bold text-text-dark">
                  Transformateur destinataire
                </h2>
                <p className="text-sm font-body text-text-dark/50 mt-0.5">
                  Choisissez le partenaire qui réceptionnera ces lots
                </p>
              </div>
              {loadingNew ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-7 h-7 border-2 border-chain-cyan border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {processors.map((proc) => {
                    const incompat = incompatibleSpeciesFor(proc)
                    return (
                      <ProcessorCard
                        key={proc.id}
                        processor={proc}
                        selected={selectedProcessor?.id === proc.id}
                        onSelect={() =>
                          setSelectedProcessor((prev) => prev?.id === proc.id ? null : proc)
                        }
                        incompatibleSpecies={incompat}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── F. Notes ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-sans font-semibold text-text-dark">
                Notes pour le transformateur{' '}
                <span className="text-text-dark/40 font-normal text-sm">(optionnel)</span>
              </h2>
              <div className="relative">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  rows={3}
                  placeholder="Ex : Lots à traiter en priorité, instructions spéciales…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-chain-cyan/50 resize-none"
                />
                <span className="absolute bottom-2 right-3 text-xs font-body text-text-dark/30">
                  {notes.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* ── C. Sidebar récapitulatif (desktop) ───────────────────────────── */}
          <div className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-4">
              <SelectionSummary
                selectedLots={selectedLots}
                processor={selectedProcessor}
                onConfirm={() => setShowConfirmModal(true)}
                onReset={resetSelection}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom bar mobile (nouveau transfert) ─────────────────────────────── */}
      {view === 'new' && (selectedCount > 0 || selectedProcessor) && (
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-gray-100 shadow-lg px-4 py-3">
          <SelectionSummary
            selectedLots={selectedLots}
            processor={selectedProcessor}
            onConfirm={() => setShowConfirmModal(true)}
            onReset={resetSelection}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ONGLET HISTORIQUE
      ══════════════════════════════════════════════════════════════════════ */}
      {view === 'history' && (
        <div className="flex flex-col gap-6">
          {/* ── G. Stats rapides ─────────────────────────────────────────────── */}
          {historyLoaded && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                icon={Truck}
                value={monthlyTransfers.length}
                label="Transferts ce mois"
                iconColor="text-chain-cyan"
                iconBg="bg-chain-cyan/10"
              />
              <KpiCard
                icon={History}
                value={monthlyKg}
                label="Poids total transféré (mois)"
                iconColor="text-cacao-brown"
                iconBg="bg-cacao-brown/10"
                suffix=" kg"
                decimals={1}
              />
              <KpiCard
                icon={Truck}
                value={activeProcessors}
                label="Transformateurs partenaires"
                iconColor="text-cacao-green"
                iconBg="bg-cacao-green/10"
              />
            </div>
          )}

          {/* ── H. Liste historique ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-sans font-bold text-text-dark">
                Historique des transferts
              </h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dark/30" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Transformateur…"
                  className="pl-8 pr-4 py-2 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-chain-cyan/40 w-48"
                />
              </div>
            </div>

            {loadingHistory && (
              <div className="flex items-center justify-center py-12">
                <div className="w-7 h-7 border-2 border-chain-cyan border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loadingHistory && filteredHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center bg-white rounded-2xl border border-gray-100">
                <History size={28} className="text-gray-200" />
                <p className="text-sm font-body text-text-dark/50">Aucun transfert dans l'historique.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {filteredHistory.map((t) => (
                <HistoryCard key={t.id} transfer={t} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmation ────────────────────────────────────────────────── */}
      <TransferConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        lots={selectedLots}
        processor={selectedProcessor ?? { id: '', name: '', commune: '' }}
        notes={notes}
        onSuccess={(res, action) => {
          if (action === 'reset') {
            setSelectedIds(new Set())
            setSelectedProcessor(null)
            setNotes('')
          }
          setHistoryLoaded(false)
        }}
        onViewHistory={() => setView('history')}
      />
    </div>
  )
}
