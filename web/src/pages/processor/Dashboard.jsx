import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package, Scale, Droplets, Award, Bell, AlertTriangle,
  FlaskConical, PackageOpen, Ship, ArrowRight,
  Thermometer, Sun, CheckCircle, Truck,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { fetchProcessorDashboard } from '../../lib/api'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import KpiCard from '../../components/dashboard/KpiCard'
import TeamAvatar from '../../components/team/TeamAvatar'
import ProcessingPipeline from '../../components/processor/ProcessingPipeline'
import { formatRelativeDate, formatFullDate } from '../../utils/format'

// ── Constantes module-level ────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    icon: FlaskConical,
    title: 'Saisir données qualité',
    desc: 'Enregistrer fermentation, séchage, grade qualité',
    to: '/processor/quality-entry',
    color: 'text-chain-cyan',
    bg: 'bg-chain-cyan/10',
  },
  {
    icon: PackageOpen,
    title: 'Réceptionner un lot',
    desc: 'Valider un lot expédié par la coopérative',
    to: '/processor/lots-incoming',
    color: 'text-cacao-green',
    bg: 'bg-cacao-green/10',
  },
  {
    icon: Ship,
    title: 'Transférer vers exportateur',
    desc: 'Sélectionner les lots prêts à l\'export',
    to: '/processor/transfer-to-exporter',
    color: 'text-[#4F46E5]',
    bg: 'bg-[#EEF2FF]',
  },
]

const ACTIVITY_ICONS = {
  lot_received:            { icon: PackageOpen, color: 'text-chain-cyan',  bg: 'bg-chain-cyan/10'  },
  fermentation_started:    { icon: Thermometer, color: 'text-cacao-brown', bg: 'bg-cacao-brown/10' },
  drying_started:          { icon: Sun,         color: 'text-gold-premium',bg: 'bg-gold-premium/10'},
  lot_completed:           { icon: CheckCircle, color: 'text-cacao-green', bg: 'bg-cacao-green/10' },
  alert_humidity:          { icon: AlertTriangle,color: 'text-error',      bg: 'bg-error/10'       },
  transferred_to_exporter: { icon: Truck,       color: 'text-chain-cyan',  bg: 'bg-chain-cyan/10'  },
}

const ALERT_LABEL = {
  fermentation_prolongée: { text: 'Fermentation > 7j', variant: 'warning' },
  humidité_élevée:        { text: 'Humidité > 9%',     variant: 'danger'  },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function todayLabel() {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date())
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-3 py-2 text-xs font-body">
      <span className="font-semibold text-text-dark">{payload[0].value} kg</span>
    </div>
  )
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-3 py-2 text-xs font-body">
      <span className="font-semibold" style={{ color: d.fill }}>{d.grade}</span>
      <span className="text-text-dark/60 ml-2">{d.value} % · {d.kg} kg</span>
    </div>
  )
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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ProcessorDashboard() {
  const { user } = useAuth()
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [source, setSource]       = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchProcessorDashboard(user?.id).then(({ source: src, data }) => {
      if (cancelled) return
      setDashboard(data)
      setSource(src)
      setLoading(false)
    }).catch((e) => {
      if (!cancelled) { setError(e.message); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [user?.id])

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

  const { profile, pipeline, monthlyStats, weeklyProduction, qualityGrades, recentActivity, alertLots } = dashboard

  const pendingCount  = pipeline.received ?? 0
  const readyCount    = pipeline.ready ?? 0
  const alertCount    = alertLots?.length ?? 0

  const showBanner = pendingCount > 0 || readyCount > 0 || alertCount > 0

  const humidityColor = monthlyStats.avgFinalHumidity >= 6 && monthlyStats.avgFinalHumidity <= 8
    ? 'text-cacao-green' : 'text-warning'
  const gradeAColor   = monthlyStats.qualityGradeABreakdown >= 75 ? 'text-cacao-green' : 'text-warning'
  const totalGradeKg  = qualityGrades.reduce((s, g) => s + g.kg, 0)

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
              Votre activité du jour · {todayLabel()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {source === 'mock' && <Badge variant="warning">Mode démonstration</Badge>}
            <Link
              to="/processor/quality-entry?action=new"
              className="hidden sm:flex items-center gap-2 bg-chain-cyan text-white rounded-xl px-4 py-2.5 text-sm font-sans font-semibold hover:bg-chain-cyan/90 transition-colors"
            >
              <FlaskConical size={15} />
              Nouveau lot à traiter
            </Link>
          </div>
        </div>
      </FadeUp>

      {/* ── B. Bandeau attention ──────────────────────────────────────────────── */}
      {showBanner && (
        <FadeUp delay={0.05}>
          <div className="bg-gold-premium/10 border border-gold-premium/30 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
            <Bell size={16} className="text-gold-premium shrink-0" />
            <span className="text-sm font-body font-medium text-cacao-brown flex-1">
              Action{pendingCount + readyCount + alertCount > 1 ? 's' : ''} requise{pendingCount + readyCount + alertCount > 1 ? 's' : ''}
            </span>
            <div className="flex flex-wrap gap-2">
              {pendingCount > 0 && (
                <Link
                  to="/processor/quality-entry?filter=received"
                  className="text-xs font-body font-semibold text-cacao-brown bg-gold-premium/20 hover:bg-gold-premium/30 rounded-lg px-3 py-1.5 transition-colors"
                >
                  {pendingCount} lot{pendingCount > 1 ? 's' : ''} à démarrer
                </Link>
              )}
              {alertCount > 0 && (
                <Link
                  to="/processor/quality-entry?filter=alert"
                  className="text-xs font-body font-semibold text-error bg-error/10 hover:bg-error/20 rounded-lg px-3 py-1.5 transition-colors"
                >
                  {alertCount} alerte{alertCount > 1 ? 's' : ''} qualité
                </Link>
              )}
              {readyCount > 0 && (
                <Link
                  to="/processor/transfer-to-exporter"
                  className="text-xs font-body font-semibold text-cacao-green bg-cacao-green/10 hover:bg-cacao-green/20 rounded-lg px-3 py-1.5 transition-colors"
                >
                  {readyCount} lot{readyCount > 1 ? 's' : ''} prêt{readyCount > 1 ? 's' : ''} à transférer
                </Link>
              )}
            </div>
          </div>
        </FadeUp>
      )}

      {/* ── C. KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Package, value: monthlyStats.lotsProcessedThisMonth, label: 'Lots transformés ce mois',
            iconColor: 'text-chain-cyan', iconBg: 'bg-chain-cyan/10',
          },
          {
            icon: Scale, value: monthlyStats.weightProcessedKg, label: 'Volume traité (mois)',
            iconColor: 'text-cacao-green', iconBg: 'bg-cacao-green/10', suffix: ' kg',
          },
          {
            icon: Droplets, value: monthlyStats.avgFinalHumidity, label: 'Humidité finale moyenne',
            iconColor: humidityColor, iconBg: 'bg-cacao-green/10', suffix: ' %', decimals: 1,
          },
          {
            icon: Award, value: monthlyStats.qualityGradeABreakdown, label: 'Taux qualité grade A',
            iconColor: gradeAColor, iconBg: 'bg-cacao-green/10', suffix: ' %',
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

      {/* ── D. Pipeline qualité ───────────────────────────────────────────────── */}
      <FadeUp delay={0.25}>
        <Card className="p-5 md:p-6">
          <div className="mb-4">
            <h2 className="text-base font-sans font-bold text-text-dark">Pipeline de transformation</h2>
            <p className="text-sm font-body text-text-dark/50 mt-0.5">
              État en temps réel des lots dans vos ateliers
            </p>
          </div>
          <ProcessingPipeline pipeline={pipeline} />
        </Card>
      </FadeUp>

      {/* ── E. Graphiques ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart production hebdomadaire */}
        <FadeUp delay={0.3}>
          <Card className="p-5">
            <h2 className="text-base font-sans font-bold text-text-dark mb-4">
              Production hebdomadaire
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyProduction} barCategoryGap="35%">
                <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'inherit', fill: '#666' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'inherit', fill: '#666' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#1A4A5A0D' }} />
                <Bar dataKey="kgProcessed" fill="#2196C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </FadeUp>

        {/* Donut qualité */}
        <FadeUp delay={0.35}>
          <Card className="p-5">
            <h2 className="text-base font-sans font-bold text-text-dark mb-4">
              Répartition qualité (ce mois)
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={qualityGrades}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={64}
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {qualityGrades.map((g, i) => <Cell key={i} fill={g.fill} />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-sans font-bold text-text-dark">{totalGradeKg}</span>
                  <span className="text-xs font-body text-text-dark/50">kg</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {qualityGrades.map((g) => (
                  <div key={g.grade} className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-xs font-body">
                      <span style={{ color: g.fill }} className="font-semibold">{g.grade}</span>
                      <span className="text-text-dark/60">{g.value} % · {g.kg} kg</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${g.value}%`, backgroundColor: g.fill }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </FadeUp>
      </div>

      {/* ── F. Zone travail ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activité récente */}
        <FadeUp delay={0.4}>
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-sans font-bold text-text-dark">Activité récente</h2>
              <Link to="/processor/audit" className="text-xs font-body text-chain-cyan hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentActivity.slice(0, 6).map((ev) => {
                const cfg = ACTIVITY_ICONS[ev.type] ?? ACTIVITY_ICONS.lot_received
                const Icon = cfg.icon
                return (
                  <div key={ev.id} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon size={14} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body text-text-dark leading-snug truncate">
                        {ev.description}
                      </p>
                      <p className="text-xs font-body text-text-dark/40 mt-0.5">
                        <span className="font-mono mr-1">{ev.lotUuid}</span>·{' '}
                        {formatRelativeDate(ev.timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </FadeUp>

        {/* Lots demandant attention */}
        <FadeUp delay={0.45}>
          <Card className="p-5 flex flex-col gap-4">
            <h2 className="text-base font-sans font-bold text-text-dark">
              Lots demandant attention
            </h2>
            {alertLots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <CheckCircle size={28} className="text-cacao-green" />
                <p className="text-sm font-body text-text-dark/50">
                  Aucun lot ne nécessite votre attention · Tout va bien
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alertLots.slice(0, 5).map((lot) => (
                  <div key={lot.id} className="flex items-center gap-3">
                    <TeamAvatar name={lot.producerName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-chain-cyan">{lot.lotUuid}</p>
                      <p className="text-sm font-body text-text-dark truncate">{lot.producerName}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {lot.alerts.map((a) => {
                          const cfg = ALERT_LABEL[a] ?? { text: a, variant: 'warning' }
                          return (
                            <Badge key={a} variant={cfg.variant}>{cfg.text}</Badge>
                          )
                        })}
                      </div>
                    </div>
                    <Link
                      to={`/processor/quality-entry/${lot.id}`}
                      className="shrink-0 flex items-center gap-1 text-xs font-body text-chain-cyan hover:underline px-2 py-1 rounded-lg hover:bg-chain-cyan/5"
                    >
                      Inspecter <ArrowRight size={11} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </FadeUp>
      </div>

      {/* ── G. Actions rapides ────────────────────────────────────────────────── */}
      <FadeUp delay={0.5}>
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
                  <p className="text-xs font-body text-text-dark/50 mt-0.5 leading-snug">
                    {action.desc}
                  </p>
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
