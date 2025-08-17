import { useEffect, useRef, useState } from 'react'; //Core React library, must have
import mapboxgl from "mapbox-gl"; //import Mapbox GL Js for interactive maps
import 'mapbox-gl/dist/mapbox-gl.css'; //for mapbox stylesheet for proper rendering
import { supabase } from './lib/supabaseClient'; //import Supabase client

// initialize Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Define component 
const MapComponent = ({onPinMove, activePanel, isPanelMinimized}) => {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [reports, setReports] = useState([]); // State to store fetched reports

    //add the state variables for user location
    const [userLocation, setUserLocation] = useState(null);
    const [error, setError] = useState(null);

    // Define default coordinates incase there is no user location
    const [lng] = useState (-0.11); //default longitude
    const [lat] = useState (51.5); //default latitude when the map is loaded for the first time
    const [zoom] = useState(16); // to define the zoom level when the map is loaded the first time
    
    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lng: position.coords.longitude,
                        lat: position.coords.latitude
                    });
                },
                (err) => {
                    setError(err.message);
                },
                { enableHighAccuracy: true }
            );
        }else {
            setError("Location is not supported");
        }
    }, []);

    // Function to fetch reports from database
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

    // Fetch reports when on visualisation panel
    useEffect(() => {
        if (activePanel === 1) { // Only fetch when on report visualisation panel
            fetchReports();
        }
    }, [activePanel]);


    // initialize the map
    useEffect(() => {
        if (!mapContainer.current || map) return;

        // use user location if available, otherwise use default coordinates
        const center = userLocation || [lng, lat];

        //initialize the map
        const newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/hilmanpr21/cm1p8cp9200qt01pi8uagd0wa',
            center: center,
            zoom: zoom
        });

        // Add navigation control to the map (zoom/pan controls)
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocate control to the map (geolocation button)
        newMap.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        }), 'top-right');

        // NEW: Track map movements
        const updateCenter = () => {
            const center = newMap.getCenter();
            console.log('Map center coordinates:', {
                lng: center.lng,
                lat: center.lat
            });
            if (onPinMove) {
                onPinMove({
                lng: center.lng,
                lat: center.lat
                });
            }
        };

        newMap.on('moveend', updateCenter);
        
        // Add idle event listener - this coordinate will be used for database submission
        newMap.on('idle', () => {
            const center = newMap.getCenter();
            console.log('Map idle - Center coordinates:', {
                lng: center.lng,
                lat: center.lat,
                timestamp: new Date().toISOString()
            });
            // Update coordinates when map becomes idle (for accurate database submission)
            if (onPinMove) {
                onPinMove({
                    lng: center.lng,
                    lat: center.lat
                });
            }
        });
        
        updateCenter(); // Initial update

        // Store map instance
        setMap(newMap);

        return () => {
            newMap.off('moveend', updateCenter);
            newMap.off('idle');
        };

    }, [userLocation, lat, lng, map, zoom]);

    // Function to add report markers to the map
    const addReportMarkers = () => {
        if (!map || activePanel !== 1) return;

        // Remove existing markers if any
        const existingMarkers = map.getLayer('reports-layer');
        if (existingMarkers) {
            map.removeLayer('reports-layer');
            map.removeSource('reports-source');
        }

        // Function to create canvas-based icons
        const createCanvasIcon = (categories) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const size = 20;
            canvas.width = size;
            canvas.height = size;

            const centerX = size / 2;
            const centerY = size / 2;
            const radius = 8;

            const hasPhysical = Array.isArray(categories) ? categories.includes('physical environment') : categories === 'physical environment';
            const hasEmotional = Array.isArray(categories) ? categories.includes('emotional perception') : categories === 'emotional perception';

            // White border
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 1, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();

            if (hasPhysical && hasEmotional) {
                // Half blue, half green
                // Blue half (left)
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.clip();
                ctx.fillStyle = '#2196F3';
                ctx.fillRect(0, 0, centerX, size);
                ctx.restore();

                // Green half (right)
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.clip();
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(centerX, 0, centerX, size);
                ctx.restore();
            } else if (hasPhysical) {
                // Blue circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fillStyle = '#2196F3';
                ctx.fill();
            } else if (hasEmotional) {
                // Green circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fillStyle = '#4CAF50';
                ctx.fill();
            } else {
                // Grey circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fillStyle = '#9E9E9E';
                ctx.fill();
            }

            return canvas;
        };

        // Create and load icons
        const loadIcon = (iconType, categories) => {
            return new Promise((resolve) => {
                const canvas = createCanvasIcon(categories);
                const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
                
                if (!map.hasImage(`icon-${iconType}`)) {
                    map.addImage(`icon-${iconType}`, imageData);
                }
                resolve();
            });
        };

        // Determine unique icon types needed
        const iconTypes = new Set();
        reports.forEach(report => {
            const categories = report.category;
            const hasPhysical = Array.isArray(categories) ? categories.includes('physical environment') : categories === 'physical environment';
            const hasEmotional = Array.isArray(categories) ? categories.includes('emotional perception') : categories === 'emotional perception';
            
            if (hasPhysical && hasEmotional) {
                iconTypes.add('both');
            } else if (hasPhysical) {
                iconTypes.add('physical');
            } else if (hasEmotional) {
                iconTypes.add('emotional');
            } else {
                iconTypes.add('other');
            }
        });

        // Load all required icons
        const iconPromises = Array.from(iconTypes).map(iconType => {
            let categories;
            switch(iconType) {
                case 'both':
                    categories = ['physical environment', 'emotional perception'];
                    break;
                case 'physical':
                    categories = ['physical environment'];
                    break;
                case 'emotional':
                    categories = ['emotional perception'];
                    break;
                default:
                    categories = [];
            }
            return loadIcon(iconType, categories);
        });

        Promise.all(iconPromises).then(() => {
            // Add reports as a GeoJSON source with icon type
            const geojsonData = {
                type: 'FeatureCollection',
                features: reports.map(report => {
                    const categories = report.category;
                    const hasPhysical = Array.isArray(categories) ? categories.includes('physical environment') : categories === 'physical environment';
                    const hasEmotional = Array.isArray(categories) ? categories.includes('emotional perception') : categories === 'emotional perception';
                    
                    let iconType;
                    if (hasPhysical && hasEmotional) {
                        iconType = 'both';
                    } else if (hasPhysical) {
                        iconType = 'physical';
                    } else if (hasEmotional) {
                        iconType = 'emotional';
                    } else {
                        iconType = 'other';
                    }

                    return {
                        type: 'Feature',
                        properties: {
                            id: report.id,
                            category: report.category,
                            subcategory: report.subcategory,
                            description: report.description,
                            created_at: report.created_at,
                            iconType: iconType
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [report.lng, report.lat]
                        }
                    };
                })
            };

            // Add source
            map.addSource('reports-source', {
                type: 'geojson',
                data: geojsonData
            });

            // Add symbol layer with custom icons
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

            // Add click event for report markers
            map.on('click', 'reports-layer', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const properties = e.features[0].properties;
                
                // Create popup content
                const popupContent = `
                    <div style="max-width: 200px;">
                        <h4 style="margin: 0 0 8px 0; color: #333;">Report Details</h4>
                        <p style="margin: 4px 0; font-size: 12px;"><strong>Category:</strong> ${Array.isArray(properties.category) ? properties.category.join(', ') : properties.category}</p>
                        ${properties.subcategory ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Subcategory:</strong> ${Array.isArray(properties.subcategory) ? properties.subcategory.join(', ') : properties.subcategory}</p>` : ''}
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
        }).catch(error => {
            console.error('Error loading icons:', error);
            // Fallback to simple circle layer if canvas approach fails
            addSimpleCircleLayer();
        });
    };

    // Fallback function for simple circle markers
    const addSimpleCircleLayer = () => {
        const geojsonData = {
            type: 'FeatureCollection',
            features: reports.map(report => ({
                type: 'Feature',
                properties: {
                    id: report.id,
                    category: report.category,
                    subcategory: report.subcategory,
                    description: report.description,
                    created_at: report.created_at
                },
                geometry: {
                    type: 'Point',
                    coordinates: [report.lng, report.lat]
                }
            }))
        };

        map.addSource('reports-source', {
            type: 'geojson',
            data: geojsonData
        });

        map.addLayer({
            id: 'reports-layer',
            type: 'circle',
            source: 'reports-source',
            paint: {
                'circle-radius': 8,
                'circle-color': [
                    'case',
                    ['in', 'physical environment', ['get', 'category']],
                    '#2196F3',
                    ['in', 'emotional perception', ['get', 'category']],
                    '#4CAF50',
                    '#9E9E9E'
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.8
            }
        });

        // Add the same click and hover events
        map.on('click', 'reports-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;
            
            const popupContent = `
                <div style="max-width: 200px;">
                    <h4 style="margin: 0 0 8px 0; color: #333;">Report Details</h4>
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Category:</strong> ${Array.isArray(properties.category) ? properties.category.join(', ') : properties.category}</p>
                    ${properties.subcategory ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Subcategory:</strong> ${Array.isArray(properties.subcategory) ? properties.subcategory.join(', ') : properties.subcategory}</p>` : ''}
                    <p style="margin: 4px 0; font-size: 12px;"><strong>Description:</strong> ${properties.description || 'No description'}</p>
                    <p style="margin: 4px 0; font-size: 10px; color: #666;"><strong>Submitted:</strong> ${new Date(properties.created_at).toLocaleDateString()}</p>
                </div>
            `;

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(popupContent)
                .addTo(map);
        });

        map.on('mouseenter', 'reports-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'reports-layer', () => {
            map.getCanvas().style.cursor = '';
        });
    };

    // Add markers when reports are loaded and map is ready
    useEffect(() => {
        if (map && reports.length > 0 && activePanel === 1) {
            addReportMarkers();
        } else if (map && activePanel === 0) {
            // Close any open popups when switching to ReportForm panel
            const popups = document.getElementsByClassName('mapboxgl-popup');
            if (popups.length > 0) {
                // Close all popups
                Array.from(popups).forEach(popup => {
                    const closeButton = popup.querySelector('.mapboxgl-popup-close-button');
                    if (closeButton) {
                        closeButton.click();
                    }
                });
            }
            
            // Remove markers when switching back to ReportForm panel
            const existingMarkers = map.getLayer('reports-layer');
            if (existingMarkers) {
                map.removeLayer('reports-layer');
                map.removeSource('reports-source');
            }
        }
    }, [map, reports, activePanel]);

    // Make smooth transition to the user location
    useEffect(() => {
        if (map && userLocation) {
            map.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: zoom,
                essential: true // this ensures the animation is not interrupted by user interactions
            });
        }
    }, [map, userLocation]);

    // Handle map resize when panel is minimized/maximized
    useEffect(() => {
        if (map) {
            // Use setTimeout to ensure DOM changes are complete before resizing
            const timeoutId = setTimeout(() => {
                map.resize();
            }, 100);
            
            return () => clearTimeout(timeoutId);
        }
    }, [map, isPanelMinimized]);

    // Add Error Message Handling
    return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
        ref={mapContainer}
        style={{ width: '100%', height: '100%' }}
        />

        {/* NEW: Fixed viewport center pin with circles and pin icon - only show on ReportForm panel */}
        {activePanel === 0 && (
            <div className="viewport-center-pin">
                <div className="pin-icon">📍</div>
            </div>
        )}
        
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


};

export default MapComponent



