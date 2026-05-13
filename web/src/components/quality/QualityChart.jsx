import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Dot,
} from 'recharts'

function CustomTooltip({ active, payload, label, xKey }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-md px-3 py-2 text-xs font-body">
      <p className="font-semibold text-text-dark mb-1">
        {xKey === 'day' ? `Jour ${label}` : `H+${label}`}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="leading-snug">
          {entry.name} : {typeof entry.value === 'number' ? entry.value.toFixed(1).replace('.', ',') : entry.value}
          {entry.unit ?? ''}
        </p>
      ))}
    </div>
  )
}

function OutOfRangeDot({ cx, cy, payload, dataKey, targetRange }) {
  if (!targetRange || !payload) return null
  const val = payload[dataKey]
  const outOfRange = val < targetRange[0] || val > targetRange[1]
  if (!outOfRange) return null
  return <circle cx={cx} cy={cy} r={5} fill="#EF4444" stroke="white" strokeWidth={2} />
}

// Props:
//   readings    – array de données
//   xKey        – 'day' | 'hour'
//   lines       – [{ dataKey, color, label, unit?, targetRange?: [min, max] }]
//   height      – px (default 280)
//   rightLines  – lignes sur l'axe Y droit (second axe)
export default function QualityChart({ readings, xKey = 'day', lines = [], height = 280, rightLines = [] }) {
  if (!readings || readings.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100"
      >
        <p className="text-xs font-body text-text-dark/40">Aucune donnée à afficher</p>
      </div>
    )
  }

  const allLines = [...lines, ...rightLines]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={readings} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fontFamily: 'var(--font-body, sans-serif)', fill: '#888' }}
          tickFormatter={(v) => xKey === 'day' ? `J+${v}` : `H+${v}`}
          axisLine={false}
          tickLine={false}
        />

        {/* Axe Y gauche */}
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: '#888', fontFamily: 'var(--font-body, sans-serif)' }}
          axisLine={false}
          tickLine={false}
          width={36}
          tickFormatter={(v) => v.toString().replace('.', ',')}
        />

        {/* Axe Y droit si rightLines présents */}
        {rightLines.length > 0 && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#888', fontFamily: 'var(--font-body, sans-serif)' }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v) => v.toString().replace('.', ',')}
          />
        )}

        <Tooltip content={<CustomTooltip xKey={xKey} />} />

        {/* Zones cibles en fond */}
        {allLines
          .filter((l) => l.targetRange)
          .map((l) => (
            <ReferenceArea
              key={`ref-${l.dataKey}`}
              yAxisId={rightLines.includes(l) ? 'right' : 'left'}
              y1={l.targetRange[0]}
              y2={l.targetRange[1]}
              fill={l.color}
              fillOpacity={0.08}
              ifOverflow="extendDomain"
            />
          ))}

        {/* Lignes gauche */}
        {lines.map((l) => (
          <Line
            key={l.dataKey}
            yAxisId="left"
            type="monotone"
            dataKey={l.dataKey}
            stroke={l.color}
            strokeWidth={2}
            name={l.label}
            unit={l.unit}
            dot={(props) => {
              const { cx, cy, payload } = props
              const val = payload[l.dataKey]
              const outOfRange = l.targetRange && (val < l.targetRange[0] || val > l.targetRange[1])
              return (
                <circle
                  key={`dot-${l.dataKey}-${payload[xKey]}`}
                  cx={cx} cy={cy} r={4}
                  fill={outOfRange ? '#EF4444' : l.color}
                  stroke="white" strokeWidth={2}
                />
              )
            }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
            connectNulls={false}
          />
        ))}

        {/* Lignes droite */}
        {rightLines.map((l) => (
          <Line
            key={l.dataKey}
            yAxisId="right"
            type="monotone"
            dataKey={l.dataKey}
            stroke={l.color}
            strokeWidth={2}
            strokeDasharray="5 3"
            name={l.label}
            unit={l.unit}
            dot={{ r: 4, fill: l.color, stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
