import { useState } from 'react';
import './RevertActionBar.css';

function RevertActionBar({ versionId, versionNumber, onRevert, onBackToCurrent }) {
    const [showModal, setShowModal] = useState(false);
    const [isReverting, setIsReverting] = useState(false);

    const handleRevertClick = () => {
        setShowModal(true);
    };

    const handleConfirmRevert = async () => {
        setIsReverting(true);
        try {
            await onRevert(versionId);
        } finally {
            setIsReverting(false);
            setShowModal(false);
        }
    };

    const handleCancelRevert = () => {
        setShowModal(false);
    };

    return (
        <>
            <div className="revert-action-bar">
                <div className="revert-content">
                    <span className="revert-message">
                        📌 You are viewing an older version (v{versionNumber})
                    </span>
                    <div className="revert-actions">
                        <button
                            onClick={handleRevertClick}
                            className="btn btn-revert"
                            disabled={isReverting}
                        >
                            Revert to this version
                        </button>
                        <button
                            onClick={onBackToCurrent}
                            className="btn btn-back"
                        >
                            Back to current
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCancelRevert}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm Revert</h3>
                        <p>
                            This will revert your portfolio to version {versionNumber} and
                            <strong> delete all other versions</strong>. This action cannot be undone.
                        </p>
                        <p className="modal-warning">
                            ⚠️ All drafts and other committed versions will be permanently removed.
                        </p>
                        <div className="modal-actions">
                            <button
                                onClick={handleConfirmRevert}
                                disabled={isReverting}
                                className="btn btn-confirm-revert"
                            >
                                {isReverting ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Reverting...
                                    </>
                                ) : (
                                    'Yes, Revert'
                                )}
                            </button>
                            <button
                                onClick={handleCancelRevert}
                                disabled={isReverting}
                                className="btn btn-cancel"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default RevertActionBar;
