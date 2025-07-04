import React from 'react';

export default function AutomationIcons({ data }) {
    return (
        <div className="flex flex-row items-center gap-2">
            {data.triggerConditions.map((triggerCondition, idx) => (
                <img
                    key={`trigger-${idx}`}
                    src={triggerCondition.icon.css}
                    alt="icon"
                    className="w-12 h-12 mb-2"
                />
            ))}
            <span className="mx-2 text-2xl text-white">{'>'}</span>
            {data.actions.map((action, idx) => (
                <img
                    key={`action-${idx}`}
                    src={action.icon.css}
                    alt="icon"
                    className="w-12 h-12 mb-2"
                />
            ))}
        </div>
    );
}