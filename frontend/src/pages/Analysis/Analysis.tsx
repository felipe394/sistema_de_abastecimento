import { Plus, Calculator, Database, TrendingUp, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const parseCurrency = (val: string | number) => {
  if (typeof val === 'number') return val;
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
  const [selectedCustodyId, setSelectedCustodyId] = useState('');
  const [referenceDate, setReferenceDate] = useState('2026-03-30');
  const [custodies, setCustodies] = useState<{id:string, name:string}[]>([]);
  
  const [rows, setRows] = useState([...Array(5)].map((_, i) => ({
    id: i,
    macro: i === 0,
    micro: i === 0,
    action: 'Maior'
  })));

  const [dateRowsByRowId, setDateRowsByRowId] = useState<Record<number, any[]>>({ 
    0: [
      { id: 1, date: '2025-11-03', week: 'Segunda-feira', amountW: '147.315.545,25', amountD: '64.120.300,00', factorW: '1,20', factorD: '1,10' },
      { id: 2, date: '2026-02-02', week: 'Segunda-feira', amountW: '154.974.259,20', amountD: '71.550.250,50', factorW: '1,15', factorD: '1,05' },
    ] 
  });

  const [loadingTotals, setLoadingTotals] = useState(false);
  const [actionFinalMacro, setActionFinalMacro] = useState('Maior');
  const [actionFinalMicro, setActionFinalMicro] = useState('Maior');
  const [fetchingAnalysis, setFetchingAnalysis] = useState(false);

  useEffect(() => {
    const fetchCustodies = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/custodies`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error('Falha ao buscar custódias');
        
        const data = await res.json();
        setCustodies(data);
        if (data.length > 0 && !selectedCustodyId) setSelectedCustodyId(data[0].id);
      } catch (err) {
        console.error('Erro ao buscar custódias:', err);
      }
    };

    fetchCustodies();
  }, []);

  // Fetch saved analysis when custody or date changes
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedCustodyId || !referenceDate) return;
      setFetchingAnalysis(true);
      try {
        const res = await fetch(`${API_URL}/api/analyses?custodyId=${selectedCustodyId}&referenceDate=${referenceDate}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        if (data) {
          if (data.lines) setRows(data.lines);
          if (data.dateRows) setDateRowsByRowId(data.dateRows);
          if (data.actionFinalMacro) setActionFinalMacro(data.actionFinalMacro);
          if (data.actionFinalMicro) setActionFinalMicro(data.actionFinalMicro);
        } else {
          // Reset to default if no analysis found? 
          // Maybe better to keep current or clear. User usually wants to start fresh.
          // But actually, resetting might be annoying if they change date by mistake.
          // For now, let's just not reset if null.
        }
      } catch (err) {
        console.error('Erro ao buscar análise:', err);
      } finally {
        setFetchingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [selectedCustodyId, referenceDate]);

  // Refetch totals for all dates when custody changes
  useEffect(() => {
    if (!selectedCustodyId) return;
    Object.keys(dateRowsByRowId).forEach(rowId => {
      const dates = dateRowsByRowId[Number(rowId)] || [];
      dates.forEach(d => {
        if (d.date) {
           // We need a version of fetchDailyTotals that doesn't rely purely on activeRowId from closure if possible,
           // but for now it's okay since we iterate over rowId too.
           // However, fetchDailyTotals uses activeRowId inside. Let's fix that.
        }
      });
    });
  }, [selectedCustodyId]);

  const activeRowId = rows[selectedRowIndex]?.id;
  const activeDateRows = dateRowsByRowId[activeRowId] || [];

  const calculatePrediction = (type: 'W' | 'D', isMicro: boolean = false) => {
    const activeAction = isMicro ? actionFinalMicro : actionFinalMacro;
    
    const rowValues = rows
      .filter(row => isMicro ? row.micro : row.macro)
      .map(row => {
        const dates = dateRowsByRowId[row.id] || [];
        if (dates.length === 0) return 0;

        const dailyPredictions = dates.map(d => {
          const amount = type === 'W' ? parseCurrency(d.amountW) : parseCurrency(d.amountD);
          const factor = type === 'W' ? parseCurrency(d.factorW) : parseCurrency(d.factorD);
          return amount * factor;
        });

        switch (row.action) {
          case 'Maior': return Math.max(...dailyPredictions);
          case 'Menor': return Math.min(...dailyPredictions);
          case 'Média': return dailyPredictions.reduce((a, b) => a + b, 0) / dailyPredictions.length;
          case 'Soma': return dailyPredictions.reduce((a, b) => a + b, 0);
          default: return 0;
        }
      });

    if (rowValues.length === 0) return 0;

    switch (activeAction) {
      case 'Maior': return Math.max(...rowValues);
      case 'Menor': return Math.min(...rowValues);
      case 'Média': return rowValues.reduce((a, b) => a + b, 0) / rowValues.length;
      case 'Soma': return rowValues.reduce((a, b) => a + b, 0);
      default: return 0;
    }
  };

  const predictionW = calculatePrediction('W');
  const predictionD = calculatePrediction('D');

  const fetchDailyTotals = async (dateRowId: number, date: string, targetRowId: number) => {
    if (!selectedCustodyId || !date) return;
    setLoadingTotals(true);
    try {
      const resp = await fetch(`${API_URL}/api/custodies/${selectedCustodyId}/daily-totals?date=${date}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await resp.json();
      
      setDateRowsByRowId(prev => ({
        ...prev,
        [targetRowId]: (prev[targetRowId] || []).map(r => {
          if (r.id === dateRowId) {
            return { 
              ...r, 
              amountW: data.withdrawal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
              amountD: data.deposit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
            };
          }
          return r;
        })
      }));
    } catch (err) {
      console.error('Erro ao buscar totais:', err);
    } finally {
      setLoadingTotals(false);
    }
  };

  // Refetch totals for all dates when custody changes
  useEffect(() => {
    if (!selectedCustodyId) return;
    Object.keys(dateRowsByRowId).forEach(rowIdKey => {
      const rId = Number(rowIdKey);
      const dates = dateRowsByRowId[rId] || [];
      dates.forEach(d => {
        if (d.date) fetchDailyTotals(d.id, d.date, rId);
      });
    });
  }, [selectedCustodyId]);

  const [saving, setSaving] = useState(false);

  const handleSaveAnalysis = async () => {
    if (!selectedCustodyId) {
      alert('Selecione uma custódia primeiro.');
      return;
    }
    setSaving(true);
    try {
      const config = {
        lines: rows,
        dateRows: dateRowsByRowId,
        actionFinalMacro,
        actionFinalMicro
      };

      const res = await fetch(`${API_URL}/api/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          custodyId: selectedCustodyId,
          referenceDate,
          config
        })
      });

      if (!res.ok) throw new Error('Erro ao salvar análise');
      alert('Análise salva com sucesso!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDateRow = (dateRowId: number, field: string, value: string) => {
    setDateRowsByRowId(prev => ({
      ...prev,
      [activeRowId]: (prev[activeRowId] || []).map(r => {
        if (r.id === dateRowId) {
          const updated = { ...r, [field]: value };
          if (field === 'date') {
            updated.week = getDayOfWeek(value);
            fetchDailyTotals(dateRowId, value, activeRowId);
          }
          return updated;
        }
        return r;
      })
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Análise de Abastecimento</h1>
          <p className="text-slate-500 mt-1">Defina fatores e algoritmos para predição de ATMs.</p>
        </div>
        <div className="text-right">
           <p className="text-sm font-bold text-slate-600 mb-1">{getDayOfWeek(referenceDate)}</p>
           <p className="text-xs text-slate-400 uppercase tracking-tighter">Data de Referência</p>
        </div>
      </div>

      {/* Top Header Controls */}
      <div className="bg-white border border-primary-100 shadow-sm p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Custódia</label>
            <select 
              value={selectedCustodyId}
              onChange={(e) => setSelectedCustodyId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
              {custodies.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Data Referência</label>
            <div className="relative">
               <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
               <input 
                 type="date" 
                 value={referenceDate} 
                 onChange={(e) => setReferenceDate(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
               />
            </div>
          </div>
          <div className="flex space-x-3 lg:col-span-2">
             <button 
               onClick={handleSaveAnalysis}
               disabled={saving}
               className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center shadow-lg shadow-primary-200"
             >
               {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
               {saving ? 'SALVANDO...' : 'CALCULAR PREDIÇÃO'}
             </button>
             <button 
               onClick={() => window.location.href = '/analysis/detail'}
               className="px-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg transition-all flex items-center justify-center shadow-sm"
             >
                DETALHAR <ArrowRight className="ml-2 w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8 pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
               <span className="text-xs font-bold text-slate-500 uppercase">Ação Final Macro</span>
               <select 
                 value={actionFinalMacro}
                 onChange={(e) => setActionFinalMacro(e.target.value)}
                 className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-sm font-bold text-primary-700 outline-none focus:border-primary-500"
               >
                  <option>Maior</option>
                  <option>Média</option>
                  <option>Menor</option>
                  <option>Soma</option>
               </select>
            </div>
            <div className="flex items-center space-x-2">
               <span className="text-xs font-bold text-slate-500 uppercase">Ação Final Micro</span>
               <select 
                 value={actionFinalMicro}
                 onChange={(e) => setActionFinalMicro(e.target.value)}
                 className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-sm font-bold text-primary-700 outline-none focus:border-primary-500"
               >
                  <option>Maior</option>
                  <option>Média</option>
                  <option>Menor</option>
                  <option>Soma</option>
               </select>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-6 ml-auto bg-slate-900 px-6 py-3 rounded-xl shadow-inner border border-slate-800">
             {fetchingAnalysis ? (
               <div className="flex items-center space-x-2 text-white">
                 <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                 <span className="text-xs font-bold uppercase">Carregando análise...</span>
               </div>
             ) : (
               <>
                 <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Previsão Saque</p>
                   <p className="text-xl font-black text-white">{formatCurrency(predictionW)}</p>
                 </div>
                 <div className="h-8 border-r border-slate-700"></div>
                 <div>
                   <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-0.5">Previsão Depósito</p>
                   <p className="text-xl font-black text-emerald-400">{formatCurrency(predictionD)}</p>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: Calculation grid - Compacted */}
        <div className="xl:col-span-4 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col h-[550px]">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
             <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-primary-600" />
                <h3 className="font-bold text-slate-800 text-sm">Algoritmos</h3>
             </div>
             <button 
               onClick={() => setRows(prev => [...prev, { id: Date.now(), macro: false, micro: false, action: 'Maior' }])}
               className="text-primary-600 hover:bg-primary-50 p-1.5 rounded-lg transition-colors"
               title="Adicionar Linha"
             >
                <Plus className="w-5 h-5" />
             </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-100">
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase">#</th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase text-center">Macro</th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase text-center">Micro</th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row, i) => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedRowIndex(i)}
                    className={`cursor-pointer transition-all ${i === selectedRowIndex ? 'bg-primary-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-3 py-3 text-xs font-bold text-slate-400">{i + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <input 
                          type="checkbox" 
                          checked={row.macro} 
                          onChange={() => {
                             const newRows = [...rows];
                             newRows[i].macro = !newRows[i].macro;
                             setRows(newRows);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <input 
                          type="checkbox" 
                          checked={row.micro} 
                          onChange={() => {
                             const newRows = [...rows];
                             newRows[i].micro = !newRows[i].micro;
                             setRows(newRows);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                       <select 
                         value={row.action}
                         onChange={(e) => {
                            const newRows = [...rows];
                            newRows[i].action = e.target.value;
                            setRows(newRows);
                         }}
                         className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none"
                       >
                         <option>Maior</option>
                         <option>Média</option>
                         <option>Menor</option>
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
        <div className="xl:col-span-8 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col h-[550px]">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 flex justify-between items-center">
             <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Datas de Cálculo (Linha {selectedRowIndex + 1})</h3>
             </div>
             <button 
               onClick={() => {
                  setDateRowsByRowId(prev => ({
                    ...prev,
                    [activeRowId]: [
                      ...(prev[activeRowId] || []),
                      { id: Date.now(), date: '', week: 'A preencher', amountW: '0,00', amountD: '0,00', factorW: '1,00', factorD: '1,00' }
                    ]
                  }));
               }}
               className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center shadow-sm hover:bg-slate-50 transition-all"
             >
                <Plus className="w-3.5 h-3.5 mr-1" /> DATA
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase">Data</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Semana</th>
                  <th className="px-5 py-3 text-[10px] font-black text-primary-600 uppercase text-right">Sacado (R$)</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase text-center w-24">Fator S.</th>
                  <th className="px-5 py-3 text-[10px] font-black text-primary-700 uppercase text-right">Total S. (R$)</th>
                  <th className="px-5 py-3 text-[10px] font-black text-emerald-600 uppercase text-right">Depositado (R$)</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase text-center w-24">Fator D.</th>
                  <th className="px-5 py-3 text-[10px] font-black text-emerald-700 uppercase text-right">Total D. (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeDateRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2 w-40">
                       <input 
                         type="date" 
                         value={row.date} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'date', e.target.value)}
                         className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none py-1"
                       />
                    </td>
                    <td className="px-5 py-2">
                       <span className="text-xs font-medium text-slate-400 uppercase">{row.week}</span>
                    </td>
                    <td className="px-3 py-2">
                       <input 
                         type="text" 
                         value={row.amountW} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'amountW', e.target.value)}
                         className="w-full bg-transparent text-sm font-bold text-slate-800 text-right outline-none px-1"
                       />
                    </td>
                    <td className="px-3 py-2">
                       <input 
                         type="text" 
                         value={row.factorW} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'factorW', e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-center font-bold text-primary-700 outline-none focus:ring-1 focus:ring-primary-500"
                       />
                    </td>
                    <td className="px-5 py-2 text-right text-xs font-black text-primary-800">
                      {formatCurrency(parseCurrency(row.amountW) * parseCurrency(row.factorW))}
                    </td>
                    <td className="px-3 py-2">
                       <input 
                         type="text" 
                         value={row.amountD} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'amountD', e.target.value)}
                         className="w-full bg-transparent text-sm font-bold text-emerald-800 text-right outline-none px-1"
                       />
                    </td>
                    <td className="px-3 py-2">
                       <input 
                         type="text" 
                         value={row.factorD} 
                         onChange={(e) => handleUpdateDateRow(row.id, 'factorD', e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-center font-bold text-emerald-700 outline-none focus:ring-1 focus:ring-emerald-500"
                       />
                    </td>
                    <td className="px-5 py-2 text-right text-xs font-black text-emerald-800">
                      {formatCurrency(parseCurrency(row.amountD) * parseCurrency(row.factorD))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Summary */}
          <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center text-sm">
             <div className="flex space-x-6">
                <p className="text-slate-500 font-bold uppercase text-[10px]">Subtotal Linha {selectedRowIndex + 1}:</p>
                <p className="font-bold text-primary-700">W: {formatCurrency(activeDateRows.reduce((a, b) => a + (parseCurrency(b.amountW) * parseCurrency(b.factorW)), 0))}</p>
                <p className="font-bold text-emerald-700">D: {formatCurrency(activeDateRows.reduce((a, b) => a + (parseCurrency(b.amountD) * parseCurrency(b.factorD)), 0))}</p>
             </div>
             {loadingTotals && <span className="text-[10px] font-black text-primary-600 animate-pulse uppercase">Atualizando dados...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
