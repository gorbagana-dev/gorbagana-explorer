import { Address } from '@components/common/Address';
import { SolBalance } from '@components/common/SolBalance';
import { Account } from '@providers/accounts';
import { useCluster } from '@providers/cluster';
import { addressLabel } from '@utils/tx';
import React from 'react';

export function UnknownAccountCard({ account }: { account: Account }) {
    const { cluster } = useCluster();

    const label = addressLabel(account.pubkey.toBase58(), cluster);
    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Overview</h4>
                <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: 'var(--primary-500)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="card-refined-body">
                <table className="table-refined">
                    <tbody>
                        <tr>
                            <td className="table-refined-label">Address</td>
                            <td className="table-refined-value">
                                <Address pubkey={account.pubkey} alignRight raw />
                            </td>
                        </tr>
                        {label && (
                            <tr>
                                <td className="table-refined-label">Address Label</td>
                                <td className="table-refined-value">{label}</td>
                            </tr>
                        )}
                        <tr>
                            <td className="table-refined-label">Balance (GOR)</td>
                            <td className="table-refined-value">
                                {account.lamports === 0 ? 'Account does not exist' : <SolBalance lamports={account.lamports} />}
                            </td>
                        </tr>

                        {account.space !== undefined && (
                            <tr>
                                <td className="table-refined-label">Allocated Data Size</td>
                                <td className="table-refined-value">{account.space} byte(s)</td>
                            </tr>
                        )}

                        <tr>
                            <td className="table-refined-label">Assigned Program Id</td>
                            <td className="table-refined-value">
                                <Address pubkey={account.owner} alignRight link />
                            </td>
                        </tr>

                        <tr>
                            <td className="table-refined-label">Executable</td>
                            <td className="table-refined-value">{account.executable ? 'Yes' : 'No'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
