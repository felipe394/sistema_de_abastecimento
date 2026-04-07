import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Loader2, User as UserIcon, Shield, Mail } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'analyst'
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'analyst' });
    }
    setModalOpen(true);
    setShowPassword(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Falha ao salvar usuário');
      
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Usuários</h1>
          <p className="text-slate-500 mt-1">Administre as contas e permissões de acesso ao sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all font-bold text-sm transform hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Perfil</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                    <p className="text-slate-400 mt-2 font-bold text-xs uppercase">Carregando usuários...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500 font-bold border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500 italic">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'admin' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                        : 'bg-primary-50 text-primary-700 border border-primary-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="text-slate-400 hover:bg-white hover:text-primary-600 p-2 rounded-xl transition-all hover:shadow-sm" 
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 p-2 rounded-xl transition-all" 
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Preencha as informações de acesso</p>
                </div>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <UserIcon className="w-3 h-3 mr-1.5" /> Nome Completo
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="Ex: João da Silva"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <Mail className="w-3 h-3 mr-1.5" /> E-mail / Login
                  </label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <Shield className="w-3 h-3 mr-1.5" /> Senha
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                      placeholder={editingUser ? 'Deixe em branco para manter' : 'Sua senha segura'}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-300 hover:text-primary-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Perfil de Acesso</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'analyst' })}
                      className={`py-3 rounded-2xl text-xs font-black border-2 transition-all ${
                        formData.role === 'analyst' 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      ANALISTA
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className={`py-3 rounded-2xl text-xs font-black border-2 transition-all ${
                        formData.role === 'admin' 
                          ? 'border-rose-500 bg-rose-50 text-rose-700' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      ADMIN
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/30 transition-all transform hover:-translate-y-1 mt-6"
                >
                  {editingUser ? 'SALVAR ALTERAÇÕES' : 'CRIAR USUÁRIO'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
