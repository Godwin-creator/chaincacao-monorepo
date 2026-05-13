import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, ExternalLink, Copy, AlertTriangle,
  Phone, MapPin, Scale, Droplets, Award, CheckCircle, Lock,
  Thermometer, Sun, Hash, Clock, FlaskConical, ArrowRight,
  ChevronDown, ChevronUp, Info,
} from 'lucide-react'
import {
  fetchLotQualityById,
  saveFermentationReading, startDryingStage,
  saveDryingReading, completeSortingStage, finalizeGrading,
} from '../../lib/api'
import { getQualityProgress, getQualityAlerts, getNextAction } from '../../utils/mockProcessor'
import { useToast, computeQualityHash, formatFR, daysSince } from '../../hooks/useLotQuality'
import { formatRelativeDate, formatFullDate } from '../../utils/format'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import TeamAvatar from '../../components/team/TeamAvatar'
import QualityChart from '../../components/quality/QualityChart'
import StageTimeline from '../../components/quality/StageTimeline'
import GradeSelector from '../../components/quality/GradeSelector'
import ToastContainer from '../../components/ui/Toast'

// ── Config ────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'fermentation', label: 'Fermentation', icon: FlaskConical },
  { key: 'drying',       label: 'Séchage',       icon: Sun },
  { key: 'sorting',      label: 'Tri',            icon: Scale },
  { key: 'grading',      label: 'Grade final',    icon: Award },
  { key: 'history',      label: 'Historique',     icon: Hash },
]

const FLAVOR_OPTIONS = ['fruité', 'floral', 'noisette', 'cacao intense', 'acidulé', 'bois', 'terreux', 'épicé', 'miellé']
const DEFECT_OPTIONS = ['moisi', 'germé', 'plat', 'fermenté insuffisant', 'sur-fermenté', 'fumée', 'insectes']
const SIZE_OPTIONS   = [
  { value: 'large',  label: 'Large' },
  { value: 'medium', label: 'Medium' },
  { value: 'small',  label: 'Small' },
  { value: 'mixed',  label: 'Mixte' },
]

