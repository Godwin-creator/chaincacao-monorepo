import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, BadgeCheck, Search, Shield, Ship } from 'lucide-react'
import { fetchVerifierLots } from '../../lib/api'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import KpiCard from '../../components/dashboard/KpiCard'
import { formatFullDate } from '../../utils/format'

function statusBadgeClasses(status) {
  return status === 'verified'
    ? 'bg-cacao-green/10 text-cacao-green border border-cacao-green/20'
    : 'bg-chain-cyan/10 text-chain-cyan border border-chain-cyan/20'
}

function conformityBadgeClasses(status) {
  return status === 'compliant'
    ? 'bg-gold-premium/10 text-cacao-brown border border-gold-premium/30'
    : 'bg-error/10 text-error border border-error/20'
}

export default function VerifierDashboard() {
  const navigate = useNavigate()
  const [draftFilters, setDraftFilters] = useState({
    search: '',
    status: 'all',
    compliance: 'all',
  })
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: 'all',
    compliance: 'all',
  })
  const [lots, setLots] = useState([])
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchVerifierLots(appliedFilters)
      .then(({ source: src, lots: data }) => {
        if (cancelled) return
        setLots(data)
        setSource(src)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message ?? 'Impossible de charger le registre de verification.')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [appliedFilters])

  const stats = useMemo(() => {
    const exportedThisMonth = lots.filter((lot) => String(lot.exportDate).startsWith('2026-05')).length
    const verifiedLots = lots.filter((lot) => lot.verified).length
    const alertsDetected = lots.filter((lot) => (lot.alerts ?? []).length > 0).length

    return {
      exportedThisMonth,
      verifiedLots,
      alertsDetected,
    }
  }, [lots])

  function handleSearch() {
    setLoading(true)
    setError(null)
    setAppliedFilters({ ...draftFilters })
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
      <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-sans font-bold text-text-dark">
                Vérification des lots exportés
              </h1>
              {source === 'mock' && <Badge variant="warning">Mode démonstration</Badge>}
            </div>
            <p className="mt-2 text-sm md:text-base font-body text-text-dark/60">
              Conformité EUDR – Preuves blockchain
            </p>
          </div>

          {source === 'supabase' && (
            <div className="rounded-2xl border border-cacao-green/20 bg-cacao-green/5 px-4 py-3 text-sm font-body text-cacao-green">
              Données en direct
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          icon={Ship}
          value={stats.exportedThisMonth}
          label="Lots exportés ce mois"
          iconColor="text-chain-cyan"
          iconBg="bg-chain-cyan/10"
        />
        <KpiCard
          icon={BadgeCheck}
          value={stats.verifiedLots}
          label="Lots vérifiés"
          iconColor="text-cacao-green"
          iconBg="bg-cacao-green/10"
        />
        <KpiCard
          icon={AlertTriangle}
          value={stats.alertsDetected}
          label="Alertes détectées"
          iconColor="text-gold-premium"
          iconBg="bg-gold-premium/10"
        />
      </section>

      <Card className="p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-[1.5fr_0.8fr_0.8fr_auto]">
          <label className="space-y-2">
            <span className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">
              Recherche
            </span>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dark/35" />
              <input
                value={draftFilters.search}
                onChange={(event) => setDraftFilters((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="UUID, producteur, coopérative, certificat"
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-body text-text-dark placeholder:text-text-dark/35 focus:outline-none focus:border-chain-cyan transition-colors"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">
              Statut
            </span>
            <select
              value={draftFilters.status}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, status: event.target.value }))}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-body text-text-dark focus:outline-none focus:border-chain-cyan transition-colors"
            >
              <option value="all">Tous</option>
              <option value="exported">Exporté</option>
              <option value="verified">Vérifié</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">
              Conformite
            </span>
            <select
              value={draftFilters.compliance}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, compliance: event.target.value }))}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-body text-text-dark focus:outline-none focus:border-chain-cyan transition-colors"
            >
              <option value="all">Tous</option>
              <option value="compliant">Conforme</option>
              <option value="non_compliant">Non conforme</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full rounded-2xl bg-chain-cyan px-5 py-3 text-sm font-sans font-semibold text-white hover:bg-chain-cyan/90 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-sans font-semibold text-text-dark">Registre des lots exportés</h2>
              <p className="text-sm font-body text-text-dark/60">
                Accès réservé aux autorités de contrôle et organismes certificateurs.
              </p>
            </div>
            <div className="hidden md:inline-flex items-center gap-2 rounded-full bg-chain-cyan/5 px-3 py-1.5 text-xs font-body font-semibold text-chain-cyan">
              <Shield size={14} />
              Preuve cryptographique
            </div>
          </div>
        </div>

        {lots.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-lg font-sans font-semibold text-text-dark">Aucun lot ne correspond à ces filtres.</p>
            <p className="mt-2 text-sm font-body text-text-dark/60">
              Modifiez la recherche ou le statut souhaité.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80">
                  <tr className="text-xs font-body font-semibold uppercase tracking-wide text-text-dark/45">
                    <th className="px-5 py-3">UUID</th>
                    <th className="px-5 py-3">Producteur</th>
                    <th className="px-5 py-3">Exportateur</th>
                    <th className="px-5 py-3">Date export</th>
                    <th className="px-5 py-3">Statut EUDR</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => (
                    <tr
                      key={lot.id}
                      className="cursor-pointer border-t border-gray-100 hover:bg-chain-cyan/5 transition-colors"
                      onClick={() => navigate(`/verifier/lot-inspection/${lot.lotUuid}`)}
                    >
                      <td className="px-5 py-4">
                        <Link
                          to={`/verifier/lot-inspection/${lot.lotUuid}`}
                          className="font-mono text-sm font-semibold text-chain-cyan hover:underline"
                        >
                          {lot.lotUuid}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm font-body text-text-dark">{lot.anonymizedProducer}</td>
                      <td className="px-5 py-4 text-sm font-body text-text-dark">{lot.exporter.name}</td>
                      <td className="px-5 py-4 text-sm font-body text-text-dark">{formatFullDate(lot.exportDate)}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-body font-semibold ${statusBadgeClasses(lot.status)}`}>
                            {lot.status === 'verified' ? 'Vérifié' : 'Exporté'}
                          </span>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-body font-semibold ${conformityBadgeClasses(lot.conformityStatus)}`}>
                            {lot.conformityStatus === 'compliant' ? 'Conforme' : 'Non conforme'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/verifier/lot-inspection/${lot.lotUuid}`}
                          className="inline-flex items-center gap-2 text-sm font-body font-semibold text-chain-cyan hover:underline"
                        >
                          Inspecter
                          <ArrowRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {lots.map((lot) => (
                <Link
                  key={lot.id}
                  to={`/verifier/lot-inspection/${lot.lotUuid}`}
                  className="block rounded-2xl border border-gray-100 bg-gray-50/70 p-4 hover:border-chain-cyan/25 hover:bg-chain-cyan/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold text-chain-cyan">{lot.lotUuid}</p>
                      <p className="mt-1 text-sm font-sans font-semibold text-text-dark">{lot.anonymizedProducer}</p>
                      <p className="text-xs font-body text-text-dark/60">{lot.exporter.name}</p>
                    </div>
                    <ArrowRight size={16} className="text-chain-cyan shrink-0" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-body font-semibold ${statusBadgeClasses(lot.status)}`}>
                      {lot.status === 'verified' ? 'Vérifié' : 'Exporté'}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-body font-semibold ${conformityBadgeClasses(lot.conformityStatus)}`}>
                      {lot.conformityStatus === 'compliant' ? 'Conforme' : 'Non conforme'}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-body text-text-dark/60">{formatFullDate(lot.exportDate)}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
