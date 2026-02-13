import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Portfolios2 from './pages/Portfolios2'
import 'bootstrap/dist/css/bootstrap.min.css'
import './templates/soumyajit_styles.css'

console.log("DEBUG: main-display.jsx is running");

const rootElement = document.getElementById('root');
console.log("DEBUG: Root element found:", rootElement);

createRoot(rootElement).render(
    <BrowserRouter>
        <Routes>
            <Route path="/display/:slug" element={<Portfolios2 />} />
        </Routes>
    </BrowserRouter>,
)
