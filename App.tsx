import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Population from './components/Population';
import Activities from './components/Activities';
import SocialAid from './components/SocialAid';
import Documents from './components/Documents';
import AiAssistant from './components/AiAssistant';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [activePage, setActivePage] = useState('Dashboard');
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }

    return (
        <div className="flex h-screen bg-secondary font-sans">
            <Sidebar onNavigate={setActivePage} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={activePage} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-primary p-6 md:p-8">
                    {/* The key here will re-mount the Routes' children on navigation, triggering their animations */}
                    <div key={location.pathname}>
                        <Routes>
                            <Route path="/" element={<Dashboard setPage={setActivePage} />} />
                            <Route path="/population" element={<Population />} />
                            <Route path="/activities" element={<Activities />} />
                            <Route path="/social-aid" element={<SocialAid />} />
                            <Route path="/documents" element={<Documents />} />
                            <Route path="/ai-assistant" element={<AiAssistant />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <HashRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </HashRouter>
    );
};

export default App;