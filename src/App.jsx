import { Routes, Route } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import Project from './pages/Project';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="generate" element={<Generate />} />
        <Route path="project" element={<Project />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
