"use client";

/**
 * A stylized, low-poly India outline used purely as a decorative coverage
 * visualization — not a precise cartographic boundary. Blinking dot markers
 * are placed at approximate positions for the states passed in.
 */

// Approximate marker positions (viewBox 0 0 320 380), state name -> {x, y}.
const STATE_POSITIONS: Record<string, { x: number; y: number }> = {
  "Jammu and Kashmir": { x: 132, y: 22 },
  "Jammu & Kashmir": { x: 132, y: 22 },
  Ladakh: { x: 155, y: 18 },
  Punjab: { x: 108, y: 55 },
  Haryana: { x: 118, y: 65 },
  Delhi: { x: 126, y: 68 },
  "Himachal Pradesh": { x: 128, y: 42 },
  Uttarakhand: { x: 150, y: 52 },
  Rajasthan: { x: 85, y: 105 },
  "Uttar Pradesh": { x: 165, y: 90 },
  Bihar: { x: 200, y: 105 },
  Sikkim: { x: 222, y: 80 },
  "West Bengal": { x: 213, y: 148 },
  Assam: { x: 268, y: 92 },
  Meghalaya: { x: 250, y: 108 },
  Nagaland: { x: 288, y: 88 },
  Manipur: { x: 285, y: 103 },
  Mizoram: { x: 265, y: 118 },
  Tripura: { x: 245, y: 128 },
  "Arunachal Pradesh": { x: 280, y: 68 },
  Jharkhand: { x: 195, y: 128 },
  Chhattisgarh: { x: 172, y: 155 },
  "Madhya Pradesh": { x: 138, y: 140 },
  Gujarat: { x: 75, y: 148 },
  Maharashtra: { x: 128, y: 200 },
  Odisha: { x: 195, y: 180 },
  Telangana: { x: 158, y: 218 },
  "Andhra Pradesh": { x: 170, y: 250 },
  Goa: { x: 105, y: 225 },
  Karnataka: { x: 130, y: 255 },
  "Tamil Nadu": { x: 155, y: 300 },
  Kerala: { x: 128, y: 305 },
};

// A simplified, low-poly outline of India (viewBox 0 0 320 380) — a
// recognizable silhouette (northern border, NE panhandle, tapering
// peninsula), not a precise cartographic boundary.
const INDIA_PATH =
  "M140,10 L175,45 L195,40 L215,55 L230,58 L255,52 L290,68 L300,88 L294,110 " +
  "L270,114 L250,120 L232,133 L237,150 L214,160 L210,190 L200,230 L190,270 " +
  "L175,310 L160,345 L140,318 L125,288 L110,254 L100,214 L90,180 L70,160 " +
  "L54,138 L66,114 L75,88 L90,64 L110,40 L125,20 Z";

export function IndiaMap({ stateCoverage }: { stateCoverage: { state: string; count: number }[] }) {
  const markers = stateCoverage
    .map((s) => ({ ...s, pos: STATE_POSITIONS[s.state] }))
    .filter((s): s is typeof s & { pos: { x: number; y: number } } => !!s.pos);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <svg viewBox="0 0 320 380" width="100%" style={{ display: "block", height: "auto" }} role="img" aria-label="Map of India showing Advisory Partner coverage">
        <path d={INDIA_PATH} fill="rgba(214,54,43,0.08)" stroke="rgba(214,54,43,0.35)" strokeWidth={1.5} strokeLinejoin="round" />
        {markers.map((m) => (
          <g key={m.state}>
            <circle cx={m.pos.x} cy={m.pos.y} r={9} fill="rgba(214,54,43,0.25)">
              <animate attributeName="r" values="6;13;6" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={m.pos.x} cy={m.pos.y} r={4} fill="#D6362B">
              <title>{m.state}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
