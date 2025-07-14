'use client';

import { Address } from '@components/common/Address';
import { BalanceDelta } from '@components/common/BalanceDelta';
import { ErrorCard } from '@components/common/ErrorCard';
import { InfoTooltip } from '@components/common/InfoTooltip';
import { LoadingCard } from '@components/common/LoadingCard';
import { Signature } from '@components/common/Signature';
import { Slot } from '@components/common/Slot';
import { SolBalance } from '@components/common/SolBalance';
import { TableCardBody } from '@components/common/TableCardBody';
import { SignatureContext } from '@components/instruction/SignatureContext';
import { InstructionsSection } from '@components/transaction/InstructionsSection';
import { ProgramLogSection } from '@components/transaction/ProgramLogSection';
import { TokenBalancesCard } from '@components/transaction/TokenBalancesCard';
import { FetchStatus } from '@providers/cache';
import { useCluster } from '@providers/cluster';
import {
    TransactionStatusInfo,
    useFetchTransactionStatus,
    useTransactionDetails,
    useTransactionStatus,
} from '@providers/transactions';
import { useFetchTransactionDetails } from '@providers/transactions/parsed';
import { ParsedTransaction, SystemInstruction, SystemProgram, TransactionSignature } from '@solana/web3.js';
import { Cluster, ClusterStatus } from '@utils/cluster';
import { displayTimestamp } from '@utils/date';
import { SignatureProps } from '@utils/index';
import { getTransactionInstructionError } from '@utils/program-err';
import { intoTransactionInstruction } from '@utils/tx';
import { useClusterPath } from '@utils/url';
import useTabVisibility from '@utils/use-tab-visibility';
import { BigNumber } from 'bignumber.js';
import bs58 from 'bs58';
import Link from 'next/link';
import React, { Suspense, useEffect, useState } from 'react';
import { RefreshCw, Settings } from 'react-feather';

const AUTO_REFRESH_INTERVAL = 2000;
const ZERO_CONFIRMATION_BAILOUT = 5;

enum AutoRefresh {
    Active,
    Inactive,
    BailedOut,
}

type AutoRefreshProps = {
    autoRefresh: AutoRefresh;
};

type Props = Readonly<{
    params: SignatureProps;
}>;

function getTransactionErrorReason(
    info: TransactionStatusInfo,
    tx: ParsedTransaction | undefined
): { errorReason: string; errorLink?: string } {
    if (typeof info.result.err === 'string') {
        return { errorReason: `Runtime Error: "${info.result.err}"` };
    }

    const programError = getTransactionInstructionError(info.result.err);
    if (programError !== undefined) {
        return { errorReason: `Program Error: "Instruction #${programError.index + 1} Failed"` };
    }

    const { InsufficientFundsForRent } = info.result.err as { InsufficientFundsForRent?: { account_index: number } };
    if (InsufficientFundsForRent !== undefined) {
        if (tx) {
            const address = tx.message.accountKeys[InsufficientFundsForRent.account_index].pubkey;
            return { errorLink: `/address/${address}`, errorReason: `Insufficient Funds For Rent: ${address}` };
        }
        return { errorReason: `Insufficient Funds For Rent: Account #${InsufficientFundsForRent.account_index + 1}` };
    }

    return { errorReason: `Unknown Error: "${JSON.stringify(info.result.err)}"` };
}

