import { ExternalLink, FileDown, FileJson, MapPinned, PackageSearch, ShieldCheck, Truck } from 'lucide-react'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import ShipmentStatusBadge from './ShipmentStatusBadge'
import { formatFullDate, formatWeight } from '../../utils/format'

function truncateHash(value = '') {
  if (!value) return '—'
  if (value.length <= 18) return value
  return `${value.slice(0, 10)}...${value.slice(-8)}`
}

export default function ShipmentDetailModal({ shipment, isOpen, onClose }) {
  if (!shipment) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={shipment.reference} size="xl">
      <div className="p-5 md:p-6 space-y-6">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <ShipmentStatusBadge status={shipment.status} estimatedArrival={shipment.estimatedArrival} />
                {shipment.certificate?.number ? <Badge variant="info">{shipment.certificate.number}</Badge> : null}
              </div>
              <p className="text-sm font-body text-text-dark/60">
                {shipment.buyer?.name} · {shipment.buyer?.city} · {shipment.destinationPort}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm font-body">
              <a
                href={shipment.certificate?.pdfUrl ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-chain-cyan text-white px-4 py-2.5 font-semibold hover:bg-chain-cyan/90 transition-colors"
              >
                <FileDown size={16} />
                Certificat
              </a>
              <a
                href={shipment.certificate?.geoJsonUrl ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-chain-cyan/20 text-chain-cyan px-4 py-2.5 font-semibold hover:bg-chain-cyan/5 transition-colors"
              >
                <FileJson size={16} />
                GeoJSON
              </a>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-chain-cyan/10 bg-chain-cyan/5 p-4">
              <div className="flex items-center gap-2 text-chain-cyan mb-2">
                <PackageSearch size={16} />
                <span className="text-sm font-sans font-semibold">Lots</span>
              </div>
              <p className="text-2xl font-sans font-bold text-text-dark">{shipment.totalLotsCount}</p>
              <p className="text-sm font-body text-text-dark/60">{formatWeight(shipment.totalWeightKg)}</p>
            </div>
            <div className="rounded-2xl border border-cacao-green/10 bg-cacao-green/5 p-4">
              <div className="flex items-center gap-2 text-cacao-green mb-2">
                <ShieldCheck size={16} />
                <span className="text-sm font-sans font-semibold">Traçabilité</span>
              </div>
              <p className="text-sm font-body text-text-dark">{shipment.certificate?.number ?? 'Certificat en attente'}</p>
              <p className="text-xs font-body text-text-dark/60">{formatFullDate(shipment.certificate?.issuedAt ?? shipment.certifiedAt)}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-text-dark mb-2">
                <Truck size={16} />
                <span className="text-sm font-sans font-semibold">Logistique</span>
              </div>
              <p className="text-sm font-body text-text-dark">{shipment.vesselName || 'Navire à confirmer'}</p>
              <p className="text-xs font-body text-text-dark/60">{shipment.containerNumber || 'Conteneur non renseigné'}</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPinned size={16} className="text-chain-cyan" />
            <h3 className="text-base font-sans font-semibold text-text-dark">Lots embarqués</h3>
          </div>
          <div className="space-y-3">
            {shipment.lots.map((lot) => (
              <div key={lot.id ?? lot.lotUuid} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-mono text-chain-cyan">{lot.lotUuid}</p>
                    <p className="text-sm font-sans font-semibold text-text-dark">{lot.origin?.producer ?? lot.producer?.name}</p>
                    <p className="text-xs font-body text-text-dark/60">{lot.producer?.commune} · Grade {lot.quality?.finalGrade ?? 'A'}</p>
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
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-sans font-semibold text-text-dark">Timeline d’expédition</h3>
          <div className="space-y-4">
            {shipment.timeline.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-chain-cyan mt-1" />
                  {index < shipment.timeline.length - 1 ? <div className="w-px flex-1 bg-chain-cyan/20 mt-2" /> : null}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-sans font-semibold text-text-dark">{event.label}</p>
                  <p className="text-xs font-body text-text-dark/60">{formatFullDate(event.timestamp)}</p>
                  <p className="text-sm font-body text-text-dark/80 mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-chain-cyan/10 bg-chain-cyan/5 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-sans font-semibold text-text-dark">Transaction blockchain</p>
              <p className="text-xs font-mono text-chain-cyan mt-1">{truncateHash(shipment.certificate?.txHash)}</p>
            </div>
            <a
              href={shipment.blockchainUrl ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-chain-cyan/20 bg-white px-3 py-2 text-sm font-body font-semibold text-chain-cyan hover:bg-chain-cyan/5 transition-colors"
            >
              <ExternalLink size={15} />
              Voir sur Polygonscan
            </a>
          </div>
        </section>
      </div>
    </Modal>
  )
}
