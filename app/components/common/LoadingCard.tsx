import React from 'react';

export function LoadingCard({ message }: { message?: string }) {
    return (
        <div className="card-refined" style={{ minHeight: '200px' }}>
            <div className="card-refined-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
                <div className="spinner-refined" style={{ width: '32px', height: '32px', marginBottom: 'var(--space-md)' }}>
                    <div className="spinner-refined-inner" style={{ borderWidth: '3px', borderTopColor: 'var(--primary-500)' }}></div>
                </div>
                {message && (
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{message}</p>
                )}
            </div>
        </div>
    );
}
