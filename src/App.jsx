import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MapComponent from './map'
import SlidingPanel from './component/SlidingPanel'

function App() {
  const [pinLocation, setPinLocation] = useState(null); 
  const [activePanel, setActivePanel] = useState(0); // 0 for ReportForm, 1 for ReportVisualisation
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);


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
            activePanel={activePanel}
            isPanelMinimized={isPanelMinimized}
          />
        </main>
        <nav className="sidebar">
          <SlidingPanel 
            coordinates={pinLocation} 
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            isPanelMinimized={isPanelMinimized}
            setIsPanelMinimized={setIsPanelMinimized}
          />
        </nav>
      </div>
    </div>
  )
}

export default App
