import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ✅ FIX: Add libraries={["places"]} for Autocomplete
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LoadScript 
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={["places"]}  // ← THIS IS REQUIRED for Autocomplete
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </LoadScript>
  </React.StrictMode>
);