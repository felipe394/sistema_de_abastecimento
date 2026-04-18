import { ArrowLeft, Landmark, TrendingUp, TrendingDown, DownloadCloud, Loader2, Calendar } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const getDayOfWeek = (dateString: string) => {
  if (!dateString) return '';
  const data = new Date(dateString + 'T12:00:00');
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return dias[data.getDay()] || '';
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const AnalysisDetail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const custodyId = params.get('custody') || '1';
  const refDate = params.get('date') || '2026-03-30';

  const [custodyName, setCustodyName] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [atms, setAtms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAtms, setLoadingAtms] = useState(false);
  const [error, setError] = useState('');

  // Fetch analysis config to extract available dates and custody name
  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch custody info
        const custRes = await fetch(`${API_URL}/api/custodies`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const custodies = await custRes.json();
        const cust = custodies.find((c: any) => String(c.id) === String(custodyId));
        if (cust) setCustodyName(cust.name);

        // Fetch analysis config to extract dates
        const res = await fetch(`/api/analyses?custodyId=${custodyId}&referenceDate=${refDate}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const config = await res.json();

        if (config && config.dateRows) {
          const allDates: string[] = [];
          Object.values(config.dateRows).forEach((rowDates: any) => {
            if (Array.isArray(rowDates)) {
              rowDates.forEach((d: any) => {
                if (d.date && !allDates.includes(d.date)) {
                  allDates.push(d.date);
                }
              });
            }
          });
          allDates.sort();
          setAvailableDates(allDates);
          if (allDates.length > 0) {
            setSelectedDate(allDates[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Falha ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [custodyId, refDate]);

  // Fetch per-ATM data when selected date changes
  useEffect(() => {
    if (!selectedDate || !custodyId) return;

    const fetchAtmData = async () => {
      setLoadingAtms(true);
      try {
        const resp = await fetch(`/api/custodies/${custodyId}/atm-daily-totals?date=${selectedDate}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!resp.ok) throw new Error('Falha ao buscar dados por ATM');
        const data = await resp.json();
        setAtms(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingAtms(false);
      }
    };

    fetchAtmData();
  }, [selectedDate, custodyId]);

  const totalW = atms.reduce((a, b) => a + b.withdrawal, 0);
  const totalD = atms.reduce((a, b) => a + b.deposit, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest">Carregando Detalhamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center max-w-md">
          <p className="text-rose-600 font-bold mb-4">{error}</p>
          <button
            onClick={() => navigate('/analysis')}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all"
          >
            Voltar para Análise
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/analysis')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Consolidação da Predição</h1>
            <p className="text-slate-500 mt-1">{custodyName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-600 mb-1">{getDayOfWeek(refDate)}</p>
            <p className="text-xs text-slate-400 uppercase tracking-tighter">Data de Referência</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={async () => {
                try {
                  const resp = await fetch('/api/analyses/export/pdf', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ custodyId, date: selectedDate, factor: 1 })
                  });
                  if (!resp.ok) throw new Error('Falha ao gerar PDF');
                  const blob = await resp.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `consolidacao_${custodyId}_${selectedDate}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  alert('Erro ao exportar PDF');
                }
              }}
              className="flex items-center px-4 py-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm transition-colors font-bold text-sm"
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={async () => {
                try {
                  const resp = await fetch('/api/analyses/export/excel', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ custodyId, date: selectedDate, factor: 1 })
                  });
                  if (!resp.ok) throw new Error('Falha ao gerar Excel');
                  const blob = await resp.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `consolidacao_${custodyId}_${selectedDate}.xlsx`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  alert('Erro ao exportar Excel');
                }
              }}
              className="flex items-center px-4 py-2 bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 rounded-lg shadow-sm transition-colors font-bold text-sm"
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Controls: Date Selector */}
      <div className="bg-white border border-primary-100 shadow-sm p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          <div className="w-full md:w-72">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
              <Calendar className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              Data para Consolidação
            </label>
            {availableDates.length > 0 ? (
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              >
                {availableDates.map(d => (
                  <option key={d} value={d}>
                    {new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')} — {getDayOfWeek(d)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-slate-400 font-medium py-2.5">Nenhuma data disponível na análise.</p>
            )}
          </div>

          {/* Day info */}
          <div className="bg-slate-900 px-6 py-3 rounded-xl flex flex-col items-center justify-center min-w-[160px] ml-auto">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Dia Selecionado</p>
            <p className="text-lg font-black text-white leading-tight">{getDayOfWeek(selectedDate)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-primary-100 shadow-sm rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-primary-600" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Sacado</p>
          <h2 className="text-3xl font-black text-primary-900">{formatCurrency(totalW)}</h2>
        </div>

        <div className="bg-white border border-emerald-100 shadow-sm rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Depositado</p>
          <h2 className="text-3xl font-black text-emerald-800">{formatCurrency(totalD)}</h2>
        </div>
      </div>

      {/* ATM Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {loadingAtms ? (
          <div className="flex items-center justify-center py-16 space-x-3">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Carregando ATMs...</span>
          </div>
        ) : atms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Landmark className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold">Nenhum dado de ATM encontrado para esta data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">ATM / Identificação</th>
                  <th className="px-6 py-4 text-[10px] font-black text-primary-600 uppercase text-right">Sacado (R$)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase text-right">Depositado (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {atms.map((atm) => (
                  <tr key={atm.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                          <Landmark className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{atm.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {atm.number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-primary-800">{formatCurrency(atm.withdrawal)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-emerald-700">{formatCurrency(atm.deposit)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Totais</td>
                  <td className="px-6 py-4 text-right text-sm font-black text-primary-800">{formatCurrency(totalW)}</td>
                  <td className="px-6 py-4 text-right text-sm font-black text-emerald-700">{formatCurrency(totalD)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
