import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, AlertTriangle, LayoutGrid, LayoutList,
  ArrowUpDown, Bell, ChevronRight, FlaskConical,
  Sun, Package, CheckCircle, Clock, Scale, Droplets, Award,
} from 'lucide-react'
import { fetchProcessorLots } from '../../lib/api'
import { getQualityProgress, getQualityAlerts, getNextAction } from '../../utils/mockProcessor'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import KpiCard from '../../components/dashboard/KpiCard'
import ProcessingPipeline from '../../components/processor/ProcessingPipeline'
import { formatRelativeDate } from '../../utils/format'

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'all',        label: 'Tous' },
  { value: 'received',   label: 'En attente' },
  { value: 'fermenting', label: 'En fermentation' },
  { value: 'drying',     label: 'En séchage' },
  { value: 'processed',  label: 'Terminés' },
]

const SORT_OPTIONS = [
  { value: 'recent',  label: 'Plus récent' },
  { value: 'oldest',  label: 'Plus ancien' },
  { value: 'alerts',  label: 'Alertes en premier' },
]

const STATUS_BADGE = {
  received:   { label: 'En attente',      variant: 'neutral' },
  fermenting: { label: 'Fermentation',    variant: 'warning' },
  drying:     { label: 'Séchage',         variant: 'info' },
  processed:  { label: 'Terminé',         variant: 'success' },
}

const STAGE_BAR_COLOR = {
  fermentation: 'bg-cacao-brown',
  drying:       'bg-gold-premium',
  sorting:      'bg-chain-cyan',
  grading:      'bg-cacao-green',
  done:         'bg-cacao-green',
}

const STAGE_LABEL = {
  fermentation: (pct, lot) => {
    const days = lot.quality.fermentation.readings.length
    const target = lot.quality.fermentation.targetDays
    return `Fermentation · J+${days}/${target} (${pct}%)`
  },
  drying: (pct, lot) => {
    const last = lot.quality.drying.readings[lot.quality.drying.readings.length - 1]
    const hum = last ? last.humidityPct.toString().replace('.', ',') : '—'
    return `Séchage · Hum. ${hum} % (${pct}%)`
  },
  sorting: () => 'Tri & calibrage',
  grading: () => 'Saisie du grade',
  done:    () => 'Transformation terminée',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function contextStats(lot) {
  const { status, quality } = lot
  if (status === 'fermenting') {
    const last = quality.fermentation.readings[quality.fermentation.readings.length - 1]
    if (!last) return null
    return `T° : ${last.tempC.toString().replace('.', ',')}°C · Hum. ${last.humidityPct} %`
  }
  if (status === 'drying') {
    const last = quality.drying.readings[quality.drying.readings.length - 1]
    if (!last) return null
    return `Humidité : ${last.humidityPct.toString().replace('.', ',')} % · Cible 7-8 %`
  }
  if (status === 'processed') {
    const g = quality.grading
    return `Grade ${g.finalGrade ?? '—'} · ${quality.sorting.beanSizeCategory ?? '—'}`
  }
  return null
}

function sortLots(lots, sortBy) {
  const copy = [...lots]
  if (sortBy === 'oldest') {
    return copy.sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt))
  }
  if (sortBy === 'alerts') {
    return copy.sort((a, b) => getQualityAlerts(b).length - getQualityAlerts(a).length)
  }
  return copy.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
}

function buildPipeline(lots) {
  return {
    received:   lots.filter((l) => l.status === 'received').length,
    fermenting: lots.filter((l) => l.status === 'fermenting').length,
    drying:     lots.filter((l) => l.status === 'drying').length,
    ready:      lots.filter((l) => l.status === 'processed').length,
    avgFermentDays: null,
    avgDryingHumidity: null,
  }
}

// ── Sous-composants ───────────────────────────────────────────────────────────

