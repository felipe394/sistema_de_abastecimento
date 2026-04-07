import { Plus, Calculator, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const parseCurrency = (val: string) => {
  if (!val) return 0;
  const num = parseFloat(val.replace(/\./g, '').replace(',', '.'));
  return isNaN(num) ? 0 : num;
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const getDayOfWeek = (dateString: string) => {
  if (!dateString) return 'A preencher';
  const data = new Date(dateString + 'T12:00:00'); // Use noon to avoid timezone shift
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return dias[data.getDay()] || 'A preencher';
};

export const Analysis = () => {
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [rows, setRows] = useState([...Array(10)].map((_, i) => ({
    id: i,
    macro: i % 2 === 0,
    micro: i % 2 !== 0,
    action: i === 0 ? 'Maior' : 'Média'
  })));

  const initialDateRows = [
    { id: 1, date: '2025-11-03', week: 'Segunda-feira', amountW: '147.315.545,25', amountD: '64.120.300,00', factorW: '1,20', factorD: '1,10' },
    { id: 2, date: '2026-02-02', week: 'Segunda-feira', amountW: '154.974.259,20', amountD: '71.550.250,50', factorW: '1,15', factorD: '1,05' },
    { id: 3, date: '2026-03-02', week: 'Segunda-feira', amountW: '173.178.783,61', amountD: '82.300.100,20', factorW: '1,18', factorD: '1,12' },
    { id: 4, date: '2026-04-01', week: 'Quarta-feira', amountW: '216.380.035,39', amountD: '95.140.500,00', factorW: '0,90', factorD: '0,95' },
    { id: 5, date: '2026-05-04', week: 'Segunda-feira', amountW: '171.657.246,84', amountD: '78.900.200,80', factorW: '1,15', factorD: '1,10' },
    { id: 6, date: '2026-06-01', week: 'Segunda-feira', amountW: '179.548.869,17', amountD: '85.200.300,10', factorW: '1,10', factorD: '1,08' },
    { id: 7, date: '2026-07-01', week: 'Quarta-feira', amountW: '228.339.967,34', amountD: '110.450.600,00', factorW: '0,85', factorD: '0,90' },
  ];

  const [dateRowsByRowId, setDateRowsByRowId] = useState<Record<number, any[]>>({ 0: initialDateRows });
  const [custodies, setCustodies] = useState<{id:string, name:string}[]>([]);

  // Load dynamically created custodies from local mock state
  useEffect(() => {
    const saved = localStorage.getItem('mock_custodies');
    if (saved) {
      setCustodies(JSON.parse(saved));
    } else {
      setCustodies([
        { id: '1', name: 'GRUPO FERIADO SÃO PAULO' },
        { id: '2', name: 'CUSTÓDIA NORDESTE LITORAL' }
      ]);
    }
  }, []);
  
  const activeRowId = rows[selectedRowIndex]?.id;
  const activeDateRows = dateRowsByRowId[activeRowId] || [];

  const totalSimulatedW = activeDateRows.reduce((acc, row) => acc + (parseCurrency(row.amountW) * parseCurrency(row.factorW)), 0);
  const totalSimulatedD = activeDateRows.reduce((acc, row) => acc + (parseCurrency(row.amountD) * parseCurrency(row.factorD)), 0);

  const handleAddRow = () => {
    const newId = Date.now();
    setRows(prev => [
      ...prev,
      { id: newId, macro: false, micro: false, action: 'Maior' }
    ]);
    setDateRowsByRowId(prev => ({ ...prev, [newId]: [] })); // Blank dates for new row
  };

  const handleAddDate = () => {
    setDateRowsByRowId(prev => ({
      ...prev,
      [activeRowId]: [
        ...(prev[activeRowId] || []),
        { id: Date.now(), date: '', week: 'A preencher', amountW: '0,00', amountD: '0,00', factorW: '1,00', factorD: '1,00' }
      ]
    }));
  };

  const handleUpdateDateRow = (dateRowId: number, field: string, value: string) => {
    setDateRowsByRowId(prev => ({
      ...prev,
      [activeRowId]: (prev[activeRowId] || []).map(r => {
        if (r.id === dateRowId) {
          const updated = { ...r, [field]: value };
          if (field === 'date') {
            updated.week = getDayOfWeek(value);
          }
          return updated;
        }
        return r;
      })
    }));
  };

  const toggleCheckbox = (index: number, type: 'macro' | 'micro') => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        return { ...row, [type]: !row[type] };
      }
      return row;
    }));
  };

  const handleActionChange = (index: number, value: string) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        return { ...row, action: value };
      }
      return row;
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Definição de Algoritmos</h1>
        <p className="text-slate-500 mt-1">Configure os cálculos e fatores para predição de abastecimento.</p>
      </div>

      {/* Top Header Controls */}
      <div className="bg-white border border-primary-100 shadow-sm p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nível</label>
            <select className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none">
              <option>Grupo de custódia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Custódia</label>
            <select className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none">
              {custodies.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data Referência</label>
            <input type="date" defaultValue="2026-03-30" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="flex space-x-3">
             <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center shadow-md">
               <Calculator className="w-4 h-4 mr-2" />
               Calcular
             </button>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-8 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-3">
             <span className="text-sm font-medium text-primary-900">Ação final macro</span>
             <select className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-slate-900 outline-none focus:border-primary-500 hover:border-primary-500 cursor-pointer">
                <option>Maior</option>
                <option>Média</option>
             </select>
          </div>
          <div className="flex items-center space-x-3">
             <span className="text-sm font-medium text-primary-900">Ação final micro</span>
             <select className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-slate-900 outline-none focus:border-primary-500 hover:border-primary-500 cursor-pointer">
                <option>Maior</option>
                <option>Média</option>
             </select>
          </div>
          <div className="hidden lg:flex items-center space-x-6 ml-auto bg-primary-50 px-5 py-2.5 rounded-lg border border-primary-200">
             <div>
               <p className="text-xs text-primary-700 font-bold uppercase tracking-wider mb-0.5">Previsão Saque</p>
               <p className="text-lg font-bold text-primary-900">R$ 199.155.601,15</p>
             </div>
             <div className="h-8 border-r border-primary-200"></div>
             <div>
               <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-0.5">Previsão Depósito</p>
               <p className="text-lg font-bold text-emerald-800">R$ 85.204.300,50</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: Calculation grid */}
        <div className="xl:col-span-5 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col h-[600px]">
          <div className="bg-slate-50 border-b border-primary-200 px-5 py-4 flex justify-between items-center">
             <h3 className="font-bold text-primary-900">Cálculo</h3>
             <button 
               onClick={handleAddRow}
               className="text-primary-700 bg-primary-100 hover:bg-primary-600 hover:text-white px-3 py-1.5 rounded-lg font-bold flex items-center transition-colors"
             >
               <Plus className="w-4 h-4 mr-1" /> Adicionar Linha
             </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">#</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Macro</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Micro</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedRowIndex(i)}
                    className={`cursor-pointer transition-colors ${i === selectedRowIndex ? 'bg-primary-50/80 border-l-4 border-l-primary-500 shadow-sm' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                  >
                    <td className="px-4 py-4 text-sm font-bold text-slate-400">{i + 1}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center" onClick={() => toggleCheckbox(i, 'macro')}>
                        <div className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${row.macro ? 'bg-primary-600 border-primary-600' : 'border-slate-300 bg-white hover:border-primary-400'}`}>
                          {row.macro && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center" onClick={() => toggleCheckbox(i, 'micro')}>
                        <div className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${row.micro ? 'bg-primary-600 border-primary-600' : 'border-slate-300 bg-white hover:border-primary-400'}`}>
                          {row.micro && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                       <select 
                         value={row.action}
                         onChange={(e) => handleActionChange(i, e.target.value)}
                         className="w-full bg-white border border-slate-200 shadow-sm rounded px-2 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-primary-500 hover:border-primary-500 cursor-pointer"
                       >
                         <option>Maior</option>
                         <option>Média</option>
                         <option>Soma</option>
                       </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Calculation details & dates */}
        <div className="xl:col-span-7 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col h-[600px]">
          <div className="bg-slate-50 border-b border-primary-200 px-5 py-4">
             <h3 className="font-bold text-primary-900 flex items-center">
               <ChevronDown className="w-5 h-5 mr-1 text-primary-500" /> 
               Detalhes do cálculo (Linha {selectedRowIndex + 1})
             </h3>
          </div>
          
          <div className="px-5 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
             <div className="flex space-x-8">
               <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Previsão Simulada (Saque)</p>
                 <p className="text-lg font-bold text-primary-900 border-b-2 border-primary-200 inline-block pb-1">{formatCurrency(totalSimulatedW)}</p>
               </div>
               <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Previsão Simulada (Depósito)</p>
                 <p className="text-lg font-bold text-emerald-800 border-b-2 border-emerald-200 inline-block pb-1">{formatCurrency(totalSimulatedD)}</p>
               </div>
             </div>
             <button 
               onClick={handleAddDate}
               className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm transition-all hover:bg-primary-600 hover:text-white hover:border-primary-600"
             >
               <Plus className="w-4 h-4 mr-1" /> Adicionar Data
             </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Dia</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Semana</th>
                  <th className="px-5 py-3 text-xs font-bold text-primary-600 uppercase text-right">Sacado (R$)</th>
                  <th className="px-5 py-3 text-xs font-bold text-emerald-600 uppercase text-right">Depositado (R$)</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-center w-24">Fator S.</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-center w-24">Fator D.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeDateRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">Nenhuma data inserida nesta linha. Adicione datas para calcular.</td>
                  </tr>
                )}
                {activeDateRows.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 w-36">
                       <input 
                         type="date" 
                         value={row.date} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'date', e.target.value)}
                         className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 text-sm font-medium text-slate-700 outline-none px-1 py-1"
                       />
                    </td>
                    <td className="px-3 py-2">
                       <input 
                         type="text" 
                         value={row.week} 
                         disabled
                         className="w-full bg-transparent text-sm text-slate-500 px-1 py-1"
                       />
                    </td>
                    <td className="px-3 py-2">
                       <input 
                         type="text" 
                         value={row.amountW} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'amountW', e.target.value)}
                         className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 text-sm font-bold text-slate-800 text-right outline-none px-1 py-1"
                       />
                    </td>
                    <td className="px-3 py-2">
                       <input 
                         type="text" 
                         value={row.amountD} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'amountD', e.target.value)}
                         className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 text-sm font-bold text-emerald-800 text-right outline-none px-1 py-1"
                       />
                    </td>
                    <td className="px-3 py-2">
                       <input 
                         type="text" 
                         value={row.factorW} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'factorW', e.target.value)}
                         className="w-full bg-white border border-slate-300 shadow-inner rounded px-2 py-1.5 text-sm text-center font-bold text-primary-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                       />
                    </td>
                    <td className="px-3 py-2">
                       <input 
                         type="text" 
                         value={row.factorD} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'factorD', e.target.value)}
                         className="w-full bg-white border border-slate-300 shadow-inner rounded px-2 py-1.5 text-sm text-center font-bold text-emerald-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                       />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
