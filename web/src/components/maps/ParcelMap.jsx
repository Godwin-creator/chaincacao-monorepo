import { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import '../../utils/leafletConfig';

// ─── Calcul superficie (formule de Shoelace + conversion en hectares) ─────────
function computeAreaHa(geoJson) {
  if (!geoJson) return null;

  let coords;
  if (geoJson.type === 'FeatureCollection') {
    coords = geoJson.features[0]?.geometry?.coordinates?.[0];
  } else if (geoJson.type === 'Feature') {
    coords = geoJson.geometry?.coordinates?.[0];
  } else if (geoJson.type === 'Polygon') {
    coords = geoJson.coordinates?.[0];
  }

  if (!coords || coords.length < 3) return null;

  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  area = Math.abs(area) / 2;

  const avgLat =
    coords.slice(0, -1).reduce((s, c) => s + c[1], 0) / (coords.length - 1);
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos((avgLat * Math.PI) / 180);
  const areaM2 = area * mPerDegLat * mPerDegLng;
  return (areaM2 / 10000).toFixed(2);
}

// ─── Normalise n'importe quel type GeoJSON en Feature(Collection) ─────────────
function normalizeGeoJson(geoJson) {
  if (!geoJson) return null;
  if (geoJson.type === 'FeatureCollection' || geoJson.type === 'Feature') {
    return geoJson;
  }
  return { type: 'Feature', properties: {}, geometry: geoJson };
}

// ─── Sous-composant : recale la vue sur le polygone ───────────────────────────
function FitBounds({ geoJson }) {
  const map = useMap();
  useEffect(() => {
    if (!geoJson) return;
    const layer = L.geoJSON(geoJson);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [map, geoJson]);
  return null;
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ParcelMap({ geoJson, height = '400px', showAreaBadge = true }) {
  const normalized = normalizeGeoJson(geoJson);
  const areaHa = computeAreaHa(geoJson);

  const parcelStyle = {
    color: '#2196C7',
    fillColor: '#2196C7',
    fillOpacity: 0.18,
    weight: 2,
  };

  function onEachFeature(feature, layer) {
    const name = feature.properties?.name ?? 'Parcelle';
    const area = areaHa ?? '—';
    layer.bindPopup(
      `<div style="min-width:130px;font-family:Inter,sans-serif">
         <strong style="color:#1A4A5A">${name}</strong><br/>
         Superficie&nbsp;: <strong>${area}&nbsp;ha</strong>
       </div>`
    );
  }

  if (!normalized) {
    return (
      <div
        style={{ height }}
        className="bg-cream animate-pulse rounded-xl flex items-center justify-center"
      >
        <p className="text-sm text-cacao-brown-light">Chargement de la carte…</p>
      </div>
    );
  }

  // Centre approximatif pour le centre initial de la carte
  let center = [6.95, 0.73];
  try {
    const coords =
      normalized.type === 'FeatureCollection'
        ? normalized.features[0]?.geometry?.coordinates?.[0]
        : normalized.geometry?.coordinates?.[0];
    if (coords?.length) {
      const n = coords.length - 1;
      const lat = coords.slice(0, n).reduce((s, c) => s + c[1], 0) / n;
      const lng = coords.slice(0, n).reduce((s, c) => s + c[0], 0) / n;
      center = [lat, lng];
    }
  } catch (_) {}

  return (
    <div className="relative rounded-xl overflow-hidden shadow-md" style={{ height }}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
        />
        <GeoJSON
          key={JSON.stringify(normalized)}
          data={normalized}
          style={parcelStyle}
          onEachFeature={onEachFeature}
        />
        <FitBounds geoJson={normalized} />
      </MapContainer>

      {showAreaBadge && areaHa && (
        <div className="absolute top-3 right-3 z-[1000] bg-chain-bg text-white text-xs font-mono px-2.5 py-1 rounded-lg shadow-lg">
          {areaHa} ha
        </div>
      )}
    </div>
  );
}
