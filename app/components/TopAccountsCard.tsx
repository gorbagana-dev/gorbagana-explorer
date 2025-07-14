import { Address } from '@components/common/Address';
import { SolBalance } from '@components/common/SolBalance';
import { Status, useFetchRichList, useRichList } from '@providers/richList';
import { useSupply } from '@providers/supply';
import { AccountBalancePair } from '@solana/web3.js';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { createRef, useMemo } from 'react';
import { ChevronDown } from 'react-feather';
import useAsyncEffect from 'use-async-effect';

import { percentage } from '../utils/math';

type Filter = 'circulating' | 'nonCirculating' | 'all' | null;

export function TopAccountsCard() {
    const supply = useSupply();
    const richList = useRichList();
    const fetchRichList = useFetchRichList();
    const filter = useQueryFilter();

    if (typeof supply !== 'object') return null;

    const isDisconnected = richList === Status.Disconnected;
    const isLoading = richList === Status.Connecting || richList === Status.Idle;
    const isError = typeof richList === 'string';

    if (isDisconnected) {
        return null; // Prevent flicker
    }

    let supplyCount: bigint;
    let accounts, header;

    if (richList !== Status.Idle && typeof richList !== 'string' && richList !== Status.Connecting) {
        switch (filter) {
            case 'nonCirculating': {
                accounts = richList.nonCirculating;
                supplyCount = supply.nonCirculating;
                header = 'Non-Circulating';
                break;
            }
            case 'all': {
                accounts = richList.total;
                supplyCount = supply.total;
                header = 'Total';
                break;
            }
            case 'circulating':
            default: {
                accounts = richList.circulating;
                supplyCount = supply.circulating;
                header = 'Circulating';
                break;
            }
        }
    }

    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Largest Accounts</h4>
                <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: isError ? 'var(--error)' : 'var(--primary-500)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {!isLoading && !isError && <FilterDropdown filter={filter} />}
            </div>
            <div className="card-refined-body">
                {isError ? (
                    <div className="error-refined" style={{ padding: 'var(--space-md) 0' }}>
                        <p className="error-refined-message">{richList}</p>
                        <button className="btn-refined btn-refined-primary" onClick={fetchRichList}>
                            Try Again
                        </button>
                    </div>
                ) : isLoading ? (
                    richList === Status.Idle ? (
                        <div style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                            <button className="btn-refined btn-refined-primary" onClick={fetchRichList}>
                                Load Largest Accounts
                            </button>
                        </div>
                    ) : (
                        <div className="table-refined-wrapper">
                            <table className="table-refined">
                                <thead>
                                    <tr>
                                        <th className="table-refined-label">Rank</th>
                                        <th className="table-refined-label">Address</th>
                                        <th className="table-refined-label d-none d-md-table-cell">Balance (GOR)</th>
                                        <th className="table-refined-label d-none d-md-table-cell">% of Supply</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(10)].map((_, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="skeleton-refined" style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-full)' }}></div>
                                            </td>
                                            <td>
                                                <div className="skeleton-refined d-block d-md-none" style={{ width: '60px', height: '16px' }}></div>
                                                <div className="skeleton-refined d-none d-md-block" style={{ width: '300px', height: '16px' }}></div>
                                            </td>
                                            <td>
                                                <div className="skeleton-refined" style={{ width: '80px', height: '16px', marginLeft: 'auto' }}></div>
                                            </td>
                                            <td className="d-none d-md-table-cell">
                                                <div className="skeleton-refined" style={{ width: '50px', height: '16px', marginLeft: 'auto' }}></div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : accounts ? (
                    <div className="table-refined-wrapper">
                        <table className="table-refined">
                            <thead>
                                <tr>
                                    <th className="table-refined-label">Rank</th>
                                    <th className="table-refined-label">Address</th>
                                    <th className="table-refined-label">Balance (GOR)</th>
                                    <th className="table-refined-label d-none d-md-table-cell">% of {header} Supply</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account, index) => renderAccountRow(account, index, supplyCount))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

const renderAccountRow = (account: AccountBalancePair, index: number, supply: bigint) => {
    const formatCompactBalance = (lamports: bigint) => {
        const sol = Number(lamports) / 1e9;
        if (sol >= 1e9) return `${(sol / 1e9).toFixed(1)}B`;
        if (sol >= 1e6) return `${(sol / 1e6).toFixed(1)}M`;
        if (sol >= 1e3) return `${(sol / 1e3).toFixed(1)}K`;
        return sol.toFixed(0);
    };

    return (
        <tr key={index}>
            <td>
                <span className="badge-refined">{index + 1}</span>
            </td>
            <td>
                <Address pubkey={account.address} link truncateChars={12} />
            </td>
            <td className="table-refined-value">
                <span className="d-block d-md-none">{formatCompactBalance(BigInt(account.lamports))}</span>
                <span className="d-none d-md-block">
                    <SolBalance lamports={account.lamports} maximumFractionDigits={0} />
                </span>
            </td>
            <td className="table-refined-value d-none d-md-table-cell">{percentage(BigInt(account.lamports), supply, 4).toFixed(3) + '%'}</td>
        </tr>
    );
};

const useQueryFilter = (): Filter => {
    const currentSearchParams = useSearchParams();
    const filter = currentSearchParams?.get('filter');
    if (filter === 'circulating' || filter === 'nonCirculating' || filter === 'all') {
        return filter;
    } else {
        return null;
    }
};

const filterTitle = (filter: Filter): string => {
    switch (filter) {
        case 'nonCirculating': {
            return 'Non-Circulating';
        }
        case 'all': {
            return 'All';
        }
        case 'circulating':
        default: {
            return 'Circulating';
        }
    }
};

type DropdownProps = {
    filter: Filter;
};

const FilterDropdown = ({ filter }: DropdownProps) => {
    const FILTERS: Filter[] = ['all', null, 'nonCirculating'];
    const dropdownRef = createRef<HTMLButtonElement>();
    useAsyncEffect(
        async isMounted => {
            if (!dropdownRef.current) {
                return;
            }
            const Dropdown = (await import('bootstrap/js/dist/dropdown')).default;
            if (!isMounted || !dropdownRef.current) {
                return;
            }
            return new Dropdown(dropdownRef.current);
        },
        dropdown => {
            if (dropdown) {
                dropdown.dispose();
            }
        },
        [dropdownRef]
    );
    return (
        <div className="dropdown">
            <button className="btn-refined btn-refined-secondary" type="button" data-bs-toggle="dropdown" ref={dropdownRef}>
                {filterTitle(filter)} <ChevronDown size={13} />
            </button>
            <div className="dropdown-menu-end dropdown-menu">
                {FILTERS.map(filterOption => (
                    <FilterLink currentFilter={filter} filterOption={filterOption} key={filterOption} />
                ))}
            </div>
        </div>
    );
};

function FilterLink({ currentFilter, filterOption }: { currentFilter: Filter; filterOption: Filter }) {
    const currentPathname = usePathname();
    const currentSearchParams = useSearchParams();
    const href = useMemo(() => {
        const params = new URLSearchParams(currentSearchParams?.toString());
        if (filterOption === null) {
            params.delete('filter');
        } else {
            params.set('filter', filterOption);
        }
        const queryString = params.toString();
        return `${currentPathname}${queryString ? `?${queryString}` : ''}`;
    }, [currentPathname, currentSearchParams, filterOption]);
    return (
        <Link
            key={filterOption || 'null'}
            href={href}
            className={`dropdown-item${filterOption === currentFilter ? ' active' : ''}`}
        >
            {filterTitle(filterOption)}
        </Link>
    );
}
