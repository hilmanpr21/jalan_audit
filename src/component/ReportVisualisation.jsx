import { useState, useEffect, use } from "react";
import { supabase } from '../lib/supabaseClient';
import './ReportVisualisation.css';

const ReportVisualisation = ({ map, onMarkerClick }) => {
    return (
        <div>
            <div className="visualisation-container">
                <div className="visualisation-header">
                    <h3>Visualisation</h3>
                    <p className="visualisation-description">
                        This section provides a visual representation of the reports submitted by users.
                    </p>    
                </div>
            </div>

             <div className="placeholder-content">
                <div className="placeholder-icon">🗺️</div>
                <h4>Visualization Panel</h4>
                <p>This is a placeholder for the report visualization system.</p>
                
                <div className="test-info">
                    <p><strong>✅ Panel Navigation:</strong> Working</p>
                    <p><strong>🔄 Panel Sliding:</strong> Testing</p>
                    <p><strong>⏳ Map Integration:</strong> Coming next</p>
                </div>

                <div className="next-steps">
                    <h5>Next Implementation Steps:</h5>
                    <ul>
                        <li>Test panel sliding between modes</li>
                        <li>Verify navigation indicators work</li>
                        <li>Add full visualization logic</li>
                        <li>Implement real-time features</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReportVisualisation;