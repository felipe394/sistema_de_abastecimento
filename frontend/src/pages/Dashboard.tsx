
import { Activity, Landmark, FileText, TrendingUp, DownloadCloud } from 'lucide-react';

export const Dashboard = () => {
  const stats = [
    { title: 'Total de ATMs', value: '450', icon: Landmark, trend: '+12%', color: 'from-blue-500 to-cyan-400' },
    { title: 'Custódias Ativas', value: '18', icon: Activity, trend: '+2', color: 'from-emerald-500 to-teal-400' },
    { title: 'Análises no Mês', value: '1,204', icon: FileText, trend: '+24%', color: 'from-primary-500 to-indigo-500' },
    { title: 'Previsões Geradas', value: '8.4K', icon: TrendingUp, trend: '+5%', color: 'from-orange-500 to-amber-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Geral</h1>
          <p className="text-slate-500 mt-1">Visão panorâmica do sistema de abastecimento.</p>
        </div>
        <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md transition-colors font-medium">
          <DownloadCloud className="w-4 h-4 mr-2" />
          Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-xl p-6 min-h-[400px]">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Volume de Transações Recentes</h2>
          <div className="flex items-center justify-center h-[300px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <p className="text-slate-400">Gráfico de volume será renderizado aqui</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Atividade Recente</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary-500"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Análise gerada para Custódia Ribeirão
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Há {i * 15} minutos por Admin
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
