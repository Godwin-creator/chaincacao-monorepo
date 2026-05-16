/**
 * Génération du certificat EUDR en PDF côté client (jsPDF).
 * Règlement (UE) 2023/1115 — Due Diligence Statement.
 */
import { jsPDF } from 'jspdf'

// Palette couleurs ChainCacao
const COLORS = {
  greenDark:  [45,  95,  46],   // cacaoGreenDark
  green:      [74, 155,  62],   // cacaoGreen
  cyan:       [79, 195, 232],   // blockchainCyan
  brown:      [93,  58,  31],   // cocoaBrown
  gold:       [232, 181,  71],  // harvestGold
  white:      [255, 255, 255],
  cream:      [245, 241, 232],
  grayText:   [61,  53,  48],
  grayLight:  [200, 195, 185],
}

function rgb(arr) { return { r: arr[0], g: arr[1], b: arr[2] } }

function setFill(doc, color)   { doc.setFillColor(...color) }
function setStroke(doc, color) { doc.setDrawColor(...color) }
function setTextColor(doc, c)  { doc.setTextColor(...c) }

function truncateHash(hash = '', front = 10, back = 8) {
  if (!hash || hash.length <= front + back + 3) return hash
  return `${hash.slice(0, front)}...${hash.slice(-back)}`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

/**
 * Génère le PDF du certificat EUDR et le retourne comme Data URL.
 *
 * @param {object} opts
 * @param {string} opts.certificateNumber
 * @param {object} opts.exporter   — { name, legalName, taxId, operatorEudrId, port }
 * @param {object} opts.buyer      — { name, country, city, contractRef }
 * @param {object[]} opts.lots     — [{ lotUuid, species, weightKg, producer, quality }]
 * @param {string} opts.destinationPort
 * @param {string} opts.vesselName
 * @param {string} opts.containerNumber
 * @param {string} opts.estimatedDeparture
 * @param {string} opts.txHash
 * @returns {string} dataUrl  — can be used in <a href> or URL.createObjectURL
 */
export function generateEudrPdf(opts) {
  const {
    certificateNumber,
    exporter,
    buyer,
    lots = [],
    destinationPort,
    vesselName,
    containerNumber,
    estimatedDeparture,
    txHash = '',
  } = opts

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 14
  const contentW = W - margin * 2

  // ── Header bande verte ─────────────────────────────────────────────────────
  setFill(doc, COLORS.greenDark)
  doc.rect(0, 0, W, 30, 'F')

  setTextColor(doc, COLORS.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('CHAINCACAO — CERTIFICAT EUDR', margin, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Règlement (UE) 2023/1115 · Devoir de Diligence Raisonnée', margin, 20)
  doc.text(`Généré le ${formatDate(new Date().toISOString())}`, W - margin, 20, { align: 'right' })

  // ── Numéro de certificat ───────────────────────────────────────────────────
  setFill(doc, COLORS.gold)
  doc.rect(0, 30, W, 12, 'F')
  setTextColor(doc, COLORS.grayText)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`N° ${certificateNumber}`, W / 2, 38, { align: 'center' })

  let y = 50

  // ── Section helper ─────────────────────────────────────────────────────────
  function section(title) {
    setFill(doc, COLORS.cream)
    doc.rect(margin, y, contentW, 8, 'F')
    setFill(doc, COLORS.green)
    doc.rect(margin, y, 3, 8, 'F')
    setTextColor(doc, COLORS.greenDark)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(title.toUpperCase(), margin + 6, y + 5.5)
    y += 12
  }

  function row(label, value, indent = 0) {
    setTextColor(doc, COLORS.grayLight)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(label, margin + indent, y)
    setTextColor(doc, COLORS.grayText)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    const maxW = contentW - 60 - indent
    const lines = doc.splitTextToSize(String(value || '—'), maxW)
    doc.text(lines, margin + 60 + indent, y)
    y += 5.5 * Math.max(1, lines.length)
  }

  function spacer(h = 4) { y += h }

  // ── 1. Opérateur exportateur ───────────────────────────────────────────────
  section('1. Opérateur (Exportateur)')
  row('Raison sociale',       exporter?.legalName ?? exporter?.name)
  row('Numéro opérateur EUDR',exporter?.operatorEudrId ?? '—')
  row('N° fiscal',            exporter?.taxId ?? '—')
  row('Port d\'origine',      exporter?.port ?? '—')
  spacer()

  // ── 2. Destinataire (Acheteur UE) ─────────────────────────────────────────
  section('2. Destinataire (Acheteur UE)')
  row('Acheteur',          buyer?.name ?? '—')
  row('Pays de livraison', buyer?.country ?? '—')
  row('Ville',             buyer?.city ?? '—')
  row('Référence contrat', buyer?.contractRef ?? '—')
  spacer()

  // ── 3. Transport ───────────────────────────────────────────────────────────
  section('3. Informations de transport')
  row('Port de destination',    destinationPort)
  row('Navire',                  vesselName)
  row('Numéro de conteneur',    containerNumber)
  row('Embarquement prévu le',  formatDate(estimatedDeparture))
  spacer()

  // ── 4. Lots concernés ─────────────────────────────────────────────────────
  section(`4. Lots de marchandise (${lots.length} lot${lots.length > 1 ? 's' : ''})`)

  // En-têtes tableau
  const colX  = [margin + 2, margin + 36, margin + 70, margin + 96, margin + 120, margin + 148]
  const heads  = ['Réf. lot', 'Espèce', 'Poids (kg)', 'Grade', 'Producteur', 'Commune']

  setFill(doc, COLORS.greenDark)
  doc.rect(margin, y, contentW, 7, 'F')
  setTextColor(doc, COLORS.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  heads.forEach((h, i) => doc.text(h, colX[i], y + 5))
  y += 8

  lots.forEach((lot, idx) => {
    if (idx % 2 === 0) {
      setFill(doc, [250, 248, 244])
      doc.rect(margin, y - 1, contentW, 7, 'F')
    }
    setTextColor(doc, COLORS.grayText)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    const cells = [
      lot.lotUuid?.slice(0, 12) ?? '—',
      lot.species ?? '—',
      typeof lot.weightKg === 'number' ? lot.weightKg.toFixed(1) : '—',
      lot.quality?.finalGrade ?? 'A',
      lot.producer?.name?.slice(0, 14) ?? '—',
      lot.producer?.commune ?? '—',
    ]
    cells.forEach((c, i) => doc.text(String(c), colX[i], y + 4.5))
    y += 7
  })

  spacer(6)

  const totalKg = lots.reduce((s, l) => s + (l.weightKg ?? 0), 0)
  setTextColor(doc, COLORS.greenDark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(`Poids total : ${totalKg.toFixed(2)} kg`, W - margin, y, { align: 'right' })
  y += 8

  // ── 5. Preuve blockchain ──────────────────────────────────────────────────
  section('5. Preuve Blockchain (Polygon Amoy Testnet)')
  row('Réseau',              'Polygon Amoy Testnet (chainId 80002)')
  row('Contrat',             '0x8E643C6bEEAa8E19a108a74B3A266cE4De9daDC4')
  row('Transaction hash',    truncateHash(txHash, 20, 12))
  row('Explorer',            `https://amoy.polygonscan.com/tx/${truncateHash(txHash, 14, 10)}`)
  spacer()

  // ── 6. Déclaration de conformité ──────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20 }

  section('6. Déclaration de Diligence Raisonnée')

  setTextColor(doc, COLORS.grayText)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const declaration = [
    `L'opérateur soussigné déclare que les marchandises décrites ci-dessus ont été`,
    `produites dans le respect du règlement (UE) 2023/1115. Les données géographiques`,
    `des parcelles d'origine ont été vérifiées et ne montrent aucune déforestation`,
    `postérieure au 31 décembre 2020. Toutes les informations sont enregistrées de`,
    `manière immuable sur la blockchain Polygon Amoy.`,
  ]
  declaration.forEach((line) => { doc.text(line, margin, y); y += 5 })
  spacer(8)

  // Signature
  setStroke(doc, COLORS.grayLight)
  doc.setLineWidth(0.3)
  doc.line(margin, y, margin + 70, y)
  doc.line(W - margin - 70, y, W - margin, y)
  setTextColor(doc, COLORS.grayLight)
  doc.setFontSize(7.5)
  doc.text('Signature opérateur', margin, y + 4)
  doc.text('Cachet officiel', W - margin, y + 4, { align: 'right' })

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    setFill(doc, COLORS.greenDark)
    doc.rect(0, 285, W, 12, 'F')
    setTextColor(doc, COLORS.white)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text('ChainCacao · Plateforme de traçabilité blockchain · Règlement EUDR (UE) 2023/1115', W / 2, 292, { align: 'center' })
    doc.text(`Page ${p}/${pageCount}`, W - margin, 292, { align: 'right' })
  }

  return doc.output('datauristring')
}

/**
 * Génère le GeoJSON TRACES à partir des lots sélectionnés.
 */
export function generateTracesGeoJson(opts) {
  const { certificateNumber, lots = [], exporter, buyer } = opts

  const features = lots
    .filter((lot) => lot.parcel?.geoJson)
    .map((lot) => ({
      type: 'Feature',
      properties: {
        lotUuid:           lot.lotUuid,
        species:           lot.species,
        weightKg:          lot.weightKg,
        producer:          lot.producer?.name,
        commune:           lot.producer?.commune,
        region:            lot.producer?.region,
        harvestDate:       lot.harvestDate,
        certificateNumber,
        exporter:          exporter?.name,
        buyer:             buyer?.name,
        eudrCompliant:     true,
        generatedAt:       new Date().toISOString(),
      },
      geometry: lot.parcel.geoJson?.geometry ?? lot.parcel.geoJson,
    }))

  const geojson = {
    type: 'FeatureCollection',
    name: `TRACES_EUDR_${certificateNumber}`,
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    metadata: {
      certificateNumber,
      regulation: 'EU 2023/1115',
      generatedAt: new Date().toISOString(),
      operator: exporter?.name,
      operatorEudrId: exporter?.operatorEudrId,
      destination: buyer?.country,
    },
    features,
  }

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' })
  return URL.createObjectURL(blob)
}
