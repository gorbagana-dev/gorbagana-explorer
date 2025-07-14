'use client';

import { Epoch } from '@components/common/Epoch';
import { Slot } from '@components/common/Slot';
import { TableCardBody } from '@components/common/TableCardBody';
import { TimestampToggle } from '@components/common/TimestampToggle';
import { LiveTransactionStatsCard } from '@components/LiveTransactionStatsCard';
import { StatsNotReady } from '@components/StatsNotReady';
import { useVoteAccounts } from '@providers/accounts/vote-accounts';
import { useCluster } from '@providers/cluster';
import { StatsProvider } from '@providers/stats';
import {
    ClusterStatsStatus,
    useDashboardInfo,
    usePerformanceInfo,
    useStatsProvider,
} from '@providers/stats/solanaClusterStats';
import { Status, SupplyProvider, useFetchSupply, useSupply } from '@providers/supply';
import { ClusterStatus } from '@utils/cluster';
import { abbreviatedNumber, lamportsToGor, slotsToHumanString } from '@utils/index';
import { percentage } from '@utils/math';
import React from 'react';

import { AdBanner } from './components/AdBanner';

export default function Page() {
    return (
        <StatsProvider>
            <SupplyProvider>
                <div className="container-refined">
                    <StakingComponent />

                    <div className="grid-refined grid-refined-cols-2">
                        <StatsCardBody />
                        <LiveTransactionStatsCard />
                    </div>
                    
                    <AdBanner />
                </div>
            </SupplyProvider>
        </StatsProvider>
    );
}

