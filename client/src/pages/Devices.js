import React, { useEffect, useState } from 'react';
import Overlay from '../components/Overlay';
import MeterIcons from '../components/MeterIcons';
import useAxios from '../hooks/useAxios';

function Devices() {
    const [devices, setDevices] = useState([]);
    const [remotes, setRemotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const { post } = useAxios();

    useEffect(() => {
        post(`${process.env.REACT_APP_SERVER_URL}/switchbot/getall`)
            .then(res => {
                setDevices(res.data.devices);
                setRemotes(res.data.remotes);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [post]);

    const handleDeviceClick = (device) => {
        setSelectedItem({ type: 'device', data: device });
    };

    const handleRemoteClick = (remote) => {
        setSelectedItem({ type: 'remote', data: remote });
    };

    const handleOverlayBack = () => {
        setSelectedItem(null);
    };

    if (loading) return <div className="text-center py-8 text-lg text-gray-300">Loading...</div>;

    return (
        <>
            <div className="flex flex-wrap gap-6 p-8">
                {devices.map(device => (
                    <div
                        key={device.device_mac}
                        onClick={() => handleDeviceClick(device)}
                        className="bg-[#253041] text-white rounded-xl p-6 min-w-[220px] min-h-[120px] shadow-md flex flex-col justify-center items-start transition-transform duration-200 hover:scale-105 hover:bg-[#32405a] cursor-pointer"
                    >
                        {
                            device.device_detail.device_type.toLowerCase().includes('meter')
                                ? <MeterIcons deviceId={device.device_mac} />
                                : <img src={getDeviceIconSrc(device)} alt="icon" className="w-12 h-12 mb-2" />
                        }
                        <h3 className="text-xl font-semibold mb-2">{device.device_name}</h3>
                        <p className="text-gray-300">{device.device_mac}</p>
                    </div>
                ))}
                {remotes.map(remote => (
                    <div
                        key={remote.remoteID}
                        onClick={() => handleRemoteClick(remote)}
                        className="bg-[#253041] text-white rounded-xl p-6 min-w-[220px] min-h-[120px] shadow-md flex flex-col justify-center items-start transition-transform duration-200 hover:scale-105 hover:bg-[#32405a] cursor-pointer"
                    >
                        <img src={getRemoteIconSrc(remote)} alt="icon" className="w-12 h-12 mb-2" />
                        <h3 className="text-xl font-semibold mb-2">{remote.remoteName}</h3>
                        <p className="text-gray-300">{remote.remoteID}</p>
                    </div>
                ))}
            </div>
            {selectedItem && (
                <Overlay onBack={handleOverlayBack} item={selectedItem.data} type={selectedItem.type} />
            )}
        </>
    );
}

function getDeviceIconSrc(device) {
    if (!device || !device.device_detail || !device.device_detail.device_type) {
        return '/icons/unknown_default.png';
    }

    const type = device.device_detail.device_type;
    let prefix = '';

    if (type.toLowerCase().includes('wolink')) {
        prefix = 'hub_shape_';
    } else if (type.toLowerCase().includes('meter')) {
        prefix = 'sensor_shape_';
    } else if (type.toLowerCase().includes('lock')) {
        prefix = 'lock_shape_';
    } else if (type.toLowerCase().includes('curtain')) {
        prefix = 'curtain_shape_';
    } else {
        prefix = 'sensor_shape_';
    }

    return `/icons/${prefix}${type}.png`;
}

function getRemoteIconSrc(remote) {
    if (!remote || remote.type === undefined || remote.type === null) {
        return '/icons/unknown_default.png';
    }

    let typePart;
    if (Number(remote.type) < 15) {
        typePart = Number(remote.type);
    } else {
        typePart = String(remote.type)[0];
    }

    return `/icons/ir_type_${typePart}.png`;
}

export default Devices;