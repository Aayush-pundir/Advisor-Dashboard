"use client";

/**
 * A stylized, low-poly India map used purely as a decorative coverage
 * visualization — a faceted mesh in brand colors (inspired by common
 * "network map" graphics), not a precise cartographic boundary. Blinking
 * dot markers sit at approximate positions for the states passed in, with
 * thin connector lines between them to complete the "network" look.
 */

// Approximate marker positions (viewBox 0 0 320 400), state name -> {x, y}.
const STATE_POSITIONS: Record<string, { x: number; y: number }> = {
  "Jammu and Kashmir": { x: 148, y: 22 },
  "Jammu & Kashmir": { x: 148, y: 22 },
  Ladakh: { x: 172, y: 18 },
  Punjab: { x: 112, y: 58 },
  Haryana: { x: 124, y: 68 },
  Delhi: { x: 132, y: 72 },
  "Himachal Pradesh": { x: 140, y: 44 },
  Uttarakhand: { x: 165, y: 55 },
  Rajasthan: { x: 88, y: 110 },
  "Uttar Pradesh": { x: 178, y: 95 },
  Bihar: { x: 210, y: 108 },
  Sikkim: { x: 232, y: 82 },
  "West Bengal": { x: 225, y: 155 },
  Assam: { x: 285, y: 90 },
  Meghalaya: { x: 265, y: 108 },
  Nagaland: { x: 300, y: 90 },
  Manipur: { x: 295, y: 108 },
  Mizoram: { x: 278, y: 118 },
  Tripura: { x: 258, y: 128 },
  "Arunachal Pradesh": { x: 298, y: 68 },
  Jharkhand: { x: 205, y: 135 },
  Chhattisgarh: { x: 180, y: 165 },
  "Madhya Pradesh": { x: 145, y: 148 },
  Gujarat: { x: 70, y: 155 },
  Maharashtra: { x: 130, y: 210 },
  Odisha: { x: 205, y: 190 },
  Telangana: { x: 165, y: 230 },
  "Andhra Pradesh": { x: 190, y: 260 },
  Goa: { x: 100, y: 230 },
  Karnataka: { x: 130, y: 265 },
  "Tamil Nadu": { x: 168, y: 320 },
  Kerala: { x: 130, y: 320 },
};

// Low-poly India outline (viewBox 0 0 320 400): Kashmir tip, the Punjab/UP
// bulge, a narrow "chicken's neck" out to an Assam/Arunachal/Manipur
// north-east arm, the Gujarat/Kutch bulge on the west coast, and an
// asymmetric Kerala/Tamil Nadu taper to the Kanyakumari tip.
const INDIA_PATH =
  "M145,8 L165,22 L155,32 L172,42 L192,36 L210,50 L205,60 L226,58 L246,50 " +
  "L268,60 L284,54 L300,63 L312,76 L308,96 L290,101 L296,116 L278,121 " +
  "L260,111 L248,131 L230,126 L238,146 L222,166 L232,181 L222,211 L212,246 " +
  "L200,276 L188,311 L172,341 L155,366 L138,346 L122,316 L108,286 L98,251 " +
  "L108,226 L92,206 L100,176 L80,161 L60,151 L48,131 L62,111 L55,91 L70,76 " +
  "L85,56 L100,36 L118,21 Z";

// A fixed low-poly triangle mesh purely for decorative texture, clipped to
// the outline above — not tied to real geography.
const MESH_TRIANGLES: [number, number, number, number, number, number][] = [
  [150, 60, 205, 60, 128, 100],
  [205, 60, 232, 88, 170, 112],
  [205, 60, 128, 100, 170, 112],
  [232, 88, 270, 95, 210, 160],
  [232, 88, 210, 160, 170, 112],
  [128, 100, 170, 112, 92, 145],
  [170, 112, 210, 160, 145, 155],
  [170, 112, 145, 155, 92, 145],
  [92, 145, 145, 155, 112, 195],
  [145, 155, 210, 160, 165, 205],
  [145, 155, 165, 205, 112, 195],
  [210, 160, 205, 215, 165, 205],
  [112, 195, 165, 205, 135, 245],
  [165, 205, 205, 215, 175, 255],
  [165, 205, 175, 255, 135, 245],
  [112, 195, 135, 245, 105, 235],
  [135, 245, 175, 255, 150, 295],
  [175, 255, 205, 215, 195, 265],
  [135, 245, 150, 295, 130, 330],
  [150, 295, 195, 265, 175, 305],
];

const MESH_SHADES = ["rgba(214,54,43,0.16)", "rgba(232,105,95,0.16)", "rgba(150,32,25,0.16)", "rgba(214,54,43,0.08)"];

export function IndiaMap({ stateCoverage }: { stateCoverage: { state: string; count: number }[] }) {
  const markers = stateCoverage
    .map((s) => ({ ...s, pos: STATE_POSITIONS[s.state] }))
    .filter((s): s is typeof s & { pos: { x: number; y: number } } => !!s.pos);

  // Connect each marker to its nearest neighbour, mimicking a network map.
  const connections: [typeof markers[number], typeof markers[number]][] = [];
  for (const m of markers) {
    let nearest: (typeof markers)[number] | null = null;
    let nearestDist = Infinity;
    for (const other of markers) {
      if (other.state === m.state) continue;
      const d = (other.pos.x - m.pos.x) ** 2 + (other.pos.y - m.pos.y) ** 2;
      if (d < nearestDist) {
        nearestDist = d;
        nearest = other;
      }
    }
    if (nearest) connections.push([m, nearest]);
  }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <svg viewBox="0 0 320 400" width="100%" style={{ display: "block", height: "auto" }} role="img" aria-label="Map of India showing Advisory Partner coverage">
        <defs>
          <linearGradient id="indiaGradient" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#E8695F" />
            <stop offset="55%" stopColor="#D6362B" />
            <stop offset="100%" stopColor="#8a231c" />
          </linearGradient>
          <clipPath id="indiaClip">
            <path d={INDIA_PATH} />
          </clipPath>
        </defs>

        <path d={INDIA_PATH} fill="url(#indiaGradient)" fillOpacity={0.9} stroke="#8a231c" strokeWidth={1.5} strokeLinejoin="round" />

        <g clipPath="url(#indiaClip)">
          {MESH_TRIANGLES.map(([x1, y1, x2, y2, x3, y3], i) => (
            <polygon
              key={i}
              points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
              fill={MESH_SHADES[i % MESH_SHADES.length]}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={0.75}
            />
          ))}
        </g>

        {connections.map(([a, b], i) => (
          <line
            key={i}
            x1={a.pos.x}
            y1={a.pos.y}
            x2={b.pos.x}
            y2={b.pos.y}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={1}
          />
        ))}

        {markers.map((m) => (
          <g key={m.state}>
            <circle cx={m.pos.x} cy={m.pos.y} r={9} fill="rgba(255,255,255,0.35)">
              <animate attributeName="r" values="6;13;6" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={m.pos.x} cy={m.pos.y} r={4} fill="#FFFFFF" stroke="#8a231c" strokeWidth={1}>
              <title>{m.state}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
