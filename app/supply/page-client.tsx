'use client';

import { SupplyCard } from '@components/SupplyCard';
import { TopAccountsCard } from '@components/TopAccountsCard';
import React from 'react';

export default function SupplyPageClient() {
    return (
        <div className="container-refined">
            <SupplyCard />
            <TopAccountsCard />
        </div>
    );
}
