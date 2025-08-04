import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { SigmaIcon } from './icons';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password minimal harus 6 karakter.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await register(name, email, password);
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Gagal untuk mendaftar.');
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
                    <h2 className="mt-4 text-xl text-medium">Buat Akun Baru</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-3">
                        <div>
                            <label htmlFor="name" className="sr-only">Nama Lengkap</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-secondary bg-secondary placeholder-medium text-light rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                                placeholder="Nama Lengkap"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Alamat Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-secondary bg-secondary placeholder-medium text-light rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                                placeholder="Alamat Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-secondary bg-secondary placeholder-medium text-light rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                                placeholder="Password (min. 6 karakter)"
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
                            {isLoading ? 'Memproses...' : 'Daftar'}
                        </button>
                    </div>
                </form>
                <p className="mt-2 text-sm text-center text-medium">
                    Sudah punya akun?{' '}
                    <NavLink to="/login" className="font-medium text-accent hover:text-sky-400">
                        Login di sini
                    </NavLink>
                </p>
                <p className="mt-6 text-center text-xs text-medium/70">
                    © {new Date().getFullYear()} SIGMA DEVELOPMENT
                </p>
            </div>
        </div>
    );
};

export default Register;