export default function TransactionDetailsPageClient({ params: { signature: raw } }: Props) {
    let signature: TransactionSignature | undefined;

    try {
        const decoded = bs58.decode(raw);
        if (decoded.length === 64) {
            signature = raw;
        }
    } catch (err) {
        /* empty */
    }

    const status = useTransactionStatus(signature);
    const clusterStatus = useCluster().status;
    const [zeroConfirmationRetries, setZeroConfirmationRetries] = useState(0);
    const { visible: isTabVisible } = useTabVisibility();

    let autoRefresh = AutoRefresh.Inactive;
    if (!isTabVisible) {
        autoRefresh = AutoRefresh.Inactive;
    } else if (zeroConfirmationRetries >= ZERO_CONFIRMATION_BAILOUT) {
        autoRefresh = AutoRefresh.BailedOut;
    } else if (status?.data?.info && status.data.info.confirmations !== 'max') {
        autoRefresh = AutoRefresh.Active;
    }

    useEffect(() => {
        if (status?.status === FetchStatus.Fetched && status.data?.info && status.data.info.confirmations === 0) {
            setZeroConfirmationRetries(retries => retries + 1);
        }
    }, [status]);

    useEffect(() => {
        if (status?.status === FetchStatus.Fetching && autoRefresh === AutoRefresh.BailedOut) {
            setZeroConfirmationRetries(0);
        }
    }, [status, autoRefresh, setZeroConfirmationRetries]);

    return (
        <div className="container mt-n3">
            <div className="header">
                <div className="header-body">
                    <h6 className="header-pretitle">Details</h6>
                    <h2 className="header-title">Transaction</h2>
                </div>
            </div>
            {signature === undefined ? (
                <ErrorCard text={`Signature "${raw}" is not valid`} />
            ) : clusterStatus === ClusterStatus.Failure ? (
                <ErrorCard text="RPC is not responding. Please change your RPC url and try again." />
            ) : (
                <SignatureContext.Provider value={signature}>
                    <StatusCard signature={signature} autoRefresh={autoRefresh} />
                    <Suspense fallback={<LoadingCard message="Loading transaction details" />}>
                        <DetailsSection signature={signature} />
                    </Suspense>
                </SignatureContext.Provider>
            )}
        </div>
    );
}

