import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';

export default function AppToken() {
    const [token, setToken] = useState('your-token-value');
    const [secret, setSecret] = useState('your-secret-key');
    const [loading, setLoading] = useState(true);
    const { post } = useAxios();

    useEffect(() => {
        post(`${process.env.REACT_APP_SERVER_URL}/switchbot/token`)
            .then(res => {
                setToken(res.data.token);
                setSecret(res.data.secretKey);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [post]);

    const handleCopy = (value) => {
        navigator.clipboard.writeText(value);
    };

    const handleReset = async () => {
        alert('To update function');
    }

    if (loading) return <div className="text-center py-8 text-lg text-gray-300">Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#111924]">
            <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-[#263242]">
                <div className="mb-6">
                    <label className="block text-white text-lg mb-2" htmlFor="token">
                        App Token
                    </label>
                    <div className="relative flex items-center">
                        <input
                            id="token"
                            type="text"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg text-white pr-12 bg-[#111924] border-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => handleCopy(token)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 transition-colors"
                            aria-label="Copy Token"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                <rect x="7" y="7" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                                <rect x="4" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-white text-lg mb-2" htmlFor="secret">
                        Secret Key
                    </label>
                    <div className="relative flex items-center">
                        <input
                            id="secret"
                            type="text"
                            value={secret}
                            onChange={e => setSecret(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg text-white pr-12 bg-[#111924] border-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => handleCopy(secret)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 transition-colors"
                            aria-label="Copy Secret Key"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                <rect x="7" y="7" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                                <rect x="4" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => handleReset()}
                    className="mt-8 w-full py-3 rounded-lg bg-red-800 hover:bg-red-900 text-white text-lg font-semibold transition-colors"
                >
                    Reset Token
                </button>
            </div>

        </div>
    );
}