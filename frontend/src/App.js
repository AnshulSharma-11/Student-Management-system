import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Navbar        from './components/Navbar';
import Dashboard     from './pages/Dashboard';
import StudentsList  from './pages/StudentsList';
import StudentDetail from './pages/StudentDetail';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="page-container">
            <Routes>
              <Route path="/"            element={<Dashboard />} />
              <Route path="/students"    element={<StudentsList />} />
              <Route path="/students/:id" element={<StudentDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
