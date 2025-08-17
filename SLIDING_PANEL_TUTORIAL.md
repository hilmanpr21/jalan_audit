# Building Sliding Panel and Data Visualisation Features

A comprehensive tutorial to add advanced sliding panel navigation and data visualisation features to the Street Audit App.

## Table of Contents

1.  [Overview](#overview)
2.  [Prerequisites](#prerequisites)
3.  [Phase 1: Creating the Branch](#phase-1-creating-the-branch)
4.  [Phase 2: Sliding Panel System](#phase-2-sliding-panel-system)
5.  [Phase 3: Report Visualisation Component](#phase-3-report-visualisation-component)
6.  [Phase 4: Data Visualisation on Map](#phase-4-data-visualisation-on-map)
7.  [Phase 5: Panel Minimise Functionality](#phase-5-panel-minimise-functionality)
8.  [Phase 6: Basemap Layer Options](#phase-6-basemap-layer-options)
9.  [Final Implementation](#final-implementation)

------------------------------------------------------------------------

## Overview {#overview}

This tutorial extends the basic Street Audit App by adding: - **Sliding Panel System**: Navigate between form input and data visualisation - **Report Visualisation**: Display submitted reports as colored markers on the map - **Navigation Dots**: Visual indicators for active panel - **Minimise Toggle**: Collapse panels for better map viewing - **Basemap Options**: Switch between default, light, and dark map styles - **Category-based Markers**: Color-coded visualisation based on report categories

**Starting Point**: Basic app with ReportForm and map functionality **End Result**: Advanced interface with sliding panels and comprehensive data visualisation

------------------------------------------------------------------------

## Prerequisites {#prerequisites}

-   Completed basic Street Audit App (see main TUTORIAL.md)
-   Git repository initialised
-   Understanding of React state management
-   Familiarity with CSS transitions and flexbox

------------------------------------------------------------------------

## Phase 1: Creating the Branch {#phase-1-creating-the-branch}

### Step 1.1: Create Feature Branch

``` bash
# Create and switch to new branch for sliding panel features
git checkout -b sliding-panel-and-visualisation

# Verify you're on the new branch
git branch
```

**Purpose**: Isolate new features from main codebase for safe development.

------------------------------------------------------------------------

## Phase 2: Sliding Panel System {#phase-2-sliding-panel-system}

### Step 2.1: Create SlidingPanel Component

Create `src/component/SlidingPanel.jsx`:

``` jsx
import { useState } from 'react';
import ReportForm from './ReportForm';
import ReportVisualisation from './ReportVisualisation';
import './SlidingPanel.css';

const SlidingPanel = ({ onCoordinatesChange, isPanelMinimized, onMinimizeChange, onActivePanelChange }) => {
    const [activePanel, setActivePanel] = useState(0);

    const handlePanelChange = (panelIndex) => {
        setActivePanel(panelIndex);
        onActivePanelChange(panelIndex);
    };

    const handleMinimizeToggle = () => {
        onMinimizeChange(!isPanelMinimized);
    };

    if (isPanelMinimized) {
        return (
            <div className="sliding-panel minimized">
                <button 
                    className="minimize-toggle"
                    onClick={handleMinimizeToggle}
                    title="Expand panels"
                >
                    ⬆️
                </button>
            </div>
        );
    }

    return (
        <div className="sliding-panel">
            {/* Navigation dots */}
            <div className="panel-navigation">
                <button 
                    className={`nav-dot ${activePanel === 0 ? 'active' : ''}`}
                    onClick={() => handlePanelChange(0)}
                    title="Report Form"
                />
                <button 
                    className={`nav-dot ${activePanel === 1 ? 'active' : ''}`}
                    onClick={() => handlePanelChange(1)}
                    title="Report Visualisation"
                />
                <button 
                    className="minimize-toggle"
                    onClick={handleMinimizeToggle}
                    title="Minimise panels"
                >
                    ⬇️
                </button>
            </div>

            {/* Sliding panels container */}
            <div className="panels-container" style={{ transform: `translateX(-${activePanel * 100}%)` }}>
                <div className="panel">
                    <ReportForm onCoordinatesChange={onCoordinatesChange} />
                </div>
                <div className="panel">
                    <ReportVisualisation />
                </div>
            </div>
        </div>
    );
};

export default SlidingPanel;
```

### Step 2.2: Create SlidingPanel Styles

Create `src/component/SlidingPanel.css`:

``` css
.sliding-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #FFFFF5;
    position: relative;
    overflow: hidden;
}

.sliding-panel.minimized {
    height: auto;
    padding: 8px;
    background: rgba(255, 255, 245, 0.9);
    backdrop-filter: blur(5px);
    border-radius: 8px;
    margin: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(190, 218, 192, 0.1);
    border-bottom: 1px solid rgba(190, 218, 192, 0.3);
    z-index: 10;
}

.nav-dot {
    width: 12px;
    height: 12px;
    border: none;
    border-radius: 0;
    background: rgba(190, 218, 192, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-dot:hover {
    background: rgba(190, 218, 192, 0.8);
    transform: scale(1.1);
}

.nav-dot.active {
    background: #bedac0;
    transform: scale(1.2);
}

.minimize-toggle {
    background: rgba(190, 218, 192, 0.8);
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 12px;
    margin-left: 8px;
    transition: all 0.3s ease;
}

.minimize-toggle:hover {
    background: #bedac0;
    transform: scale(1.05);
}

.panels-container {
    display: flex;
    flex: 1;
    transition: transform 0.3s ease-in-out;
    overflow: hidden;
}

.panel {
    min-width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
```

### Step 2.3: Update App.jsx

Modify `src/App.jsx` to use the new sliding panel system:

``` jsx
import { useState } from 'react'
import './App.css'
import MapComponent from './map.jsx'
import SlidingPanel from './component/SlidingPanel.jsx'

function App() {
  const [coordinates, setCoordinates] = useState(null);
  const [activePanel, setActivePanel] = useState(0);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);

  const handleCoordinatesChange = (newCoordinates) => {
    setCoordinates(newCoordinates);
  };

  const handleActivePanelChange = (panelIndex) => {
    setActivePanel(panelIndex);
  };

  const handleMinimizeChange = (minimized) => {
    setIsPanelMinimized(minimized);
  };

  return (
    <div className="app">
      <header className="header">
        <img src="/Jalan-Logo-05.png" alt="Jalan Logo" className="header-logo" />
        <h1>Street Audit App</h1>
        <div style={{ width: '40px' }}></div> {/* Spacer for center alignment */}
      </header>
      
      <div className="content-container">
        <div className="body">
          <MapComponent 
            onPinMove={handleCoordinatesChange} 
            activePanel={activePanel}
            isPanelMinimized={isPanelMinimized}
          />
        </div>
        
        <div className="sidebar">
          <SlidingPanel 
            onCoordinatesChange={handleCoordinatesChange}
            isPanelMinimized={isPanelMinimized}
            onMinimizeChange={handleMinimizeChange}
            onActivePanelChange={handleActivePanelChange}
          />
        </div>
      </div>
    </div>
  )
}

export default App
```

------------------------------------------------------------------------

## Phase 3: Report Visualisation Component {#phase-3-report-visualisation-component}

### Step 3.1: Create ReportVisualisation Component

Create `src/component/ReportVisualisation.jsx`:

``` jsx
import './ReportVisualisation.css';

const ReportVisualisation = () => {
    return (
        <div className="report-visualisation">
            <div className="visualisation-content">
                <h2>Report Visualisation</h2>
                <p>
                    This panel displays all submitted reports as colored markers on the map. 
                    Use the map to explore different areas and view submitted audit reports.
                </p>
                
                <div className="legend">
                    <h3>Legend</h3>
                    <div className="legend-item">
                        <div className="legend-color blue"></div>
                        <span>Physical Environment</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color green"></div>
                        <span>Emotional Perception</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color split"></div>
                        <span>Both Categories</span>
                    </div>
                </div>

                <div className="instructions">
                    <h3>Instructions</h3>
                    <ul>
                        <li>Click on any marker to view report details</li>
                        <li>Use map controls to zoom and navigate</li>
                        <li>Switch between different basemap styles</li>
                        <li>Minimise panels for better map viewing</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReportVisualisation;
```

### Step 3.2: Create ReportVisualisation Styles

Create `src/component/ReportVisualisation.css`:

``` css
.report-visualisation {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
    background: #FFFFF5;
    overflow-y: auto;
}

.visualisation-content h2 {
    color: #2c5530;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.visualisation-content p {
    color: #555;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.legend {
    margin-bottom: 1.5rem;
}

.legend h3 {
    color: #2c5530;
    margin-bottom: 0.8rem;
    font-size: 1.2rem;
}

.legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 0.8rem;
    border: 1px solid rgba(0, 0, 0, 0.2);
}

.legend-color.blue {
    background: #2196F3;
}

.legend-color.green {
    background: #4CAF50;
}

.legend-color.split {
    background: linear-gradient(90deg, #2196F3 50%, #4CAF50 50%);
}

.instructions {
    background: rgba(190, 218, 192, 0.1);
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #bedac0;
}

.instructions h3 {
    color: #2c5530;
    margin-bottom: 0.8rem;
    font-size: 1.1rem;
}

.instructions ul {
    color: #555;
    padding-left: 1.2rem;
}

.instructions li {
    margin-bottom: 0.4rem;
    line-height: 1.4;
}
```

------------------------------------------------------------------------

## Phase 4: Data Visualisation on Map {#phase-4-data-visualisation-on-map}

### Step 4.1: Update MapComponent for Data Fetching

Modify `src/map.jsx` to fetch and display report data:

``` jsx
// Add to existing imports
import { supabase } from './lib/supabaseClient';

// Add to component state (after existing useState hooks)
const [reports, setReports] = useState([]);

// Add data fetching function
const fetchReports = async () => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .not('lat', 'is', null)
            .not('lng', 'is', null);
        
        if (error) {
            console.error('Error fetching reports:', error);
            setError('Failed to load reports');
        } else {
            setReports(data || []);
        }
    } catch (err) {
        console.error('Error:', err);
        setError('Failed to load reports');
    }
};

// Add useEffect to fetch reports when on visualisation panel
useEffect(() => {
    if (activePanel === 1) {
        fetchReports();
    }
}, [activePanel]);
```

### Step 4.2: Add Report Markers Function

Add the marker generation function to `src/map.jsx`:

``` jsx
// Function to add report markers to the map
const addReportMarkers = () => {
    if (!map || activePanel !== 1) return;

    // Remove existing markers if any
    if (map.getLayer('reports-layer')) {
        map.removeLayer('reports-layer');
        map.removeSource('reports-source');
    }

    if (reports.length === 0) return;

    // Create custom icons using Canvas
    const createCustomIcon = (categories) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 32;
        canvas.width = size;
        canvas.height = size;

        const hasPhysical = categories.includes('physical environment');
        const hasEmotional = categories.includes('emotional perception');

        if (hasPhysical && hasEmotional) {
            // Split circle: blue left, green right
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
            ctx.fillStyle = '#2196F3';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI);
            ctx.fillStyle = '#4CAF50';
            ctx.fill();
        } else if (hasPhysical) {
            // Blue circle
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
            ctx.fillStyle = '#2196F3';
            ctx.fill();
        } else if (hasEmotional) {
            // Green circle
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
            ctx.fillStyle = '#4CAF50';
            ctx.fill();
        } else {
            // Grey circle for other categories
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
            ctx.fillStyle = '#9E9E9E';
            ctx.fill();
        }

        // Add border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        return canvas;
    };

    // Load custom icons and add markers
    Promise.all(reports.map(report => {
        const canvas = createCustomIcon(report.category || []);
        const iconType = `${(report.category || []).join('-').replace(/\s+/g, '-')}`;
        
        return new Promise((resolve) => {
            map.loadImage(canvas.toDataURL(), (error, image) => {
                if (!error) {
                    if (!map.hasImage(`icon-${iconType}`)) {
                        map.addImage(`icon-${iconType}`, image);
                    }
                }
                resolve({
                    ...report,
                    iconType: iconType
                });
            });
        });
    })).then(reportsWithIcons => {
        // Create GeoJSON data
        const geojsonData = {
            type: 'FeatureCollection',
            features: reportsWithIcons.map(report => {
                return {
                    type: 'Feature',
                    properties: {
                        id: report.id,
                        category: Array.isArray(report.category) ? report.category.join(', ') : report.category,
                        subcategory: Array.isArray(report.subcategory) ? report.subcategory.join(', ') : report.subcategory,
                        description: report.description,
                        created_at: report.created_at,
                        iconType: report.iconType
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [report.lng, report.lat]
                    }
                };
            })
        };

        // Add source and layer
        map.addSource('reports-source', {
            type: 'geojson',
            data: geojsonData
        });

        map.addLayer({
            id: 'reports-layer',
            type: 'symbol',
            source: 'reports-source',
            layout: {
                'icon-image': ['concat', 'icon-', ['get', 'iconType']],
                'icon-size': 1,
                'icon-allow-overlap': true
            }
        });

        // Add click event for popups
        map.on('click', 'reports-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;
            
            const popupContent = `
                <div style="max-width: 200px;">
                    <h4 style="margin: 0 0 8px 0; color: #333;">Report Details</h4>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Category:</strong> ${properties.category}</p>
                    ${properties.subcategory ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Subcategory:</strong> ${properties.subcategory}</p>` : ''}
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Description:</strong> ${properties.description || 'No description'}</p>
                    <p style="margin: 4px 0; font-size: 10px; color: #666;"><strong>Submitted:</strong> ${new Date(properties.created_at).toLocaleDateString()}</p>
                </div>
            `;

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(popupContent)
                .addTo(map);
        });

        // Change cursor on hover
        map.on('mouseenter', 'reports-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'reports-layer', () => {
            map.getCanvas().style.cursor = '';
        });
    });
};

// Add useEffect to manage markers
useEffect(() => {
    if (map && reports.length > 0) {
        if (activePanel === 1) {
            addReportMarkers();
        } else {
            // Remove markers when not on visualisation panel
            if (map.getLayer('reports-layer')) {
                map.removeLayer('reports-layer');
                map.removeSource('reports-source');
            }
        }
    }
}, [map, reports, activePanel]);
```

------------------------------------------------------------------------

## Phase 5: Panel Minimise Functionality {#phase-5-panel-minimise-functionality}

### Step 5.1: Add Map Resize Logic

Update the MapComponent to handle panel minimisation:

``` jsx
// Add useEffect for map resize when panel is minimized/maximized
useEffect(() => {
    if (map) {
        // Use setTimeout to ensure DOM changes are complete before resizing
        const timeoutId = setTimeout(() => {
            map.resize();
        }, 100);
        
        return () => clearTimeout(timeoutId);
    }
}, [map, isPanelMinimized]);
```

### Step 5.2: Update CSS for Minimised State

Add responsive styling to `src/App.css`:

``` css
/* Update existing .content-container styles for landscape mode */
@media (min-width: 768px) and (orientation: landscape) {
    .content-container {
        display: flex;
        flex: 1;
        overflow: hidden;
    }
    
    .body {
        flex: 8;
        overflow-y: auto;
    }

    .sidebar {
        position: static;
        flex: 2;
        bottom: auto; 
        height: 100%;
        transition: flex 0.3s ease;
    }

    /* When panel is minimized, reduce sidebar space */
    .sidebar:has(.sliding-panel.minimized) {
        flex: 0;
        min-width: 60px;
    }
}
```

------------------------------------------------------------------------

## Phase 6: Basemap Layer Options {#phase-6-basemap-layer-options}

### Step 6.1: Add Basemap State and Styles

Update `src/map.jsx` to include basemap options:

``` jsx
// Add basemap state
const [currentBasemap, setCurrentBasemap] = useState('default');

// Define basemap styles
const basemapStyles = {
    default: 'mapbox://styles/hilmanpr21/cm1p8cp9200qt01pi8uagd0wa',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11'
};

// Add basemap change function
const changeBasemap = (basemapType) => {
    if (map && basemapStyles[basemapType]) {
        map.setStyle(basemapStyles[basemapType]);
        setCurrentBasemap(basemapType);
        
        // Re-add markers after style change if on visualisation panel
        map.once('styledata', () => {
            if (activePanel === 1) {
                addReportMarkers();
            }
        });
    }
};
```

### Step 6.2: Add Basemap UI

Update the map component return statement:

``` jsx
return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
            ref={mapContainer}
            style={{ width: '100%', height: '100%' }}
        />

        {/* Fixed viewport center pin - only show on ReportForm panel */}
        {activePanel === 0 && (
            <div className="viewport-center-pin">
                <div className="pin-icon">📍</div>
            </div>
        )}

        {/* Basemap Layer Selector */}
        <div className="basemap-selector">
            <button 
                className={`basemap-btn ${currentBasemap === 'default' ? 'active' : ''}`}
                onClick={() => changeBasemap('default')}
                title="Default Style"
            >
                🗺️
            </button>
            <button 
                className={`basemap-btn ${currentBasemap === 'light' ? 'active' : ''}`}
                onClick={() => changeBasemap('light')}
                title="Light Mode"
            >
                ☀️
            </button>
            <button 
                className={`basemap-btn ${currentBasemap === 'dark' ? 'active' : ''}`}
                onClick={() => changeBasemap('dark')}
                title="Dark Mode"
            >
                🌙
            </button>
        </div>
        
        {error && (
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'white',
                padding: '8px',
                borderRadius: '4px',
                zIndex: 100
            }}>
                Location Error: {error}
            </div>
        )}
    </div>
);
```

### Step 6.3: Add Basemap Styles

Add to `src/App.css`:

``` css
/* Basemap Layer Selector */
.basemap-selector {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 10;
}

.basemap-btn {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.basemap-btn:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
}

.basemap-btn.active {
    background: #2196F3;
    color: white;
    border-color: #1976D2;
}

.basemap-btn.active:hover {
    background: #1976D2;
}
```

------------------------------------------------------------------------

## Final Implementation {#final-implementation}

### Key Features Implemented

1.  **Sliding Panel System**
    -   Navigation between ReportForm and ReportVisualisation
    -   Smooth CSS transitions
    -   Visual navigation dots
2.  **Data Visualisation**
    -   Fetch reports from Supabase database
    -   Category-based color coding
    -   Custom canvas-generated icons
    -   Interactive popups with report details
3.  **Panel Management**
    -   Minimise/maximise functionality
    -   Responsive map resizing
    -   State management across components
4.  **Basemap Options**
    -   Three basemap styles (default, light, dark)
    -   Visual basemap selector
    -   Persistent marker display across style changes

### File Structure

```         
src/
├── component/
│   ├── ReportForm.jsx
│   ├── ReportForm.css
│   ├── ReportVisualisation.jsx
│   ├── ReportVisualisation.css
│   ├── SlidingPanel.jsx
│   └── SlidingPanel.css
├── lib/
│   └── supabaseClient.js
├── App.jsx
├── App.css
└── map.jsx
```

### Testing the Implementation

1.  **Panel Navigation**
    -   Click navigation dots to switch between panels
    -   Verify smooth sliding animations
    -   Test minimise/maximise functionality
2.  **Data Visualisation**
    -   Submit test reports in different categories
    -   Switch to visualisation panel
    -   Verify colored markers appear on map
    -   Test popup interactions
3.  **Basemap Switching**
    -   Test all three basemap options
    -   Verify markers persist across style changes
    -   Check visual consistency
4.  **Responsive Behaviour**
    -   Test on different screen sizes
    -   Verify panel minimisation works correctly
    -   Check map resizing functionality

### British English Conventions

Throughout the implementation, British English spelling is used: - `visualisation` (not visualization) - `colour` (not color) - `minimise` (not minimize) - `centre` (not center)

### Next Steps

-   Add data export functionality
-   Implement report filtering options
-   Add user authentication
-   Create administrative dashboard
-   Add offline capability

------------------------------------------------------------------------

## Conclusion

This tutorial demonstrates how to build advanced UI components with React, including: - Complex state management across multiple components - CSS animations and transitions - Integration with mapping libraries - Custom canvas-based graphics - Responsive design patterns

The sliding panel system provides an intuitive interface for both data input and visualisation, while maintaining clean separation of concerns and reusable component architecture.