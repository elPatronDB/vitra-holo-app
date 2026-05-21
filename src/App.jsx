import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import AuthGuard from './components/AuthGuard';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import Project from './pages/Project';
import Login from './pages/Login';
import ProjectRemote from './pages/ProjectRemote';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/project-remote" element={<ProjectRemote />} />
      <Route element={<AuthGuard />}>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="generate" element={<Generate />} />
          <Route path="project" element={<Project />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
