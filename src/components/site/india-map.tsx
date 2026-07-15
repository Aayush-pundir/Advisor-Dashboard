"use client";

/**
 * India coverage map — renders OmniCard's own branded map graphic
 * (public/marketing/india-coverage-map.png) with a live overlay of blinking
 * dot markers for the states passed in, connected by thin lines. The image
 * itself is 1402x1122px; marker coordinates below are calibrated against
 * that pixel space via the SVG overlay's matching viewBox.
 */

const IMAGE_WIDTH = 1402;
const IMAGE_HEIGHT = 1122;

// Approximate marker positions in the source image's pixel space.
const STATE_POSITIONS: Record<string, { x: number; y: number }> = {
  "Jammu and Kashmir": { x: 430, y: 90 },
  "Jammu & Kashmir": { x: 430, y: 90 },
  Ladakh: { x: 520, y: 60 },
  Punjab: { x: 400, y: 220 },
  Haryana: { x: 430, y: 260 },
  Delhi: { x: 445, y: 270 },
  "Himachal Pradesh": { x: 460, y: 160 },
  Uttarakhand: { x: 520, y: 200 },
  Rajasthan: { x: 330, y: 380 },
  "Uttar Pradesh": { x: 580, y: 340 },
  Bihar: { x: 680, y: 370 },
  Sikkim: { x: 720, y: 300 },
  "West Bengal": { x: 720, y: 480 },
  Assam: { x: 980, y: 320 },
  Meghalaya: { x: 900, y: 380 },
  Nagaland: { x: 1050, y: 310 },
  Manipur: { x: 1030, y: 380 },
  Mizoram: { x: 960, y: 430 },
  Tripura: { x: 880, y: 450 },
  "Arunachal Pradesh": { x: 1040, y: 250 },
  Jharkhand: { x: 680, y: 420 },
  Chhattisgarh: { x: 600, y: 480 },
  "Madhya Pradesh": { x: 480, y: 440 },
  Gujarat: { x: 250, y: 470 },
  Maharashtra: { x: 440, y: 560 },
  Odisha: { x: 680, y: 530 },
  Telangana: { x: 540, y: 610 },
  "Andhra Pradesh": { x: 620, y: 660 },
  Goa: { x: 350, y: 620 },
  Karnataka: { x: 440, y: 680 },
  "Tamil Nadu": { x: 560, y: 830 },
  Kerala: { x: 440, y: 830 },
};

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
    <div style={{ position: "relative", width: "100%", maxWidth: 520, margin: "0 auto" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/marketing/india-coverage-map.png"
        alt="Map of India showing Advisory Partner coverage"
        style={{ width: "100%", display: "block" }}
      />
      <svg
        viewBox={`0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {connections.map(([a, b], i) => (
          <line
            key={i}
            x1={a.pos.x}
            y1={a.pos.y}
            x2={b.pos.x}
            y2={b.pos.y}
            stroke="rgba(255,255,255,0.65)"
            strokeWidth={2.5}
          />
        ))}

        {markers.map((m) => (
          <g key={m.state}>
            <circle cx={m.pos.x} cy={m.pos.y} r={26} fill="rgba(255,255,255,0.4)">
              <animate attributeName="r" values="16;34;16" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={m.pos.x} cy={m.pos.y} r={11} fill="#FFFFFF" stroke="#8a231c" strokeWidth={3}>
              <title>{m.state}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
