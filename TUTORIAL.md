# Building a Street Audit App with React, Vite, and Mapbox

A comprehensive tutorial to build a street audit application from scratch using React, Vite, Mapbox GL JS, and Supabase for data storage.

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Prerequisites](#prerequisites)
3.  [Phase 1: Project Setup](#phase-1-project-setup)
4.  [Phase 2: Basic App Structure](#phase-2-basic-app-structure)
5.  [Phase 3: Mapbox Integration](#phase-3-mapbox-integration)
6.  [Phase 4: Database Setup](#phase-4-database-setup)
7.  [Phase 5: Report Form Component](#phase-5-report-form-component)
8.  [Phase 6: Coordinate Tracking](#phase-6-coordinate-tracking)
9.  [Phase 7: Styling and Layout](#phase-7-styling-and-layout)
10. [Phase 8: Final Touches](#phase-8-final-touches)

------------------------------------------------------------------------

## Project Overview {#project-overview}

This tutorial will guide you through building a **Street Audit App** that allows users to: - View an interactive map with their current location - Pin locations by moving the map center - Submit reports about street infrastructure and emotional perceptions - Store data in a cloud database

**Key Features:** - 📍 Interactive Mapbox map with geolocation - 📝 Dynamic form for categorizing observations - 🗄️ Supabase database integration - 📱 Responsive design (mobile-first) - 🎯 Real-time coordinate tracking

------------------------------------------------------------------------

## Prerequisites {#prerequisites}

Before starting, ensure you have: - **Node.js 22.x** installed - **npm** package manager - **Mapbox account** (free tier available) - **Supabase account** (free tier available) - Basic knowledge of **React** and **JavaScript**

------------------------------------------------------------------------

## Phase 1: Project Setup {#phase-1-project-setup}

### Step 1.1: Create Vite + React Project

``` bash
# Create a new Vite project with React template
npm create vite@latest jalan-audit-app -- --template react

# Navigate to project directory
cd jalan-audit-app

# Install dependencies
npm install
```

**What this does:** - Creates a new Vite project with React template - Vite provides fast development server and optimized builds - React template includes basic project structure and configuration

### Step 1.2: Update package.json

Update your `package.json` to specify Node.js version and project details:

``` json
{
  "name": "jalan-audit-app",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "engines": {
    "node": "22.x",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

**What this does:** - Specifies Node.js 22.x for deployment compatibility - Sets up standard development scripts - Configures ESM module type

### Step 1.3: Install Required Dependencies

``` bash
# Install Mapbox GL JS for interactive maps
npm install mapbox-gl

# Install Supabase client for database operations
npm install @supabase/supabase-js

# Install React Map GL (optional wrapper for Mapbox)
npm install react-map-gl
```

**What each dependency does:** - **mapbox-gl**: Core Mapbox library for interactive maps - @supabase/supabase-js: Client library for Supabase database operations - **react-map-gl**: React wrapper for Mapbox (provides React-friendly components)

### Step 1.4: Configure Vite

Update `vite.config.js` for optimal development experience:

``` javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ fastRefresh: true })], // Ensure HMR is on
  server: {
    watch: {
      usePolling: true, // Needed for WSL/Docker
    },
  },
});
```

**What this does:** - Enables fast refresh for instant updates during development - Configures file watching for different environments - Optimizes development server performance

------------------------------------------------------------------------

## Phase 2: Basic App Structure {#phase-2-basic-app-structure}

### Step 2.1: Create Project Structure

Create the following folder structure:

```         
src/
├── component/           # Reusable components
├── lib/                # Utility libraries and configurations
├── assets/             # Static assets
│   └── image/          # Image files
└── [existing files]
```

``` bash
# Create directories
mkdir src/component src/lib src/assets/image

# Copy logo files to appropriate directories
# Place your logo files in public/ and src/assets/image/
```

### Step 2.2: Environment Variables Setup

Create `.env.local` file in your project root:

``` env
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important:** - Replace placeholder values with your actual API keys - Never commit `.env.local` to version control - Add `.env.local` to your `.gitignore` file

**What this does:** - Stores sensitive API keys securely - Makes configuration values available to Vite during build - Keeps secrets out of your source code

### Step 2.3: Basic App Component

Update `src/App.jsx`:

``` jsx
import { useState } from 'react'
import './App.css'

function App() {
  const [pinLocation, setPinLocation] = useState(null); 

  return (
    <div className='app'>
      <header className="header">
        <div className='header-logo'>
          <img src='/Jalan-Logo-05.png' alt="Jalan Logo" className='header-logo'/>
        </div>
        <a href='https://www.instagram.com/kultum.co/' target='_blank' className='header-logo'>
          <img src='/Kultum-Visual-04.png' alt="Kultum Logo" className='header-logo'/>
        </a>
      </header>
      <div className='content-container'>
        <main className="body">
          {/* Map will go here */}
          <p>Map Component Coming Soon...</p>
        </main>
        <nav className="sidebar">
          {/* Form will go here */}
          <p>Report Form Coming Soon...</p>
        </nav>
      </div>
    </div>
  )
}

export default App
```

**What this does:** - Sets up basic layout with header, main content, and sidebar - Introduces state management for pin location coordinates - Prepares structure for map and form components

------------------------------------------------------------------------

## Phase 3: Mapbox Integration {#phase-3-mapbox-integration}

### Step 3.1: Create Supabase Client

Create `src/lib/supabaseClient.js`:

``` javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**What this does:** - Creates a Supabase client instance for database operations - Uses environment variables for secure configuration - Exports client for use throughout the application

### Step 3.2: Create Map Component

Create `src/map.jsx`:

``` jsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapComponent = ({onPinMove}) => {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [error, setError] = useState(null);

    // Default coordinates (London)
    const [lng] = useState(-0.11);
    const [lat] = useState(51.5);
    const [zoom] = useState(16);
    
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
        } else {
            setError("Geolocation is not supported");
        }
    }, []);

    // Initialize the map
    useEffect(() => {
        if (!mapContainer.current || map) return;

        const center = userLocation || [lng, lat];

        const newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12', // Use your custom style
            center: center,
            zoom: zoom
        });

        // Add navigation controls
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocate control
        newMap.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        }), 'top-right');

        setMap(newMap);

        return () => {
            newMap.remove();
        };
    }, [userLocation, lat, lng, map, zoom]);

    // Smooth transition to user location
    useEffect(() => {
        if (map && userLocation) {
            map.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: zoom,
                essential: true
            });
        }
    }, [map, userLocation]);

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

