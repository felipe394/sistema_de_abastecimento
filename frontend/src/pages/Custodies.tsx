import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

type Custody = { id: string, name: string, region: string, cities: string, description: string, status: string };

const defaultCustodies: Custody[] = [
  { id: '1', name: 'GRUPO FERIADO SÃO PAULO', region: 'Sudeste', cities: 'São Paulo, Campinas, Santos', description: 'Agrupamento principal capital', status: 'Ativo' },
  { id: '2', name: 'CUSTÓDIA NORDESTE LITORAL', region: 'Nordeste', cities: 'Recife, Fortaleza, João Pessoa, Maceió', description: 'Agrupamento turistico', status: 'Ativo' }
];

export const Custodies = () => {
  const [custodies, setCustodies] = useState<Custody[]>(() => {
    const saved = localStorage.getItem('mock_custodies');
    return saved ? JSON.parse(saved) : defaultCustodies;
  });

  useEffect(() => {
    localStorage.setItem('mock_custodies', JSON.stringify(custodies));
  }, [custodies]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', region: '', cities: '', description: '', status: 'Ativo' });

  const openModal = (custody?: Custody) => {
    if (custody) {
      setEditingId(custody.id);
      setFormData({ name: custody.name, region: custody.region, cities: custody.cities, description: custody.description, status: custody.status });
    } else {
      setEditingId(null);
      setFormData({ name: '', region: '', cities: '', description: '', status: 'Ativo' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    if (editingId) {
      setCustodies(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } : c));
    } else {
      setCustodies(prev => [...prev, { id: Date.now().toString(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta custódia?')) {
      setCustodies(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Custódias</h1>
          <p className="text-slate-500 mt-1">Crie e edite grupos de custódia e seus ATMs.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md transition-colors font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Custódia
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Custódia' : 'Nova Custódia'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <form className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Custódia</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ex: CUSTÓDIA LITORAL SUL" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Região</label>
                  <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none">
                     <option value="">Selecione a Região</option>
                     <option>Norte</option>
                     <option>Nordeste</option>
                     <option>Centro-Oeste</option>
                     <option>Sudeste</option>
                     <option>Sul</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Cidades Envolvidas</label>
                  <textarea value={formData.cities} onChange={(e) => setFormData({...formData, cities: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none resize-none" rows={2} placeholder="Ex: Recife, Fortaleza, Salvador..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Descrição Adicional</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none resize-none" rows={2} placeholder="Breve descrição sobre o agrupamento..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status Inicial</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none">
                     <option>Ativo</option>
                     <option>Inativo</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="button" onClick={handleSave} className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md transition-colors">Salvar Custódia</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Nome da Custódia</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Região</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Cidades</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Descrição</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {custodies.map((custody) => (
                <tr key={custody.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{custody.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{custody.region}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate" title={custody.cities}>{custody.cities}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{custody.description}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${custody.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {custody.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <button onClick={() => openModal(custody)} className="text-slate-500 hover:bg-primary-600 hover:text-white p-1.5 rounded-lg transition-colors" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(custody.id)} className="text-slate-500 hover:bg-rose-600 hover:text-white p-1.5 rounded-lg transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
