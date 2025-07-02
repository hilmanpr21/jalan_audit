import { useEffect, useRef, useState } from 'react'; //Core React library, must have
import mapboxgl from "mapbox-gl"; //import Mapbox GL Js for interactive maps
import 'mapbox-gl/dist/mapbox-gl.css'; //for mapbox stylesheet for proper rendering

// initialize Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Define component 
const MapComponent = () => {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);

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

        // Store map instance
        setMap(newMap);

    }, [userLocation, lat, lng, map, zoom]);

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

    // Add Error Message Handling
    return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
        ref={mapContainer}
        style={{ width: '100%', height: '100%' }}
        />
        
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