const STATUS_BADGE = {
  received:   { label: 'En attente',   variant: 'neutral' },
  fermenting: { label: 'Fermentation', variant: 'warning' },
  drying:     { label: 'Séchage',      variant: 'info' },
  processed:  { label: 'Terminé',      variant: 'success' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isTabEnabled(tabKey, lot) {
  const { status, quality } = lot
  if (tabKey === 'fermentation') return true
  if (tabKey === 'drying')       return status === 'drying' || status === 'processed'
  if (tabKey === 'sorting')      return status === 'drying' || status === 'processed'
  if (tabKey === 'grading')      return status === 'processed' || quality.sorting.completedAt != null
  if (tabKey === 'history')      return true
  return false
}

function buildBlockchainHistory(lot) {
  const events = []
  const add = (icon, actor, action, timestamp, txHash, payload) =>
    events.push({ icon, actor, action, timestamp, txHash, payload })

  add('lot_created',      'Producteur',    `Lot créé · ${lot.producerName}`,       lot.receivedAt, '0xabc123...', { lotUuid: lot.lotUuid, species: lot.species })
  add('reception_coop',   'Coopérative',   `Réception · ${lot.originCooperative?.name}`, lot.receivedAt, '0xdef456...', {})
  add('reception_proc',   'Transformateur','Réception atelier ATC Kpalimé',        lot.receivedAt, '0xghi789...', { weightKg: lot.weightKg })

  const ferm = lot.quality.fermentation
  if (ferm.startedAt) {
    add('fermentation_start', 'Transformateur', 'Fermentation démarrée', ferm.startedAt, '0x' + 'a'.repeat(64), { method: 'Caisse bois', targetDays: ferm.targetDays })
    ferm.readings.forEach((r) => {
      add('fermentation_reading', 'Technicien', `Relevé J+${r.day} · T° ${r.tempC}°C · Hum. ${r.humidityPct}%`, r.takenAt, '0x' + Math.random().toString(16).slice(2).padEnd(64, '0'), r)
    })
  }

  const dry = lot.quality.drying
  if (dry.startedAt) {
    add('drying_start', 'Transformateur', `Séchage démarré (${dry.method ?? 'solaire'})`, dry.startedAt, '0x' + 'b'.repeat(64), { humidityStart: dry.humidityStart })
    dry.readings.forEach((r) => {
      add('drying_reading', 'Technicien', `Relevé H+${r.hour} · Hum. ${r.humidityPct}%`, r.takenAt, '0x' + Math.random().toString(16).slice(2).padEnd(64, '0'), r)
    })
  }

  const sort = lot.quality.sorting
  if (sort.completedAt) {
    add('sorting_done', 'Transformateur', `Tri clôturé · ${sort.weightAfterSortingKg} kg · Rejet ${sort.rejectPct}%`, sort.completedAt, '0x' + 'c'.repeat(64), sort)
  }

  const grade = lot.quality.grading
  if (grade.finalGrade) {
    add('grading_final', 'Inspecteur', `Grade final ${grade.finalGrade} inscrit on-chain`, grade.inspectedAt, grade.onChainTxHash, { hash: grade.onChainHash })
  }

  return events.reverse()
}

const HISTORY_ICONS = {
  lot_created:          { bg: 'bg-chain-cyan/10',    color: 'text-chain-cyan',  Icon: FlaskConical },
  reception_coop:       { bg: 'bg-cacao-brown/10',   color: 'text-cacao-brown', Icon: ChevronRight },
  reception_proc:       { bg: 'bg-chain-cyan/10',    color: 'text-chain-cyan',  Icon: CheckCircle },
  fermentation_start:   { bg: 'bg-cacao-brown/10',   color: 'text-cacao-brown', Icon: Thermometer },
  fermentation_reading: { bg: 'bg-cacao-brown/5',    color: 'text-cacao-brown', Icon: Thermometer },
  drying_start:         { bg: 'bg-gold-premium/10',  color: 'text-gold-premium',Icon: Sun },
  drying_reading:       { bg: 'bg-gold-premium/5',   color: 'text-gold-premium',Icon: Droplets },
  sorting_done:         { bg: 'bg-chain-cyan/10',    color: 'text-chain-cyan',  Icon: Scale },
  grading_final:        { bg: 'bg-cacao-green/10',   color: 'text-cacao-green', Icon: Award },
}

// ── Tab Fermentation ──────────────────────────────────────────────────────────

function TabFermentation({ lot, onLotUpdated, toast }) {
  const { status, quality } = lot
  const ferm = quality.fermentation
  const [tempC, setTempC]         = useState('')
  const [humidity, setHumidity]   = useState('')
  const [notes, setNotes]         = useState('')
  const [submitting, setSubmit]   = useState(false)
  const [dryModal, setDryModal]   = useState(false)
  const [dryMethod, setDryMethod] = useState('solaire')
  const [dryHumidity, setDryHum]  = useState('')

  const currentDay = ferm.readings.length + 1
  const canClose = ferm.readings.length >= ferm.targetDays - 1
  const notStarted = status === 'received' && !ferm.startedAt

  async function handleSaveReading(e) {
    e.preventDefault()
    if (!tempC || !humidity) return
    setSubmit(true)
    try {
      const res = await saveFermentationReading(lot.id, {
        day: currentDay,
        tempC: parseFloat(tempC),
        humidityPct: parseFloat(humidity),
        notes,
      })
      if (res.success) {
        onLotUpdated(res.lot)
        toast.success(`Relevé J+${currentDay} enregistré · Tx ${res.txHash.slice(0, 10)}…`)
        setTempC(''); setHumidity(''); setNotes('')
      }
    } finally {
      setSubmit(false)
    }
  }

  async function handleStartDrying() {
    if (!dryHumidity) return
    setSubmit(true)
    try {
      const res = await startDryingStage(lot.id, { method: dryMethod, initialHumidity: parseFloat(dryHumidity) })
      if (res.success) {
        onLotUpdated(res.lot)
        setDryModal(false)
        toast.success('Fermentation clôturée · Séchage démarré')
      }
    } finally {
      setSubmit(false)
    }
  }

  if (notStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cacao-brown/10 flex items-center justify-center">
          <Thermometer size={28} className="text-cacao-brown" />
        </div>
        <div>
          <p className="font-body font-semibold text-text-dark">Fermentation pas encore démarrée</p>
          <p className="text-sm font-body text-text-dark/50 mt-1">Ce lot a été reçu et attend le démarrage de la fermentation</p>
        </div>
        <p className="text-xs font-body text-text-dark/40">Pour démarrer, utilisez le bouton "Ajouter relevé J+1" depuis la liste</p>
      </div>
    )
  }

  const readings = ferm.readings
  const chartLines = [
    { dataKey: 'tempC',       color: '#C17537', label: 'Température', unit: '°C', targetRange: [38, 48] },
    { dataKey: 'humidityPct', color: '#2196C7', label: 'Humidité',    unit: '%',  targetRange: [75, 85] },
  ]

  return (
    <div className="space-y-6">
      {/* Info démarrage */}
      <div className="flex items-center gap-3 text-sm font-body text-text-dark/60 bg-cacao-brown/5 rounded-xl px-4 py-3">
        <Thermometer size={16} className="text-cacao-brown shrink-0" />
        Démarrée le {formatFullDate(ferm.startedAt)} · Cible : {ferm.targetDays} jours
      </div>

      {/* Layout 2 colonnes sur grand écran */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* Graphique */}
        <div>
          <p className="text-sm font-body font-semibold text-text-dark mb-3">Évolution Température & Humidité</p>
          <Card className="p-4">
            <QualityChart readings={readings} xKey="day" lines={chartLines} height={260} />
          </Card>

          {/* Tableau compact des relevés */}
          {readings.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-body font-semibold text-text-dark/50 uppercase tracking-wider mb-2">
                Relevés enregistrés
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-body border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-text-dark/40">Jour</th>
                      <th className="text-left py-2 px-3 text-text-dark/40">Date</th>
                      <th className="text-right py-2 px-3 text-text-dark/40">T° (°C)</th>
                      <th className="text-right py-2 px-3 text-text-dark/40">Hum. (%)</th>
                      <th className="text-left py-2 px-3 text-text-dark/40">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((r) => {
                      const outTemp = r.tempC < 38 || r.tempC > 48
                      const outHum  = r.humidityPct < 75 || r.humidityPct > 85
                      return (
                        <tr key={r.day} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 font-semibold text-cacao-brown">J+{r.day}</td>
                          <td className="py-2 px-3 text-text-dark/50">{new Date(r.takenAt).toLocaleDateString('fr-FR')}</td>
                          <td className={`py-2 px-3 text-right font-mono ${outTemp ? 'text-error font-bold' : 'text-text-dark'}`}>
                            {formatFR(r.tempC)}
                          </td>
                          <td className={`py-2 px-3 text-right font-mono ${outHum ? 'text-error font-bold' : 'text-text-dark'}`}>
                            {formatFR(r.humidityPct)}
                          </td>
                          <td className="py-2 px-3 text-text-dark/50">{r.notes || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire saisie */}
        <div className="space-y-4">
          {status === 'fermenting' ? (
            <Card className="p-5 space-y-4">
              <p className="font-body font-semibold text-text-dark">Ajouter relevé J+{currentDay}</p>

              <form onSubmit={handleSaveReading} className="space-y-3">
                <div>
                  <label className="text-xs font-body text-text-dark/60 mb-1 block">Température (°C)</label>
                  <input
                    type="number" inputMode="decimal" step="0.1" min="20" max="70"
                    value={tempC} onChange={(e) => setTempC(e.target.value)}
                    required
                    placeholder="ex : 46,5"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-chain-cyan transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-body text-text-dark/60 mb-1 block">Humidité (%)</label>
                  <input
                    type="number" inputMode="decimal" step="0.5" min="0" max="100"
                    value={humidity} onChange={(e) => setHumidity(e.target.value)}
                    required
                    placeholder="ex : 78"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-chain-cyan transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-body text-text-dark/60 mb-1 block">Notes (optionnel)</label>
                  <textarea
                    value={notes} onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Observations, anomalies…"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body resize-none focus:outline-none focus:border-chain-cyan transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !tempC || !humidity}
                  className="w-full bg-chain-cyan text-white font-body font-semibold text-sm rounded-xl py-2.5 hover:bg-chain-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement…</>
                  ) : (
                    'Enregistrer le relevé'
                  )}
                </button>
              </form>
            </Card>
          ) : (
            <Card className="p-5">
              <div className="flex items-center gap-2 text-cacao-green">
                <CheckCircle size={18} />
                <p className="font-body font-semibold">Fermentation terminée</p>
              </div>
              <p className="text-xs font-body text-text-dark/50 mt-2">
                Clôturée le {formatFullDate(ferm.completedAt)}
              </p>
            </Card>
          )}

          {/* Bandeau clôture */}
          {status === 'fermenting' && canClose && (
            <div className="bg-cacao-green/5 border border-cacao-green/20 rounded-xl p-4 space-y-3">
              <p className="text-sm font-body font-semibold text-cacao-green">
                ✓ Fermentation prête à être clôturée
              </p>
              <p className="text-xs font-body text-text-dark/60">
                {ferm.readings.length} jours effectués sur {ferm.targetDays} prévus
              </p>
              <button
                onClick={() => setDryModal(true)}
                className="w-full bg-cacao-green text-white font-body font-semibold text-sm rounded-xl py-2.5 hover:bg-cacao-green/90 transition-colors"
              >
                Clôturer la fermentation et démarrer le séchage
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal démarrage séchage */}
      <Modal isOpen={dryModal} onClose={() => setDryModal(false)} title="Démarrer le séchage" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm font-body text-text-dark/70">
            Résumé fermentation : {ferm.readings.length} jours ·{' '}
            T° moy. {formatFR(ferm.readings.reduce((s, r) => s + r.tempC, 0) / (ferm.readings.length || 1))}°C
          </p>

          <div>
            <label className="text-xs font-body text-text-dark/60 mb-1 block">Méthode de séchage</label>
            <select
              value={dryMethod} onChange={(e) => setDryMethod(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-chain-cyan"
            >
              <option value="solaire">Séchage solaire</option>
              <option value="mécanique">Séchage mécanique</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-body text-text-dark/60 mb-1 block">Humidité initiale (%)</label>
            <input
              type="number" inputMode="decimal" step="0.5" min="0" max="100"
              value={dryHumidity} onChange={(e) => setDryHum(e.target.value)}
              placeholder="ex : 55"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-chain-cyan"
            />
          </div>

          <button
            onClick={handleStartDrying}
            disabled={submitting || !dryHumidity}
            className="w-full bg-chain-cyan text-white font-body font-semibold text-sm rounded-xl py-2.5 hover:bg-chain-cyan/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement…</>
              : 'Confirmer et démarrer le séchage'
            }
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ── Tab Séchage ───────────────────────────────────────────────────────────────

function TabDrying({ lot, onLotUpdated, toast }) {
  const { status, quality } = lot
  const dry = quality.drying
  const [humidity, setHumidity] = useState('')
  const [tempC, setTempC]       = useState('')
  const [submitting, setSubmit] = useState(false)
  const [sortModal, setSortModal] = useState(false)

  const notStarted = !dry.startedAt
  const lastHum = dry.readings.length > 0 ? dry.readings[dry.readings.length - 1].humidityPct : dry.humidityStart ?? null
  const targetReached = lastHum != null && lastHum <= 8

  async function handleSaveDrying(e) {
    e.preventDefault()
    if (!humidity || !tempC) return
    setSubmit(true)
    try {
      const hoursSince = dry.startedAt
        ? Math.round((Date.now() - new Date(dry.startedAt).getTime()) / 3_600_000)
        : 0
      const res = await saveDryingReading(lot.id, { hour: hoursSince, tempC: parseFloat(tempC), humidityPct: parseFloat(humidity) })
      if (res.success) {
        onLotUpdated(res.lot)
        toast.success(`Relevé séchage enregistré · Tx ${res.txHash.slice(0, 10)}…`)
        setHumidity(''); setTempC('')
      }
    } finally { setSubmit(false) }
  }

  if (notStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gold-premium/10 flex items-center justify-center">
          <Lock size={24} className="text-gold-premium" />
        </div>
        <p className="font-body font-semibold text-text-dark/60">Séchage pas encore démarré</p>
        <p className="text-sm font-body text-text-dark/40">Terminez la fermentation d'abord</p>
      </div>
    )
  }

  const chartLines = [{ dataKey: 'humidityPct', color: '#2196C7', label: 'Humidité', unit: '%', targetRange: [6, 8] }]
  const chartRightLines = [{ dataKey: 'tempC', color: '#E8B547', label: 'Temp. ambiante', unit: '°C' }]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm font-body text-text-dark/60 bg-gold-premium/5 rounded-xl px-4 py-3">
        <Sun size={16} className="text-gold-premium shrink-0" />
        Démarré le {formatFullDate(dry.startedAt)} · Méthode : {dry.method ?? 'solaire'} · Hum. initiale : {dry.humidityStart} %
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Graphique */}
        <div>
          <p className="text-sm font-body font-semibold text-text-dark mb-3">Courbe d'humidité (objectif 6-8 %)</p>
          <Card className="p-4">
            <QualityChart readings={dry.readings} xKey="hour" lines={chartLines} rightLines={chartRightLines} height={260} />
          </Card>

          {dry.readings.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs font-body border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-text-dark/40">Heure</th>
                    <th className="text-left py-2 px-3 text-text-dark/40">Date</th>
                    <th className="text-right py-2 px-3 text-text-dark/40">Hum. (%)</th>
                    <th className="text-right py-2 px-3 text-text-dark/40">T° amb. (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  {dry.readings.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-semibold text-gold-premium">H+{r.hour}</td>
                      <td className="py-2 px-3 text-text-dark/50">{new Date(r.takenAt).toLocaleDateString('fr-FR')}</td>
                      <td className={`py-2 px-3 text-right font-mono ${r.humidityPct <= 8 ? 'text-cacao-green font-bold' : 'text-text-dark'}`}>
                        {formatFR(r.humidityPct)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-text-dark">{formatFR(r.tempC)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div className="space-y-4">
          {!dry.completedAt ? (
            <Card className="p-5 space-y-4">
              <p className="font-body font-semibold text-text-dark">Ajouter un relevé séchage</p>
              <form onSubmit={handleSaveDrying} className="space-y-3">
                <div>
                  <label className="text-xs font-body text-text-dark/60 mb-1 block">Humidité actuelle (%)</label>
                  <input
                    type="number" inputMode="decimal" step="0.5" min="0" max="100"
                    value={humidity} onChange={(e) => setHumidity(e.target.value)} required
                    placeholder="ex : 18"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-chain-cyan transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-body text-text-dark/60 mb-1 block">Température ambiante (°C)</label>
                  <input
                    type="number" inputMode="decimal" step="0.5" min="0" max="60"
                    value={tempC} onChange={(e) => setTempC(e.target.value)} required
                    placeholder="ex : 34"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-chain-cyan transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !humidity || !tempC}
                  className="w-full bg-chain-cyan text-white font-body font-semibold text-sm rounded-xl py-2.5 hover:bg-chain-cyan/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement…</> : 'Enregistrer'}
                </button>
              </form>
            </Card>
          ) : (
            <Card className="p-5">
              <div className="flex items-center gap-2 text-cacao-green">
                <CheckCircle size={18} />
                <p className="font-body font-semibold">Séchage terminé</p>
              </div>
              <p className="text-xs font-body text-text-dark/50 mt-2">
                Clôturé le {formatFullDate(dry.completedAt)} · Hum. finale : {formatFR(dry.humidityFinal)} %
              </p>
            </Card>
          )}

          {!dry.completedAt && targetReached && (
            <div className="bg-cacao-green/5 border border-cacao-green/20 rounded-xl p-4 space-y-3">
              <p className="text-sm font-body font-semibold text-cacao-green">✓ Séchage atteint la cible</p>
              <p className="text-xs font-body text-text-dark/60">Humidité actuelle : {formatFR(lastHum)} % · Prêt pour le tri</p>
              <button
                onClick={() => setSortModal(true)}
                className="w-full bg-cacao-green text-white font-body font-semibold text-sm rounded-xl py-2.5 hover:bg-cacao-green/90 transition-colors"
              >
                Clôturer le séchage et passer au tri
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal tri */}
      <SortingModal isOpen={sortModal} onClose={() => setSortModal(false)} lot={lot} onLotUpdated={onLotUpdated} toast={toast} />
    </div>
  )
}

// ── Tab Tri ───────────────────────────────────────────────────────────────────

function SortingModal({ isOpen, onClose, lot, onLotUpdated, toast }) {
  const defaultWeight = parseFloat((lot.weightKg * 0.92).toFixed(1))
  const [weight, setWeight]     = useState(defaultWeight.toString())
  const [reject, setReject]     = useState('')
  const [size, setSize]         = useState('')
  const [notes, setNotes]       = useState('')
  const [submitting, setSubmit] = useState(false)

  const rejectPct = weight
    ? parseFloat(((lot.weightKg - parseFloat(weight)) / lot.weightKg * 100).toFixed(1))
    : null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmit(true)
    try {
      const res = await completeSortingStage(lot.id, {
        weightAfterKg: parseFloat(weight),
        rejectPct: rejectPct ?? parseFloat(reject),
        beanSizeCategory: size,
      })
      if (res.success) {
        onLotUpdated(res.lot)
        onClose()
        toast.success('Tri clôturé avec succès')
      }
    } finally { setSubmit(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Valider le tri & calibrage" size="md">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="text-xs font-body text-text-dark/60 mb-1 block">Poids après tri (kg)</label>
          <input
            type="number" inputMode="decimal" step="0.1" min="0"
            value={weight} onChange={(e) => setWeight(e.target.value)} required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-chain-cyan"
          />
          {rejectPct != null && weight && (
            <p className="text-xs font-body text-text-dark/50 mt-1">
              Rejet calculé : {formatFR(rejectPct)} % ({(lot.weightKg - parseFloat(weight)).toFixed(1)} kg)
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-body text-text-dark/60 mb-2 block">Catégorie de calibre</label>
          <div className="grid grid-cols-2 gap-2">
            {SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value} type="button"
                onClick={() => setSize(opt.value)}
                className={`py-2.5 rounded-xl border-2 text-sm font-body font-medium transition-colors ${
                  size === opt.value
                    ? 'border-chain-cyan bg-chain-cyan/5 text-chain-cyan'
                    : 'border-gray-200 text-text-dark/60 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-body text-text-dark/60 mb-1 block">Notes</label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body resize-none focus:outline-none focus:border-chain-cyan"
            placeholder="Observations sur le tri…"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !weight || !size}
          className="w-full bg-chain-cyan text-white font-body font-semibold text-sm rounded-xl py-2.5 hover:bg-chain-cyan/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement…</> : 'Valider le tri et passer au grade final'}
        </button>
      </form>
    </Modal>
  )
}

function TabSorting({ lot, onLotUpdated, toast }) {
  const sort = lot.quality.sorting
  const [sortModal, setSortModal] = useState(false)
  const notDone = !sort.completedAt

  if (lot.status === 'received' || lot.status === 'fermenting') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
          <Lock size={24} className="text-gray-300" />
        </div>
        <p className="font-body font-semibold text-text-dark/40">Étape non atteinte</p>
        <p className="text-sm font-body text-text-dark/30">Terminez la fermentation et le séchage d'abord</p>
      </div>
    )
  }

  if (notDone) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="font-body text-text-dark/60">Le séchage est en cours ou terminé. Lancez le tri quand vous êtes prêt.</p>
        <button
          onClick={() => setSortModal(true)}
          className="bg-chain-cyan text-white font-body font-semibold text-sm rounded-xl px-6 py-2.5 hover:bg-chain-cyan/90 transition-colors"
        >
          Saisir le tri & calibrage
        </button>
        <SortingModal isOpen={sortModal} onClose={() => setSortModal(false)} lot={lot} onLotUpdated={onLotUpdated} toast={toast} />
      </div>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 text-cacao-green mb-2">
        <CheckCircle size={20} />
        <p className="font-body font-semibold text-lg">Tri clôturé</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-body text-text-dark/40 mb-1">Poids après tri</p>
          <p className="text-lg font-sans font-bold text-text-dark">{formatFR(sort.weightAfterSortingKg)} kg</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-body text-text-dark/40 mb-1">Taux de rejet</p>
          <p className="text-lg font-sans font-bold text-text-dark">{formatFR(sort.rejectPct)} %</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-body text-text-dark/40 mb-1">Calibre</p>
          <p className="text-lg font-sans font-bold text-text-dark capitalize">{sort.beanSizeCategory ?? '—'}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-body text-text-dark/40 mb-1">Clôturé le</p>
          <p className="text-sm font-body font-semibold text-text-dark">{new Date(sort.completedAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </Card>
  )
}

// ── Tab Grade final ───────────────────────────────────────────────────────────

function TabGrading({ lot, onLotUpdated, toast, navigate }) {
  const grade = lot.quality.grading
  const [finalGrade, setGrade]     = useState(grade.finalGrade ?? '')
  const [flavors, setFlavors]      = useState(grade.flavorProfile ?? [])
  const [defects, setDefects]      = useState(grade.defects ?? [])
  const [notes, setNotes]          = useState(grade.notes ?? '')
  const [liveHash, setLiveHash]    = useState(grade.onChainHash ?? null)
  const [confirmModal, setConfirm] = useState(false)
  const [submitting, setSubmit]    = useState(false)

  const notUnlocked = !lot.quality.sorting.completedAt && lot.status !== 'processed'

  // Calcul live du hash
  useEffect(() => {
    if (!finalGrade) { setLiveHash(null); return }
    const preview = { ...lot.quality, grading: { ...grade, finalGrade, flavorProfile: flavors, defects, notes } }
    computeQualityHash(preview).then(setLiveHash)
  }, [finalGrade, flavors, defects, notes])

  function toggleFlavor(f) {
    setFlavors((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f])
  }
  function toggleDefect(d) {
    setDefects((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  async function handleFinalize() {
    setSubmit(true)
    try {
      const res = await finalizeGrading(lot.id, { finalGrade, flavorProfile: flavors, defects, notes })
      if (res.success) {
        onLotUpdated(res.lot)
        setConfirm(false)
        toast.success(`Grade ${finalGrade} inscrit on-chain · Hash ${res.onChainHash.slice(0, 12)}…`)
      }
    } finally { setSubmit(false) }
  }

  if (notUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
          <Lock size={24} className="text-gray-300" />
        </div>
        <p className="font-body font-semibold text-text-dark/40">Étape non atteinte</p>
        <p className="text-sm font-body text-text-dark/30">Terminez le tri & calibrage pour accéder au grade final</p>
      </div>
    )
  }

  if (grade.finalGrade) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cacao-green/10 flex items-center justify-center">
              <Award size={24} className="text-cacao-green" />
            </div>
            <div>
              <p className="text-2xl font-sans font-bold text-text-dark">Grade {grade.finalGrade}</p>
              <p className="text-xs font-body text-text-dark/50">Inscrit le {formatFullDate(grade.inspectedAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-body text-text-dark/40 uppercase tracking-wider mb-2">Profil saveur</p>
              <div className="flex flex-wrap gap-1.5">
                {grade.flavorProfile.map((f) => (
                  <span key={f} className="px-2.5 py-1 rounded-full bg-cacao-green/10 text-cacao-green text-xs font-body">{f}</span>
                ))}
              </div>
            </div>
            {grade.defects.length > 0 && (
              <div>
                <p className="text-xs font-body text-text-dark/40 uppercase tracking-wider mb-2">Défauts</p>
                <div className="flex flex-wrap gap-1.5">
                  {grade.defects.map((d) => (
                    <span key={d} className="px-2.5 py-1 rounded-full bg-error/10 text-error text-xs font-body">{d}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {grade.onChainHash && (
            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-body text-text-dark/40 mb-1">Hash SHA-256 on-chain</p>
              <p className="font-mono text-xs text-text-dark break-all">{grade.onChainHash}</p>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Formulaire */}
      <div className="space-y-6">
        <div>
          <p className="text-sm font-body font-semibold text-text-dark mb-3">Grade final</p>
          <GradeSelector value={finalGrade} onChange={setGrade} />
        </div>

        <div>
          <p className="text-sm font-body font-semibold text-text-dark mb-3">Profil de saveur</p>
          <div className="flex flex-wrap gap-2">
            {FLAVOR_OPTIONS.map((f) => (
              <button
                key={f} type="button" onClick={() => toggleFlavor(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-body border-2 transition-colors ${
                  flavors.includes(f)
                    ? 'border-cacao-green bg-cacao-green/10 text-cacao-green'
                    : 'border-gray-200 text-text-dark/60 hover:border-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-body font-semibold text-text-dark mb-3">Défauts détectés</p>
          <div className="flex flex-wrap gap-2">
            {DEFECT_OPTIONS.map((d) => (
              <button
                key={d} type="button" onClick={() => toggleDefect(d)}
                className={`px-3 py-1.5 rounded-full text-sm font-body border-2 transition-colors ${
                  defects.includes(d)
                    ? 'border-error bg-error/10 text-error'
                    : 'border-gray-200 text-text-dark/60 hover:border-gray-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-body font-semibold text-text-dark block mb-2">Notes d'inspection</label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-body resize-none focus:outline-none focus:border-chain-cyan transition-colors"
            placeholder="Observations sur la qualité…"
          />
        </div>
      </div>

      {/* Panneau aperçu certificat */}
      <div className="space-y-4">
        <Card className="p-5 sticky top-4">
          <p className="text-xs font-body font-semibold text-text-dark/40 uppercase tracking-wider mb-4">
            Aperçu certificat qualité
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-body text-text-dark/50">Grade</span>
              <span className={`text-xl font-sans font-bold ${finalGrade ? 'text-text-dark' : 'text-gray-200'}`}>
                {finalGrade || '—'}
              </span>
            </div>

            <div>
              <p className="text-xs font-body text-text-dark/50 mb-1.5">Profil saveur</p>
              <div className="flex flex-wrap gap-1">
                {flavors.length > 0
                  ? flavors.map((f) => <span key={f} className="px-2 py-0.5 rounded-full bg-cacao-green/10 text-cacao-green text-xs font-body">{f}</span>)
                  : <span className="text-xs font-body text-gray-200">Aucun sélectionné</span>
                }
              </div>
            </div>

            <div>
              <p className="text-xs font-body text-text-dark/50 mb-1.5">Hash SHA-256</p>
              {liveHash ? (
                <p className="font-mono text-[10px] text-text-dark/60 break-all leading-relaxed">{liveHash}</p>
              ) : (
                <p className="text-xs font-body text-gray-200">Calculé après sélection du grade</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setConfirm(true)}
            disabled={!finalGrade}
            className="w-full mt-5 bg-chain-cyan text-white font-body font-semibold text-sm rounded-xl py-3 hover:bg-chain-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Finaliser et signer on-chain
          </button>
        </Card>
      </div>

      {/* Modal confirmation */}
      <Modal isOpen={confirmModal} onClose={() => setConfirm(false)} title="Confirmer la finalisation" size="md">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-3 py-2.5">
            <AlertTriangle size={16} />
            <p className="text-sm font-body font-medium">Action irréversible — Le grade sera inscrit en blockchain</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-body text-text-dark/70"><strong>Lot :</strong> {lot.lotUuid}</p>
            <p className="text-sm font-body text-text-dark/70"><strong>Grade :</strong> {finalGrade}</p>
            <p className="text-sm font-body text-text-dark/70"><strong>Profil :</strong> {flavors.join(', ') || 'Aucun'}</p>
            {defects.length > 0 && <p className="text-sm font-body text-text-dark/70"><strong>Défauts :</strong> {defects.join(', ')}</p>}
          </div>

          <button
            onClick={handleFinalize}
            disabled={submitting}
            className="w-full bg-chain-cyan text-white font-body font-semibold text-sm rounded-xl py-2.5 hover:bg-chain-cyan/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Inscription en cours…</>
              : 'Confirmer et inscrire on-chain'
            }
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ── Tab Historique ────────────────────────────────────────────────────────────

function TabHistory({ lot }) {
  const [expanded, setExpanded] = useState({})
  const events = useMemo(() => buildBlockchainHistory(lot), [lot])

  function toggle(i) {
    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))
  }

  return (
    <div className="space-y-2">
      {events.map((ev, i) => {
        const cfg = HISTORY_ICONS[ev.icon] ?? HISTORY_ICONS.lot_created
        const Icon = cfg.Icon
        const isExp = expanded[i]

        return (
          <div key={i} className="flex gap-3">
            {/* Colonne icône + ligne */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon size={14} className={cfg.color} />
              </div>
              {i < events.length - 1 && <div className="w-0.5 flex-1 min-h-[20px] mt-1 bg-gray-100" />}
            </div>

            {/* Contenu */}
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-semibold text-text-dark leading-snug">{ev.action}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs font-body text-text-dark/40">{ev.actor}</span>
                    <span className="text-text-dark/20">·</span>
                    <span className="text-xs font-body text-text-dark/40">{formatRelativeDate(ev.timestamp)}</span>
                  </div>
                  {ev.txHash && (
                    <a
                      href={`https://polygonscan.com/tx/${ev.txHash}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-mono text-chain-cyan hover:underline mt-0.5 inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {ev.txHash.slice(0, 18)}… <ExternalLink size={9} />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => toggle(i)}
                  className="shrink-0 text-gray-300 hover:text-gray-400 transition-colors"
                  aria-label={isExp ? 'Réduire' : 'Voir les données'}
                >
                  {isExp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Payload JSON */}
              <AnimatePresence>
                {isExp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <pre className="mt-2 text-[10px] font-mono bg-gray-50 rounded-xl p-3 overflow-x-auto text-text-dark/60 leading-relaxed">
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function QualityEntryDetail() {
  const { lotId } = useParams()
  const navigate = useNavigate()
  const { toasts, toast, dismissToast } = useToast()

  const [lot, setLot]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [source, setSource]   = useState(null)
  const [activeTab, setTab]   = useState('fermentation')
  const [sidebarOpen, setSidebar] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const res = await fetchLotQualityById(lotId)
      if (!cancelled) {
        if (res.lot) { setLot(res.lot); setSource(res.source) }
        else setError('Lot introuvable')
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [lotId])

  const { stage, progressPct } = useMemo(() => lot ? getQualityProgress(lot) : { stage: null, progressPct: 0 }, [lot])
  const alerts = useMemo(() => lot ? getQualityAlerts(lot) : [], [lot])
  const nextAction = useMemo(() => lot ? getNextAction(lot) : '', [lot])

  function handleLotUpdated(updatedLot) {
    setLot(updatedLot)
  }

  async function copyUuid() {
    if (!lot) return
    await navigator.clipboard.writeText(lot.lotUuid).catch(() => {})
    toast.success('UUID copié')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-chain-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-body text-text-dark/40">Chargement du lot…</p>
        </div>
      </div>
    )
  }

  if (error || !lot) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="font-body font-semibold text-text-dark/60 mb-3">{error ?? 'Lot introuvable'}</p>
        <Link to="/processor/quality-entry" className="text-sm font-body text-chain-cyan hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    )
  }

  const statusCfg = STATUS_BADGE[lot.status] ?? STATUS_BADGE.received

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── En-tête ── */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Link
            to="/processor/quality-entry"
            className="flex items-center gap-1 text-sm font-body text-text-dark/50 hover:text-chain-cyan transition-colors"
          >
            <ChevronLeft size={16} /> Saisie qualité
          </Link>

          <div className="flex-1 flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-sans font-bold text-text-dark">
              Lot {lot.lotUuid}
            </h1>
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            <Badge variant="cacao">{lot.species}</Badge>
          </div>

          <a
            href={`/verify/${lot.lotUuid}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-body text-chain-cyan hover:underline shrink-0"
          >
            Voir traçabilité publique <ExternalLink size={12} />
          </a>
        </div>

        {/* ── Layout desktop : sidebar gauche + content ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Sidebar mobile — accordion */}
          <div className="lg:hidden w-full">
            <button
              onClick={() => setSidebar((v) => !v)}
              className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
            >
              <span className="text-sm font-body font-semibold text-text-dark">Informations du lot</span>
              {sidebarOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    <SidebarCards lot={lot} alerts={alerts} onCopyUuid={copyUuid} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar desktop */}
          <div className="hidden lg:flex flex-col gap-4 w-80 shrink-0 sticky top-4">
            <SidebarCards lot={lot} alerts={alerts} onCopyUuid={copyUuid} />
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">

            {/* Tabs */}
            <div className="mb-6 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1 border-b border-gray-100 min-w-max">
                {TABS.map((tab) => {
                  const enabled = isTabEnabled(tab.key, lot)
                  const active  = activeTab === tab.key
                  const Icon    = tab.icon

                  return (
                    <button
                      key={tab.key}
                      onClick={() => enabled && setTab(tab.key)}
                      disabled={!enabled}
                      className={`
                        relative flex items-center gap-2 px-4 py-3 text-sm font-body font-medium
                        transition-colors whitespace-nowrap
                        ${active
                          ? 'text-chain-cyan'
                          : enabled
                            ? 'text-text-dark/50 hover:text-text-dark'
                            : 'text-gray-200 cursor-not-allowed'
                        }
                      `}
                      aria-selected={active}
                    >
                      {!enabled && <Lock size={11} className="text-gray-300" />}
                      <Icon size={15} />
                      {tab.label}
                      {active && (
                        <motion.div
                          layoutId="tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-chain-cyan rounded-t-full"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contenu du tab */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'fermentation' && (
                  <TabFermentation lot={lot} onLotUpdated={handleLotUpdated} toast={toast} />
                )}
                {activeTab === 'drying' && (
                  <TabDrying lot={lot} onLotUpdated={handleLotUpdated} toast={toast} />
                )}
                {activeTab === 'sorting' && (
                  <TabSorting lot={lot} onLotUpdated={handleLotUpdated} toast={toast} />
                )}
                {activeTab === 'grading' && (
                  <TabGrading lot={lot} onLotUpdated={handleLotUpdated} toast={toast} navigate={navigate} />
                )}
                {activeTab === 'history' && (
                  <TabHistory lot={lot} />
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

// ── Sidebar Cards ─────────────────────────────────────────────────────────────

function SidebarCards({ lot, alerts, onCopyUuid }) {
  return (
    <>
      {/* Card Identité */}
      <Card className="p-4 space-y-4">
        <p className="text-xs font-body font-semibold text-text-dark/40 uppercase tracking-wider">Identité du lot</p>

        {/* UUID copiable */}
        <div>
          <p className="text-xs font-body text-text-dark/40 mb-1">UUID</p>
          <button
            onClick={onCopyUuid}
            className="flex items-center gap-2 group"
            title="Copier l'UUID"
          >
            <span className="font-mono text-xs text-text-dark break-all">{lot.lotUuid}</span>
            <Copy size={12} className="text-gray-300 group-hover:text-chain-cyan transition-colors shrink-0" />
          </button>
        </div>

        {/* Producteur */}
        <div className="flex items-center gap-3">
          <TeamAvatar name={lot.producerName} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-body font-semibold text-text-dark truncate">{lot.producerName}</p>
            <p className="text-xs font-body text-text-dark/50">{lot.producerCommune}</p>
            {lot.producerPhone && (
              <a href={`tel:${lot.producerPhone}`} className="text-xs font-body text-chain-cyan hover:underline flex items-center gap-1 mt-0.5">
                <Phone size={10} /> {lot.producerPhone}
              </a>
            )}
          </div>
        </div>

        {/* Coopérative */}
        <div className="pt-2 border-t border-gray-50">
          <p className="text-xs font-body text-text-dark/40 mb-0.5">Coopérative d'origine</p>
          <p className="text-sm font-body text-text-dark font-medium">{lot.originCooperative?.name}</p>
          <p className="text-xs font-body text-text-dark/50 flex items-center gap-1 mt-0.5">
            <MapPin size={10} /> {lot.originCooperative?.commune}
          </p>
        </div>

        {/* Parcelle */}
        <div className="pt-2 border-t border-gray-50">
          <p className="text-xs font-body text-text-dark/40 mb-0.5">Parcelle</p>
          <p className="text-sm font-body text-text-dark">{lot.parcelName}</p>
          {lot.parcelAreaHa && (
            <p className="text-xs font-body text-text-dark/50">{lot.parcelAreaHa} ha</p>
          )}
        </div>

        {/* Espèce + poids */}
        <div className="flex gap-3 pt-2 border-t border-gray-50">
          <div className="flex-1">
            <p className="text-xs font-body text-text-dark/40 mb-0.5">Espèce</p>
            <p className="text-sm font-body font-semibold text-text-dark">{lot.species}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs font-body text-text-dark/40 mb-0.5">Poids initial</p>
            <p className="text-sm font-body font-semibold text-text-dark">
              {lot.weightKg.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} kg
            </p>
          </div>
        </div>
      </Card>

      {/* Card Progression globale */}
      <Card className="p-4">
        <p className="text-xs font-body font-semibold text-text-dark/40 uppercase tracking-wider mb-4">Progression</p>
        <StageTimeline lot={lot} />
      </Card>

      {/* Card Alertes */}
      {alerts.length > 0 && (
        <Card className="p-4 border-amber-200">
          <p className="text-xs font-body font-semibold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle size={13} /> Alertes actives
          </p>
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2">
                <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-body text-amber-700 leading-snug">{a}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
