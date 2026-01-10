
import { TablePage } from './types';

/**
 * ASTM Table 53 Data Engine - "Smart Grid Matrix"
 * 
 * LOGIC:
 * Instead of formulas, we use exact values extracted from the PDF OCR.
 * The Grid is defined by DENSITY_ANCHORS (Rows) and TEMP_ANCHORS (Cols).
 * 
 * Grid Resolution:
 * - Density: Every 0.010 kg/L where available (0.690, 0.700... 0.900)
 * - Temp: Every 5.0°C (0, 5, 10... 50)
 * 
 * Gaps in PDF data (e.g. 0.760-0.790) are handled by interpolating between the nearest available anchors (0.750 and 0.800).
 */

const TEMP_ANCHORS = [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0];

// Data Rows Map: Density -> [Val@0C, Val@5C, ... Val@50C]
// Values @ 15C must match the Density key exactly (Standard definition).
const GRID_ROWS: Record<string, number[]> = {
  // D=0.690 (Page 1 & 2) - 0-15C Extrapolated due to missing OCR, 15-50C from PDF
  "0.690": [0.6771, 0.6814, 0.6857, 0.6900, 0.6944, 0.6986, 0.7029, 0.7071, 0.7110, 0.7152, 0.7196],
  
  // D=0.700 (Page 3 & 4)
  "0.700": [0.6869, 0.6913, 0.6957, 0.7000, 0.7043, 0.7085, 0.7127, 0.7168, 0.7209, 0.7249, 0.7289],
  
  // D=0.710 (Page 5 & 6)
  "0.710": [0.6971, 0.7014, 0.7057, 0.7100, 0.7142, 0.7184, 0.7225, 0.7265, 0.7305, 0.7345, 0.7384],
  
  // D=0.720 (Page 7 & 8)
  "0.720": [0.7073, 0.7116, 0.7158, 0.7200, 0.7241, 0.7282, 0.7323, 0.7362, 0.7402, 0.7441, 0.7479],
  
  // D=0.730 (Page 9 & 10)
  "0.730": [0.7175, 0.7217, 0.7259, 0.7300, 0.7341, 0.7381, 0.7421, 0.7460, 0.7499, 0.7536, 0.7573],
  
  // D=0.740 (Page 11 & 12)
  "0.740": [0.7277, 0.7319, 0.7360, 0.7400, 0.7440, 0.7480, 0.7518, 0.7557, 0.7594, 0.7631, 0.7667],
  
  // D=0.750 (Page 13 & 14)
  "0.750": [0.7379, 0.7420, 0.7460, 0.7500, 0.7539, 0.7578, 0.7616, 0.7653, 0.7689, 0.7728, 0.7767],
  
  // Gap 0.760-0.790: Will interpolate automatically
  
  // D=0.800 (Page 15 & 16)
  "0.800": [0.7891, 0.7928, 0.7964, 0.8000, 0.8035, 0.8070, 0.8104, 0.8139, 0.8172, 0.8206, 0.8238],
  
  // D=0.810 (Page 17 & 18)
  "0.810": [0.7993, 0.8029, 0.8065, 0.8100, 0.8135, 0.8169, 0.8203, 0.8236, 0.8270, 0.8302, 0.8335],
  
  // D=0.820 (Page 19 & 20)
  "0.820": [0.8095, 0.8131, 0.8165, 0.8200, 0.8234, 0.8268, 0.8301, 0.8335, 0.8368, 0.8400, 0.8432],
  
  // D=0.830 (Page 21 & 22)
  "0.830": [0.8197, 0.8232, 0.8266, 0.8300, 0.8334, 0.8367, 0.8400, 0.8433, 0.8466, 0.8498, 0.8530],
  
  // D=0.840 (Page 23 & 24)
  "0.840": [0.8298, 0.8332, 0.8366, 0.8400, 0.8433, 0.8466, 0.8499, 0.8532, 0.8564, 0.8596, 0.8628],
  
  // D=0.850 (Page 25 & 26)
  "0.850": [0.8399, 0.8433, 0.8467, 0.8500, 0.8533, 0.8566, 0.8598, 0.8630, 0.8663, 0.8694, 0.8726],
  
  // D=0.860 (Page 27 & 28)
  "0.860": [0.8500, 0.8534, 0.8567, 0.8600, 0.8633, 0.8665, 0.8697, 0.8729, 0.8761, 0.8793, 0.8824],
  
  // D=0.870 (Page 29 & 30) - 0-25C Extrapolated using 0.860 slope characteristics (0.00066)
  "0.870": [0.8601, 0.8634, 0.8667, 0.8700, 0.8732, 0.8765, 0.8797, 0.8829, 0.8860, 0.8892, 0.8923],
  
  // D=0.880 (Page 30)
  "0.880": [0.8702, 0.8735, 0.8768, 0.8800, 0.8832, 0.8864, 0.8896, 0.8928, 0.8959, 0.8991, 0.9022],
  
  // D=0.890 (Page 31)
  "0.890": [0.8803, 0.8836, 0.8869, 0.8900, 0.8931, 0.8964, 0.8996, 0.9027, 0.9059, 0.9090, 0.9121],
  
  // D=0.900 (Page 32)
  "0.900": [0.8904, 0.8937, 0.8969, 0.9000, 0.9032, 0.9064, 0.9096, 0.9127, 0.9159, 0.9190, 0.9221]
};

