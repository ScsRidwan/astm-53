
export interface ASTMDataPoint {
  observedDensity: number;
  observedTemp: number;
  densityAt15C: number;
}

export interface TablePage {
  densityRange: [number, number];
  tempRange: [number, number];
  densities: number[]; // Column headers
  rows: {
    temp: number;
    values: number[];
  }[];
}
