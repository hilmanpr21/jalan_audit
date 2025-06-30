import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MapComponent from './map'

function App() {
  return (
    <div className='app'>
      <header className="header">
        <div className='header-logo'>
          <img src='src/assets/image/Jalan-logo-05.png' alt="Jalan Logo" className='header-logo'/>
        </div>
        <a href='https://www.instagram.com/kultum.co/'  target='_blank' className='header-logo'>
          <img src='src/assets/image/Kultum-Visual-04.png' alt="Kultum Logo" className='header-logo'/>
        </a>
      </header>
      <div className='content-container'>
        <main className="body">
          <MapComponent />
        </main>
        <nav className="sidebar">Bottom sidebar</nav>
      </div>
    </div>
  )
}

export default App
