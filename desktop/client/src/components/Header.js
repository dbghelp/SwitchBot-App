import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaRobot, FaListAlt, FaCogs, FaInfoCircle, FaBluetoothB } from 'react-icons/fa';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [updateMessage, setUpdateMessage] = useState('');

    useEffect(() => {
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.on('update-message', (event, message) => {
                setUpdateMessage(message);
            });
        } else if (window.require) {
            // For contextIsolation: false
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.on('update-message', (event, message) => {
                setUpdateMessage(message);
            });
        }
        // Cleanup
        return () => {
            if (window.electron && window.electron.ipcRenderer) {
                window.electron.ipcRenderer.removeAllListeners('update-message');
            } else if (window.require) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.removeAllListeners('update-message');
            }
        };
    }, []);

    useEffect(() => {
        axios.post(`${process.env.REACT_APP_SERVER_URL}/switchbot/checkLogin`)
            .then(res => {
                setIsLoggedIn(res.data['Logged in'] === true);
            })
            .catch(() => setIsLoggedIn(false));
    }, []);

    const handleAuthButton = () => {
        if (isLoggedIn) {
            window.confirm('Are you sure you want to log out?') && handleLogout();
        } else {
            navigate('/login');
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/switchbot/dropTable`);
            setIsLoggedIn(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoggedIn(false);
            navigate('/login');
        }
    };

    return (
        <aside className="h-screen w-64 bg-gradient-to-b from-red-700 to-red-900 text-white shadow-lg flex flex-col fixed left-0 top-0">
            <style>
                {`
                .logout-btn {
                    background-color: #263242;
                    transition: background 0.2s;
                }
                .logout-btn:hover {
                    background-color: #32405a;
                }
                `}
            </style>
            <div className="px-6 py-6 flex flex-col items-start h-full w-full">
                <h1 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-2">
                    <Link to="/" className="hover:text-gray-400 transition-colors">SwitchBot</Link>
                </h1>
                <nav className="w-full">
                    <ul className="flex flex-col space-y-4 font-medium text-2xl w-full">
                        <li>
                            <Link to="/devices" className="hover:text-gray-400 transition-colors block w-full text-left flex items-center gap-2">
                                <FaRobot /> Devices
                            </Link>
                        </li>
                        <li>
                            <Link to="/automations" className="hover:text-gray-400 transition-colors block w-full text-left flex items-center gap-2">
                                <FaListAlt /> Automations
                            </Link>
                        </li>
                        <li>
                            <Link to="/bluetooth" className="hover:text-gray-400 transition-colors block w-full text-left flex items-center gap-2">
                                <FaBluetoothB /> Bluetooth
                            </Link>
                        </li>
                        <Dropdown label={<span className="flex items-center gap-2"><FaCogs /> Settings</span>}>
                            <DropdownLink to="/app_token">App Token</DropdownLink>
                            <DropdownLink to="/change_password">Change Password</DropdownLink>
                        </Dropdown>
                        <li>
                            <Link to="/about" className="hover:text-gray-400 transition-colors block w-full text-left flex items-center gap-2">
                                <FaInfoCircle /> About
                            </Link>
                        </li>
                    </ul>
                </nav>
                <button
                    className="mt-auto w-full text-white py-2 rounded transition-colors logout-btn"
                    onClick={handleAuthButton}
                    disabled={isLoggedIn === null}
                >
                    {location.pathname === '/login'
                        ? 'Log In'
                        : 'Log Out'}
                </button>
            </div>
        </aside>
    );
}

function Dropdown({ label, children }) {
    const [open, setOpen] = React.useState(false);

    return (
        <li className="relative w-full">
            <button
                className="hover:text-gray-400 transition-colors w-full text-left py-2 flex items-center gap-2"
                onClick={() => setOpen((prev) => !prev)}
            >
                {label}
            </button>
            <ul className={`bg-white text-black rounded-xl shadow-lg mt-1 transition-all duration-300 z-10 w-full ${open ? 'block' : 'hidden'}`}>
                {children}
            </ul>
        </li>
    );
}

function DropdownLink({ to, children }) {
    return (
        <li>
            <Link
                to={to}
                className="block px-4 py-2 hover:bg-gray-200 rounded-md transition-colors w-full text-left"
            >
                {children}
            </Link>
        </li>
    );
}

export default Header;