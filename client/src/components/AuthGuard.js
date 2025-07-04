import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AuthGuard({ children }) {
    const [checking, setChecking] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.post(`${process.env.REACT_APP_SERVER_URL}/switchbot/checkLogin`)
            .then(res => {
                if (!res.data['Logged in']) {
                    navigate('/login');
                }
                setChecking(false);
            })
            .catch(() => {
                navigate('/login');
                setChecking(false);
            });
    }, [navigate]);

    if (checking) return null; 

    return children;
}