import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Analysis } from './pages/Analysis/Analysis';
import { AnalysisDetail } from './pages/Analysis/AnalysisDetail';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { ImportData } from './pages/ImportData';
import { Custodies } from './pages/Custodies';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/analysis/detail" element={<AnalysisDetail />} />
                <Route path="/import" element={<ImportData />} />
                <Route path="/users" element={<Users />} />
                <Route path="/custodies" element={<Custodies />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
