import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';

export default function Overlay({ onBack, item, type }) {
    const [remoteinfo, setRemoteinfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const { post } = useAxios();

    useEffect(() => {
        switch (type) {
            case 'device':
                setLoading(false);
                break;
            case 'remote':
                post(`${process.env.REACT_APP_SERVER_URL}/switchbot/remoteinfo`,
                    { remoteID: item.remoteID, userID: item.userID })
                    .then(res => {
                        setRemoteinfo(res.data.remoteInfo.keyDetail);
                        setLoading(false);
                    })
                    .catch(() => setLoading(false));
                break;
            case 'scene':
                setLoading(false);
                break;
            default:
                setLoading(false);
                break;
        }
    }, [item, type, post]);

    const handlePowerButtonClick = (remoteID, keyName) => {
        post(`${process.env.REACT_APP_SERVER_URL}/switchbot/controlDevice`, {
            deviceId: remoteID,
            command: keyName,
            parameter: 'default'
        })
            .then(res => {

            })
            .catch(() => {
                console.error(`Failed on ${keyName}`);
            });
    };

    if (loading) return <div className="text-center py-8 text-lg text-gray-300">Loading...</div>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div
                className="relative flex flex-col rounded-2xl"
                style={{
                    background: '#263242',
                    borderRadius: '1.5rem',
                    minHeight: '300px',
                    position: 'absolute',
                    top: '1rem',
                    bottom: '1rem',
                    left: 'calc(256px + 1rem)',
                    right: '1rem',
                }}
            >
                <button
                    onClick={onBack}
                    className="absolute top-4 left-6 flex items-center px-4 py-2 bg-gray-700 text-white rounded-full shadow hover:bg-gray-600 transition-colors"
                    style={{ zIndex: 10 }}
                >
                    <span className="mr-2 text-xl">←</span> Back
                </button>
                <div className="flex-1 flex flex-col items-center justify-center w-full h-full p-8">
                    {type === 'remote' && Array.isArray(remoteinfo) && (
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 mb-8 justify-items-center">
                            {remoteinfo.map((info, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <button
                                        className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-600 active:bg-blue-500 text-white shadow transition"
                                        title={info.keyName || `Power ${idx + 1}`}
                                        onClick={() => handlePowerButtonClick(item.remoteID, info.keyName)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-8 h-8 ml-[3px] mt-[-6px]"
                                            fill="none"
                                            viewBox="0 0 26 26"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m6.364-2.364a9 9 0 11-12.728 0" />
                                        </svg>
                                    </button>
                                    <span className="mt-2 text-white text-sm text-center max-w-[8rem] break-words">
                                        {info.keyName || `Power ${idx + 1}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {type === 'scene' && (
                        <div className="text-center py-8 text-lg text-gray-300">To be updated...</div>
                    )}
                    {type === 'device' && (
                        <div className="text-center py-8 text-lg text-gray-300">To be updated...</div>
                    )}

                </div>
            </div>
        </div>
    );
}