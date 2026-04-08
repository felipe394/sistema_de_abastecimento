

export const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-medium text-slate-500">
        <p>Desenvolvido por <a href="https://connectortech.com.br" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-bold hover:underline">ConnectorTech</a> @2026</p>
        <div className="mt-2 md:mt-0 flex space-x-6">
          <p>© Todos os direitos reservados</p>
          <a href="#" className="hover:text-slate-800 transition-colors">Política de Privacidade</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Termos de Uso</a>
        </div>
      </div>
    </footer>
  );
};
