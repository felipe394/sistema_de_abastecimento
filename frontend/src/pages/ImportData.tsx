import React from 'react';
import { UploadCloud } from 'lucide-react';

export const ImportData = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Importação de Dados</h1>
        <p className="text-slate-500 mt-1 font-medium">Faça o upload do Excel contendo os dados brutos de ATMs e transações.</p>
      </div>

      <div className="bg-white p-10 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-primary-300 rounded-2xl shadow-sm hover:border-primary-500 transition-colors bg-primary-50/30">
        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-6 shadow-inner border border-primary-200">
          <UploadCloud className="w-12 h-12 text-primary-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Arraste e solte o arquivo Excel</h3>
        <p className="text-slate-500 mb-8 text-center max-w-sm font-medium">
          Formatos suportados: .xlsx, .xls, .csv. As custódias e ATMs novas serão cadastradas automaticamente.
        </p>
        <button className="px-8 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl flex items-center">
          Selecionar Arquivo
        </button>
      </div>
    </div>
  );
};
