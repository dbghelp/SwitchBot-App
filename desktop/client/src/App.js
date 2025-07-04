import './App.css';
import Header from './components/Header';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import About from './pages/About';
import Devices from './pages/Devices';
import Automations from './pages/Automations';
import ChangePassword from './pages/ChangePassword';
import Bluetooth from './pages/Bluetooth';
import AppToken from './pages/AppToken';
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <div className="App">
      <Header />
      <div className="ml-64">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <Routes>
                  <Route path="/" element={<Devices />} />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/automations" element={<Automations />} />
                  <Route path="/change_password" element={<ChangePassword />} />
                  <Route path="/bluetooth" element={<Bluetooth />} />
                  <Route path="/app_token" element={<AppToken />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </AuthGuard>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}