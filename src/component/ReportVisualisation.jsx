import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import mapboxgl from 'mapbox-gl';
import './ReportVisualisation.css';

const ReportVisualization = ({ map, onMarkerClick }) => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markers, setMarkers] = useState([]);

    // Fetch all reports when component mounts
    useEffect(() => {
        fetchReports();
        setupRealtimeSubscription();
        
        return () => {
            // Cleanup markers when component unmounts
            markers.forEach(marker => marker.remove());
        };
    }, []);

    // Add markers to map when reports change
    useEffect(() => {
        console.log('🔄 useEffect for markers triggered:', { map: !!map, reportsLength: reports.length }); // Debug log
        if (map && reports.length > 0) {
            console.log('✅ Conditions met, calling addMarkersToMap()'); // Debug log
            addMarkersToMap();
        } else {
            console.log('❌ Conditions not met:', { hasMap: !!map, hasReports: reports.length > 0 }); // Debug log
        }
    }, [map, reports]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            console.log('📊 Fetched reports:', data); // Debug log
            console.log('📊 Number of reports:', data?.length || 0); // Debug log
            setReports(data || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = () => {
        const subscription = supabase
            .channel('reports-channel')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'reports' 
                }, 
                (payload) => {
                    console.log('New report received:', payload.new);
                    setReports(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    };

    const addMarkersToMap = () => {
        console.log('🗺️ Adding markers to map...'); // Debug log
        console.log('🗺️ Map object:', map); // Debug log
        console.log('🗺️ Reports to process:', reports); // Debug log
        
        // Debug: Check coordinate diversity in more detail
        const coordinates = reports
            .filter(report => report.lng && report.lat)
            .map(report => ({ lng: report.lng, lat: report.lat, category: report.category }));
        
        console.log('📍 All coordinates:', coordinates);
        
        // Check if coordinates are too similar (detailed analysis)
        const uniqueCoords = new Set(coordinates.map(coord => `${coord.lng}_${coord.lat}`));
        console.log(`📍 Unique coordinate pairs: ${uniqueCoords.size} out of ${coordinates.length} total`);
        
        // Show coordinate clustering details
        const coordGroups = {};
        coordinates.forEach((coord, index) => {
            const key = `${coord.lng}_${coord.lat}`;
            if (!coordGroups[key]) {
                coordGroups[key] = [];
            }
            coordGroups[key].push(index + 1);
        });
        
        console.log('📍 Coordinate grouping:', coordGroups);
        
        // Show which coordinates have multiple reports
        Object.entries(coordGroups).forEach(([coords, reportNumbers]) => {
            if (reportNumbers.length > 1) {
                console.log(`🎯 CLUSTER at ${coords}: Reports ${reportNumbers.join(', ')} (${reportNumbers.length} markers)`);
            }
        });
        
        if (uniqueCoords.size < coordinates.length) {
            console.log('⚠️ Warning: Some reports have identical coordinates! This causes marker clustering.');
        }
        
        // Clear existing markers
        markers.forEach(marker => marker.remove());
        
        const newMarkers = [];
        
        // Keep track of used coordinates to handle clustering
        const usedCoordinates = new Map(); // key: "lng_lat", value: count

        reports.forEach((report, index) => {
            console.log(`🗺️ Processing report ${index + 1}:`, report); // Debug log
            console.log(`🗺️ Report ${index + 1} coordinates check:`, { 
                lng: report.lng, 
                lat: report.lat, 
                lngType: typeof report.lng, 
                latType: typeof report.lat,
                lngValid: report.lng !== null && report.lng !== undefined && !isNaN(report.lng),
                latValid: report.lat !== null && report.lat !== undefined && !isNaN(report.lat)
            }); // Debug log
            
            if (report.lng && report.lat) {
                console.log(`✅ Report ${index + 1} has coordinates: ${report.lng}, ${report.lat}`); // Debug log
                console.log(`🏷️ Report ${index + 1} category:`, report.category, typeof report.category); // Debug log
                
                // Determine marker color based on category array
                let markerColor = '#666666'; // default gray
                
                if (report.category && Array.isArray(report.category) && report.category.length > 0) {
                    // Join array elements and convert to lowercase for easier matching
                    const categoryString = report.category.join(' ').toLowerCase();
                    console.log(`🏷️ Report ${index + 1} categories: [${report.category.join(', ')}]`); // Debug log
                    
                    const hasPhysical = categoryString.includes('physical') || categoryString.includes('environment');
                    const hasEmotional = categoryString.includes('emotional') || categoryString.includes('perception');
                    
                    if (hasPhysical && hasEmotional) {
                        markerColor = '#9C27B0'; // purple for both
                    } else if (hasPhysical) {
                        markerColor = '#2196F3'; // blue for physical
                    } else if (hasEmotional) {
                        markerColor = '#4CAF50'; // green for emotional
                    }
                    
                    console.log(`🎨 Report ${index + 1} color: ${markerColor} (physical: ${hasPhysical}, emotional: ${hasEmotional})`);
                } else {
                    console.log(`🎨 Report ${index + 1} no valid category array, using default gray`);
                }

                // Handle coordinate clustering by slightly offsetting overlapping markers
                let finalLng = report.lng;
                let finalLat = report.lat;
                
                const coordKey = `${report.lng}_${report.lat}`;
                const existingCount = usedCoordinates.get(coordKey) || 0;
                usedCoordinates.set(coordKey, existingCount + 1);
                
                if (existingCount > 0) {
                    // Add small offset for overlapping markers in a circular pattern
                    const offset = 0.0001; // Very small offset (about 10 meters)
                    const angle = (existingCount * 2 * Math.PI) / 8; // Distribute in circle
                    finalLng += offset * Math.cos(angle);
                    finalLat += offset * Math.sin(angle);
                    
                    console.log(`🔄 Report ${index + 1} offset applied: ${report.lng}, ${report.lat} → ${finalLng}, ${finalLat} (cluster position ${existingCount + 1})`);
                }

                // Create marker element
                const markerEl = document.createElement('div');
                markerEl.className = 'custom-marker';
                markerEl.style.backgroundColor = markerColor;
                markerEl.style.width = '16px';
                markerEl.style.height = '16px';
                markerEl.style.borderRadius = '50%';
                markerEl.style.border = '2px solid white';
                markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                markerEl.style.cursor = 'pointer';
                markerEl.style.zIndex = '999';
                
                // Add tooltip for debugging coordinates
                const categoryDisplay = Array.isArray(report.category) ? report.category.join(', ') : (report.category || 'Unknown');
                markerEl.title = `${categoryDisplay} - [${finalLng.toFixed(6)}, ${finalLat.toFixed(6)}]`;

                const marker = new mapboxgl.Marker(markerEl)
                    .setLngLat([finalLng, finalLat])
                    .addTo(map);

                console.log(`📍 Added marker ${index + 1} to map at [${finalLng}, ${finalLat}]`); // Debug log
                console.log(`📍 Marker ${index + 1} object:`, marker); // Debug log

                // Add click handler
                markerEl.addEventListener('click', () => {
                    setSelectedReport(report);
                    if (onMarkerClick) {
                        onMarkerClick(report);
                    }
                });

                newMarkers.push(marker);
            } else {
                console.log(`❌ Report ${index + 1} missing or invalid coordinates:`, { 
                    lng: report.lng, 
                    lat: report.lat,
                    lngCheck: {
                        exists: report.lng !== null && report.lng !== undefined,
                        isNumber: !isNaN(report.lng),
                        value: report.lng
                    },
                    latCheck: {
                        exists: report.lat !== null && report.lat !== undefined,
                        isNumber: !isNaN(report.lat),
                        value: report.lat
                    }
                }); // Debug log
            }
        });

        console.log(`🗺️ Total markers created: ${newMarkers.length}`); // Debug log
        console.log(`📊 Summary: ${reports.length} total reports, ${newMarkers.length} markers created`); // Debug log
        
        // Show which reports failed coordinate validation
        const failedReports = reports.filter((report, index) => {
            const hasValidCoords = report.lng && report.lat && !isNaN(report.lng) && !isNaN(report.lat);
            if (!hasValidCoords) {
                console.log(`❌ Failed report ${index + 1} - lng: ${report.lng}, lat: ${report.lat}`);
                return true;
            }
            return false;
        });
        
        console.log(`❌ Reports with invalid coordinates: ${failedReports.length}`);
        
        setMarkers(newMarkers);
        
        // Fit map to show all markers if there are any
        if (newMarkers.length > 0) {
            const coordinates = reports
                .filter(report => report.lng && report.lat)
                .map(report => [report.lng, report.lat]);
            
            if (coordinates.length > 1) {
                // Create bounds that include all markers
                const bounds = new mapboxgl.LngLatBounds();
                coordinates.forEach(coord => bounds.extend(coord));
                
                // Fit map to bounds with padding
                map.fitBounds(bounds, {
                    padding: 50,
                    maxZoom: 16
                });
                
                console.log('🗺️ Map bounds fitted to show all markers'); // Debug log
            } else if (coordinates.length === 1) {
                // If only one marker, center on it
                map.flyTo({
                    center: coordinates[0],
                    zoom: 16
                });
                console.log('🗺️ Map centered on single marker'); // Debug log
            }
        }
    };

    if (loading) {
        return (
            <div className="visualization-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="visualization-container">
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={fetchReports} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="visualization-container">
            <div className="visualization-header">
                <h3>Community Reports</h3>
                <p className="report-count">{reports.length} reports submitted</p>
                {/* Debug info */}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    <p>🗺️ Map available: {map ? 'Yes' : 'No'}</p>
                    <p>📊 Reports loaded: {reports.length}</p>
                    <p>📍 Markers created: {markers.length}</p>
                    {map && (
                        <button 
                            onClick={() => {
                                // Add a test marker at map center
                                const center = map.getCenter();
                                const testEl = document.createElement('div');
                                testEl.style.backgroundColor = 'red';
                                testEl.style.width = '30px';
                                testEl.style.height = '30px';
                                testEl.style.borderRadius = '50%';
                                testEl.style.border = '3px solid yellow';
                                testEl.innerHTML = 'TEST';
                                testEl.style.display = 'flex';
                                testEl.style.alignItems = 'center';
                                testEl.style.justifyContent = 'center';
                                testEl.style.fontSize = '8px';
                                testEl.style.fontWeight = 'bold';
                                
                                const testMarker = new mapboxgl.Marker(testEl)
                                    .setLngLat([center.lng, center.lat])
                                    .addTo(map);
                                
                                console.log('🧪 Test marker added at:', center);
                            }}
                            style={{ padding: '5px', fontSize: '10px', margin: '5px' }}
                        >
                            Add Test Marker
                        </button>
                    )}
                </div>
            </div>

            {selectedReport ? (
                <div className="report-details">
                    <div className="detail-header">
                        <h4>Report Details</h4>
                        <button 
                            onClick={() => setSelectedReport(null)}
                            className="close-button"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div className="detail-content">
                        <div className="detail-section">
                            <label>Categories:</label>
                            <div className="category-tags">
                                {selectedReport.category?.map((cat, index) => (
                                    <span key={index} className={`category-tag ${cat.replace(' ', '-')}`}>
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {selectedReport.subcategory?.length > 0 && (
                            <div className="detail-section">
                                <label>Subcategories:</label>
                                <div className="subcategory-tags">
                                    {selectedReport.subcategory.map((subcat, index) => (
                                        <span key={index} className="subcategory-tag">
                                            {subcat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedReport.description && (
                            <div className="detail-section">
                                <label>Description:</label>
                                <p className="description-text">{selectedReport.description}</p>
                            </div>
                        )}

                        <div className="detail-section">
                            <label>Submitted:</label>
                            <p className="timestamp">
                                {new Date(selectedReport.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="instruction-message">
                    <div className="instruction-icon">📍</div>
                    <p>Click a marker on the map to see report details</p>
                    <div className="legend">
                        <div className="legend-item">
                            <div className="legend-color blue"></div>
                            <span>Physical Environment</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color green"></div>
                            <span>Emotional Perception</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color purple"></div>
                            <span>Both Categories</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportVisualization;