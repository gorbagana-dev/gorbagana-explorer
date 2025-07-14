import { Address } from '@components/common/Address';
import { useAddressLookupTable } from '@providers/accounts';
import { FetchStatus } from '@providers/cache';
import { PublicKey, VersionedMessage } from '@solana/web3.js';
import React from 'react';

export function AddressTableLookupsCard({ message }: { message: VersionedMessage }) {
    const [expanded, setExpanded] = React.useState(true);

    const lookupRows = React.useMemo(() => {
        let key = 0;
        return message.addressTableLookups.flatMap(lookup => {
            const indexes = [
                ...lookup.writableIndexes.map(index => ({ index, readOnly: false })),
                ...lookup.readonlyIndexes.map(index => ({ index, readOnly: true })),
            ];

            indexes.sort((a, b) => (a.index < b.index ? -1 : 1));

            return indexes.map(({ index, readOnly }) => {
                const props = {
                    lookupTableIndex: index,
                    lookupTableKey: lookup.accountKey,
                    readOnly,
                };
                return <LookupRow key={key++} {...props} />;
            });
        });
    }, [message]);

    if (message.version === 'legacy') return null;

    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Address Table Lookup(s)</h4>
                <button
                    className={`btn-refined ${expanded ? 'btn-refined-primary' : 'btn-refined-secondary'}`}
                    onClick={() => setExpanded(e => !e)}
                >
                    {expanded ? 'Collapse' : 'Expand'}
                </button>
            </div>
            {expanded && (
                <div className="card-refined-body">
                    <div className="table-refined-wrapper">
                        <table className="table-refined">
                            <thead>
                                <tr>
                                    <th className="table-refined-label">Address Lookup Table Address</th>
                                    <th className="table-refined-label">Table Index</th>
                                    <th className="table-refined-label">Resolved Address</th>
                                    <th className="table-refined-label">Details</th>
                                </tr>
                            </thead>
                            {lookupRows.length > 0 ? (
                                <tbody>{lookupRows}</tbody>
                            ) : (
                                <tbody>
                                    <tr>
                                        <td colSpan={4} style={{textAlign: 'center', padding: 'var(--space-lg)'}}>
                                            <span style={{color: 'var(--text-muted)'}}>No entries found</span>
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function LookupRow({
    lookupTableKey,
    lookupTableIndex,
    readOnly,
}: {
    lookupTableKey: PublicKey;
    lookupTableIndex: number;
    readOnly: boolean;
}) {
    const lookupTableInfo = useAddressLookupTable(lookupTableKey.toBase58());

    const loadingComponent = (
        <div className="skeleton-refined" style={{ width: '100px', height: '16px' }}></div>
    );

    let resolvedKeyComponent;
    if (!lookupTableInfo) {
        resolvedKeyComponent = loadingComponent;
    } else {
        const [lookupTable, status] = lookupTableInfo;
        if (status === FetchStatus.Fetching) {
            resolvedKeyComponent = loadingComponent;
        } else if (status === FetchStatus.FetchFailed || !lookupTable) {
            resolvedKeyComponent = <span className="text-muted">Failed to fetch Lookup Table</span>;
        } else if (typeof lookupTable === 'string') {
            resolvedKeyComponent = <span className="text-muted">Invalid Lookup Table</span>;
        } else if (lookupTableIndex >= lookupTable.state.addresses.length) {
            resolvedKeyComponent = <span className="text-muted">Invalid Lookup Table Index</span>;
        } else {
            const resolvedKey = lookupTable.state.addresses[lookupTableIndex];
            resolvedKeyComponent = <Address pubkey={resolvedKey} link />;
        }
    }

    return (
        <tr>
            <td className="text-lg-end">
                <Address pubkey={lookupTableKey} link />
            </td>
            <td className="text-lg-end">{lookupTableIndex}</td>
            <td className="text-lg-end">{resolvedKeyComponent}</td>
            <td>{!readOnly && <span className="badge-refined" style={{backgroundColor: 'var(--error-bg)', color: 'var(--error)'}}>Writable</span>}</td>
        </tr>
    );
}
