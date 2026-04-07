import { useState } from 'react';
import { Lock, Mail, Check, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/login.png';

export const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Illustration/Brand */}
        <div className="hidden md:flex w-1/2 relative bg-primary-900 overflow-hidden">
              <img 
                src={loginImage} 
                alt="Ilustração de abastecimento" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90"
              />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-800/40 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col justify-end items-center h-full w-full p-12 text-center pb-20">
            <h2 className="text-4xl font-black text-white mb-3 drop-shadow-md">Bem-vindo de volta!</h2>
            <p className="text-primary-50 text-base leading-relaxed max-w-sm drop-shadow-sm font-medium">
              Acesse o painel do Sistema de Abastecimento para gerar predições avançadas e gerenciar sua rede de ATMs.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-10 lg:p-16 bg-white">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">LOGIN</h2>
            <div className="w-12 h-1 bg-primary-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium placeholder:text-slate-400"
                  placeholder="@mail.com"
                  defaultValue="admin@system.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-12 py-3.5 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium placeholder:text-slate-400"
                  placeholder="password"
                  defaultValue="admin123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="w-5 h-5 border-2 border-slate-300 rounded flex items-center justify-center group-hover:border-primary-500 transition-colors bg-white">
                  {/* Fake checked state for visual */}
                  <Check className="w-3.5 h-3.5 text-primary-600 opacity-0" /> 
                </div>
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline">
                Esqueceu a Senha?
              </a>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all transform hover:-translate-y-0.5 mt-4"
            >
              Entrar
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Não Tem Uma Conta? <a href="#" className="text-primary-600 font-bold hover:underline">Inscrever-se</a>
            </p>
          </div>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-bold">Logar Com</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-[#1877F2] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-[#DB4437] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
              <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.7.04 3.06.69 3.97 1.87-3.32 1.83-2.71 6.13.56 7.37-.8 1.87-1.89 3.73-3.2 4.69zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