export default MapComponent;
```

**What this does:** - Creates an interactive Mapbox map component - Implements geolocation to get user's current position - Adds navigation controls (zoom, rotate) - Adds geolocation button for easy location access - Handles location errors gracefully - Uses useRef for direct DOM manipulation - Manages map lifecycle with useEffect hooks

------------------------------------------------------------------------

## Phase 4: Database Setup {#phase-4-database-setup}

### Step 4.1: Create Database Schema

In your Supabase dashboard SQL editor, run:

``` sql
-- Create reports table
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    category TEXT[] NOT NULL DEFAULT ARRAY['physical environment'],
    subcategory TEXT[],
    description TEXT NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints
ALTER TABLE reports 
ADD CONSTRAINT reports_category_not_empty_check 
CHECK (array_length(category, 1) > 0);

ALTER TABLE reports 
ADD CONSTRAINT reports_subcategory_check 
CHECK (
    subcategory IS NULL OR 
    (subcategory <@ ARRAY['safety', 'accessibility', 'walkability'] AND array_length(subcategory, 1) > 0)
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed)
CREATE POLICY "Allow all operations" ON reports FOR ALL USING (true);
```

**What this does:** - Creates a `reports` table with appropriate columns - Uses PostgreSQL arrays for multiple category/subcategory selection - Adds constraints to ensure data integrity - Sets up Row Level Security for data protection - Includes timestamp for tracking when reports were created

### Step 4.2: Database Migration (Optional)

If you need to modify existing tables, create `database_migration.sql`:

``` sql
-- Migration script to update reports table structure
-- Execute these queries in order in your Supabase SQL editor