const DENSITY_ANCHORS = Object.keys(GRID_ROWS).map(Number).sort((a, b) => a - b);

// Calculation Function using the Grid
export const calculateStandardDensity = (obsDensity: number, obsTemp: number): number | null => {
  // Bounds check (Strict to Table 53 Range)
  if (obsDensity < 0.690 || obsDensity > 0.909) return null; // Upper bound limited by valid PDF data
  if (obsTemp < 0.0 || obsTemp > 50.0) return null;

  // 1. Find Density Indexes
  let dIdx = DENSITY_ANCHORS.findIndex(d => d >= obsDensity);
  if (dIdx === -1) dIdx = DENSITY_ANCHORS.length - 1; 
  if (dIdx === 0) dIdx = 1; // Need previous anchor
  
  const d1 = DENSITY_ANCHORS[dIdx - 1];
  const d2 = DENSITY_ANCHORS[dIdx];
  
  // Calculate Density Ratio (0.0 to 1.0)
  const dRatio = (obsDensity - d1) / (d2 - d1);

  // 2. Find Temp Indexes
  let tIdx = TEMP_ANCHORS.findIndex(t => t >= obsTemp);
  if (tIdx === -1) tIdx = TEMP_ANCHORS.length - 1;
  if (tIdx === 0) tIdx = 1;

  const t1 = TEMP_ANCHORS[tIdx - 1];
  const t2 = TEMP_ANCHORS[tIdx];
  
  // Calculate Temp Ratio (0.0 to 1.0)
  const tRatio = (obsTemp - t1) / (t2 - t1);

  // 3. Bilinear Interpolation
  // Get row arrays
  const row1 = GRID_ROWS[d1.toFixed(3)];
  const row2 = GRID_ROWS[d2.toFixed(3)];

  // Get the 4 corner values
  const Q11 = row1[tIdx - 1]; // Top-Left
  const Q21 = row2[tIdx - 1]; // Bottom-Left
  const Q12 = row1[tIdx];     // Top-Right
  const Q22 = row2[tIdx];     // Bottom-Right

  // Interpolate Density first
  const R1 = Q11 + dRatio * (Q21 - Q11); // Value at ObsDensity, T1
  const R2 = Q12 + dRatio * (Q22 - Q12); // Value at ObsDensity, T2

  // Interpolate Temp
  const P = R1 + tRatio * (R2 - R1);

  // Round to 4 decimal places as per ASTM standard
  return parseFloat(P.toFixed(4));
};

// Generate visualization data for the table view
export const ASTM_TABLE_DATA: TablePage[] = Array.from({ length: 31 }, (_, i) => {
  const startDensity = 0.690 + (i * 0.010);
  const endDensity = startDensity + 0.009;
  
  const densities = Array.from({ length: 10 }, (_, j) => parseFloat((startDensity + j * 0.001).toFixed(3)));
  
  const rows = [];
  for (let t = 0.0; t <= 50.0; t += 0.5) {
    rows.push({
      temp: t,
      values: densities.map(d => {
        const val = calculateStandardDensity(d, t);
        return val !== null ? val : 0;
      })
    });
  }
  
  return {
    densityRange: [parseFloat(startDensity.toFixed(3)), parseFloat(endDensity.toFixed(3))],
    tempRange: [0.0, 50.0],
    densities: densities,
    rows: rows
  };
});