function StakingComponent() {
    const { status } = useCluster();
    const supply = useSupply();
    const fetchSupply = useFetchSupply();
    const { fetchVoteAccounts, voteAccounts } = useVoteAccounts();

    function fetchData() {
        fetchSupply();
        fetchVoteAccounts();
    }

    React.useEffect(() => {
        if (status === ClusterStatus.Connected) {
            fetchData();
        }
    }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

    const delinquentStake = React.useMemo(() => {
        if (voteAccounts) {
            return voteAccounts.delinquent.reduce((prev, current) => prev + current.activatedStake, BigInt(0));
        }
    }, [voteAccounts]);

    const activeStake = React.useMemo(() => {
        if (voteAccounts && delinquentStake) {
            return (
                voteAccounts.current.reduce((prev, current) => prev + current.activatedStake, BigInt(0)) +
                delinquentStake
            );
        }
    }, [voteAccounts, delinquentStake]);

    if (supply === Status.Disconnected) {
        // we'll return here to prevent flicker
        return null;
    }

    const isLoading = supply === Status.Idle || supply === Status.Connecting;
    const isError = typeof supply === 'string';

    if (isLoading || isError) {
        return (
            <div className="grid-refined grid-refined-cols-2" style={{ marginBottom: 'var(--space-md)' }}>
                <div className="card-refined">
                    <div className="card-refined-header">
                        <h4 className="card-refined-title">Circulating Supply</h4>
                        <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: isError ? 'var(--error)' : 'var(--primary-500)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="card-refined-body">
                        {isError ? (
                            <div className="error-refined" style={{ padding: 'var(--space-md) 0' }}>
                                <p className="error-refined-message">{supply}</p>
                                <button className="btn-refined btn-refined-primary" onClick={fetchData}>
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 'var(--space-md)' }}>
                                    <div className="skeleton-refined skeleton-refined-text-lg" style={{ width: '120px', height: '2rem', marginBottom: '4px' }}></div>
                                    <div className="skeleton-refined skeleton-refined-text" style={{ width: '160px' }}></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <div className="skeleton-refined" style={{ flex: 1, height: '8px', borderRadius: 'var(--radius-full)' }}></div>
                                    <div className="skeleton-refined skeleton-refined-text" style={{ width: '50px' }}></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="card-refined">
                    <div className="card-refined-header">
                        <h4 className="card-refined-title">Active Stake</h4>
                        <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: isError ? 'var(--error)' : 'var(--primary-500)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="card-refined-body">
                        {isError ? (
                            <div style={{ height: '4rem' }}></div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 'var(--space-md)' }}>
                                    <div className="skeleton-refined skeleton-refined-text-lg" style={{ width: '120px', height: '2rem', marginBottom: '4px' }}></div>
                                    <div className="skeleton-refined skeleton-refined-text" style={{ width: '160px' }}></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Calculate to 2dp for accuracy, then display as 1
    const circulatingPercentage = percentage(supply.circulating, supply.total, 2).toFixed(1);

    let delinquentStakePercentage;
    if (delinquentStake && activeStake) {
        delinquentStakePercentage = percentage(delinquentStake, activeStake, 2).toFixed(1);
    }

    return (
        <div className="grid-refined grid-refined-cols-2" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="card-refined">
                <div className="card-refined-header">
                    <h4 className="card-refined-title">Circulating Supply</h4>
                    <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: 'var(--primary-500)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="card-refined-body">
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-500)', marginBottom: '4px' }}>
                            {displayLamports(supply.circulating)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                            of {displayLamports(supply.total)} total supply
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <div style={{ 
                            flex: 1, 
                            height: '8px', 
                            backgroundColor: 'var(--bg-secondary)', 
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden'
                        }}>
                            <div style={{ 
                                width: `${circulatingPercentage}%`, 
                                height: '100%', 
                                backgroundColor: 'var(--primary-500)',
                                borderRadius: 'var(--radius-full)'
                            }}></div>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary-500)' }}>
                            {circulatingPercentage}%
                        </span>
                    </div>
                </div>
            </div>
            <div className="card-refined">
                <div className="card-refined-header">
                    <h4 className="card-refined-title">Active Stake</h4>
                    <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: 'var(--primary-500)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="card-refined-body">
                    {activeStake ? (
                        <>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-500)', marginBottom: '4px' }}>
                                    {displayLamports(activeStake)}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    of {displayLamports(supply.total)} total supply
                                </div>
                            </div>
                            {delinquentStakePercentage && (
                                <div style={{ 
                                    padding: 'var(--space-sm)', 
                                    backgroundColor: 'var(--warning-bg)', 
                                    border: '1px solid var(--warning-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.875rem'
                                }}>
                                    <span style={{ color: 'var(--warning)' }}>
                                        ⚠️ {delinquentStakePercentage}% delinquent
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <div className="skeleton-refined skeleton-refined-text-lg" style={{ width: '180px', height: '2rem', marginBottom: '4px' }}></div>
                                <div className="skeleton-refined skeleton-refined-text" style={{ width: '140px' }}></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function displayLamports(value: number | bigint) {
    return abbreviatedNumber(lamportsToGor(value));
}

function StatsCardBody() {
    const dashboardInfo = useDashboardInfo();
    const performanceInfo = usePerformanceInfo();
    const { setActive } = useStatsProvider();
    const { cluster } = useCluster();

    React.useEffect(() => {
        setActive(true);
        return () => setActive(false);
    }, [setActive, cluster]);

    if (performanceInfo.status !== ClusterStatsStatus.Ready || dashboardInfo.status !== ClusterStatsStatus.Ready) {
        const error =
            performanceInfo.status === ClusterStatsStatus.Error || dashboardInfo.status === ClusterStatsStatus.Error;
        return <StatsNotReady error={error} />;
    }

    const { avgSlotTime_1h, avgSlotTime_1min, epochInfo, blockTime } = dashboardInfo;
    const hourlySlotTime = Math.round(1000 * avgSlotTime_1h);
    const averageSlotTime = Math.round(1000 * avgSlotTime_1min);
    const { slotIndex, slotsInEpoch } = epochInfo;
    const epochProgress = percentage(slotIndex, slotsInEpoch, 2).toFixed(1) + '%';
    const epochTimeRemaining = slotsToHumanString(Number(slotsInEpoch - slotIndex), hourlySlotTime);
    const { blockHeight, absoluteSlot } = epochInfo;

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
                                <Slot slot={absoluteSlot} link />
                            </td>
                        </tr>
                        {blockHeight !== undefined && (
                            <tr>
                                <td className="table-refined-label">Block height</td>
                                <td className="table-refined-value">
                                    <Slot slot={blockHeight} />
                                </td>
                            </tr>
                        )}
                        {blockTime && (
                            <tr>
                                <td className="table-refined-label">Cluster time</td>
                                <td className="table-refined-value">
                                    <TimestampToggle unixTimestamp={blockTime} shorter></TimestampToggle>
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td className="table-refined-label">Slot time (1min average)</td>
                            <td className="table-refined-value">{averageSlotTime}ms</td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Slot time (1hr average)</td>
                            <td className="table-refined-value">{hourlySlotTime}ms</td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Epoch</td>
                            <td className="table-refined-value">
                                <Epoch epoch={epochInfo.epoch} link />
                            </td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Epoch progress</td>
                            <td className="table-refined-value">{epochProgress}</td>
                        </tr>
                        <tr>
                            <td className="table-refined-label">Epoch time remaining (approx.)</td>
                            <td className="table-refined-value">~{epochTimeRemaining}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