-- Step 1: Rename existing category column to subcategory
ALTER TABLE reports 
RENAME COLUMN category TO subcategory;

-- Step 2: Drop old constraint
ALTER TABLE reports 
DROP CONSTRAINT reports_category_check;

-- Step 3: Modify subcategory column to allow arrays
ALTER TABLE reports 
ALTER COLUMN subcategory DROP NOT NULL,
ALTER COLUMN subcategory TYPE TEXT[] USING CASE 
    WHEN subcategory IS NOT NULL THEN ARRAY[subcategory] 
    ELSE NULL 
END,
ALTER COLUMN subcategory SET DEFAULT NULL;

-- Step 4: Add new category column
ALTER TABLE reports 
ADD COLUMN category TEXT[] NOT NULL DEFAULT ARRAY['physical environment'];

-- Step 5: Add constraints
ALTER TABLE reports 
ADD CONSTRAINT reports_subcategory_check 
CHECK (
    subcategory IS NULL OR 
    (subcategory <@ ARRAY['safety', 'accessibility', 'walkability'] AND array_length(subcategory, 1) > 0)
);

ALTER TABLE reports 
ADD CONSTRAINT reports_category_not_empty_check 
CHECK (array_length(category, 1) > 0);
```

**What this does:** - Provides a migration path for existing databases - Safely transforms data types while preserving existing data - Ensures backward compatibility during updates

------------------------------------------------------------------------

## Phase 5: Report Form Component {#phase-5-report-form-component}

### Step 5.1: Create Form Component

Create `src/component/ReportForm.jsx`:

``` jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ReportForm.css';

// Category options
const categoryOptions = [
    { value: 'physical environment', label: 'Observed—infrastructure (footways/crossings/lights/seats/spaces)' },
    { value: 'emotional perception', label: 'Felt—perceptions (comfort/fear/emotions shaped by environment)' }
];

// Subcategory options
const subcategoryOptions = [
    { value: 'safety', label: 'Safety' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'walkability', label: 'Walkability' }
];

