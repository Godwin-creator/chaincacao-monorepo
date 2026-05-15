import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  FileJson,
  LoaderCircle,
  PackageSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import LoadingState from '../../components/ui/LoadingState'
import ToastContainer from '../../components/ui/Toast'
import LotCard from '../../components/exporter/LotCard'
import ComplianceTable from '../../components/exporter/ComplianceTable'
import CertificatePreview from '../../components/exporter/CertificatePreview'
import ParcelMap from '../../components/maps/ParcelMap'
import {
  createShipmentAndCertificate,
  fetchAvailableLots,
  fetchBuyersList,
  fetchExporterDashboard,
  validateLotForEUDR,
} from '../../lib/api'
import { formatFullDate, formatWeight } from '../../utils/format'

const WIZARD_STEPS = [
  { id: 1, label: 'Sélection des lots' },
  { id: 2, label: 'Vérification conformité' },
  { id: 3, label: 'Informations expédition' },
  { id: 4, label: 'Génération & signature' },
]

const SIGNING_PHASES = [
  'Préparation des données',
  'Inscription sur Polygon',
  'Génération des documents',
]

const initialFormData = {
  buyerId: '',
  selectedLotIds: [],
  destinationPort: '',
  vesselName: '',
  containerNumber: '',
  estimatedDeparture: '',
  contractNumber: '',
  notes: '',
}

