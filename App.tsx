
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import JoinQueuePage from './pages/JoinQueuePage';
import TrackQueuePage from './pages/TrackQueuePage';
import CataloguePage from './pages/CataloguePage';
import PoliciesPage from './pages/PoliciesPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Routes with Layout */}
          <Route path="/" element={<Layout><LandingPage /></Layout>} />
          <Route path="/join" element={<Layout><JoinQueuePage /></Layout>} />
          <Route path="/track" element={<Layout><TrackQueuePage /></Layout>} />
          <Route path="/catalogue" element={<Layout><CataloguePage /></Layout>} />
          <Route path="/policies" element={<Layout><PoliciesPage /></Layout>} />
          
          {/* Admin Routes without main Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
