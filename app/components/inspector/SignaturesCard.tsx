import { Address } from '@components/common/Address';
import { Signature } from '@components/common/Signature';
import { PublicKey, VersionedMessage } from '@solana/web3.js';
import bs58 from 'bs58';
import React from 'react';
import * as nacl from 'tweetnacl';

export function TransactionSignatures({
    signatures,
    message,
    rawMessage,
}: {
    signatures: (string | null)[];
    message: VersionedMessage;
    rawMessage: Uint8Array;
}) {
    const signatureRows = React.useMemo(() => {
        return signatures.map((signature, index) => {
            const publicKey = message.staticAccountKeys[index];

            let verified;
            if (signature) {
                const key = publicKey.toBytes();
                const rawSignature = bs58.decode(signature);
                verified = verifySignature({
                    key,
                    message: rawMessage,
                    signature: rawSignature,
                });
            }

            const props = {
                index,
                signature,
                signer: publicKey,
                verified,
            };

            return <SignatureRow key={publicKey.toBase58()} {...props} />;
        });
    }, [signatures, message, rawMessage]);

    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Signatures</h4>
            </div>
            <div className="card-refined-body">
                <div className="table-refined-wrapper">
                    <table className="table-refined">
                        <thead>
                            <tr>
                                <th className="table-refined-label">#</th>
                                <th className="table-refined-label">Signature</th>
                                <th className="table-refined-label">Signer</th>
                                <th className="table-refined-label">Validity</th>
                                <th className="table-refined-label">Details</th>
                            </tr>
                        </thead>
                        <tbody>{signatureRows}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function verifySignature({
    message,
    signature,
    key,
}: {
    message: Uint8Array;
    signature: Uint8Array;
    key: Uint8Array;
}): boolean {
    return nacl.sign.detached.verify(message, signature, key);
}

function SignatureRow({
    signature,
    signer,
    verified,
    index,
}: {
    signature: string | null;
    signer: PublicKey;
    verified?: boolean;
    index: number;
}) {
    return (
        <tr>
            <td>
                <span className="badge-refined">{index + 1}</span>
            </td>
            <td>{signature ? <Signature signature={signature} truncateChars={40} /> : 'Missing Signature'}</td>
            <td>
                <Address pubkey={signer} link />
            </td>
            <td>
                {verified === undefined ? (
                    'N/A'
                ) : verified ? (
                    <span className="badge-refined" style={{backgroundColor: 'var(--success-bg)', color: 'var(--success)'}}>Valid</span>
                ) : (
                    <span className="badge-refined" style={{backgroundColor: 'var(--warning-bg)', color: 'var(--warning)'}}>Invalid</span>
                )}
            </td>
            <td>{index === 0 && <span className="badge-refined">Fee Payer</span>}</td>
        </tr>
    );
}
