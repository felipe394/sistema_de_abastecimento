import { ArrowLeft, Landmark, TrendingUp, TrendingDown, DownloadCloud, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

export const AnalysisDetail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const custodyId = params.get('custody') || '1';
  const date = params.get('date') || '2026-03-30';

  const [atms, setAtms] = useState<any[]>([]);
  const [custodyName, setCustodyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await fetch(`${API_URL}/api/analyses/detail?custodyId=${custodyId}&referenceDate=${date}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!resp.ok) {
          const data = await resp.json();
          throw new Error(data.error || 'Falha ao carregar detalhamento');
        }

        const data = await resp.json();
        setAtms(data.atms.map((a: any) => ({
          ...a,
          type: a.withdrawal > a.deposit ? 'Saque' : 'Depósito',
          prediction: Math.max(a.withdrawal, a.deposit),
          factor: 1.0 // Factor is already applied in the backend
        })));
        setCustodyName(data.custody.name);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [custodyId, date]);

  const totalW = atms.reduce((a, b) => a + b.withdrawal, 0);
  const totalD = atms.reduce((a, b) => a + b.deposit, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/analysis')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Detalhamento da Predição</h1>
            <p className="text-slate-500 mt-1">{custodyName} • {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg shadow-sm transition-colors font-bold text-sm">
          <DownloadCloud className="w-4 h-4 mr-2" />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-primary-100 shadow-sm rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-primary-600" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Previsto Saques</p>
          <h2 className="text-3xl font-black text-primary-900">{formatCurrency(totalW)}</h2>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
            +15% em relação à média
          </div>
        </div>

        <div className="bg-white border border-emerald-100 shadow-sm rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Previsto Depósitos</p>
          <h2 className="text-3xl font-black text-emerald-800">{formatCurrency(totalD)}</h2>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-md">
            Estável
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">ATM / Identificação</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Fator Aplicado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Valor Final Previsto</th>
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
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{atm.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                      atm.type === 'Saque' ? 'bg-primary-50 text-primary-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {atm.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-black text-slate-600">x{atm.factor.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className={`text-sm font-black ${
                      atm.type === 'Saque' ? 'text-primary-900' : 'text-emerald-800'
                    }`}>
                      {formatCurrency(atm.prediction)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
