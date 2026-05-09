import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Builder from './pages/Builder';
import Viewer from './pages/Viewer';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Builder />
          </ProtectedRoute>
        } />
        <Route path="/view" element={<Viewer />} />
        <Route path="/view/:id" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
}
