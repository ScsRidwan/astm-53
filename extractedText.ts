
import { ASTM_TABLE_DATA } from './data';

export interface ExtractedPage {
  pageNumber: number;
  content: string;
}

const generatePageContent = (pageNumber: number): string => {
  // Map page number to density block index
  const dataIndex = pageNumber - 1;
  if (dataIndex >= ASTM_TABLE_DATA.length) return "End of available data.";

  const pageData = ASTM_TABLE_DATA[dataIndex];
  
  if (pageNumber === 1) {
    return `ASTM-IP PETROLEUM MEASUREMENT TABLES
ASTM Designation: D 1250 | IP Designation: 200

TABLE 53
REDUCTION OF OBSERVED DENSITY TO DENSITY AT 15°C

Scope:
This table provides values for reducing observed density to standard density at 15°C.
The data provided here uses a calibrated thermal expansion model derived from the original standard tables.

CALIBRATION NOTES:
- 0.690 Range: Uses high expansion coefficient (approx 0.00089/°C)
- 0.800 Range: Uses medium expansion coefficient (approx 0.00072/°C)
- 0.900 Range: Uses low expansion coefficient (approx 0.00063/°C)

EXAMPLE:
Observed Density: 0.690 @ 25.0°C
Correction: ~ +0.0088
Density @ 15°C: 0.6988

(See full numeric tables below)`;
  }

  const startD = pageData.densityRange[0];
  const endD = pageData.densityRange[1];
  
  const headers = pageData.densities.map(d => d.toFixed(3)).join(' | ');
  const separator = "-".repeat(headers.length + 12);
  
  // Show representative rows (every 5 degrees + ends) for the text view
  const displayTemps = [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0];
  
  const rowStrings = displayTemps.map(t => {
    // Find the row in our data
    const row = pageData.rows.find(r => Math.abs(r.temp - t) < 0.1);
    if (!row) return "";
    
    const values = row.values.map(v => v.toFixed(4).replace(/^0/, '')).join(' | ');
    return `${t.toFixed(1).padEnd(4)} | ${values}`;
  }).join('\n');

  return `TABLE 53 - CALIBRATED DIGITAL EXTRACTION
DENSITY RANGE: ${startD.toFixed(3)} TO ${endD.toFixed(3)}
TEMPERATURE RANGE: 0.0°C TO 50.0°C

Temp | ${headers}
${separator}
${rowStrings}

(End of Section ${pageNumber})`;
};

export const EXTRACTED_TEXT: ExtractedPage[] = Array.from({ length: 32 }, (_, i) => ({
  pageNumber: i + 1,
  content: generatePageContent(i + 1)
}));
