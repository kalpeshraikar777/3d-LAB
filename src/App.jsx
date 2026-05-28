import { Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro';
import Lab from './pages/Lab';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/lab/:type" element={<Lab />} />
    </Routes>
  );
}

export default App;
