import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'maplibre-gl/dist/maplibre-gl.css';

const savedTheme = localStorage.getItem("theme") || "auto";

const isDark = savedTheme === "dark" || (savedTheme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

document.documentElement.classList.toggle("dark", isDark);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
