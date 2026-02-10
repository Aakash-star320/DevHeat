import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import GeneratePortfolio from './pages/GeneratePortfolio';
import RefinePortfolio from './pages/RefinePortfolio';
import ViewPortfolio from './pages/ViewPortfolio';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/generate" element={<GeneratePortfolio />} />
            <Route path="/portfolio/:slug" element={<ViewPortfolio />} />
            <Route path="/refine/:slug" element={<RefinePortfolio />} />
        </Routes>
    );
}
