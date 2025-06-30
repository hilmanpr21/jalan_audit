import React from "react"; //Core React library, must have
import mapboxgl from "mapbox-gl"; //import Mapbox GL Js for interactive maps
import 'mapbox-gl/dist/mapbox-gl.css'; //for mapbox stylesheet for proper rendering

// initialize Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Define component 
const MapComponent = () => {
    const mapContainer = React.useRef(null);
    const [map, setMap] = React.useState(null);
    const [lng] = React.useState (-74.5); //default longitude
    const [lat] = React.useState (40); //default latitude when the map is loaded for the first time
    const [zoom] = React.useState(9); // to define the zoom level when the map is loaded the first time

    React.useEffect(() => {
        if (mapContainer.current && !map) {
            const newMap = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/hilmanpr21/cm1p8cp9200qt01pi8uagd0wa',
                center: [lng, lat],
                zoom: zoom
            });
            setMap(newMap);
        }

        return () => map?.remove()
    }, [lat, lng, map, zoom]);

    return (
        <div
            ref={mapContainer}
            style={{
                width: '100%',
                height: '100%'
            }}
        />
    );

};

export default MapComponent



