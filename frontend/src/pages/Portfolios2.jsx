import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Preloader from "../templates/soumyajit_components/Pre.jsx";
import ModernPortfolio from "../templates/ModernPortfolio/ModernPortfolio.jsx";
import portfolioService from "../services/portfolioService";
import "../templates/soumyajit_styles.css";

const Portfolios2 = () => {
    const { slug } = useParams();
    const [load, updateLoad] = useState(true);
    const [portfolio, setPortfolio] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                updateLoad(true);
                const data = await portfolioService.getPortfolio(slug);
                setPortfolio(data);
                setError(null);
            } catch (err) {
                console.error("Failed to load portfolio:", err);
                setError("Failed to load portfolio.");
            } finally {
                // Keep preloader for at least 1.2s for effect, or just disable when data ready
                setTimeout(() => {
                    updateLoad(false);
                }, 1000);
            }
        };

        if (slug) {
            fetchPortfolio();
        }
    }, [slug]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Portfolio Not Found</h2>
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="soumyajit-portfolio">
            <Preloader load={load} />
            <div className="App" id={load ? "no-scroll" : "scroll"}>
                <ModernPortfolio portfolio={portfolio} />
            </div>
        </div>
    );
};

export default Portfolios2;
