import { TableCardBody } from '@components/common/TableCardBody';
import { useScrollAnchor } from '@providers/scroll-anchor';
import { TransactionInstruction } from '@solana/web3.js';
import React from 'react';

import getInstructionCardScrollAnchorId from '@/app/utils/get-instruction-card-scroll-anchor-id';

import { BaseRawDetails } from '../common/BaseRawDetails';
import { AddressWithContext, programValidator } from './AddressWithContext';

export function UnknownDetailsCard({
    index,
    ix,
    programName,
}: {
    index: number;
    ix: TransactionInstruction;
    programName: string;
}) {
    const [expanded, setExpanded] = React.useState(false);

    const scrollAnchorRef = useScrollAnchor(getInstructionCardScrollAnchorId([index + 1]));

    return (
        <div className="card-refined" ref={scrollAnchorRef}>
            <div className="card-refined-header">
                <h4 className="card-refined-title d-flex align-items-center">
                    <span className="badge-refined me-2">#{index + 1}</span>
                    {programName} Instruction
                </h4>

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
                        <tbody>
                            <tr>
                                <td className="table-refined-label">Program</td>
                                <td className="table-refined-value">
                                    <AddressWithContext pubkey={ix.programId} validator={programValidator} />
                                </td>
                            </tr>
                            <BaseRawDetails ix={ix} />
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
