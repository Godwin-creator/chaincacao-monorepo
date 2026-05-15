import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, FileCheck, Ship, Package, Building2, Search, History, PackagePlus,
  ArrowRight, AlertTriangle, CheckCircle2, PackageCheck,
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { fetchExporterDashboard } from '../../lib/api'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import KpiCard from '../../components/dashboard/KpiCard'
import ExportFlowMap from '../../components/exporter/ExportFlowMap'
import ShipmentStatusBadge from '../../components/exporter/ShipmentStatusBadge'
import BuyerCard from '../../components/exporter/BuyerCard'
import { formatWeight } from '../../utils/format'

// ── Constantes module-level ────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    icon: PackagePlus,
    title: 'Créer un nouveau shipment',
    desc: 'Agrégez des lots transformés et générez le certificat EUDR',
    to: '/exporter/eudr-certificate?action=new',
    color: 'text-chain-cyan',
    bg: 'bg-chain-cyan/10',
  },
  {
    icon: History,
    title: "Consulter l'historique",
    desc: 'Tous vos exports certifiés et leur traçabilité',
    to: '/exporter/export-records',
    color: 'text-cacao-green',
    bg: 'bg-cacao-green/10',
  },
  {
    icon: Search,
    title: "Vérifier la conformité d'un lot",
    desc: 'Recherchez un lot avant inclusion dans un shipment',
    to: '/verify',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
]

const BUYER_COLORS = ['#2196C7', '#4A6B2A', '#E8B547', '#5D3A1F', '#4FC3E8']

const FLAGS = { BE: '🇧🇪', DE: '🇩🇪', FR: '🇫🇷', NL: '🇳🇱', CH: '🇨🇭' }

const FMT_KG = new Intl.NumberFormat('fr-FR')

// ── Helpers ────────────────────────────────────────────────────────────────────

function todayLabel() {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date())
}

function FadeUp({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  )
}

function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-3 py-2 text-xs font-body">
      <p className="font-semibold text-text-dark">{label}</p>
      <p className="text-chain-cyan mt-0.5">{FMT_KG.format(payload[0].value)} kg</p>
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-3 py-2 text-xs font-body">
      <span className="font-semibold" style={{ color: d.fill }}>{d.buyer}</span>
      <span className="text-text-dark/60 ml-2">{FMT_KG.format(d.weightKg)} kg</span>
    </div>
  )
}

