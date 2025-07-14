import { SolBalance } from '@components/common/SolBalance';
import { Status, useFetchSupply, useSupply } from '@providers/supply';
import React from 'react';

export function SupplyCard() {
    const supply = useSupply();
    const fetchSupply = useFetchSupply();

    // Fetch supply on load
    React.useEffect(() => {
        if (supply === Status.Idle) fetchSupply();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const isLoading = supply === Status.Idle || supply === Status.Connecting;
    const isError = typeof supply === 'string';
    const isDisconnected = supply === Status.Disconnected;

    if (isDisconnected) {
        return null; // Prevent flicker
    }

    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Supply Overview</h4>
                <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: isError ? 'var(--error)' : 'var(--primary-500)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="card-refined-body">
                {isError ? (
                    <div className="error-refined" style={{ padding: 'var(--space-md) 0' }}>
                        <p className="error-refined-message">{supply}</p>
                        <button className="btn-refined btn-refined-primary" onClick={fetchSupply}>
                            Try Again
                        </button>
                    </div>
                ) : (
                    <table className="table-refined">
                        <tbody>
                            <tr>
                                <td className="table-refined-label">Total Supply (GOR)</td>
                                <td className="table-refined-value">
                                    {isLoading ? (
                                        <div className="skeleton-refined" style={{ width: '120px', height: '20px' }}></div>
                                    ) : (
                                        <SolBalance lamports={supply.total} maximumFractionDigits={0} />
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="table-refined-label">Circulating Supply (GOR)</td>
                                <td className="table-refined-value">
                                    {isLoading ? (
                                        <div className="skeleton-refined" style={{ width: '120px', height: '20px' }}></div>
                                    ) : (
                                        <SolBalance lamports={supply.circulating} maximumFractionDigits={0} />
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="table-refined-label">Non-Circulating Supply (GOR)</td>
                                <td className="table-refined-value">
                                    {isLoading ? (
                                        <div className="skeleton-refined" style={{ width: '120px', height: '20px' }}></div>
                                    ) : (
                                        <SolBalance lamports={supply.nonCirculating} maximumFractionDigits={0} />
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
