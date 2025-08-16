import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MapComponent from './map'
import ReportForm from './component/ReportForm'
import PanelNavigation from './component/PanelNavigation'
import ReportVisualisation from './component/ReportVisualisation' 

function App() {
  const [pinLocation, setPinLocation] = useState(null); 
  const [panelMode, setPanelMode] = useState('report');  // 'report' or 'visualisation'
  const [map, setMap] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleModeChange = (mode) => {
    setPanelMode(mode);
    setSelectedReport(null);  //clear selected report when switching modes
  };

  // to set auto transition to visualisation after succesful submission
  const handleReportSuccess = () => {
    setPanelMode('visualisation');
  };

  // to set selected report when clicking on a marker
  const handleMarkerClick = (report) => {
    setSelectedReport(report);
  };

  const handleMapInstance = (mapInstance) => {
    setMap(mapInstance);
  };

  return (
    <div className='app'>
      <header className="header">
        <div className='header-logo'>
          <img src='/Jalan-Logo-05.png' alt="Jalan Logo" className='header-logo'/>
        </div>
        <a href='https://www.instagram.com/kultum.co/'  target='_blank' className='header-logo'>
          <img src='/Kultum-Visual-04.png' alt="Kultum Logo" className='header-logo'/>
        </a>
      </header>
      <div className='content-container'>
        <main className="body">
          <MapComponent 
            onPinMove={setPinLocation}     
            onMapLoad={handleMapInstance}
            panelMode={panelMode}           
          /> 
        </main>
        <nav className={`sidebar panel-${panelMode}`}>
          <PanelNavigation
            activeMode={panelMode}
            onModeChange={handleModeChange}
          />

          <div className='panel-content'>
            {panelMode == 'report' ? (
              <ReportForm
                coordinates={pinLocation}
                onReportSuccess={handleReportSuccess}
              />
            ) : (
              <ReportVisualisation
                map={map}
                onMarkerClick={handleMarkerClick}
                selectedReport={selectedReport}
              />
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default App
