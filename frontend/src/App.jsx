import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import GeneratePortfolio from './pages/GeneratePortfolio';
import RefinePortfolio from './pages/RefinePortfolio';
import ViewPortfolio from './pages/ViewPortfolio';
import MyPortfolios from './pages/MyPortfolios';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './context/AuthContext';



export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/generate" element={<GeneratePortfolio />} />
                <Route path="/my-portfolios" element={<MyPortfolios />} />
                <Route path="/view/:slug" element={<ViewPortfolio />} />
                <Route path="/refine/:slug" element={<RefinePortfolio />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
        </AuthProvider>
    );
}
