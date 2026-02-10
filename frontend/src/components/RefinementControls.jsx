import { useState } from 'react';
import './RefinementControls.css';

function RefinementControls({ isCurrentVersion, versionState, onRefine, onConfirm, isRefining, isConfirming }) {
    const [instruction, setInstruction] = useState('');

    const handleRefine = () => {
        if (instruction.trim()) {
            onRefine(instruction);
            setInstruction('');
        }
    };

    const showConfirmButton = isCurrentVersion && versionState === 'draft';

    return (
        <div className="refinement-controls">
            {/* AI Refinement Section */}
            <div className="refinement-section">
                <h3>AI Refinement</h3>
                <p className="section-description">
                    {isCurrentVersion
                        ? 'Provide instructions to refine your portfolio using AI'
                        : 'Switch to the current version to refine your portfolio'}
                </p>
                <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="e.g., Make it more concise and emphasize backend skills"
                    rows={4}
                    disabled={!isCurrentVersion || isRefining}
                    className="instruction-input"
                />
                <button
                    onClick={handleRefine}
                    disabled={!isCurrentVersion || isRefining || !instruction.trim()}
                    className="btn btn-refine"
                >
                    {isRefining ? (
                        <>
                            <span className="spinner-small"></span>
                            Refining...
                        </>
                    ) : (
                        'Refine Portfolio'
                    )}
                </button>
            </div>

            {/* Confirm Section */}
            {showConfirmButton && (
                <div className="confirm-section">
                    <button
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className="btn btn-confirm"
                    >
                        {isConfirming ? (
                            <>
                                <span className="spinner-small"></span>
                                Confirming...
                            </>
                        ) : (
                            'Confirm Portfolio'
                        )}
                    </button>
                    <p className="confirm-note">
                        ⚠️ Confirming will finalize this version and delete all other versions
                    </p>
                </div>
            )}
        </div>
    );
}

export default RefinementControls;
