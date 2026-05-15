import { AlertTriangle, CheckCircle2, Eye, MapPinned, XCircle } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

function StatusIcon({ validation }) {
  if (!validation.isValid) {
    return <XCircle size={18} className="text-error" />
  }
  if (validation.warnings?.length) {
    return <AlertTriangle size={18} className="text-gold-premium" />
  }
  return <CheckCircle2 size={18} className="text-cacao-green" />
}

function StatusBadge({ validation }) {
  if (!validation.isValid) return <Badge variant="danger">Non conforme</Badge>
  if (validation.warnings?.length) return <Badge variant="warning">Conforme avec réserve</Badge>
  return <Badge variant="success">Conforme</Badge>
}

function GeometryLabel({ geoJson }) {
  return geoJson?.geometry?.type === 'Point' ? 'Point GPS' : 'Polygone'
}

export default function ComplianceTable({ lotsValidations, onOpenGeoJson }) {
  return (
    <>
      <div className="space-y-3 lg:hidden">
        {lotsValidations.map(({ lot, validation }) => (
          <Card key={lot.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-text-dark">{lot.lotUuid}</p>
                <p className="mt-1 text-sm text-text-dark/60">{lot.parcel.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon validation={validation} />
                <StatusBadge validation={validation} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-text-dark/70">
              <div className="flex items-center justify-between gap-3">
                <span>Géolocalisation</span>
                <span className="font-medium">{GeometryLabel({ geoJson: lot.parcel.geoJson })}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Non-déforestation</span>
                <span className="font-medium">
                  {validation.noDeforestationAfter2020 ? 'Validée' : 'À revoir'}
                </span>
              </div>
              {validation.errors?.length > 0 && (
                <div className="rounded-xl bg-error/8 px-3 py-2 text-error">
                  {validation.errors[0]}
                </div>
              )}
              {validation.warnings?.length > 0 && (
                <div className="rounded-xl bg-gold-premium/10 px-3 py-2 text-cacao-brown">
                  {validation.warnings[0]}
                </div>
              )}
              <button
                type="button"
                onClick={() => onOpenGeoJson?.(lot)}
                className="inline-flex items-center gap-2 text-sm font-medium text-chain-cyan"
              >
                <MapPinned size={15} />
                Voir la parcelle
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-chain-bg text-left text-sm text-white">
              <tr>
                <th className="px-5 py-4 font-medium">Lot UUID</th>
                <th className="px-5 py-4 font-medium">Parcelle</th>
                <th className="px-5 py-4 font-medium">Géolocalisation</th>
                <th className="px-5 py-4 font-medium">Non-déforestation</th>
                <th className="px-5 py-4 font-medium">Statut global</th>
                <th className="px-5 py-4 font-medium">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {lotsValidations.map(({ lot, validation }) => (
                <tr key={lot.id} className="align-top">
                  <td className="px-5 py-4 font-mono text-text-dark">{lot.lotUuid}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-text-dark">{lot.parcel.name}</p>
                    <p className="text-text-dark/55">{lot.producer.commune}, {lot.producer.region}</p>
                  </td>
                  <td className="px-5 py-4 text-text-dark/70">{GeometryLabel({ geoJson: lot.parcel.geoJson })}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-text-dark/70">
                      {validation.noDeforestationAfter2020 ? (
                        <CheckCircle2 size={16} className="text-cacao-green" />
                      ) : (
                        <XCircle size={16} className="text-error" />
                      )}
                      <span>{validation.noDeforestationAfter2020 ? 'Conforme' : 'Non conforme'}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-dark/45">
                      Rapport satellite : {validation.noDeforestationDate ?? '—'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon validation={validation} />
                      <StatusBadge validation={validation} />
                    </div>
                    {validation.errors?.length > 0 && (
                      <p className="mt-2 text-xs text-error">{validation.errors[0]}</p>
                    )}
                    {validation.warnings?.length > 0 && validation.errors?.length === 0 && (
                      <p className="mt-2 text-xs text-cacao-brown">{validation.warnings[0]}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onOpenGeoJson?.(lot)}
                      className="inline-flex items-center gap-2 rounded-lg border border-chain-cyan/25 px-3 py-2 font-medium text-chain-cyan transition-colors hover:bg-chain-cyan/5"
                    >
                      <Eye size={15} />
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