function StatusCard({ signature, autoRefresh }: SignatureProps & AutoRefreshProps) {
    const fetchStatus = useFetchTransactionStatus();
    const status = useTransactionStatus(signature);
    const details = useTransactionDetails(signature);
    const { cluster, clusterInfo, name: clusterName, status: clusterStatus, url: clusterUrl } = useCluster();
    const inspectPath = useClusterPath({ pathname: `/tx/${signature}/inspect` });

    // Fetch transaction on load
    useEffect(() => {
        if (!status && clusterStatus === ClusterStatus.Connected) {
            fetchStatus(signature);
        }
    }, [signature, clusterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect to set and clear interval for auto-refresh
    useEffect(() => {
        if (autoRefresh === AutoRefresh.Active) {
            const intervalHandle: NodeJS.Timeout = setInterval(() => fetchStatus(signature), AUTO_REFRESH_INTERVAL);

            return () => {
                clearInterval(intervalHandle);
            };
        }
    }, [autoRefresh, fetchStatus, signature]);

    if (!status || (status.status === FetchStatus.Fetching && autoRefresh === AutoRefresh.Inactive)) {
        return <LoadingCard />;
    } else if (status.status === FetchStatus.FetchFailed) {
        return <ErrorCard retry={() => fetchStatus(signature)} text="Fetch Failed" />;
    } else if (!status.data?.info) {
        if (clusterInfo && clusterInfo.firstAvailableBlock > 0) {
            return (
                <ErrorCard
                    retry={() => fetchStatus(signature)}
                    text="Not Found"
                    subtext={`Note: Transactions processed before block ${clusterInfo.firstAvailableBlock} are not available at this time`}
                />
            );
        }
        return <ErrorCard retry={() => fetchStatus(signature)} text="Not Found" />;
    }

    const { info } = status.data;

    const transactionWithMeta = details?.data?.transactionWithMeta;
    const fee = transactionWithMeta?.meta?.fee;
    const computeUnitsConsumed = transactionWithMeta?.meta?.computeUnitsConsumed;
    const transaction = transactionWithMeta?.transaction;
    const blockhash = transaction?.message.recentBlockhash;
    const version = transactionWithMeta?.version;
    const isNonce = (() => {
        if (!transaction || transaction.message.instructions.length < 1) {
            return false;
        }

        const ix = intoTransactionInstruction(transaction, transaction.message.instructions[0]);
        return (
            ix &&
            SystemProgram.programId.equals(ix.programId) &&
            SystemInstruction.decodeInstructionType(ix) === 'AdvanceNonceAccount'
        );
    })();

    let statusClass = 'success';
    let statusText = 'Success';
    let errorReason = undefined;
    let errorLink = undefined;

    if (info.result.err) {
        statusClass = 'warning';
        statusText = 'Error';

        const err = getTransactionErrorReason(info, transaction);
        errorReason = err.errorReason;
        if (err.errorLink !== undefined) {
            if (cluster === Cluster.MainnetBeta) {
                errorLink = err.errorLink;
            } else {
                errorLink = `${err.errorLink}?cluster=${clusterName.toLowerCase()}${
                    cluster === Cluster.Custom ? `&customUrl=${clusterUrl}` : ''
                }`;
            }
        }
    }

    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Overview</h4>
                <div className="d-flex gap-2">
                    <Link className="btn-refined btn-refined-secondary" href={inspectPath}>
                        <Settings className="align-text-top me-2" size={13} />
                        Inspect
                    </Link>
                    {autoRefresh === AutoRefresh.Active ? (
                        <span className="spinner-grow spinner-grow-sm"></span>
                    ) : (
                        <button className="btn-refined btn-refined-secondary" onClick={() => fetchStatus(signature)}>
                            <RefreshCw className="align-text-top me-2" size={13} />
                            Refresh
                        </button>
                    )}
                </div>
            </div>

            <div className="card-refined-body">
                <table className="table-refined">
                    <tbody>
                        <tr>
                            <td className="table-refined-label">Signature</td>
                            <td className="table-refined-value">
                                <Signature signature={signature} alignRight />
                            </td>
                        </tr>

                        <tr>
                            <td className="table-refined-label">Result</td>
                            <td className="table-refined-value">
                                <span className="badge-refined">{statusText}</span>
                            </td>
                        </tr>

                        {errorReason !== undefined && (
                            <tr>
                                <td className="table-refined-label">Error</td>
                                <td className="table-refined-value">
                                    {errorLink !== undefined ? (
                                        <Link href={errorLink}>
                                            <span className="badge-refined">{errorReason}</span>
                                        </Link>
                                    ) : (
                                        <span className="badge-refined">{errorReason}</span>
                                    )}
                                </td>
                            </tr>
                        )}

                        <tr>
                            <td className="table-refined-label">Timestamp</td>
                            <td className="table-refined-value">
                                {info.timestamp !== 'unavailable' ? (
                                    <span className="font-monospace">{displayTimestamp(info.timestamp * 1000)}</span>
                                ) : (
                                    <InfoTooltip bottom right text="Timestamps are only available for confirmed blocks">
                                        Unavailable
                                    </InfoTooltip>
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td className="table-refined-label">Confirmation Status</td>
                            <td className="table-refined-value text-uppercase">{info.confirmationStatus || 'Unknown'}</td>
                        </tr>

                        <tr>
                            <td className="table-refined-label">Confirmations</td>
                            <td className="table-refined-value text-uppercase">{info.confirmations}</td>
                        </tr>

                        <tr>
                            <td className="table-refined-label">Slot</td>
                            <td className="table-refined-value">
                                <Slot slot={info.slot} link />
                            </td>
                        </tr>

                        {blockhash && (
                            <tr>
                                <td className="table-refined-label">
                                    {isNonce ? (
                                        'Nonce'
                                    ) : (
                                        <InfoTooltip text="Transactions use a previously confirmed blockhash as a nonce to prevent double spends">
                                            Recent Blockhash
                                        </InfoTooltip>
                                    )}
                                </td>
                                <td className="table-refined-value">{blockhash}</td>
                            </tr>
                        )}

                        {fee !== undefined && (
                            <tr>
                                <td className="table-refined-label">Fee (GOR)</td>
                                <td className="table-refined-value">
                                    <SolBalance lamports={fee} />
                                </td>
                            </tr>
                        )}

                        {computeUnitsConsumed !== undefined && (
                            <tr>
                                <td className="table-refined-label">Compute units consumed</td>
                                <td className="table-refined-value">{computeUnitsConsumed.toLocaleString('en-US')}</td>
                            </tr>
                        )}

                        {version !== undefined && (
                            <tr>
                                <td className="table-refined-label">Transaction Version</td>
                                <td className="table-refined-value text-uppercase">{version}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DetailsSection({ signature }: SignatureProps) {
    const details = useTransactionDetails(signature);
    const fetchDetails = useFetchTransactionDetails();
    const status = useTransactionStatus(signature);
    const transactionWithMeta = details?.data?.transactionWithMeta;
    const transaction = transactionWithMeta?.transaction;
    const message = transaction?.message;
    const { status: clusterStatus } = useCluster();
    const refreshDetails = () => fetchDetails(signature);

    // Fetch details on load
    useEffect(() => {
        if (!details && clusterStatus === ClusterStatus.Connected && status?.status === FetchStatus.Fetched) {
            fetchDetails(signature);
        }
    }, [signature, clusterStatus, status]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!status?.data?.info) {
        return null;
    } else if (!details || details.status === FetchStatus.Fetching) {
        return <LoadingCard />;
    } else if (details.status === FetchStatus.FetchFailed) {
        return <ErrorCard retry={refreshDetails} text="Failed to fetch details" />;
    } else if (!transactionWithMeta || !message) {
        return <ErrorCard text="Details are not available" />;
    }

    return (
        <>
            <AccountsCard signature={signature} />
            <TokenBalancesCard signature={signature} />
            <InstructionsSection signature={signature} />
            <ProgramLogSection signature={signature} />
        </>
    );
}

function AccountsCard({ signature }: SignatureProps) {
    const details = useTransactionDetails(signature);

    const transactionWithMeta = details?.data?.transactionWithMeta;
    if (!transactionWithMeta) {
        return null;
    }

    const { meta, transaction } = transactionWithMeta;
    const { message } = transaction;

    if (!meta) {
        return <ErrorCard text="Transaction metadata is missing" />;
    }

    const accountRows = message.accountKeys.map((account, index) => {
        const pre = meta.preBalances[index];
        const post = meta.postBalances[index];
        const pubkey = account.pubkey;
        const key = account.pubkey.toBase58();
        const delta = new BigNumber(post).minus(new BigNumber(pre));

        return (
            <tr key={key}>
                <td>{index + 1}</td>
                <td>
                    <Address pubkey={pubkey} link fetchTokenLabelInfo />
                </td>
                <td>
                    <BalanceDelta delta={delta} isSol />
                </td>
                <td>
                    <SolBalance lamports={post} />
                </td>
                <td>
                    {index === 0 && <span className="badge-refined me-1">Fee Payer</span>}
                    {account.signer && <span className="badge-refined me-1">Signer</span>}
                    {account.writable && <span className="badge-refined me-1">Writable</span>}
                    {message.instructions.find(ix => ix.programId.equals(pubkey)) && (
                        <span className="badge-refined me-1">Program</span>
                    )}
                    {account.source === 'lookupTable' && (
                        <span className="badge-refined me-1">Address Table Lookup</span>
                    )}
                </td>
            </tr>
        );
    });

    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Account Input(s)</h4>
            </div>
            <div className="card-refined-body">
                <div className="table-refined-wrapper">
                    <table className="table-refined">
                        <thead>
                            <tr>
                                <th className="table-refined-label">#</th>
                                <th className="table-refined-label">Address</th>
                                <th className="table-refined-label">Change (GOR)</th>
                                <th className="table-refined-label">Post Balance (GOR)</th>
                                <th className="table-refined-label">Details</th>
                            </tr>
                        </thead>
                        <tbody>{accountRows}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
