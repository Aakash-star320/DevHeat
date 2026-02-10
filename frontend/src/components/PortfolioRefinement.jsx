import { useState, useEffect } from 'react';
import VersionSelector from './VersionSelector';
import PortfolioPreview from './PortfolioPreview';
import RefinementControls from './RefinementControls';
import RevertActionBar from './RevertActionBar';
import './PortfolioRefinement.css';

function PortfolioRefinement({ slug }) {
    // State management
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [currentVersionId, setCurrentVersionId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefining, setIsRefining] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Load versions on mount
    useEffect(() => {
        loadVersions();
    }, [slug]);

    // Load version content when selection changes
    useEffect(() => {
        if (selectedVersion?.id) {
            loadVersionContent(selectedVersion.id);
        }
    }, [selectedVersion?.id]);

    const loadVersions = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:8000/portfolio/${slug}/versions`);

            if (!response.ok) {
                throw new Error('Failed to load versions');
            }

            const data = await response.json();

            if (data.versions && data.versions.length > 0) {
                setVersions(data.versions);

                // Set the first version (latest) as current and selected
                const latestVersion = data.versions[0];
                setCurrentVersionId(latestVersion.id);
                setSelectedVersion(latestVersion);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadVersionContent = async (versionId) => {
        try {
            const response = await fetch(`http://localhost:8000/portfolio/${slug}/versions/${versionId}`);

            if (!response.ok) {
                throw new Error('Failed to load version content');
            }

            const data = await response.json();

            // Update selected version with full content
            setSelectedVersion(prev => ({
                ...prev,
                portfolio_json: data.portfolio_json
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSelectVersion = (versionId) => {
        const version = versions.find(v => v.id === versionId);
        if (version) {
            setSelectedVersion(version);
        }
    };

    const handleRefine = async (instruction) => {
        try {
            setIsRefining(true);
            setError(null);
            setSuccessMessage(null);

            const response = await fetch(`http://localhost:8000/portfolio/${slug}/refine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instruction: instruction,
                    sections: ['all']
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Refinement failed');
            }

            const data = await response.json();

            // Reload versions to get the new draft
            await loadVersions();

            setSuccessMessage('Portfolio refined successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsRefining(false);
        }
    };

    const handleConfirm = async () => {
        if (!window.confirm('Are you sure you want to confirm this portfolio? This will finalize the current version and delete all other versions.')) {
            return;
        }

        try {
            setIsConfirming(true);
            setError(null);

            const response = await fetch(`http://localhost:8000/portfolio/${slug}/confirm`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Confirmation failed');
            }

            // Reload versions after confirmation
            await loadVersions();

            setSuccessMessage('Portfolio confirmed successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleRevert = async (versionId) => {
        try {
            setError(null);

            const response = await fetch(`http://localhost:8000/portfolio/${slug}/revert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version_id: versionId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Revert failed');
            }

            // Reload versions after revert
            await loadVersions();

            setSuccessMessage('Portfolio reverted successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBackToCurrent = () => {
        const currentVersion = versions.find(v => v.id === currentVersionId);
        if (currentVersion) {
            setSelectedVersion(currentVersion);
        }
    };

    // UI state calculations
    const isCurrentVersion = selectedVersion?.id === currentVersionId;
    const showRevertBar = !isCurrentVersion && selectedVersion;

    if (isLoading) {
        return (
            <div className="refinement-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading portfolio versions...</p>
                </div>
            </div>
        );
    }

    if (!versions.length) {
        return (
            <div className="refinement-container">
                <div className="error-state">
                    <p>No portfolio versions found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="refinement-container">
            <header className="refinement-header">
                <h1>Portfolio Refinement</h1>
                <p>Review your portfolio versions and refine using AI</p>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="alert alert-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Success Banner */}
            {successMessage && (
                <div className="alert alert-success">
                    <span>✓ {successMessage}</span>
                </div>
            )}

            {/* Main Layout */}
            <div className="refinement-layout">
                <VersionSelector
                    slug={slug}
                    versions={versions}
                    selectedVersionId={selectedVersion?.id}
                    currentVersionId={currentVersionId}
                    onSelectVersion={handleSelectVersion}
                />

                <div className="preview-panel">
                    <PortfolioPreview portfolio={selectedVersion?.portfolio_json} />

                    <RefinementControls
                        isCurrentVersion={isCurrentVersion}
                        versionState={selectedVersion?.version_state}
                        onRefine={handleRefine}
                        onConfirm={handleConfirm}
                        isRefining={isRefining}
                        isConfirming={isConfirming}
                    />
                </div>
            </div>

            {/* Revert Action Bar */}
            {showRevertBar && (
                <RevertActionBar
                    versionId={selectedVersion.id}
                    versionNumber={selectedVersion.version_number}
                    onRevert={handleRevert}
                    onBackToCurrent={handleBackToCurrent}
                />
            )}
        </div>
    );
}

export default PortfolioRefinement;