export default function ReportForm({ coordinates }) {
    const [category, setCategory] = useState(['physical environment']);
    const [subcategory, setSubcategory] = useState([]);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // Handle checkbox changes for arrays
    const handleCheckboxChange = (value, currentArray, setterFunction) => {
        setterFunction(prev => 
            prev.includes(value)
                ? prev.filter(item => item !== value)
                : [...prev, value]
        );
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (category.length === 0) {
            setMessage('Category is required');
            setIsSubmitting(false);
            return;
        }

        const { error } = await supabase
            .from('reports')
            .insert({
                category,
                subcategory: subcategory.length > 0 ? subcategory : null,
                description,
                lng: coordinates?.lng,
                lat: coordinates?.lat,
            });

        setMessage(error ? 'Error submitting report' : 'Report submitted! Thank you');
        
        if (!error) {
            setDescription('');
            setSubcategory([]);
            setCategory(['physical environment']);
        }
        
        setIsSubmitting(false);
    };

    return (
        <div className="sidebar">
            <div className='sidebar-title'>
                <h3>Let's Audit!</h3>
                <p>Adjust the map pin to set the location</p>
            </div>
            
            <form onSubmit={handleSubmit}>
                <p>Category: <span style={{color: 'red'}}>*</span></p>
                <div className='checkbox-group category'>
                    {categoryOptions.map(option => (
                        <label key={option.value}>
                            <input
                                type="checkbox"
                                checked={category.includes(option.value)}
                                onChange={() => handleCheckboxChange(option.value, category, setCategory)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                <p>Tick all that apply:</p>
                <div className='checkbox-group subcategory'>
                    {subcategoryOptions.map(option => (
                        <label key={option.value}>
                            <input
                                type="checkbox"
                                checked={subcategory.includes(option.value)}
                                onChange={() => handleCheckboxChange(option.value, subcategory, setSubcategory)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                <p>Detailed description:</p>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue..."
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting || !coordinates || category.length === 0}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>

                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
}
```

**What this does:** - Creates a dynamic form with checkbox groups for categories and subcategories - Implements state management for form data - Handles form submission to Supabase database - Provides user feedback during submission process - Validates required fields before submission - Resets form after successful submission

### Step 5.2: Create Form Styles

Create `src/component/ReportForm.css`:

``` css
.sidebar {
  background: #bedac0;
  color: black;
  width: 100%;
  text-align: left;
}

.sidebar-title {
  margin-bottom: 10px;
}

.sidebar select, 
.sidebar textarea {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.sidebar textarea {
  min-height: 70px;
}

.sidebar button {
  background: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.sidebar button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.checkbox-group.subcategory {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.checkbox-group.category {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 8px;
}

.message {
  margin-top: 1rem;
  color: green;
  font-weight: bold;
}
```

**What this does:** - Styles the form with a clean, professional appearance - Uses CSS Grid for subcategory layout (responsive columns) - Provides visual feedback for interactive elements - Ensures good accessibility with proper spacing and colors

------------------------------------------------------------------------

## Phase 6: Coordinate Tracking {#phase-6-coordinate-tracking}

### Step 6.1: Add Pin Visualization

Update `src/map.jsx` to include coordinate tracking:

``` jsx
// Add these event listeners inside the map initialization useEffect
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

newMap.on('idle', () => {
    const center = newMap.getCenter();
    console.log('Map idle - Center coordinates:', {
        lng: center.lng,
        lat: center.lat,
        timestamp: new Date().toISOString()
    });
    if (onPinMove) {
        onPinMove({
            lng: center.lng,
            lat: center.lat
        });
    }
});

updateCenter(); // Initial update

// Update the return cleanup
return () => {
    newMap.off('moveend', updateCenter);
    newMap.off('idle');
    newMap.remove();
};
```

### Step 6.2: Add Center Pin Visualization

Update the return statement in `src/map.jsx`:

``` jsx
return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
            ref={mapContainer}
            style={{ width: '100%', height: '100%' }}
        />

        {/* Fixed viewport center pin */}
        <div className="viewport-center-pin">
            <div className="pin-icon">📍</div>
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

**What this does:** - Tracks map center coordinates in real-time - Provides callback function to parent component - Shows visual pin at map center - Logs coordinate changes for debugging - Updates coordinates when map becomes idle (accurate for submissions)

------------------------------------------------------------------------

## Phase 7: Styling and Layout {#phase-7-styling-and-layout}

### Step 7.1: Update Main App Styles

Update `src/App.css`:

``` css
/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

h3 {
  font-size: 1.5rem;
}

p {
  font-size: 0.9rem;
}

/* Mobile-first layout */
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #bedac0;
  color: white;
  text-align: center;
  padding: 0.3rem;
  position: sticky;
  top: 0;
  z-index: 99;
}

.header-logo {
  height: 40px;
}

.header-logo:hover {
  opacity: 0.6;
}

.content-container {
  display: contents; /* Makes this div invisible in layout */
}

.body {
  background: #FFFFF5;
  flex: 1;
  overflow-y: hidden;
  padding: 0;
  position: relative;
}

.sidebar {
  background: lightsteelblue;
  color: #bedac0;
  padding: 0.5rem;
  text-align: center;
  position: sticky;
  bottom: 0;
  z-index: 98;
}

/* Desktop/landscape layout */
@media (min-width: 768px) and (orientation: landscape) {
  .app {
    display: flex;
    flex-direction: column;
  }

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
  }
}

/* Pin visualization styles */
.viewport-center-pin {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
}

.viewport-center-pin:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #dc3545;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.viewport-center-pin:after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #dc3545;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.pin-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 40px;
  transform: translate(-50%, -90%);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
  z-index: 11;
}
```

**What this does:** - Implements mobile-first responsive design - Creates flexible layout that adapts to different screen sizes - Provides visual feedback with pin styling - Uses CSS Flexbox and Grid for modern layouts - Ensures accessibility with proper contrast and spacing

------------------------------------------------------------------------

## Phase 8: Final Touches {#phase-8-final-touches}

### Step 8.1: Update Main App Component

Update `src/App.jsx` with all components:

``` jsx
import { useState } from 'react'
import './App.css'
import MapComponent from './map'
import ReportForm from './component/ReportForm'

function App() {
  const [pinLocation, setPinLocation] = useState(null); 

  return (
    <div className='app'>
      <header className="header">
        <div className='header-logo'>
          <img src='/Jalan-Logo-05.png' alt="Jalan Logo" className='header-logo'/>
        </div>
        <a href='https://www.instagram.com/kultum.co/' target='_blank' className='header-logo'>
          <img src='/Kultum-Visual-04.png' alt="Kultum Logo" className='header-logo'/>
        </a>
      </header>
      <div className='content-container'>
        <main className="body">
          <MapComponent onPinMove={setPinLocation} />
        </main>
        <nav className="sidebar">
          <ReportForm coordinates={pinLocation} />
        </nav>
      </div>
    </div>
  )
}

export default App
```

### Step 8.2: Test the Application

``` bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# Test all functionality:
# 1. Map loads with your location
# 2. Pin shows at map center
# 3. Moving map updates coordinates
# 4. Form submits to database
# 5. Form resets after successful submission
```

### Step 8.3: Build for Production

``` bash
# Build optimized production version
npm run build

# Preview production build locally
npm run preview

# The dist/ folder contains your production-ready files
```

**What this does:** - Connects all components together - Establishes data flow between map and form - Creates production-ready build - Optimizes assets for deployment

------------------------------------------------------------------------

## Key Concepts Explained

### 1. **State Management**

-   **useState**: Manages component-level state (coordinates, form data)
-   **Props**: Passes data between parent and child components
-   **Callbacks**: Enables child-to-parent communication

### 2. **Effect Hooks**

-   **useEffect**: Handles side effects (API calls, DOM manipulation)
-   **Dependencies**: Controls when effects run
-   **Cleanup**: Prevents memory leaks

### 3. **Refs**

-   **useRef**: Direct DOM access for Mapbox integration
-   **Persistent references**: Maintains object references across renders

### 4. **API Integration**

-   **Environment variables**: Secure API key management
-   **Async/await**: Modern JavaScript for API calls
-   **Error handling**: Graceful failure management

### 5. **Responsive Design**

-   **Mobile-first**: Start with mobile, enhance for desktop
-   **CSS Grid/Flexbox**: Modern layout techniques
-   **Media queries**: Adapt to different screen sizes

------------------------------------------------------------------------

## Next Steps and Enhancements

### Immediate Improvements

1.  **Error boundaries**: Better error handling
2.  **Loading states**: User feedback during operations
3.  **Offline support**: PWA capabilities
4.  **Data validation**: Client-side form validation

### Advanced Features

1.  **Authentication**: User accounts and permissions
2.  **Data visualization**: Charts and analytics
3.  **Export functionality**: Download reports as CSV/PDF
4.  **Real-time updates**: Live data synchronization
5.  **Admin panel**: Content management interface

### Performance Optimizations

1.  **Code splitting**: Lazy load components
2.  **Image optimization**: Compress and optimize assets
3.  **Caching strategies**: Improve load times
4.  **Bundle analysis**: Reduce bundle size

------------------------------------------------------------------------

## Troubleshooting

### Common Issues

**Map not loading:** - Check Mapbox access token - Verify environment variables - Check browser console for errors

**Geolocation not working:** - Ensure HTTPS in production - Check browser permissions - Test with different browsers

**Database errors:** - Verify Supabase configuration - Check table schema matches code - Review Row Level Security policies

**Styling issues:** - Clear browser cache - Check CSS specificity - Verify responsive breakpoints

------------------------------------------------------------------------

## Conclusion

You've successfully built a fully functional street audit application! This tutorial covered:

✅ **Modern development setup** with Vite and React\
✅ **Interactive mapping** with Mapbox GL JS\
✅ **Real-time coordinate tracking** and visualization\
✅ **Database integration** with Supabase\
✅ **Responsive design** for all devices\
✅ **Production-ready build** process

The application demonstrates real-world development practices including state management, API integration, responsive design, and deployment preparation. You can now extend this foundation to add more features and customize it for your specific needs.

**Happy coding! 🚀**