function LotCard({ lot }) {
  const { stage, progressPct } = getQualityProgress(lot)
  const alerts = getQualityAlerts(lot)
  const nextAction = getNextAction(lot)
  const stats = contextStats(lot)
  const statusCfg = STATUS_BADGE[lot.status] ?? STATUS_BADGE.received
  const stageLabel = STAGE_LABEL[stage]?.(progressPct, lot) ?? stage
  const barColor = STAGE_BAR_COLOR[stage] ?? 'bg-chain-cyan'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
    >
      <Card className="overflow-hidden flex flex-col h-full">
        {/* Ribbon alertes */}
        {alerts.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <p className="text-xs font-body text-amber-700 truncate">
              {alerts.length} alerte{alerts.length > 1 ? 's' : ''} : {alerts[0]}
            </p>
          </div>
        )}

        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              <Badge variant="cacao">{lot.species}</Badge>
            </div>
            <span className="text-xs font-body text-text-dark/40 shrink-0">
              {formatRelativeDate(lot.receivedAt)}
            </span>
          </div>

          {/* UUID */}
          <p className="font-mono text-sm font-semibold text-text-dark truncate">{lot.lotUuid}</p>

          {/* Producteur */}
          <div>
            <p className="text-sm font-body font-semibold text-text-dark leading-snug">
              {lot.producerName}
            </p>
            <p className="text-xs font-body text-text-dark/50">
              {lot.originCooperative?.name} · {lot.producerCommune ?? lot.originCooperative?.commune}
            </p>
          </div>

          {/* Poids */}
          <p className="text-xs font-body text-text-dark/50">
            {lot.weightKg.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} kg
          </p>

          {/* Barre de progression */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-body text-text-dark/60 truncate">{stageLabel}</span>
              {lot.status !== 'processed' && (
                <span className="text-xs font-body text-text-dark/40">{progressPct}%</span>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-700`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Stats contextuelles */}
          {stats && (
            <p className="text-xs font-body text-text-dark/60 bg-gray-50 rounded-lg px-3 py-2">
              {stats}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-1">
            <Link
              to={`/processor/quality-entry/${lot.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-chain-cyan text-white text-sm font-body font-semibold rounded-xl px-3 py-2 hover:bg-chain-cyan/90 transition-colors"
            >
              Ouvrir <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function LotTableRow({ lot }) {
  const { stage, progressPct } = getQualityProgress(lot)
  const alerts = getQualityAlerts(lot)
  const statusCfg = STATUS_BADGE[lot.status] ?? STATUS_BADGE.received
  const stageLabel = STAGE_LABEL[stage]?.(progressPct, lot) ?? stage
  const barColor = STAGE_BAR_COLOR[stage] ?? 'bg-chain-cyan'

  return (
    <Link
      to={`/processor/quality-entry/${lot.id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
    >
      {/* Statut */}
      <div className="w-28 shrink-0">
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </div>

      {/* UUID + Producteur */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-semibold text-text-dark truncate">{lot.lotUuid}</p>
        <p className="text-xs font-body text-text-dark/50 truncate">{lot.producerName}</p>
      </div>

      {/* Espèce */}
      <div className="w-20 shrink-0 hidden md:block">
        <Badge variant="cacao">{lot.species}</Badge>
      </div>

      {/* Étape + barre */}
      <div className="w-40 shrink-0 hidden lg:block">
        <p className="text-xs font-body text-text-dark/70 truncate mb-1">{stageLabel}</p>
        <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Dernière action */}
      <div className="w-28 shrink-0 hidden xl:block">
        <p className="text-xs font-body text-text-dark/40">{formatRelativeDate(lot.receivedAt)}</p>
      </div>

      {/* Alertes */}
      <div className="w-8 shrink-0 flex justify-center">
        {alerts.length > 0 && <AlertTriangle size={16} className="text-amber-400" />}
      </div>

      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </Link>
  )
}

function EmptyState({ filter }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
        <Package size={28} className="text-gray-200" />
      </div>
      <div className="text-center">
        <p className="font-body font-semibold text-text-dark/60">Aucun lot dans cette étape</p>
        <p className="text-sm font-body text-text-dark/40 mt-1">
          {filter === 'all'
            ? 'Aucun lot en cours de transformation'
            : "Modifiez les filtres pour afficher d'autres lots"}
        </p>
      </div>
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function QualityEntry() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [lots, setLots]           = useState([])
  const [allLots, setAllLots]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [source, setSource]       = useState(null)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState(searchParams.get('filter') ?? 'all')
  const [alertsOnly, setAlerts]   = useState(false)
  const [sortBy, setSort]         = useState('recent')
  const [view, setView]           = useState('cards')

  // Chargement initial — tous les lots (pour le pipeline)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const res = await fetchProcessorLots('proc-atc-kpalime')
      if (!cancelled) {
        setAllLots(res.lots ?? [])
        setSource(res.source)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Filtrage côté client
  const filtered = useMemo(() => {
    let result = [...allLots]
    if (statusFilter !== 'all') result = result.filter((l) => l.status === statusFilter)
    if (alertsOnly) result = result.filter((l) => getQualityAlerts(l).length > 0)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.lotUuid.toLowerCase().includes(q) ||
          l.producerName.toLowerCase().includes(q) ||
          l.originCooperative?.name.toLowerCase().includes(q),
      )
    }
    return sortLots(result, sortBy)
  }, [allLots, statusFilter, alertsOnly, search, sortBy])

  const pipeline = useMemo(() => buildPipeline(allLots), [allLots])
  const alertCount = useMemo(() => allLots.filter((l) => getQualityAlerts(l).length > 0).length, [allLots])

  // KPI stats
  const kpiReadings = useMemo(() => {
    return allLots.reduce((acc, lot) => {
      return acc + lot.quality.fermentation.readings.length + lot.quality.drying.readings.length
    }, 0)
  }, [allLots])

  const kpiAvgFerm = useMemo(() => {
    const done = allLots.filter((l) => l.quality.fermentation.completedAt)
    if (!done.length) return null
    const avg = done.reduce((s, l) => s + l.quality.fermentation.readings.length, 0) / done.length
    return avg.toFixed(1).replace('.', ',')
  }, [allLots])

  const kpiAvgHum = useMemo(() => {
    const doneHum = allLots
      .filter((l) => l.quality.drying.humidityFinal != null)
      .map((l) => l.quality.drying.humidityFinal)
    if (!doneHum.length) return null
    const avg = doneHum.reduce((s, v) => s + v, 0) / doneHum.length
    return avg.toFixed(1).replace('.', ',')
  }, [allLots])

  function handlePipelineFilter(stageFilter) {
    setStatus(stageFilter)
    setSearchParams(stageFilter !== 'all' ? { filter: stageFilter } : {})
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-chain-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-body text-text-dark/40">Chargement des lots…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* ── En-tête ── */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs font-body text-text-dark/40 mb-3">
          <Link to="/processor" className="hover:text-chain-cyan transition-colors">Tableau de bord</Link>
          <ChevronRight size={12} />
          <span className="text-text-dark/70">Saisie qualité</span>
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-sans font-bold text-text-dark">
              Saisie qualité
            </h1>
            <p className="mt-1 text-sm font-body text-text-dark/60">
              Suivez et enregistrez les paramètres de transformation de vos lots
            </p>
          </div>

          {source === 'mock' && (
            <Badge variant="warning" className="shrink-0 mt-1">Mode démonstration</Badge>
          )}
        </div>
      </div>

      {/* ── Pipeline de progression ── */}
      <Card className="p-4 md:p-6">
        <p className="text-xs font-body font-semibold text-text-dark/40 uppercase tracking-wider mb-4">
          Pipeline de transformation
        </p>
        {/* Wrapper cliquable autour du pipeline — gère la navigation par étape */}
        <div className="[&_a]:!pointer-events-auto" onClick={(e) => {
          const href = e.target.closest('a')?.getAttribute('href')
          if (href) {
            const filterParam = new URL(href, window.location.origin).searchParams.get('filter')
            if (filterParam) { e.preventDefault(); handlePipelineFilter(filterParam) }
          }
        }}>
          <ProcessingPipeline pipeline={pipeline} />
        </div>
      </Card>

      {/* ── Filtres sticky ── */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 space-y-3">
        {/* Ligne 1 : recherche + vue */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dark/30" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher UUID, producteur…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-body text-text-dark placeholder:text-text-dark/30 focus:outline-none focus:border-chain-cyan transition-colors"
            />
          </div>

          <div className="flex gap-1 border border-gray-200 rounded-xl p-1 bg-white">
            <button
              onClick={() => setView('cards')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'cards' ? 'bg-chain-cyan/10 text-chain-cyan' : 'text-gray-400'}`}
              aria-label="Vue grille"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'table' ? 'bg-chain-cyan/10 text-chain-cyan' : 'text-gray-400'}`}
              aria-label="Vue tableau"
            >
              <LayoutList size={18} />
            </button>
          </div>
        </div>

        {/* Ligne 2 : filtres statut + alertes + tri */}
        <div className="flex gap-2 flex-wrap">
          {/* Filtre statut */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePipelineFilter(opt.value)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-chain-cyan text-white'
                    : 'bg-gray-100 text-text-dark/60 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {/* Toggle alertes */}
            <button
              onClick={() => setAlerts((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors ${
                alertsOnly
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-gray-100 text-text-dark/60 hover:bg-gray-200'
              }`}
            >
              <Bell size={13} />
              Alertes
              {alertCount > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  alertsOnly ? 'bg-amber-200 text-amber-800' : 'bg-amber-400 text-white'
                }`}>
                  {alertCount}
                </span>
              )}
            </button>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-body text-text-dark/60 bg-gray-100 border-none focus:outline-none focus:ring-1 focus:ring-chain-cyan/30"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Liste ── */}
      {filtered.length === 0 ? (
        <EmptyState filter={statusFilter} />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="overflow-hidden">
          {/* En-tête tableau */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-body font-semibold text-text-dark/50 uppercase tracking-wider">
            <span className="w-28 shrink-0">Statut</span>
            <span className="flex-1">UUID · Producteur</span>
            <span className="w-20 shrink-0 hidden md:block">Espèce</span>
            <span className="w-40 shrink-0 hidden lg:block">Étape</span>
            <span className="w-28 shrink-0 hidden xl:block">Reçu</span>
            <span className="w-8 shrink-0" />
            <span className="w-4 shrink-0" />
          </div>
          <AnimatePresence mode="popLayout">
            {filtered.map((lot) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout
              >
                <LotTableRow lot={lot} />
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      )}

      {/* ── KPI footer ── */}
      {allLots.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <KpiCard
            icon={Scale}
            value={kpiReadings}
            label="Relevés enregistrés ce mois"
            iconColor="text-chain-cyan"
            iconBg="bg-chain-cyan/10"
          />
          <KpiCard
            icon={Clock}
            value={kpiAvgFerm ?? 6.2}
            label="Temps moyen fermentation (jours)"
            iconColor="text-cacao-brown"
            iconBg="bg-cacao-brown/10"
            decimals={1}
          />
          <KpiCard
            icon={Droplets}
            value={kpiAvgHum ? parseFloat(kpiAvgHum.replace(',', '.')) : 7.1}
            label="Humidité finale moyenne"
            iconColor="text-cacao-green"
            iconBg="bg-cacao-green/10"
            suffix=" %"
            decimals={1}
          />
        </div>
      )}

    </div>
  )
}
