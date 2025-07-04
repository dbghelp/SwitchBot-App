import React from 'react';
import { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';


export default function MeterIcons({ deviceId }) {
    const [temperature, setTemperature] = useState('--.-');
    const [humidity, setHumidity] = useState('--');
    const { post } = useAxios();

    useEffect(() => {
        post(`${process.env.REACT_APP_SERVER_URL}/switchbot/getDeviceStatus`, { deviceId } )
            .then(res => {
                setTemperature(res.data.response.temperature);
                setHumidity(res.data.response.humidity);
            })
            .catch((error) => console.error(error));
    }, [deviceId, post]);

    return (
        <div className="flex flex-row items-center gap-2">
            <img src={`/icons/sensor_type_temperature_default.png`} alt="icon" className="w-12 h-12 mb-2" />
            <span className="text-2xl text-white">{temperature}°C</span>
            <img src={`/icons/sensor_type_humidity_default.png`} alt="icon" className="w-12 h-12 mb-2" />
            <span className="text-2xl text-white">{humidity}%</span>
        </div>

    );
}