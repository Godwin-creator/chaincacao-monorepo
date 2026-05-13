import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package, Scale, TrendingUp, AlertTriangle, Bell,
  QrCode, Truck, Map, ArrowRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { fetchCooperativeDashboard } from '../../lib/api'
import LoadingState from '../../components/ui/LoadingState'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import KpiCard from '../../components/dashboard/KpiCard'
import TeamAvatar from '../../components/team/TeamAvatar'

// ── Constantes ────────────────────────────────────────────────────────────────

const SPECIES_COLORS = {
  Cacao:   '#6B4423',
  Robusta: '#8B5E3C',
  Arabica: '#C9A876',
}

const QUICK_ACTIONS = [
  {
    icon: QrCode,
    title: 'Réceptionner un lot',
    desc: "Scannez le QR d'un lot apporté par un producteur",
    to: '/cooperative/lots-received?action=new',
    color: 'text-chain-cyan',
    bg: 'bg-chain-cyan/10',
  },
  {
    icon: Truck,
    title: 'Transférer vers transformateur',
    desc: 'Sélectionnez les lots à expédier en transformation',
    to: '/cooperative/transfer-lot',
    color: 'text-cacao-green',
    bg: 'bg-cacao-green/10',
  },
  {
    icon: Map,
    title: 'Carte des fournisseurs',
    desc: 'Visualisez les parcelles de tous vos producteurs',
    to: '/cooperative/lots-received?view=map',
    color: 'text-[#4F46E5]',
    bg: 'bg-[#EEF2FF]',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat('fr-FR')

function fmtDateTime(iso) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function speciesVariant(species) {
  const map = { Cacao: 'cacao', Robusta: 'robusta', Arabica: 'arabica' }
  return map[species] ?? 'neutral'
}

// ── Composants locaux ─────────────────────────────────────────────────────────

const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut', delay }}
    className={className}
  >
    {children}
  </motion.div>
)

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-chain-bg text-white text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-sans font-semibold mb-0.5">{label}</p>
      <p>{fmt.format(payload[0].value)} kg</p>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function CooperativeDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [source, setSource]   = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCooperativeDashboard(user?.id)
      .then(({ source: src, data }) => {
        if (!cancelled) { setDashboard(data); setSource(src); setLoading(false) }
      })
      .catch((err) => {
        if (!cancelled) { setError(err); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [user?.id, retryCount])

  // ── Chargement ────────────────────────────────────────────────────────────
  if (loading) return <LoadingState />

  // ── Erreur ────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex items-center justify-center min-h-64 p-4">
      <div className="bg-error/10 border border-error/20 rounded-2xl p-6 max-w-sm w-full text-center">
        <AlertTriangle className="text-error mx-auto mb-3" size={28} />
        <p className="font-sans font-semibold text-error mb-1">
          Impossible de charger le tableau de bord
        </p>
        <p className="text-sm font-body text-text-dark/60 mb-4">{error.message}</p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="px-4 py-2 bg-chain-cyan text-white rounded-lg text-sm font-body hover:bg-chain-cyan/90 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )

  const {
    profile, pendingLots, recentLots,
    monthlyStats, weeklyVolume, speciesBreakdown, supplierProducers,
  } = dashboard

  const today = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())

  const totalSpeciesWeight = speciesBreakdown.reduce((s, e) => s + e.weight, 0)
  const maxSupplierVolume  = supplierProducers[0]?.volumeKg ?? 1

  const kpis = [
    {
      icon: Package,
      value: monthlyStats.lotsReceived,
      label: 'Lots reçus ce mois',
      iconColor: 'text-chain-cyan',
      iconBg: 'bg-chain-cyan/10',
      suffix: '',
      trend: { positive: true, label: '+5 vs mois dernier' },
    },
    {
      icon: Scale,
      value: monthlyStats.weightTotalKg,
      label: 'Volume total',
      iconColor: 'text-cacao-green',
      iconBg: 'bg-cacao-green/10',
      suffix: ' kg',
      trend: { positive: true, label: '+12 % vs mois dernier' },
    },
    {
      icon: TrendingUp,
      value: monthlyStats.avgDelta,
      label: 'Écart moyen pesée',
      iconColor: monthlyStats.avgDelta < 2 ? 'text-cacao-green' : 'text-warning',
      iconBg:    monthlyStats.avgDelta < 2 ? 'bg-cacao-green/10' : 'bg-warning/10',
      suffix: ' %',
      decimals: 1,
      trend: { positive: monthlyStats.avgDelta < 2, label: 'conforme (seuil 2 %)' },
    },
    {
      icon: AlertTriangle,
      value: monthlyStats.discrepancyAlerts,
      label: 'Alertes écart',
      iconColor: monthlyStats.discrepancyAlerts > 0 ? 'text-error' : 'text-cacao-green',
      iconBg:    monthlyStats.discrepancyAlerts > 0 ? 'bg-error/10' : 'bg-cacao-green/10',
      suffix: '',
      trend: null,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">

      {/* ── A. EN-TÊTE ──────────────────────────────────────────────────────── */}
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-sans font-bold text-text-dark">
                Bonjour, {profile.name}
              </h1>
              {source === 'mock' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body bg-chain-bg/10 text-chain-bg border border-chain-bg/20">
                  Mode démonstration
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-body text-text-dark/60 first-letter:capitalize">
              Voici votre activité du jour · {today}
            </p>
          </div>
          <Link
            to="/cooperative/lots-received?action=new"
            className="hidden sm:flex items-center gap-2 bg-chain-cyan text-white px-4 py-2.5 rounded-xl text-sm font-sans font-semibold hover:bg-chain-cyan/90 transition-colors shrink-0"
          >
            <Package size={16} />
            Réceptionner un lot
          </Link>
        </div>
      </FadeUp>

      {/* ── B. BANDEAU ATTENTION ────────────────────────────────────────────── */}
      {pendingLots.length > 0 && (
        <FadeUp delay={0.05}>
          <div className="bg-gold-premium/10 border border-gold-premium/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Bell className="text-cacao-brown mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-sans font-semibold text-cacao-brown">
                  {pendingLots.length} lot{pendingLots.length > 1 ? 's' : ''} en attente de réception
                </p>
                <p className="mt-0.5 text-sm font-body text-cacao-brown/70">
                  Des producteurs ont déposé des lots qui attendent votre validation.
                </p>
              </div>
            </div>
            <Link
              to="/cooperative/lots-received?filter=pending"
              className="flex items-center gap-2 bg-cacao-brown text-white px-4 py-2 rounded-xl text-sm font-sans font-semibold hover:bg-cacao-brown/90 transition-colors shrink-0 self-start sm:self-auto whitespace-nowrap"
            >
              Voir les lots en attente
              <ArrowRight size={14} />
            </Link>
          </div>
        </FadeUp>
      )}

      {/* ── C. KPI CARDS ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 + i * 0.05 }}
          >
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* ── D. GRAPHIQUES ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Volume hebdomadaire */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Card className="p-5">
            <h3 className="font-sans font-semibold text-text-dark mb-4">
              Volume hebdomadaire (kg)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyVolume} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#1A4A5A0D' }} />
                <Bar dataKey="weightKg" fill="#2196C7" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Répartition par espèce */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <Card className="p-5">
            <h3 className="font-sans font-semibold text-text-dark mb-4">
              Répartition par espèce
            </h3>
            <div className="flex items-center gap-6">
              <div className="w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={speciesBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={72}
                      dataKey="weight"
                      nameKey="species"
                      strokeWidth={0}
                    >
                      {speciesBreakdown.map((entry) => (
                        <Cell
                          key={entry.species}
                          fill={SPECIES_COLORS[entry.species] ?? '#ccc'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [`${fmt.format(v)} kg`, name]}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-4">
                {speciesBreakdown.map((s) => {
                  const pct = Math.round((s.weight / totalSpeciesWeight) * 100)
                  const color = SPECIES_COLORS[s.species] ?? '#ccc'
                  return (
                    <div key={s.species}>
                      <div className="flex items-center justify-between text-xs font-body mb-1">
                        <span className="flex items-center gap-1.5 font-medium text-text-dark">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          {s.species}
                        </span>
                        <span className="text-text-dark/50">{pct} %</span>
                      </div>
                      <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <p className="text-xs font-body text-text-dark/40 mt-0.5">
                        {fmt.format(s.weight)} kg
                      </p>
                    </div>
                  )
                })}
                <p className="text-xs font-body text-text-dark/40 pt-1 border-t border-chain-cyan/10">
                  Total : {fmt.format(totalSpeciesWeight)} kg
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── E. ZONE TRAVAIL ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Lots récemment reçus */}
        <FadeUp delay={0.2}>
          <Card className="flex flex-col">
            <div className="px-5 py-4 border-b border-chain-cyan/10">
              <h3 className="font-sans font-semibold text-text-dark">Lots récemment reçus</h3>
            </div>

            <div className="divide-y divide-chain-cyan/5">
              {recentLots.slice(0, 5).map((lot) => (
                <div key={lot.id} className="flex items-center gap-3 px-5 py-3">
                  <Badge variant={speciesVariant(lot.species)}>{lot.species}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-text-dark truncate">
                      {lot.producerName}
                    </p>
                    <p className="text-xs font-body text-text-dark/50">
                      {fmt.format(lot.weightKg)} kg · {fmtDateTime(lot.receivedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {lot.weightDelta > 2 && (
                      <span
                        className="flex items-center gap-1 text-xs font-body text-warning"
                        title={`Écart de pesée : ${lot.weightDelta} %`}
                      >
                        <AlertTriangle size={13} />
                        {lot.weightDelta} %
                      </span>
                    )}
                    <Badge variant={lot.status === 'Transferred' ? 'info' : 'success'}>
                      {lot.status === 'Transferred' ? 'Transféré' : 'Reçu'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-chain-cyan/10">
              <Link
                to="/cooperative/lots-received"
                className="flex items-center gap-1 text-sm font-body text-chain-cyan hover:text-chain-cyan/80 transition-colors"
              >
                Voir tous les lots <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        </FadeUp>

        {/* Top producteurs */}
        <FadeUp delay={0.25}>
          <Card className="flex flex-col">
            <div className="px-5 py-4 border-b border-chain-cyan/10">
              <h3 className="font-sans font-semibold text-text-dark">Top producteurs ce mois</h3>
            </div>

            <div className="divide-y divide-chain-cyan/5">
              {supplierProducers.map((producer, i) => (
                <div key={producer.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-body font-bold text-chain-cyan/40 w-4 text-center shrink-0">
                    {i + 1}
                  </span>
                  <TeamAvatar name={producer.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-text-dark truncate">
                      {producer.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-body text-text-dark/40 shrink-0">
                        {producer.commune}
                      </span>
                      <div className="flex-1 h-1.5 bg-cream rounded-full overflow-hidden">
                        <div
                          className="h-full bg-chain-cyan rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.round((producer.volumeKg / maxSupplierVolume) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-body font-semibold text-text-dark shrink-0">
                    {fmt.format(producer.volumeKg)} kg
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </FadeUp>
      </div>

      {/* ── F. ACTIONS RAPIDES ──────────────────────────────────────────────── */}
      <FadeUp delay={0.3}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} to={action.to} className="block h-full">
              <Card className="p-5 h-full group hover:shadow-md transition-shadow">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${action.bg}`}
                >
                  <action.icon size={20} className={action.color} />
                </div>
                <p className="font-sans font-semibold text-text-dark mb-1">{action.title}</p>
                <p className="text-sm font-body text-text-dark/60">{action.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </FadeUp>

    </div>
  )
}
