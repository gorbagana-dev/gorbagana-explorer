import { ErrorCard } from '@components/common/ErrorCard';
import { TableCardBody } from '@components/common/TableCardBody';
import { PublicKey, VersionedMessage } from '@solana/web3.js';
import React from 'react';

import { AddressFromLookupTableWithContext, AddressWithContext } from './AddressWithContext';

export function AccountsCard({ message }: { message: VersionedMessage }) {
    const [expanded, setExpanded] = React.useState(true);

    const { validMessage, error } = React.useMemo(() => {
        const { numRequiredSignatures, numReadonlySignedAccounts, numReadonlyUnsignedAccounts } = message.header;

        if (numReadonlySignedAccounts >= numRequiredSignatures) {
            return { error: 'Invalid header', validMessage: undefined };
        } else if (numReadonlyUnsignedAccounts >= message.staticAccountKeys.length) {
            return { error: 'Invalid header', validMessage: undefined };
        } else if (message.staticAccountKeys.length === 0) {
            return { error: 'Message has no accounts', validMessage: undefined };
        }

        return {
            error: undefined,
            validMessage: message,
        };
    }, [message]);

    const { accountRows, numAccounts } = React.useMemo(() => {
        const message = validMessage;
        if (!message) return { accountRows: undefined, numAccounts: 0 };
        const staticAccountRows = message.staticAccountKeys.map((publicKey, accountIndex) => {
            const { numRequiredSignatures, numReadonlySignedAccounts, numReadonlyUnsignedAccounts } = message.header;

            let readOnly = false;
            let signer = false;
            if (accountIndex < numRequiredSignatures) {
                signer = true;
                if (accountIndex >= numRequiredSignatures - numReadonlySignedAccounts) {
                    readOnly = true;
                }
            } else if (accountIndex >= message.staticAccountKeys.length - numReadonlyUnsignedAccounts) {
                readOnly = true;
            }

            const props = {
                accountIndex,
                publicKey,
                readOnly,
                signer,
            };

            return <AccountRow key={accountIndex} {...props} />;
        });

        let accountIndex = message.staticAccountKeys.length;
        const writableLookupTableRows = message.addressTableLookups.flatMap(lookup => {
            return lookup.writableIndexes.map(lookupTableIndex => {
                const props = {
                    accountIndex,
                    lookupTableIndex,
                    lookupTableKey: lookup.accountKey,
                    readOnly: false,
                };

                accountIndex += 1;
                return <AccountFromLookupTableRow key={accountIndex} {...props} />;
            });
        });

        const readonlyLookupTableRows = message.addressTableLookups.flatMap(lookup => {
            return lookup.readonlyIndexes.map(lookupTableIndex => {
                const props = {
                    accountIndex,
                    lookupTableIndex,
                    lookupTableKey: lookup.accountKey,
                    readOnly: true,
                };

                accountIndex += 1;
                return <AccountFromLookupTableRow key={accountIndex} {...props} />;
            });
        });

        return {
            accountRows: [...staticAccountRows, ...writableLookupTableRows, ...readonlyLookupTableRows],
            numAccounts: accountIndex,
        };
    }, [validMessage]);

    if (error) {
        return <ErrorCard text={`Unable to display accounts. ${error}`} />;
    }

    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">{`Account List (${numAccounts})`}</h4>
                <button
                    className={`btn-refined ${expanded ? 'btn-refined-primary' : 'btn-refined-secondary'}`}
                    onClick={() => setExpanded(e => !e)}
                >
                    {expanded ? 'Collapse' : 'Expand'}
                </button>
            </div>
            {expanded && (
                <div className="card-refined-body">
                    <table className="table-refined">
                        <tbody>{accountRows}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function AccountFromLookupTableRow({
    accountIndex,
    lookupTableKey,
    lookupTableIndex,
    readOnly,
}: {
    accountIndex: number;
    lookupTableKey: PublicKey;
    lookupTableIndex: number;
    readOnly: boolean;
}) {
    return (
        <tr>
            <td>
                <div className="d-flex align-items-start flex-column">
                    Account #{accountIndex + 1}
                    <span className="mt-1">
                        {!readOnly && <span className="badge-refined me-1" style={{backgroundColor: 'var(--error-bg)', color: 'var(--error)'}}>Writable</span>}
                        <span className="badge-refined">Address Table Lookup</span>
                    </span>
                </div>
            </td>
            <td className="text-lg-end">
                <AddressFromLookupTableWithContext
                    lookupTableKey={lookupTableKey}
                    lookupTableIndex={lookupTableIndex}
                />
            </td>
        </tr>
    );
}

function AccountRow({
    accountIndex,
    publicKey,
    signer,
    readOnly,
}: {
    accountIndex: number;
    publicKey: PublicKey;
    signer: boolean;
    readOnly: boolean;
}) {
    return (
        <tr>
            <td>
                <div className="d-flex align-items-start flex-column">
                    Account #{accountIndex + 1}
                    <span className="mt-1">
                        {signer && <span className="badge-refined me-1">Signer</span>}
                        {!readOnly && <span className="badge-refined" style={{backgroundColor: 'var(--error-bg)', color: 'var(--error)'}}>Writable</span>}
                    </span>
                </div>
            </td>
            <td className="text-lg-end">
                <AddressWithContext pubkey={publicKey} />
            </td>
        </tr>
    );
}
