import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const encryptedPassword = CryptoJS.AES.encrypt(password, "github.com/dbghelp").toString();

            await axios.post(`${process.env.REACT_APP_SERVER_URL}/switchbot/login`, {
                email,
                encryptedPassword,
            });

            navigate('/');
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#111924]">
            <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-[#263242]">
                {error && (
                    <div className="mb-4 text-red-400 text-center font-semibold">{error}</div>
                )}
                <div className="mb-6">
                    <label className="block text-white text-lg mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-white bg-[#111924] border-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-8">
                    <label className="block text-white text-lg mb-2" htmlFor="password">
                        Password
                    </label>
                    <div className="relative flex items-center">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg text-white bg-[#111924] border-none focus:ring-2 focus:ring-blue-500 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M6.343 6.343A8.001 8.001 0 0112 4c4.418 0 8 3.582 8 8 0 1.657-.403 3.22-1.125 4.575M15.657 15.657A8.001 8.001 0 0112 20c-4.418 0-8-3.582-8-8 0-1.657.403-3.22 1.125-4.575M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="mt-8 w-full py-3 rounded-lg bg-red-800 hover:bg-red-900 text-white text-lg font-semibold transition-colors"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>
        </div>
    );
}