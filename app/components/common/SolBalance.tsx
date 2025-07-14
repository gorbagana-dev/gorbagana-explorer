import { lamportsToGorString } from '@utils/index';
import React from 'react';

export function SolBalance({
    lamports,
    maximumFractionDigits = 9,
}: {
    lamports: number | bigint;
    maximumFractionDigits?: number;
}) {
    return (
        <span>
            🗑️<span className="font-monospace">{lamportsToGorString(lamports, maximumFractionDigits)}</span>
        </span>
    );
}

export function GorBalance({
    lamports,
    maximumFractionDigits = 9,
}: {
    lamports: number | bigint;
    maximumFractionDigits?: number;
}) {
    return (
        <span>
            🗑️<span className="font-monospace">{lamportsToGorString(lamports, maximumFractionDigits)}</span>
        </span>
    );
}
