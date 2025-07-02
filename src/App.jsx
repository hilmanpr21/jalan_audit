import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MapComponent from './map'
import ReportForm from './component/ReportForm'
import kultumLogo from './assets/image/Kultum-Visual-04.png';
import jalanLogo from './assets/image/Jalan-logo-05.png';

function App() {
  const [pinLocation, setPinLocation] = useState(null); 


  return (
    <div className='app'>
      <header className="header">
        <div className='header-logo'>
          <img src={jalanLogo} alt="Jalan Logo" className='header-logo'/>
        </div>
        <a href='https://www.instagram.com/kultum.co/'  target='_blank' className='header-logo'>
          <img src={kultumLogo} alt="Kultum Logo" className='header-logo'/>
        </a>
      </header>
      <div className='content-container'>
        <main className="body">
          <MapComponent onPinMove={setPinLocation} /> {/* Add the onPinMove prop */}
        </main>
        <nav className="sidebar">
          <ReportForm coordinates={pinLocation} />  {/* Add the ReportForm component */}
        </nav>
      </div>
    </div>
  )
}

export default App
