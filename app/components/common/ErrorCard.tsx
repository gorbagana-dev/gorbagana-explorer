import React from 'react';

export function ErrorCard({
    retry,
    retryText,
    text,
    subtext,
}: {
    retry?: () => void;
    retryText?: string;
    text: string;
    subtext?: string;
}) {
    const buttonText = retryText || 'Try Again';
    return (
        <div className="card-refined error">
            <div className="error-refined">
                <svg className="error-refined-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="error-refined-title">Error</h3>
                <p className="error-refined-message">{text}</p>
                {retry && (
                    <button className="btn-refined btn-refined-primary" onClick={retry}>
                        {buttonText}
                    </button>
                )}
                {subtext && (
                    <p className="error-refined-message" style={{ marginTop: 'var(--space-md)', fontSize: '0.875rem' }}>
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );
}
