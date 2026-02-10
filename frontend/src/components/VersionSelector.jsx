import { useState, useEffect } from 'react';
import './VersionSelector.css';

function VersionSelector({ slug, versions, selectedVersionId, currentVersionId, onSelectVersion }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getVersionBadge = (version) => {
        if (version.id === currentVersionId) {
            return <span className="version-badge badge-current">Current</span>;
        }
        if (version.version_state === 'draft') {
            return <span className="version-badge badge-draft">Draft</span>;
        }
        return <span className="version-badge badge-committed">Committed</span>;
    };

    const getRelativeTime = (timestamp) => {
        const now = new Date();
        const created = new Date(timestamp);
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    if (isMobile) {
        // Mobile: Dropdown selector
        return (
            <div className="version-selector-mobile">
                <label htmlFor="version-select">Version:</label>
                <select
                    id="version-select"
                    value={selectedVersionId || ''}
                    onChange={(e) => onSelectVersion(e.target.value)}
                    className="version-dropdown"
                >
                    {versions.map((version) => (
                        <option key={version.id} value={version.id}>
                            v{version.version_number} - {version.changes_summary}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    // Desktop: List view
    return (
        <div className="version-selector">
            <h3>Version History</h3>
            <div className="version-list">
                {versions.map((version) => (
                    <div
                        key={version.id}
                        className={`version-item ${version.id === selectedVersionId ? 'selected' : ''}`}
                        onClick={() => onSelectVersion(version.id)}
                    >
                        <div className="version-header">
                            <span className="version-number">v{version.version_number}</span>
                            {getVersionBadge(version)}
                        </div>
                        <p className="version-summary">{version.changes_summary}</p>
                        <span className="version-time">{getRelativeTime(version.created_at)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VersionSelector;