function ShipmentTimeline({ status }) {
  const STEPS = [
    { key: 'cert',    label: 'Certifié', done: ['certified', 'in_transit', 'delivered'].includes(status) },
    { key: 'sea',     label: 'En mer',   done: ['in_transit', 'delivered'].includes(status) },
    { key: 'port',    label: 'Livraison',done: status === 'delivered' },
  ]
  return (
    <div className="flex items-start mt-1.5">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-start">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full border-2 ${
              step.done ? 'bg-chain-cyan border-chain-cyan' : 'bg-white border-gray-300'
            }`} />
            <span className={`text-[9px] font-body mt-0.5 whitespace-nowrap ${
              step.done ? 'text-chain-cyan' : 'text-text-dark/30'
            }`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px mt-1 shrink-0 mx-0.5 ${step.done ? 'bg-chain-cyan' : 'bg-gray-200'}`}
              style={{ width: 22 }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ExporterDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [source, setSource] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchExporterDashboard(user?.organizationId ?? user?.id ?? 'exp-cacaomax-lome')
      .then(({ source: src, data }) => {
        if (cancelled) return
        setDashboard(data)
        setSource(src)
        setLoading(false)
      })
      .catch((e) => {
        if (!cancelled) { setError(e.message); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [user?.id, user?.organizationId])

  const shipments         = useMemo(() => dashboard?.shipments        ?? [], [dashboard])
  const buyers            = useMemo(() => dashboard?.buyers           ?? [], [dashboard])
  const monthlyEvolution  = useMemo(() => dashboard?.monthlyEvolution ?? [], [dashboard])
  const buyerDistribution = useMemo(() => dashboard?.buyerDistribution ?? [], [dashboard])

  const activeShipments = useMemo(
    () => shipments.filter(s => s.status !== 'delivered'),
    [shipments],
  )
  const preparingShipments = useMemo(
    () => shipments.filter(s => s.status === 'preparing'),
    [shipments],
  )
  const activeFlowShipments = useMemo(
    () => shipments.filter(s => ['certified', 'in_transit'].includes(s.status)),
    [shipments],
  )
  const chartData = useMemo(
    () => monthlyEvolution.filter(m => m.weightKg > 0),
    [monthlyEvolution],
  )
  const buyerDistributionWithColors = useMemo(
    () => buyerDistribution.map((b, i) => ({ ...b, fill: BUYER_COLORS[i % BUYER_COLORS.length] })),
    [buyerDistribution],
  )
  const totalPieWeight = useMemo(
    () => buyerDistribution.reduce((s, b) => s + b.weightKg, 0),
    [buyerDistribution],
  )
  const buyersWithStats = useMemo(
    () => buyers.map(buyer => {
      const buyerShips = shipments.filter(s => s.buyer.id === buyer.id || s.buyer.name === buyer.name)
      return {
        ...buyer,
        stats: {
          weightThisQuarterKg: Math.round(buyerShips.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0)),
          shipmentsCount: buyerShips.length,
          contractStatus: buyer.contractStatus || 'active',
        },
      }
    }),
    [buyers, shipments],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-chain-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center gap-2 text-sm text-error bg-error/10 rounded-xl px-4 py-3">
        <AlertTriangle size={15} />
        {error ?? 'Impossible de charger le tableau de bord.'}
      </div>
    )
  }

  const { profile, monthlyStats } = dashboard
  const isCompliant = monthlyStats.eudrComplianceRate >= 100

  return (
    <div className="flex flex-col gap-6">

      {/* ── A. En-tête ───────────────────────────────────────────────────────── */}
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-sans font-bold text-text-dark">
              Bonjour, {profile.name}
            </h1>
            <p className="text-sm font-body text-text-dark/50 mt-0.5 first-letter:capitalize">
              {todayLabel()} · Conformité EUDR : {monthlyStats.eudrComplianceRate}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            {source === 'mock' && <Badge variant="warning">Mode démonstration</Badge>}
            <Link
              to="/exporter/eudr-certificate?action=new"
              className="hidden sm:flex items-center gap-2 bg-chain-cyan text-white rounded-xl px-4 py-2.5 text-sm font-sans font-semibold hover:bg-chain-cyan/90 transition-colors"
            >
              <FileCheck size={15} />
              Nouveau certificat EUDR
            </Link>
          </div>
        </div>
      </FadeUp>

      {/* ── B. Bandeau conformité EUDR ────────────────────────────────────────── */}
      <FadeUp delay={0.05}>
        <Card className={`p-5 md:p-6 ${
          isCompliant
            ? 'bg-cacao-green/5 border-cacao-green/20'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isCompliant ? 'bg-cacao-green/10' : 'bg-amber-100'
            }`}>
              <ShieldCheck size={28} className={isCompliant ? 'text-cacao-green' : 'text-amber-600'} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={`text-base font-sans font-bold ${isCompliant ? 'text-cacao-green' : 'text-amber-700'}`}>
                Statut de conformité EUDR : {isCompliant ? 'Conforme ✓' : 'Vérification requise'}
              </h2>
              <p className="text-sm font-body text-text-dark/60 mt-0.5">
                {isCompliant
                  ? 'Tous vos shipments sont conformes au règlement (UE) 2023/1115'
                  : 'Certains shipments nécessitent une vérification'}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
                {[
                  `${monthlyStats.certificatesIssued} certificats émis ce mois`,
                  '100% des lots tracés on-chain',
                  `Identifiant : ${profile.operatorEudrId}`,
                  'Dernier audit : il y a 12 jours',
                ].map((stat) => (
                  <span key={stat} className="flex items-center gap-1.5 text-xs font-body text-text-dark/60">
                    <CheckCircle2 size={11} className={isCompliant ? 'text-cacao-green' : 'text-amber-500'} />
                    {stat}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/exporter/export-records?filter=eudr"
              className={`shrink-0 self-start text-xs font-body border rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
                isCompliant
                  ? 'text-cacao-green border-cacao-green/30 hover:bg-cacao-green/5'
                  : 'text-amber-700 border-amber-300 hover:bg-amber-100'
              }`}
            >
              Voir l'historique →
            </Link>
          </div>
        </Card>
      </FadeUp>

      {/* ── C. KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Ship, value: monthlyStats.shipmentsThisMonth, label: 'Expéditions ce mois',
            iconColor: 'text-chain-cyan', iconBg: 'bg-chain-cyan/10',
          },
          {
            icon: Package, value: monthlyStats.weightExportedKg, label: 'Volume exporté',
            iconColor: 'text-cacao-green', iconBg: 'bg-cacao-green/10', suffix: ' kg',
          },
          {
            icon: FileCheck, value: monthlyStats.certificatesIssued, label: 'Certificats EUDR émis',
            iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50',
          },
          {
            icon: Building2, value: monthlyStats.buyersServed, label: 'Acheteurs actifs',
            iconColor: 'text-gold-premium', iconBg: 'bg-gold-premium/10',
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
          >
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* ── D. Carte flux export ──────────────────────────────────────────────── */}
      <FadeUp delay={0.3}>
        <ExportFlowMap activeShipments={activeShipments} />
      </FadeUp>

      {/* ── E. Graphiques ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Area chart — volumes 12 mois */}
        <FadeUp delay={0.35}>
          <Card className="p-5">
            <h2 className="text-base font-sans font-bold text-text-dark mb-4">
              Volumes exportés (12 derniers mois)
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="exportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2196C7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2196C7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fontFamily: 'inherit', fill: '#666' }}
                />
                <YAxis
                  axisLine={false} tickLine={false} width={42}
                  tick={{ fontSize: 11, fontFamily: 'inherit', fill: '#666' }}
                  tickFormatter={(v) => FMT_KG.format(v)}
                />
                <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#2196C720', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="weightKg"
                  stroke="#2196C7"
                  strokeWidth={2}
                  fill="url(#exportGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#2196C7', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </FadeUp>

        {/* Donut — répartition acheteurs */}
        <FadeUp delay={0.4}>
          <Card className="p-5">
            <h2 className="text-base font-sans font-bold text-text-dark mb-4">
              Répartition par acheteur (ce mois)
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie
                      data={buyerDistributionWithColors}
                      dataKey="weightKg"
                      cx="50%" cy="50%"
                      innerRadius={48} outerRadius={68}
                      startAngle={90} endAngle={-270}
                      strokeWidth={2} stroke="#fff"
                    >
                      {buyerDistributionWithColors.map((b, i) => (
                        <Cell key={i} fill={b.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-sans font-bold text-text-dark leading-none">
                    {FMT_KG.format(Math.round(totalPieWeight))}
                  </span>
                  <span className="text-xs font-body text-text-dark/50">kg</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                {buyerDistributionWithColors.map((b) => (
                  <div key={b.buyer} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.fill }} />
                    <span className="text-xs font-body text-text-dark/60 flex-1 truncate">{b.buyer}</span>
                    <span className="text-xs font-sans font-semibold text-text-dark">
                      {FMT_KG.format(b.weightKg)} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </FadeUp>
      </div>

      {/* ── F. Zone travail ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Shipments à finaliser */}
        <FadeUp delay={0.45}>
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-sans font-bold text-text-dark">Shipments à finaliser</h2>
              {preparingShipments.length > 0 && (
                <Badge variant="warning">{preparingShipments.length}</Badge>
              )}
            </div>
            {preparingShipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <PackageCheck size={28} className="text-cacao-green" />
                <p className="text-sm font-body text-text-dark/50">
                  Aucun shipment en préparation
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {preparingShipments.slice(0, 5).map((s) => {
                  const isReady = s.totalLotsCount >= 6 || s.totalWeightKg >= 500
                  const progress = Math.min(100, (s.totalLotsCount / 8) * 100)
                  return (
                    <div key={s.id} className="rounded-xl border border-chain-cyan/10 bg-chain-bg/5 p-3 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl leading-none">{FLAGS[s.buyer.country] || '🏳️'}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-sans font-semibold text-text-dark truncate">{s.reference}</p>
                            <p className="text-xs font-body text-text-dark/50 truncate">{s.buyer.name}</p>
                          </div>
                        </div>
                        {isReady
                          ? <Badge variant="success">Prêt à certifier</Badge>
                          : <Badge variant="neutral">{s.totalLotsCount} lots</Badge>
                        }
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-body text-text-dark/40 mb-1">
                          <span>{s.totalLotsCount} lot{s.totalLotsCount > 1 ? 's' : ''} sélectionné{s.totalLotsCount > 1 ? 's' : ''}</span>
                          <span>{formatWeight(s.totalWeightKg)}</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-chain-cyan transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <Link
                        to={`/exporter/eudr-certificate?shipmentId=${s.id}`}
                        className="self-start text-xs font-body font-medium text-chain-cyan bg-chain-cyan/10 hover:bg-chain-cyan/20 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Générer certificat EUDR →
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </FadeUp>

        {/* Expéditions en cours */}
        <FadeUp delay={0.5}>
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-sans font-bold text-text-dark">Expéditions en cours</h2>
              {activeFlowShipments.length > 0 && (
                <Badge variant="info">{activeFlowShipments.length}</Badge>
              )}
            </div>
            {activeFlowShipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <Ship size={28} className="text-text-dark/30" />
                <p className="text-sm font-body text-text-dark/50">Aucune expédition active</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeFlowShipments.slice(0, 5).map((s) => (
                  <div key={s.id} className="rounded-xl border border-chain-cyan/10 bg-chain-bg/5 p-3 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl leading-none">{FLAGS[s.buyer.country] || '🏳️'}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-sans font-semibold text-text-dark truncate">{s.reference}</p>
                          <p className="text-xs font-body text-text-dark/50 truncate">
                            {s.vesselName || 'Navire à confirmer'}
                          </p>
                        </div>
                      </div>
                      <ShipmentStatusBadge status={s.status} estimatedArrival={s.estimatedArrival} />
                    </div>
                    <ShipmentTimeline status={s.status} />
                    <Link
                      to={`/exporter/export-records?ref=${s.reference}`}
                      className="self-start text-xs font-body text-chain-cyan hover:underline"
                    >
                      Voir les détails →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </FadeUp>
      </div>

      {/* ── G. Acheteurs partenaires ──────────────────────────────────────────── */}
      <FadeUp delay={0.55}>
        <div>
          <h2 className="text-lg font-sans font-bold text-text-dark mb-4">
            Vos acheteurs européens
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {buyersWithStats.map((buyer) => (
              <BuyerCard key={buyer.id} buyer={buyer} stats={buyer.stats} />
            ))}
          </div>
        </div>
      </FadeUp>

      {/* ── H. Actions rapides ────────────────────────────────────────────────── */}
      <FadeUp delay={0.6}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.to}
                to={action.to}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${action.bg}`}>
                  <Icon size={18} className={action.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-semibold text-text-dark group-hover:text-chain-cyan transition-colors">
                    {action.title}
                  </p>
                  <p className="text-xs font-body text-text-dark/50 mt-0.5 leading-snug">{action.desc}</p>
                </div>
                <ArrowRight size={15} className="text-text-dark/20 group-hover:text-chain-cyan transition-colors shrink-0 mt-0.5" />
              </Link>
            )
          })}
        </div>
      </FadeUp>

    </div>
  )
}
