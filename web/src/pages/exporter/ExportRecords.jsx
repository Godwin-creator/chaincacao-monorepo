import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  CalendarRange,
  ChevronDown,
  ExternalLink,
  FileDown,
  FileJson,
  Filter,
  PackageSearch,
  Plus,
  Search,
  ShipWheel,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { fetchBuyersList, fetchExporterShipments } from '../../lib/api'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import KpiCard from '../../components/dashboard/KpiCard'
import ShipmentStatusBadge from '../../components/exporter/ShipmentStatusBadge'
import ShipmentDetailModal from '../../components/exporter/ShipmentDetailModal'
import { formatFullDate, formatRelativeDate, formatWeight } from '../../utils/format'

const QUICK_FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'certified', label: 'Certifiés' },
  { key: 'in_transit', label: 'En transit' },
  { key: 'delivered', label: 'Livrés' },
]

const PAGE_SIZE = 4

const FLAGS = {
  BE: '🇧🇪',
  CH: '🇨🇭',
  DE: '🇩🇪',
  FR: '🇫🇷',
  NL: '🇳🇱',
}

function truncateHash(value = '') {
  if (!value) return '—'
  if (value.length <= 18) return value
  return `${value.slice(0, 10)}...${value.slice(-8)}`
}

function ShipmentDetailsInline({ shipment, onOpenModal }) {
  return (
    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/60">
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-sans font-semibold text-text-dark">Lots embarqués</h4>
            <button
              type="button"
              onClick={onOpenModal}
              className="text-xs font-body font-semibold text-chain-cyan hover:underline"
            >
              Ouvrir la fiche complète
            </button>
          </div>
          <div className="space-y-3">
            {shipment.lots.map((lot) => (
              <div key={lot.id ?? lot.lotUuid} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono text-chain-cyan">{lot.lotUuid}</p>
                    <p className="text-sm font-sans font-semibold text-text-dark">
                      {lot.origin?.producer ?? lot.producer?.name}
                    </p>
                    <p className="text-xs font-body text-text-dark/60">
                      {lot.producer?.commune || 'Origine non renseignée'} · Grade {lot.quality?.finalGrade ?? 'A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-sans font-semibold text-text-dark">{formatWeight(lot.weightKg ?? 0)}</p>
                    <Badge variant={String(lot.species).toLowerCase() === 'robusta' ? 'robusta' : 'cacao'}>
                      {lot.species}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-sans font-semibold text-text-dark">Timeline</h4>
          <div className="space-y-4">
            {shipment.timeline.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-chain-cyan mt-1" />
                  {index < shipment.timeline.length - 1 ? <div className="w-px flex-1 bg-chain-cyan/20 mt-2" /> : null}
                </div>
                <div>
                  <p className="text-sm font-sans font-semibold text-text-dark">{event.label}</p>
                  <p className="text-xs font-body text-text-dark/60">{formatFullDate(event.timestamp)}</p>
                  <p className="text-sm font-body text-text-dark/80 mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExportRecords() {
  const { user } = useAuth()
  const { shipmentId } = useParams()
  const [searchParams] = useSearchParams()
  const [buyers, setBuyers] = useState([])
  const [shipments, setShipments] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [expandedIds, setExpandedIds] = useState(() => (shipmentId ? [shipmentId] : []))
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [showAdvancedMobile, setShowAdvancedMobile] = useState(false)

  const initialStatus = searchParams.get('status') || 'all'
  const initialBuyer = searchParams.get('buyer') || 'all'
  const initialSearch = searchParams.get('q') || ''

  const [draftFilters, setDraftFilters] = useState({
    status: initialStatus,
    search: initialSearch,
    buyerId: initialBuyer,
    dateFrom: '',
    dateTo: '',
  })
  const [appliedFilters, setAppliedFilters] = useState({
    status: initialStatus,
    search: initialSearch,
    buyerId: initialBuyer,
    dateFrom: '',
    dateTo: '',
  })

  useEffect(() => {
    let cancelled = false

    fetchBuyersList()
      .then(({ buyers: data }) => {
        if (!cancelled) setBuyers(data)
      })
      .catch(() => {
        if (!cancelled) setBuyers([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchExporterShipments(user?.organizationId || 'exp-cacaomax-lome', appliedFilters)
      .then(({ source: src, shipments: data, totalCount: total }) => {
        if (cancelled) return
        setShipments(data)
        setTotalCount(total)
        setSource(src)
        setVisibleCount(PAGE_SIZE)
        if (shipmentId) {
          const target = data.find((shipment) => shipment.id === shipmentId)
          setSelectedShipment(target ?? null)
        }
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message ?? 'Impossible de charger les expéditions.')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [appliedFilters, shipmentId, user?.organizationId])

  const visibleShipments = shipments.slice(0, visibleCount)
  const hasMore = visibleCount < shipments.length

  const stats = useMemo(() => {
    const totalWeightKg = shipments.reduce((sum, shipment) => sum + (shipment.totalWeightKg ?? 0), 0)
    const certificatesIssued = shipments.filter((shipment) => shipment.certificate?.number).length
    return {
      shipments: totalCount,
      totalWeightKg,
      certificatesIssued,
    }
  }, [shipments, totalCount])

  function handleQuickFilter(status) {
    const next = { ...draftFilters, status }
    setLoading(true)
    setError(null)
    setDraftFilters(next)
    setAppliedFilters(next)
  }

  function handleApplyFilters() {
    setLoading(true)
    setError(null)
    setAppliedFilters({ ...draftFilters })
  }

  function toggleExpanded(id) {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-chain-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-body text-error">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-sans font-bold text-text-dark">
                Expéditions et certificats
              </h1>
              {source === 'mock' ? <Badge variant="warning">Mode démonstration</Badge> : null}
            </div>
            <p className="mt-2 text-sm md:text-base font-body text-text-dark/60">
              Historique complet de vos exports certifiés EUDR
            </p>
          </div>

          <Link
            to="/exporter/eudr-certificate"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-chain-cyan px-4 py-3 text-sm font-sans font-semibold text-white hover:bg-chain-cyan/90 transition-colors"
          >
            <Plus size={18} />
            Nouvelle expédition
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_FILTERS.map((filter) => {
            const active = appliedFilters.status === filter.key
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => handleQuickFilter(filter.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-body font-semibold transition-colors ${
                  active
                    ? 'bg-chain-cyan text-white'
                    : 'bg-white text-text-dark/70 border border-chain-cyan/10 hover:bg-chain-cyan/5'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          icon={PackageSearch}
          value={stats.shipments}
          label="Expéditions totales"
          iconColor="text-chain-cyan"
          iconBg="bg-chain-cyan/10"
        />
        <KpiCard
          icon={ShipWheel}
          value={stats.totalWeightKg}
          label="Volume total exporté"
          iconColor="text-cacao-green"
          iconBg="bg-cacao-green/10"
          suffix=" kg"
          decimals={1}
        />
        <KpiCard
          icon={ShieldCheck}
          value={stats.certificatesIssued}
          label="Certificats émis"
          iconColor="text-chain-cyan"
          iconBg="bg-chain-cyan/10"
        />
      </section>

      <Card className="overflow-hidden">
        <div className="p-4 md:p-5 space-y-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dark/35" />
              <input
                value={draftFilters.search}
                onChange={(event) => setDraftFilters((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="Référence, acheteur, lot UUID"
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-body text-text-dark placeholder:text-text-dark/30 focus:outline-none focus:border-chain-cyan transition-colors"
              />
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setShowAdvancedMobile((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-2xl border border-chain-cyan/10 bg-chain-cyan/5 px-4 py-3 text-sm font-sans font-semibold text-text-dark"
              >
                <span className="inline-flex items-center gap-2">
                  <Filter size={16} className="text-chain-cyan" />
                  Filtres avancés
                </span>
                <ChevronDown
                  size={18}
                  className={`text-chain-cyan transition-transform ${showAdvancedMobile ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          <div className={`${showAdvancedMobile ? 'block' : 'hidden'} md:block`}>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
              <label className="space-y-2">
                <span className="text-xs font-body font-semibold text-text-dark/60">Acheteur</span>
                <select
                  value={draftFilters.buyerId}
                  onChange={(event) => setDraftFilters((prev) => ({ ...prev, buyerId: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-body text-text-dark focus:outline-none focus:border-chain-cyan transition-colors"
                >
                  <option value="all">Tous les acheteurs</option>
                  {buyers.map((buyer) => (
                    <option key={buyer.id} value={buyer.id}>
                      {buyer.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2">
                  <span className="text-xs font-body font-semibold text-text-dark/60">Du</span>
                  <div className="relative">
                    <CalendarRange size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dark/35" />
                    <input
                      type="date"
                      value={draftFilters.dateFrom}
                      onChange={(event) => setDraftFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-body text-text-dark focus:outline-none focus:border-chain-cyan transition-colors"
                    />
                  </div>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-body font-semibold text-text-dark/60">Au</span>
                  <input
                    type="date"
                    value={draftFilters.dateTo}
                    onChange={(event) => setDraftFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-body text-text-dark focus:outline-none focus:border-chain-cyan transition-colors"
                  />
                </label>
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="w-full md:w-auto rounded-2xl bg-text-dark px-5 py-3 text-sm font-sans font-semibold text-white hover:bg-text-dark/90 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {shipments.length === 0 ? (
        <Card className="p-8 md:p-12">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-chain-cyan/10">
              <ShipWheel size={28} className="text-chain-cyan" />
            </div>
            <h2 className="mt-5 text-xl font-sans font-semibold text-text-dark">Aucune expédition trouvée</h2>
            <p className="mt-2 text-sm font-body text-text-dark/60">
              Ajustez vos filtres ou créez une nouvelle expédition certifiée EUDR.
            </p>
            <Link
              to="/exporter/eudr-certificate"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-chain-cyan px-4 py-3 text-sm font-sans font-semibold text-white hover:bg-chain-cyan/90 transition-colors"
            >
              <Plus size={16} />
              Créer une expédition
            </Link>
          </div>
        </Card>
      ) : (
        <section className="space-y-4">
          {visibleShipments.map((shipment, index) => {
            const isExpanded = expandedIds.includes(shipment.id)
            const hash = shipment.certificate?.txHash ?? ''
            const flag = FLAGS[shipment.buyer?.country] ?? '🌍'

            return (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <Card className="overflow-hidden">
                  <div className="p-5 space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-sans font-semibold text-text-dark">{shipment.reference}</h3>
                          <ShipmentStatusBadge status={shipment.status} estimatedArrival={shipment.estimatedArrival} />
                        </div>
                        <p className="text-sm font-body text-text-dark/55">
                          Créée {formatRelativeDate(shipment.createdAt)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-chain-cyan/5 px-4 py-3">
                        <p className="text-xs font-body font-semibold uppercase tracking-wide text-chain-cyan">
                          Destinataire
                        </p>
                        <p className="mt-1 text-sm font-sans font-semibold text-text-dark">
                          {flag} {shipment.buyer?.name}
                        </p>
                        <p className="text-xs font-body text-text-dark/60">{shipment.buyer?.city}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                        <p className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">
                          Arrivée
                        </p>
                        <p className="mt-2 text-sm font-sans font-semibold text-text-dark">{shipment.destinationPort}</p>
                        <p className="text-xs font-body text-text-dark/60">
                          {shipment.status === 'in_transit' && shipment.estimatedArrival
                            ? `ETA ${formatFullDate(shipment.estimatedArrival)}`
                            : shipment.actualArrival
                              ? `Arrivé ${formatFullDate(shipment.actualArrival)}`
                              : shipment.vesselName || 'Planification en cours'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                        <p className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">
                          Lots et poids
                        </p>
                        <p className="mt-2 text-sm font-sans font-semibold text-text-dark">
                          {shipment.totalLotsCount} lot{shipment.totalLotsCount > 1 ? 's' : ''} · {formatWeight(shipment.totalWeightKg)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {shipment.speciesBreakdown.map((item) => (
                            <Badge
                              key={item.species}
                              variant={String(item.species).toLowerCase() === 'robusta' ? 'robusta' : 'cacao'}
                            >
                              {item.species} · {Math.round(item.weightKg)} kg
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                        <p className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">
                          Certificat
                        </p>
                        <p className="mt-2 text-sm font-sans font-semibold text-text-dark">
                          {shipment.certificate?.number ?? 'En attente'}
                        </p>
                        {shipment.certificate?.pdfUrl ? (
                          <a
                            href={shipment.certificate.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-body font-semibold text-chain-cyan hover:underline"
                          >
                            PDF du certificat
                            <ExternalLink size={13} />
                          </a>
                        ) : (
                          <p className="mt-2 text-xs font-body text-text-dark/50">Disponible après certification</p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                        <p className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">
                          Blockchain
                        </p>
                        <a
                          href={shipment.blockchainUrl ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-sm font-mono text-chain-cyan hover:underline"
                        >
                          {truncateHash(hash)}
                          <ExternalLink size={14} />
                        </a>
                        <p className="mt-1 text-xs font-body text-text-dark/50">Polygonscan</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {shipment.certificate?.pdfUrl ? (
                        <a
                          href={shipment.certificate.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-chain-cyan px-4 py-3 text-sm font-sans font-semibold text-white hover:bg-chain-cyan/90 transition-colors"
                        >
                          <FileDown size={16} />
                          Télécharger le certificat
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => toggleExpanded(shipment.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-chain-cyan/20 px-4 py-3 text-sm font-sans font-semibold text-chain-cyan hover:bg-chain-cyan/5 transition-colors"
                      >
                        {isExpanded ? 'Masquer le détail' : 'Voir le détail'}
                      </button>

                      <a
                        href={shipment.certificate?.geoJsonUrl ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cacao-green/20 px-4 py-3 text-sm font-sans font-semibold text-cacao-green hover:bg-cacao-green/5 transition-colors"
                      >
                        <FileJson size={16} />
                        Télécharger le GeoJSON
                      </a>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        key={`${shipment.id}-details`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <ShipmentDetailsInline
                          shipment={shipment}
                          onOpenModal={() => setSelectedShipment(shipment)}
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}

          {hasMore ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="rounded-2xl border border-chain-cyan/20 bg-white px-5 py-3 text-sm font-sans font-semibold text-chain-cyan hover:bg-chain-cyan/5 transition-colors"
              >
                Voir plus
              </button>
            </div>
          ) : null}
        </section>
      )}

      <ShipmentDetailModal
        shipment={selectedShipment}
        isOpen={Boolean(selectedShipment)}
        onClose={() => setSelectedShipment(null)}
      />
    </div>
  )
}
