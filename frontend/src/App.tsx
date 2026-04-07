import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Analysis } from './pages/Analysis/Analysis';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { ImportData } from './pages/ImportData';
import { Custodies } from './pages/Custodies';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/import" element={<ImportData />} />
              <Route path="/users" element={<Users />} />
              <Route path="/custodies" element={<Custodies />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
