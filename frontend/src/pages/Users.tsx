import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const Users = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Usuários</h1>
          <p className="text-slate-500 mt-1">Administrar acessos ao sistema.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md transition-colors font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Nome</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Email</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Perfil</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-800">Admin Silva</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">admin@system.com</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold border border-primary-200">
                    Admin
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2">
                  <button className="text-slate-500 hover:bg-primary-600 hover:text-white p-1.5 rounded-lg transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-slate-500 hover:bg-rose-600 hover:text-white p-1.5 rounded-lg transition-colors" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
