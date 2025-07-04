import React, { useState } from 'react';
import useAxios from '../hooks/useAxios';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { post } = useAxios();

    const handleSendCode = async () => {
        setSending(true);
        await post(`${process.env.REACT_APP_SERVER_URL}/switchbot/sendCode`);
        setSending(false);
    };

    const handleChangePassword = async () => {
        setError('');
        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!/^\d{6}$/.test(verificationCode)) {
            setError('Verification code must be exactly 6 digits.');
            return;
        }
        setLoading(true);
        const response = await post(`${process.env.REACT_APP_SERVER_URL}/switchbot/changePassword`, {
            'newPassword': newPassword,
            'credential' : verificationCode,
        });
        setLoading(false);

        if(!response.data.success) {
            setError(response.data.message || 'Failed to change password.');
            return;
        }

        await post(`${process.env.REACT_APP_SERVER_URL}/switchbot/dropTable`);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#111924]">
            <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-[#263242]">
                {error && (
                    <div className="mb-4 text-red-400 text-center font-semibold">{error}</div>
                )}
                <div className="mb-6">
                    <label className="block text-white text-lg mb-2" htmlFor="new-password">
                        New Password
                    </label>
                    <div className="relative flex items-center">
                        <input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg text-white bg-[#111924] border-none focus:ring-2 focus:ring-blue-500 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(v => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 transition-colors"
                            tabIndex={-1}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                            {showNewPassword ? (
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
                <div className="mb-6">
                    <label className="block text-white text-lg mb-2" htmlFor="confirm-password">
                        Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                        <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg text-white bg-[#111924] border-none focus:ring-2 focus:ring-blue-500 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(v => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 transition-colors"
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? (
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
                <div className="mb-8">
                    <label className="block text-white text-lg mb-2" htmlFor="verification-code">
                        Verification Code
                    </label>
                    <div className="flex flex-row items-center gap-2">
                        <input
                            id="verification-code"
                            type="text"
                            value={verificationCode}
                            onChange={e => setVerificationCode(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-lg text-white bg-[#111924] border-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={sending}
                            className="px-4 py-3 rounded-lg bg-gray-500 hover:bg-gray-400 text-white font-semibold transition-colors disabled:opacity-60"
                        >
                            {sending ? 'Sending...' : 'Send Code'}
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="mt-8 w-full py-3 rounded-lg bg-red-800 hover:bg-red-900 text-white text-lg font-semibold transition-colors"
                >
                    {loading ? 'Changing...' : 'Change Password'}
                </button>
            </div>
        </div>
    );
}