function summarizeSpecies(lots) {
  const breakdown = lots.reduce((acc, lot) => {
    acc[lot.species] = (acc[lot.species] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(breakdown)
    .map(([species, count]) => `${species} (${count})`)
    .join(' · ')
}

function createToast(message, variant = 'info') {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    variant,
  }
}

function truncateHash(value) {
  if (!value) return '—'
  if (value.length <= 18) return value
  return `${value.slice(0, 10)}…${value.slice(-8)}`
}

function StepProgress({ step }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-chain-cyan/10 bg-cream/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {WIZARD_STEPS.map((item) => {
            const isActive = item.id === step
            const isDone = item.id < step

            return (
              <div
                key={item.id}
                className={`rounded-2xl border px-3 py-3 transition-colors ${
                  isActive
                    ? 'border-chain-cyan bg-chain-cyan/10'
                    : isDone
                      ? 'border-cacao-green/20 bg-cacao-green/5'
                      : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isActive
                        ? 'bg-chain-cyan text-white'
                        : isDone
                          ? 'bg-cacao-green text-white'
                          : 'bg-gray-100 text-text-dark/55'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={16} /> : item.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-dark/45">Étape {item.id}</p>
                    <p className="truncate text-sm font-medium text-text-dark">{item.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Header({ source, shipmentId }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-text-dark/55">
        <Link to="/exporter" className="hover:text-chain-cyan transition-colors">Exportateur</Link>
        <ChevronRight size={15} />
        <span className="font-medium text-text-dark">Certificat EUDR</span>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-sans font-bold text-text-dark md:text-4xl">
              Générer un certificat EUDR
            </h1>
            {source === 'mock' ? <Badge variant="warning">Mode démo</Badge> : null}
            {shipmentId ? <Badge variant="info">Préchargement {shipmentId}</Badge> : null}
          </div>
          <p className="mt-2 max-w-3xl text-base text-text-dark/65">
            Créez un dossier d&apos;exportation conforme au règlement (UE) 2023/1115.
          </p>
        </div>

        <Card className="min-w-[260px] bg-chain-bg px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">Objectif démo jury</p>
          <p className="mt-2 text-lg font-semibold">PDF EUDR + GeoJSON TRACES + preuve on-chain</p>
        </Card>
      </div>
    </div>
  )
}

function StepContainer({ step, children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default function EUDRCertificate() {
  const { shipmentId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)
  const [source, setSource] = useState('mock')
  const [exporterProfile, setExporterProfile] = useState(null)
  const [availableLots, setAvailableLots] = useState([])
  const [buyers, setBuyers] = useState([])
  const [unavailableLotsCount, setUnavailableLotsCount] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    species: 'all',
    grade: 'all',
  })
  const [formData, setFormData] = useState(initialFormData)
  const [validations, setValidations] = useState([])
  const [validating, setValidating] = useState(false)
  const [geoModalLot, setGeoModalLot] = useState(null)
  const [toasts, setToasts] = useState([])
  const [signingPhase, setSigningPhase] = useState(-1)
  const [submitting, setSubmitting] = useState(false)
  const [successResult, setSuccessResult] = useState(null)
  const [errorResult, setErrorResult] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setError(null)

      try {
        const [dashboardResult, lotsResult, buyersResult] = await Promise.all([
          fetchExporterDashboard('exp-cacaomax-lome'),
          fetchAvailableLots('exp-cacaomax-lome'),
          fetchBuyersList(),
        ])

        if (cancelled) return

        setExporterProfile(dashboardResult.data.profile)
        setAvailableLots(lotsResult.lots)
        setBuyers(buyersResult.buyers)
        setUnavailableLotsCount(
          (dashboardResult.data.lots ?? []).filter((lot) => lot.status !== 'available').length,
        )
        setSource(
          dashboardResult.source === 'mock' || lotsResult.source === 'mock' || buyersResult.source === 'mock'
            ? 'mock'
            : 'supabase',
        )
        setLoading(false)
      } catch (loadError) {
        if (cancelled) return
        setError(loadError.message ?? 'Impossible de charger l’assistant EUDR.')
        setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const buyer = buyers.find((item) => item.id === formData.buyerId)
    if (!buyer) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((current) => ({
      ...current,
      destinationPort: current.destinationPort || buyer.defaultPort || '',
      contractNumber: current.contractNumber || buyer.contractRef || '',
    }))
  }, [buyers, formData.buyerId])

  const selectedLots = availableLots.filter((lot) => formData.selectedLotIds.includes(lot.id))
  const totalSelectedWeight = selectedLots.reduce((sum, lot) => sum + lot.weightKg, 0)
  const selectedBuyer = buyers.find((buyer) => buyer.id === formData.buyerId) ?? null
  const hasInvalidLots = validations.some((entry) => !entry.validation.isValid)
  const validationWarningsCount = validations.reduce((sum, entry) => sum + entry.validation.warnings.length, 0)

  const filteredLots = useMemo(() => (
    availableLots.filter((lot) => {
      const searchMatch = filters.search
        ? (
          lot.lotUuid.toLowerCase().includes(filters.search.toLowerCase()) ||
          lot.producer.name.toLowerCase().includes(filters.search.toLowerCase())
        )
        : true

      const speciesMatch = filters.species === 'all' || lot.species === filters.species
      const gradeMatch = filters.grade === 'all' || lot.quality.finalGrade === filters.grade

      return searchMatch && speciesMatch && gradeMatch
    })
  ), [availableLots, filters.grade, filters.search, filters.species])

  const previewCertificateNumber = `CC-EUDR-2026-${String(selectedLots.length * 137 + 4200).padStart(4, '0')}`

  useEffect(() => {
    if (step !== 2 || selectedLots.length === 0) return

    let cancelled = false

    async function runValidation() {
      setValidating(true)
      const results = await Promise.all(
        selectedLots.map(async (lot) => ({
          lot,
          validation: await validateLotForEUDR(lot.id),
        })),
      )

      if (cancelled) return
      setValidations(results)
      setValidating(false)
    }

    runValidation()
    return () => { cancelled = true }
  }, [selectedLots, step])

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  function pushToast(message, variant) {
    setToasts((current) => [...current, createToast(message, variant)])
  }

  function updateFormField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function toggleLotSelection(lotId) {
    setFormData((current) => {
      const selected = current.selectedLotIds.includes(lotId)
      return {
        ...current,
        selectedLotIds: selected
          ? current.selectedLotIds.filter((id) => id !== lotId)
          : [...current.selectedLotIds, lotId],
      }
    })
  }

  function goToStepTwo() {
    if (selectedLots.length === 0) {
      pushToast('Veuillez sélectionner au moins un lot exportable.', 'error')
      return
    }
    setStep(2)
  }

  function goToStepThree() {
    if (hasInvalidLots) {
      pushToast('Le dossier est bloqué tant qu’un lot reste non conforme.', 'error')
      return
    }
    setStep(3)
  }

  function goToStepFour() {
    if (!formData.buyerId || !formData.destinationPort || !formData.vesselName || !formData.containerNumber || !formData.estimatedDeparture || !formData.contractNumber) {
      pushToast('Veuillez compléter toutes les informations d’expédition requises.', 'error')
      return
    }
    setStep(4)
  }

  async function handleSignature() {
    if (!selectedBuyer || selectedLots.length === 0) return

    setSubmitting(true)
    setErrorResult(null)
    setSigningPhase(0)

    let phaseIndex = 0
    const interval = window.setInterval(() => {
      phaseIndex = Math.min(phaseIndex + 1, SIGNING_PHASES.length - 1)
      setSigningPhase(phaseIndex)
    }, 800)

    const result = await createShipmentAndCertificate({
      buyerId: formData.buyerId,
      lotsIds: formData.selectedLotIds,
      destinationPort: formData.destinationPort,
      vesselInfo: {
        vesselName: formData.vesselName,
        containerNumber: formData.containerNumber,
        estimatedDeparture: formData.estimatedDeparture,
        contractNumber: formData.contractNumber,
      },
      notes: formData.notes,
    })

    window.clearInterval(interval)
    setSubmitting(false)
    setSigningPhase(-1)

    if (!result.success) {
      setErrorResult(result.error ?? { message: 'La signature blockchain a échoué.' })
      return
    }

    setSuccessResult(result)
    pushToast('Certificat EUDR généré avec succès.', 'success')
  }

  function resetWizard() {
    setStep(1)
    setFormData(initialFormData)
    setValidations([])
    setSuccessResult(null)
    setErrorResult(null)
    setGeoModalLot(null)
  }

  function downloadFile(url, filename) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <LoadingState />

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="border-error/20 bg-error/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-error" size={20} />
            <div>
              <h2 className="font-sans text-lg font-bold text-error">Impossible de charger l’assistant EUDR</h2>
              <p className="mt-1 text-sm text-error/80">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-28">
      <StepProgress step={step} />

      <div className="mx-auto mt-8 max-w-6xl space-y-8 px-4 md:px-0">
        <Header source={source} shipmentId={shipmentId} />

        <StepContainer step={step}>
          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Card className="p-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-text-dark">Recherche lot / producteur</span>
                      <input
                        value={filters.search}
                        onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                        placeholder="LOT-2026-0882"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-text-dark">Espèce</span>
                      <select
                        value={filters.species}
                        onChange={(event) => setFilters((current) => ({ ...current, species: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                      >
                        <option value="all">Toutes</option>
                        <option value="Cacao">Cacao</option>
                        <option value="Robusta">Robusta</option>
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-text-dark">Grade qualité</span>
                      <select
                        value={filters.grade}
                        onChange={(event) => setFilters((current) => ({ ...current, grade: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                      >
                        <option value="all">Tous</option>
                        <option value="A">Grade A</option>
                        <option value="B">Grade B</option>
                        <option value="C">Grade C</option>
                      </select>
                    </label>
                  </div>
                </Card>

                <Card className="p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-dark/45">Disponibilité export</p>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-bold text-text-dark">{filteredLots.length}</p>
                      <p className="text-sm text-text-dark/60">lots prêts pour certification EUDR</p>
                    </div>
                    <Link
                      to="/exporter/export-records"
                      className="text-sm font-medium text-chain-cyan transition-colors hover:text-chain-bg"
                    >
                      Voir les lots non disponibles ({unavailableLotsCount})
                    </Link>
                  </div>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {filteredLots.map((lot) => (
                  <LotCard
                    key={lot.id}
                    lot={lot}
                    selected={formData.selectedLotIds.includes(lot.id)}
                    onToggle={toggleLotSelection}
                  />
                ))}
              </div>

              {filteredLots.length === 0 ? (
                <Card className="p-10 text-center">
                  <PackageSearch className="mx-auto text-chain-cyan" size={34} />
                  <p className="mt-4 text-lg font-semibold text-text-dark">Aucun lot ne correspond à vos filtres.</p>
                  <p className="mt-2 text-sm text-text-dark/60">Ajustez la recherche ou le grade pour afficher d’autres lots disponibles.</p>
                </Card>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <Card className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-text-dark">Contrôle géographique et documentaire</p>
                    <p className="mt-1 text-sm text-text-dark/60">
                      Chaque lot est vérifié pour la géolocalisation, la précision WGS84 et la non-déforestation.
                    </p>
                  </div>

                  {validating ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-chain-cyan/10 px-4 py-2 text-sm font-medium text-chain-cyan">
                      <LoaderCircle size={16} className="animate-spin" />
                      Vérification des lots en cours…
                    </div>
                  ) : null}
                </div>
              </Card>

              {validating ? (
                <Card className="p-10 text-center">
                  <LoaderCircle className="mx-auto animate-spin text-chain-cyan" size={34} />
                  <p className="mt-4 text-lg font-semibold text-text-dark">Validation EUDR en cours</p>
                  <p className="mt-2 text-sm text-text-dark/60">Analyse des GeoJSON, des parcelles et des preuves de non-déforestation.</p>
                </Card>
              ) : (
                <>
                  <ComplianceTable lotsValidations={validations} onOpenGeoJson={setGeoModalLot} />

                  <Card className={`p-5 ${hasInvalidLots ? 'border-error/20 bg-error/5' : 'border-cacao-green/20 bg-cacao-green/5'}`}>
                    {hasInvalidLots ? (
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 text-error" size={18} />
                        <div>
                          <p className="font-semibold text-error">Dossier bloqué</p>
                          <p className="mt-1 text-sm text-error/85">
                            Un ou plusieurs lots sont non conformes. Corrigez le lot concerné avant de poursuivre.
                          </p>
                          <ul className="mt-3 space-y-1 text-sm text-error/85">
                            {validations
                              .filter((entry) => !entry.validation.isValid)
                              .map((entry) => (
                                <li key={entry.lot.id}>
                                  {entry.lot.lotUuid} non conforme : {entry.validation.errors[0]}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 text-cacao-green" size={18} />
                        <div>
                          <p className="font-semibold text-cacao-green">
                            {validations.length} lots vérifiés, tous conformes à l’EUDR.
                          </p>
                          <p className="mt-1 text-sm text-text-dark/70">
                            {validationWarningsCount > 0
                              ? `${validationWarningsCount} avertissement(s) documentaire(s) ont été signalés, sans blocage.`
                              : 'Aucun blocage documentaire ni géographique détecté.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <Card className="p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-text-dark">Destinataire</span>
                      <select
                        value={formData.buyerId}
                        onChange={(event) => updateFormField('buyerId', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                      >
                        <option value="">Sélectionnez un acheteur européen</option>
                        {buyers.map((buyer) => (
                          <option key={buyer.id} value={buyer.id}>
                            {buyer.name} · {buyer.country} · {buyer.contractRef}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-text-dark">Port d’arrivée</span>
                      <input
                        value={formData.destinationPort}
                        onChange={(event) => updateFormField('destinationPort', event.target.value)}
                        placeholder="Port d’Anvers"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-text-dark">Vessel name</span>
                      <input
                        value={formData.vesselName}
                        onChange={(event) => updateFormField('vesselName', event.target.value)}
                        placeholder="MV Atlantic Star"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-text-dark">Container number</span>
                      <input
                        value={formData.containerNumber}
                        onChange={(event) => updateFormField('containerNumber', event.target.value)}
                        placeholder="TGHU 4567890"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-text-dark">Date d’embarquement prévue</span>
                      <input
                        type="date"
                        value={formData.estimatedDeparture}
                        onChange={(event) => updateFormField('estimatedDeparture', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-text-dark">Numéro de contrat</span>
                      <input
                        value={formData.contractNumber}
                        onChange={(event) => updateFormField('contractNumber', event.target.value)}
                        placeholder="BC-2026-TG-014"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block space-y-2">
                    <span className="text-sm font-medium text-text-dark">Notes</span>
                    <textarea
                      value={formData.notes}
                      onChange={(event) => updateFormField('notes', event.target.value)}
                      placeholder="Observations de dossier, exigences douanières, consignes de lots…"
                      rows={5}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-chain-cyan focus:ring-2 focus:ring-chain-cyan/20"
                    />
                  </label>
                </Card>

                <Card className="p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-dark/45">Résumé dossier</p>
                  <div className="mt-4 space-y-4 text-sm text-text-dark/70">
                    <div className="rounded-2xl bg-cream px-4 py-4">
                      <p className="font-semibold text-text-dark">Lots sélectionnés</p>
                      <p className="mt-2">{selectedLots.length} lots · {formatWeight(totalSelectedWeight)}</p>
                      <p className="mt-1 text-xs text-text-dark/55">{summarizeSpecies(selectedLots)}</p>
                    </div>

                    <div className="rounded-2xl bg-cream px-4 py-4">
                      <p className="font-semibold text-text-dark">Destinataire</p>
                      <p className="mt-2">{selectedBuyer ? `${selectedBuyer.name} (${selectedBuyer.country})` : 'Non renseigné'}</p>
                      <p className="mt-1 text-xs text-text-dark/55">{selectedBuyer?.contractRef ?? 'Contrat non sélectionné'}</p>
                    </div>

                    <div className="rounded-2xl bg-cream px-4 py-4">
                      <p className="font-semibold text-text-dark">Transport</p>
                      <p className="mt-2">{formData.destinationPort || 'Port à confirmer'}</p>
                      <p className="mt-1 text-xs text-text-dark/55">
                        {formData.vesselName || 'Navire à confirmer'} · {formData.containerNumber || 'Conteneur à confirmer'}
                      </p>
                      <p className="mt-1 text-xs text-text-dark/55">
                        Embarquement prévu : {formData.estimatedDeparture ? formatFullDate(formData.estimatedDeparture) : 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <CertificatePreview
                shipmentPreview={{
                  certificateNumber: previewCertificateNumber,
                  exporter: exporterProfile,
                  buyer: selectedBuyer,
                  lots: selectedLots,
                  destinationPort: formData.destinationPort,
                  vesselName: formData.vesselName,
                  containerNumber: formData.containerNumber,
                  estimatedDeparture: formData.estimatedDeparture,
                  notes: formData.notes,
                }}
              />

              <div className="space-y-5">
                <Card className="p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-dark/45">Signature on-chain</p>
                  <h2 className="mt-2 text-2xl font-bold text-text-dark">Finalisez le dossier d’expédition</h2>
                  <p className="mt-2 text-sm text-text-dark/60">
                    Une transaction groupée inscrira le certificat sur Polygon et générera les documents de démonstration.
                  </p>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.985 }}
                    animate={submitting ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={submitting ? { repeat: Infinity, duration: 1.2 } : {}}
                    onClick={handleSignature}
                    disabled={submitting}
                    className="mt-6 w-full rounded-2xl bg-chain-cyan px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-chain-bg disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? 'Signature en cours…' : 'Signer et générer le certificat sur blockchain'}
                  </motion.button>

                  <div className="mt-5 space-y-3">
                    {SIGNING_PHASES.map((phase, index) => (
                      <div
                        key={phase}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                          signingPhase === index
                            ? 'border-chain-cyan bg-chain-cyan/10 text-chain-cyan'
                            : signingPhase > index
                              ? 'border-cacao-green/20 bg-cacao-green/5 text-cacao-green'
                              : 'border-gray-200 bg-white text-text-dark/45'
                        }`}
                      >
                        <span>{phase}</span>
                        <span>{submitting && signingPhase === index ? `${index + 1}/3` : signingPhase > index ? 'Terminé' : 'En attente'}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <p className="text-sm font-semibold text-text-dark">Contrôles finaux</p>
                  <div className="mt-4 space-y-3 text-sm text-text-dark/70">
                    <div className="flex items-start gap-3 rounded-xl bg-cacao-green/5 px-4 py-3">
                      <CheckCircle2 size={16} className="mt-0.5 text-cacao-green" />
                      <span>Lots transformés et disponibles à l’export</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-cacao-green/5 px-4 py-3">
                      <CheckCircle2 size={16} className="mt-0.5 text-cacao-green" />
                      <span>Validation géographique et non-déforestation complètes</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-cacao-green/5 px-4 py-3">
                      <CheckCircle2 size={16} className="mt-0.5 text-cacao-green" />
                      <span>Dossier d’expédition prêt pour génération TRACES</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}
        </StepContainer>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1 || submitting}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-text-dark transition hover:border-chain-cyan hover:text-chain-cyan disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {step === 1 ? (
              <button
                type="button"
                onClick={goToStepTwo}
                disabled={selectedLots.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-chain-cyan px-5 py-3 text-sm font-semibold text-white transition hover:bg-chain-bg disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continuer
                <ArrowRight size={16} />
              </button>
            ) : null}

            {step === 2 ? (
              <button
                type="button"
                onClick={goToStepThree}
                disabled={validating || hasInvalidLots}
                className="inline-flex items-center gap-2 rounded-xl bg-chain-cyan px-5 py-3 text-sm font-semibold text-white transition hover:bg-chain-bg disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continuer
                <ArrowRight size={16} />
              </button>
            ) : null}

            {step === 3 ? (
              <button
                type="button"
                onClick={goToStepFour}
                className="inline-flex items-center gap-2 rounded-xl bg-chain-cyan px-5 py-3 text-sm font-semibold text-white transition hover:bg-chain-bg"
              >
                Vérifier le dossier
                <ArrowRight size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-6xl">
          <Card className="border-chain-cyan/20 bg-chain-bg px-5 py-4 text-white shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Sélection en cours</p>
                <p className="mt-1 text-lg font-semibold">
                  {selectedLots.length} lots sélectionnés · {formatWeight(totalSelectedWeight)}
                </p>
              </div>
              <button
                type="button"
                onClick={goToStepTwo}
                disabled={selectedLots.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-chain-cyan px-5 py-3 text-sm font-semibold text-white transition hover:bg-chain-cyan-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continuer
                <ArrowRight size={16} />
              </button>
            </div>
          </Card>
        </div>
      ) : null}

      <Modal
        isOpen={Boolean(geoModalLot)}
        onClose={() => setGeoModalLot(null)}
        title={geoModalLot ? `Parcelle d’origine · ${geoModalLot.lotUuid}` : 'Parcelle'}
        size="xl"
      >
        {geoModalLot ? (
          <div className="space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-dark/45">Parcelle</p>
                <p className="mt-2 font-semibold text-text-dark">{geoModalLot.parcel.name}</p>
                <p className="mt-1 text-sm text-text-dark/60">{geoModalLot.producer.commune}, {geoModalLot.producer.region}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-dark/45">Géométrie</p>
                <p className="mt-2 font-semibold text-text-dark">{geoModalLot.parcel.geometryType}</p>
                <p className="mt-1 text-sm text-text-dark/60">Précision {geoModalLot.parcel.coordinatesPrecision} décimales</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-dark/45">Hash qualité</p>
                <p className="mt-2 font-mono text-sm font-semibold text-text-dark">{truncateHash(geoModalLot.onChainHash)}</p>
                <p className="mt-1 text-sm text-text-dark/60">Grade {geoModalLot.quality.finalGrade}</p>
              </Card>
            </div>

            <ParcelMap geoJson={geoModalLot.parcel.geoJson} height="420px" />
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(successResult)}
        onClose={() => setSuccessResult(null)}
        title="Certificat généré avec succès"
        size="lg"
      >
        {successResult ? (
          <div className="space-y-6 p-6">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cacao-green/10">
                <CheckCircle2 size={42} className="text-cacao-green" />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-text-dark">Certificat généré avec succès !</h3>
              <p className="mt-2 text-sm text-text-dark/65">
                Le certificat {successResult.certificateNumber} a été signé et inscrit pour la démo on-chain.
              </p>
            </div>

            <Card className="p-4">
              <div className="grid gap-3 text-sm text-text-dark/70 md:grid-cols-2">
                <div>
                  <p className="font-medium text-text-dark">Numéro de certificat</p>
                  <p className="mt-1">{successResult.certificateNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-text-dark">Transaction Polygon</p>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${successResult.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-2 text-chain-cyan hover:text-chain-bg"
                  >
                    {truncateHash(successResult.txHash)}
                    <ChevronRight size={14} />
                  </a>
                </div>
                <div>
                  <p className="font-medium text-text-dark">Lots concernés</p>
                  <p className="mt-1">{selectedLots.length} lots</p>
                </div>
                <div>
                  <p className="font-medium text-text-dark">Poids total</p>
                  <p className="mt-1">{formatWeight(totalSelectedWeight)}</p>
                </div>
              </div>
            </Card>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => downloadFile(successResult.pdfUrl, `${successResult.certificateNumber}-DEMO.pdf`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-chain-cyan px-5 py-3 text-sm font-semibold text-white transition hover:bg-chain-bg"
              >
                <FileCheck size={16} />
                Télécharger le certificat (PDF)
              </button>
              <button
                type="button"
                onClick={() => downloadFile(successResult.geoJsonUrl, `${successResult.certificateNumber}-TRACES.geojson`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-chain-cyan/20 px-5 py-3 text-sm font-semibold text-chain-cyan transition hover:bg-chain-cyan/5"
              >
                <FileJson size={16} />
                Télécharger le GeoJSON
              </button>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(`/exporter/export-records/${successResult.shipmentId}`)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-text-dark transition hover:border-chain-cyan hover:text-chain-cyan"
              >
                Voir l’expédition
              </button>
              <button
                type="button"
                onClick={resetWizard}
                className="inline-flex items-center gap-2 rounded-xl bg-cacao-green px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Sparkles size={16} />
                Nouveau certificat
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(errorResult)}
        onClose={() => setErrorResult(null)}
        title="Échec de la signature blockchain"
        size="md"
      >
        {errorResult ? (
          <div className="space-y-5 p-6">
            <div className="rounded-2xl bg-error/8 px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 text-error" size={18} />
                <div>
                  <p className="font-semibold text-error">{errorResult.code ?? 'BLOCKCHAIN_ERROR'}</p>
                  <p className="mt-1 text-sm text-error/85">{errorResult.message}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleSignature}
                className="inline-flex items-center gap-2 rounded-xl bg-chain-cyan px-4 py-3 text-sm font-semibold text-white transition hover:bg-chain-bg"
              >
                Réessayer
              </button>
              <button
                type="button"
                onClick={() => setErrorResult(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-text-dark transition hover:border-chain-cyan hover:text-chain-cyan"
              >
                Contacter le support
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
