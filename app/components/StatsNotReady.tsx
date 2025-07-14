import { useCluster } from '@providers/cluster';
import { useStatsProvider } from '@providers/stats/solanaClusterStats';
import React from 'react';
import { RefreshCw } from 'react-feather';

const CLUSTER_STATS_TIMEOUT = 5000;

export function StatsNotReady({ error }: { error: boolean }) {
    const { setTimedOut, retry, active } = useStatsProvider();
    const { cluster } = useCluster();

    React.useEffect(() => {
        let timedOut: NodeJS.Timeout;
        if (!error) {
            timedOut = setTimeout(setTimedOut, CLUSTER_STATS_TIMEOUT);
        }
        return () => {
            if (timedOut) {
                clearTimeout(timedOut);
            }
        };
    }, [setTimedOut, cluster, error]);

    if (error || !active) {
        return (
            <div className="card-refined">
                <div className="card-refined-header">
                    <h4 className="card-refined-title">Live Cluster Stats</h4>
                    <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: 'var(--error)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="card-refined-body">
                    <div className="error-refined" style={{ padding: 'var(--space-lg) 0' }}>
                        <p className="error-refined-message">Unable to load cluster stats</p>
                        <button
                            className="btn-refined btn-refined-primary"
                            onClick={() => {
                                retry();
                            }}
                        >
                            <RefreshCw className="align-text-top me-2" size={13} />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Live Cluster Stats</h4>
                <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: 'var(--primary-500)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
            <div className="card-refined-body">
                <table className="table-refined">
                    <tbody>
                        <tr>
                            <td className="table-refined-label">Slot</td>
                            <td className="table-refined-value">
                                <div className="skeleton-refined skeleton-refined-text" style={{ width: '120px', marginLeft: 'auto' }}></div>
                            </td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Block height</td>
                            <td className="table-refined-value">
                                <div className="skeleton-refined skeleton-refined-text" style={{ width: '100px', marginLeft: 'auto' }}></div>
                            </td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Cluster time</td>
                            <td className="table-refined-value">
                                <div className="skeleton-refined skeleton-refined-text" style={{ width: '140px', marginLeft: 'auto' }}></div>
                            </td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Slot time (1min average)</td>
                            <td className="table-refined-value">
                                <div className="skeleton-refined skeleton-refined-text" style={{ width: '60px', marginLeft: 'auto' }}></div>
                            </td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Slot time (1hr average)</td>
                            <td className="table-refined-value">
                                <div className="skeleton-refined skeleton-refined-text" style={{ width: '60px', marginLeft: 'auto' }}></div>
                            </td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Epoch</td>
                            <td className="table-refined-value">
                                <div className="skeleton-refined skeleton-refined-text" style={{ width: '80px', marginLeft: 'auto' }}></div>
                            </td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Epoch progress</td>
                            <td className="table-refined-value">
                                <div className="skeleton-refined skeleton-refined-text" style={{ width: '50px', marginLeft: 'auto' }}></div>
                            </td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Epoch time remaining (approx.)</td>
                            <td className="table-refined-value">
                                <div className="skeleton-refined skeleton-refined-text" style={{ width: '100px', marginLeft: 'auto' }}></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
