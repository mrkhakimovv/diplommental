import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Builder from './pages/Builder';
import Viewer from './pages/Viewer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/view" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
}
