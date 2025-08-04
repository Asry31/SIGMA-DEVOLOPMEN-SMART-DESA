import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { SigmaIcon } from './icons';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Gagal untuk login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <div className="w-full max-w-md p-8 space-y-8 bg-primary rounded-xl shadow-lg animate-fade-in-up">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <SigmaIcon className="h-12 w-12" />
                        <div className="ml-2 text-left">
                            <h1 className="text-2xl font-bold tracking-wider text-light leading-tight">SIGMA</h1>
                            <p className="text-sm tracking-wider text-medium leading-tight">DEVELOPMENT</p>
                        </div>
                    </div>
                    <h2 className="mt-4 text-xl text-medium">Selamat Datang Kembali</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-secondary bg-secondary placeholder-medium text-light rounded-t-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                                placeholder="Alamat Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-secondary bg-secondary placeholder-medium text-light rounded-b-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-secondary bg-accent hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-500"
                        >
                            {isLoading ? 'Memproses...' : 'Login'}
                        </button>
                    </div>
                </form>
                <p className="mt-2 text-sm text-center text-medium">
                    Belum punya akun?{' '}
                    <NavLink to="/register" className="font-medium text-accent hover:text-sky-400">
                        Daftar di sini
                    </NavLink>
                </p>
                <p className="mt-6 text-center text-xs text-medium/70">
                    © {new Date().getFullYear()} SIGMA DEVELOPMENT
                </p>
            </div>
        </div>
    );
};

export default Login;