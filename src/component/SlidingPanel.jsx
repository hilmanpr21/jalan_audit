import { useState } from 'react';
import ReportForm from './ReportForm';
import ReportVisualisation from './ReportVisualisation';
import './SlidingPanel.css';

export default function SlidingPanel({ coordinates, activePanel, setActivePanel, isPanelMinimized, setIsPanelMinimized }) {
    const panels = [
        { component: ReportForm, name: 'report-form' },
        { component: ReportVisualisation, name: 'report-visualisation' }
    ];

    const toggleMinimize = () => {
        setIsPanelMinimized(!isPanelMinimized);
    };

    return (
        <div className={`sliding-panel-container ${isPanelMinimized ? 'minimized' : ''}`}>
            {/* Minimize toggle button */}
            <button className="minimize-toggle" onClick={toggleMinimize}>
                {isPanelMinimized ? '▲' : '▼'}
            </button>

            {/* Navigation dots */}
            <div className="panel-navigation">
                {panels.map((_, index) => (
                    <button
                        key={index}
                        className={`nav-dot ${activePanel === index ? 'active' : ''}`}
                        onClick={() => setActivePanel(index)}
                        aria-label={`Switch to panel ${index + 1}`}
                    />
                ))}
            </div>

            {/* Sliding panels container */}
            <div 
                className="panels-container"
                style={{ transform: `translateX(-${activePanel * 50}%)` }}
            >
                {panels.map((Panel, index) => (
                    <div key={index} className="panel-slide">
                        <Panel.component coordinates={coordinates} />
                    </div>
                ))}
            </div>
        </div>
    );
}
