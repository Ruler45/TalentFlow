import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { makeServer } from "./api/server";

async function initializeApp() {
  console.log('Initializing app...');
  console.log('Environment:', import.meta.env.MODE);
  
  try {
    // Always initialize Mirage in both development and production
    await makeServer({
      environment: "development" // Force development mode for data seeding
    });
    console.log('Mirage server initialized successfully');
  } catch (error) {
    console.error('Error initializing Mirage server:', error);
  }

  createRoot(document.getElementById('root')).render(<App />);
}

initializeApp();
