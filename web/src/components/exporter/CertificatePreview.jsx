import { FileCheck, Globe2, ShieldCheck, Ship, Wallet } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatWeight, formatFullDate } from '../../utils/format'

function summarizeSpecies(lots) {
  const counts = lots.reduce((acc, lot) => {
    acc[lot.species] = (acc[lot.species] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([species, count]) => `${species} (${count})`).join(' · ')
}

export default function CertificatePreview({ shipmentPreview }) {
  const {
    certificateNumber,
    exporter,
    buyer,
    lots,
    destinationPort,
    vesselName,
    containerNumber,
    estimatedDeparture,
    notes,
  } = shipmentPreview

  const totalWeightKg = lots.reduce((sum, lot) => sum + lot.weightKg, 0)

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-chain-cyan/10 bg-gradient-to-r from-chain-bg to-chain-cyan px-5 py-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Aperçu dossier EUDR</p>
            <h3 className="mt-1 text-xl font-bold">{certificateNumber}</h3>
          </div>
          <Badge variant="warning" className="bg-white/15 text-white border-white/20">
            Démo PDF
          </Badge>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-cream px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-chain-bg">
              <FileCheck size={16} />
              Exportateur
            </div>
            <p className="mt-3 font-sans text-lg font-bold text-text-dark">{exporter.name}</p>
            <p className="mt-1 text-sm text-text-dark/65">{exporter.operatorEudrId}</p>
          </div>

          <div className="rounded-2xl bg-cream px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-chain-bg">
              <Globe2 size={16} />
              Destinataire
            </div>
            <p className="mt-3 font-sans text-lg font-bold text-text-dark">{buyer.name}</p>
            <p className="mt-1 text-sm text-text-dark/65">
              {buyer.city}, {buyer.country} · Contrat {buyer.contractRef}
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-text-dark/70 md:grid-cols-2">
          <div className="rounded-xl border border-gray-100 px-4 py-3">
            <p className="font-medium text-text-dark">Lots concernés</p>
            <p className="mt-1">{lots.length} lots · {formatWeight(totalWeightKg)}</p>
            <p className="mt-1 text-xs text-text-dark/55">{summarizeSpecies(lots)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 px-4 py-3">
            <p className="font-medium text-text-dark">Départ estimé</p>
            <p className="mt-1">{estimatedDeparture ? formatFullDate(estimatedDeparture) : 'À confirmer'}</p>
          </div>
          <div className="rounded-xl border border-gray-100 px-4 py-3">
            <p className="flex items-center gap-2 font-medium text-text-dark">
              <Ship size={15} className="text-chain-cyan" />
              Expédition
            </p>
            <p className="mt-1">{destinationPort}</p>
            <p className="mt-1 text-xs text-text-dark/55">{vesselName || 'Navire à confirmer'} · {containerNumber || 'Conteneur à confirmer'}</p>
          </div>
          <div className="rounded-xl border border-gray-100 px-4 py-3">
            <p className="flex items-center gap-2 font-medium text-text-dark">
              <Wallet size={15} className="text-chain-cyan" />
              Hash blockchain
            </p>
            <p className="mt-1 text-sm text-text-dark/55">En attente de signature on-chain</p>
          </div>
        </div>

        <div className="rounded-2xl border border-cacao-green/15 bg-cacao-green/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-cacao-green" />
            <div>
              <p className="font-semibold text-cacao-green">Déclaration de non-déforestation</p>
              <p className="mt-1 text-sm text-text-dark/70">
                L’exportateur atteste que les parcelles intégrées au dossier sont conformes au règlement (UE) 2023/1115 et disposent d’une preuve géographique vérifiable.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-text-dark">Lots inclus</p>
          <div className="space-y-2">
            {lots.map((lot) => (
              <div
                key={lot.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-mono font-semibold text-text-dark">{lot.lotUuid}</p>
                  <p className="text-text-dark/55">{lot.producer.name} · {lot.producer.commune}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-dark">{formatWeight(lot.weightKg)}</p>
                  <p className="text-text-dark/55">Grade {lot.quality.finalGrade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {notes ? (
          <div className="rounded-xl bg-gold-premium/10 px-4 py-3 text-sm text-cacao-brown">
            <p className="font-semibold">Notes dossier</p>
            <p className="mt-1">{notes}</p>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
