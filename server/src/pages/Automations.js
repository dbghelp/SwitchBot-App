import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxios';
import Overlay from '../components/Overlay';
import AutomationIcons from '../components/AutomationIcons';

function Automations() {
    const [scenes, setScenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const { post } = useAxios();

    useEffect(() => {
        post(`${process.env.REACT_APP_SERVER_URL}/switchbot/getList`)
            .then(res => {
                setScenes(res.data.scenes);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [post]);

    const handleSceneClick = (scene) => {
        setSelectedItem({ type: 'scene', data: scene });
    };

    const handleOverlayBack = () => {
        setSelectedItem(null);
    };

    const handleToggle = (e, sceneID, sceneEnabled) => {
        e.stopPropagation();
        setScenes(prev =>
            prev.map(s =>
                s.sceneID === sceneID ? { ...s, enable: !s.enable } : s
            )
        );

        post(`${process.env.REACT_APP_SERVER_URL}/switchbot/sceneChangeEnable`,
            {
                enable: !sceneEnabled,
                sceneID: sceneID
            })
            .then(res => {

            })
            .catch(() => console.error('Failed to ', !sceneEnabled ? 'enable' : 'disable', ' scene'));
    };

    if (loading) return <div className="text-center py-8 text-lg text-gray-300">Loading...</div>;

    return (
        <>
            <div className="grid grid-cols-1 gap-6 p-8">
                {scenes.map(scene => (
                    <div
                        key={scene.sceneID}
                        onClick={() => handleSceneClick(scene)}
                        className="bg-[#253041] text-white rounded-xl p-6 min-w-[220px] min-h-[120px] shadow-md flex flex-col justify-center items-start transition-transform duration-200 hover:scale-[1.02] hover:bg-[#32405a] cursor-pointer"
                    >
                        <h3 className="text-xl font-semibold mb-2">{scene.name}</h3>

                        <div className="flex flex-row items-center justify-between w-full">
                            <AutomationIcons data={scene} />
                            <button
                                onClick={e => handleToggle(e, scene.sceneID, scene.enable)}
                                className="ml-4"
                                aria-label="Toggle scene"
                            >
                                <span
                                    className={`
                inline-block w-12 h-6 rounded-full transition-colors duration-200
                ${scene.enable ? 'bg-green-500' : 'bg-gray-400'}
                relative align-middle
            `}
                                >
                                    <span
                                        className={`
                    absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200
                    ${scene.enable ? 'translate-x-6' : ''}
                `}
                                    />
                                </span>
                            </button>
                        </div>
                        <p className="text-gray-300">{scene.sceneID}</p>
                    </div>
                ))}
            </div>
            {selectedItem && (
                <Overlay onBack={handleOverlayBack} item={selectedItem.data} type={selectedItem.type} />
            )}
        </>
    );
}


export default Automations;