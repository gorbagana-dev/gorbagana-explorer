import { ConfirmedSignatureInfo, TransactionError } from '@solana/web3.js';
import React from 'react';
import { RefreshCw } from 'react-feather';

export type TransactionRow = {
    slot: number;
    signature: string;
    err: TransactionError | null;
    blockTime: number | null | undefined;
    statusClass: string;
    statusText: string;
    signatureInfo: ConfirmedSignatureInfo;
};

export function HistoryCardHeader({
    title,
    refresh,
    fetching,
}: {
    title: string;
    refresh: () => void;
    fetching: boolean;
}) {
    return (
        <div className="card-refined-header">
            <h4 className="card-refined-title">{title}</h4>
            <button className="btn-refined btn-refined-secondary" disabled={fetching} onClick={() => refresh()}>
                {fetching ? (
                    <>
                        <span className="align-text-top spinner-grow spinner-grow-sm me-2"></span>
                        Loading
                    </>
                ) : (
                    <>
                        <RefreshCw className="align-text-top me-2" size={13} />
                        Refresh
                    </>
                )}
            </button>
        </div>
    );
}

export function HistoryCardFooter({
    fetching,
    foundOldest,
    loadMore,
}: {
    fetching: boolean;
    foundOldest: boolean;
    loadMore: () => void;
}) {
    return (
        <div className="card-refined-footer">
            {foundOldest ? (
                <div className="text-muted text-center">Fetched full history</div>
            ) : (
                <button className="btn-refined btn-refined-primary w-100" onClick={() => loadMore()} disabled={fetching}>
                    {fetching ? (
                        <>
                            <span className="align-text-top spinner-grow spinner-grow-sm me-2"></span>
                            Loading
                        </>
                    ) : (
                        'Load More'
                    )}
                </button>
            )}
        </div>
    );
}

export function getTransactionRows(transactions: ConfirmedSignatureInfo[]): TransactionRow[] {
    const transactionRows: TransactionRow[] = [];
    for (let i = 0; i < transactions.length; i++) {
        const slot = transactions[i].slot;
        const slotTransactions = [transactions[i]];
        while (i + 1 < transactions.length) {
            const nextSlot = transactions[i + 1].slot;
            if (nextSlot !== slot) break;
            slotTransactions.push(transactions[++i]);
        }

        for (const slotTransaction of slotTransactions) {
            let statusText;
            let statusClass;
            if (slotTransaction.err) {
                statusClass = 'warning';
                statusText = 'Failed';
            } else {
                statusClass = 'success';
                statusText = 'Success';
            }
            transactionRows.push({
                blockTime: slotTransaction.blockTime,
                err: slotTransaction.err,
                signature: slotTransaction.signature,
                signatureInfo: slotTransaction,
                slot,
                statusClass,
                statusText,
            });
        }
    }

    return transactionRows;
}
