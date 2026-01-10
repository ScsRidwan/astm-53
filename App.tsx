
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Table as TableIcon, 
  FileText, 
  Calculator, 
  Info, 
  Droplet, 
  Thermometer, 
  ChevronRight,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { ASTM_TABLE_DATA, calculateStandardDensity } from './data';
import { EXTRACTED_TEXT } from './extractedText';

// Tab Enum
enum Tab {
  FINDER = 'FINDER',
  BROWSER = 'BROWSER',
  TEXT = 'TEXT',
  GUIDE = 'GUIDE'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.FINDER);
  
  // Finder State
  const [obsDensity, setObsDensity] = useState<string>('');
  const [obsTemp, setObsTemp] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  // Browser State
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    setIsCalculated(false);

    const d = parseFloat(obsDensity);
    const t = parseFloat(obsTemp);

    // Validation
    if (isNaN(d) || isNaN(t)) {
      setError("Please enter valid numeric values.");
      return;
    }

    if (t < 0.0 || t > 50.0) {
      setError("Temperature is out of table range (0.0°C - 50.0°C).");
      return;
    }

    if (d < 0.690 || d > 0.909) {
      setError("Density is out of table range (0.690 - 0.909 kg/L).");
      return;
    }

    // Direct Smart Grid Calculation
    const calculatedValue = calculateStandardDensity(d, t);

    if (calculatedValue !== null && calculatedValue > 0) {
      setResult(calculatedValue);
      setIsCalculated(true);
    } else {
      setError("Calculation error. Data point likely out of valid correlation range.");
    }
  };

  const handleReset = () => {
    setObsDensity('');
    setObsTemp('');
    setResult(null);
    setIsCalculated(false);
    setError(null);
  };

  const currentPage = ASTM_TABLE_DATA[selectedPageIdx];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 hidden md:block">ASTM 53 Density Finder</h1>
              <h1 className="text-lg font-bold text-slate-800 md:hidden">ASTM 53</h1>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block uppercase tracking-widest">Exact Data Grid</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            {[
              { id: Tab.FINDER, label: 'Finder', icon: Search },
              { id: Tab.BROWSER, label: 'Table', icon: TableIcon },
              { id: Tab.TEXT, label: 'Text', icon: FileText },
              { id: Tab.GUIDE, label: 'Guide', icon: Info },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === item.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* FINDER TAB */}
        {activeTab === Tab.FINDER && (
          <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Standard Density Finder</h2>
              <p className="text-slate-500 mt-2">Correlates Observed Density to 15°C using exact PDF data.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 space-y-6">
                
                {/* Input: Observed Density */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    Observed Density (kg/L)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="e.g., 0.850"
                    value={obsDensity}
                    onChange={(e) => setObsDensity(e.target.value)}
                    className="w-full text-2xl font-mono p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                    <span>Range: 0.690 - 0.909</span>
                    <span>Step: 0.001</span>
                  </div>
                </div>

                {/* Input: Observed Temperature */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    Observed Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 28.5"
                    value={obsTemp}
                    onChange={(e) => setObsTemp(e.target.value)}
                    className="w-full text-2xl font-mono p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                    <span>Range: 0.0 - 50.0</span>
                    <span>Step: 0.1</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-3">
                    <div className="mt-0.5 min-w-[4px] h-4 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-4 pt-2">
                  <button
                    onClick={handleReset}
                    className="col-span-1 flex items-center justify-center p-4 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold transition-colors"
                    title="Reset Form"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleCalculate}
                    className="col-span-3 flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-lg shadow-lg shadow-blue-600/20 transition-all hover:translate-y-[-1px]"
                  >
                    Find Density
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Result Area */}
              {result !== null && (
                <div className="bg-slate-900 p-8 text-center animate-in zoom-in-95 duration-300">
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.25em] mb-4">Standard Density Result</p>
                  <div className="inline-flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white tracking-tight tabular-nums">{result.toFixed(4)}</span>
                    <span className="text-xl text-slate-400 font-medium">kg/L</span>
                  </div>
                  <div className="mt-6 flex justify-center gap-8 text-slate-400 text-sm">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider mb-1">Obs. Density</span>
                      <span className="font-mono text-white">{parseFloat(obsDensity).toFixed(3)}</span>
                    </div>
                    <div className="w-px bg-slate-700 h-8"></div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider mb-1">Obs. Temp</span>
                      <span className="font-mono text-white">{parseFloat(obsTemp).toFixed(1)}°C</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-center text-xs text-slate-400 mt-8 max-w-xs mx-auto leading-relaxed">
              Based on ASTM D 1250 / IP 200 Standard (Table 53). Calibrated using 'Smart Grid' interpolation.
            </p>
          </div>
        )}

        {/* BROWSER TAB */}
        {activeTab === Tab.BROWSER && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Data Table Browser</h2>
                <p className="text-slate-500 text-sm">View full matrix (0°C - 50°C)</p>
              </div>
              
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setSelectedPageIdx(Math.max(0, selectedPageIdx - 1))}
                  disabled={selectedPageIdx === 0}
                  className="p-2 hover:bg-white rounded-md disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                
                <div className="px-4">
                  <select 
                    value={selectedPageIdx}
                    onChange={(e) => setSelectedPageIdx(Number(e.target.value))}
                    className="bg-transparent text-sm font-mono font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    {ASTM_TABLE_DATA.map((p, i) => (
                      <option key={i} value={i}>
                         {p.densityRange[0].toFixed(3)} - {p.densityRange[1].toFixed(3)}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => setSelectedPageIdx(Math.min(ASTM_TABLE_DATA.length - 1, selectedPageIdx + 1))}
                  disabled={selectedPageIdx === ASTM_TABLE_DATA.length - 1}
                  className="p-2 hover:bg-white rounded-md disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="p-4 text-center border-r border-slate-700 sticky left-0 z-10 bg-slate-800 w-24">
                        <div className="text-[10px] uppercase opacity-70">Temp</div>
                        <div className="text-lg">°C</div>
                      </th>
                      {currentPage.densities.map(d => (
                        <th key={d} className="p-3 text-center min-w-[80px] font-mono border-l border-slate-700/50">
                          {d.toFixed(3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentPage.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-700 bg-slate-50 border-r border-slate-200 sticky left-0">
                          {row.temp.toFixed(1)}
                        </td>
                        {row.values.map((v, vidx) => (
                          <td key={vidx} className="p-3 text-center font-mono text-slate-600">
                            {v.toFixed(4)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === Tab.TEXT && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Raw Data Extraction</h2>
              <p className="text-slate-500 text-sm">Text-based representation of the dataset.</p>
            </div>
            
            <div className="space-y-4">
              {EXTRACTED_TEXT.map((page) => (
                <div key={page.pageNumber} className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase">Page {page.pageNumber}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">Digital Version</span>
                  </div>
                  <pre className="p-6 text-xs font-mono text-slate-700 overflow-x-auto leading-relaxed">
                    {page.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === Tab.GUIDE && (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
             <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 space-y-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-4">How to use</h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    This application simplifies the process of reducing observed density to standard density at 15°C, using a high-precision grid engine.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 font-bold">1</div>
                    <h3 className="font-bold text-slate-900 mb-2">Measure</h3>
                    <p className="text-sm text-slate-600">Obtain the Observed Density (kg/L) and Observed Temperature (°C) of your petroleum product.</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 font-bold">2</div>
                    <h3 className="font-bold text-slate-900 mb-2">Find</h3>
                    <p className="text-sm text-slate-600">Enter these values in the "Finder" tab. The app will locate the corresponding factor and calculate the result.</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-slate-400" />
                    Technical Constraints
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-3">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Supported Density Range: 0.690 to 0.909 kg/L
                    </li>
                    <li className="flex gap-3">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Supported Temperature Range: 0.0°C to 50.0°C
                    </li>
                    <li className="flex gap-3">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Calculation Method: Uses Smart Grid Bilinear Interpolation based on exact table values.
                    </li>
                  </ul>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
