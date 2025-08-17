import { useState } from 'react';
import ReportForm from './ReportForm';
import ReportVisualisation from './ReportVisualisation';
import './SlidingPanel.css';

export default function SlidingPanel({ coordinates, activePanel, setActivePanel }) {
    const panels = [
        { component: ReportForm, name: 'report-form' },
        { component: ReportVisualisation, name: 'report-visualisation' }
    ];

    return (
        <div className="sliding-panel-container">
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
