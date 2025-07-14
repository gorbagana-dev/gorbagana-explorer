'use client';

import { Address } from '@components/common/Address';
import { ErrorCard } from '@components/common/ErrorCard';
import { LoadingCard } from '@components/common/LoadingCard';
import { useUserDomains } from '@utils/name-service';
import React from 'react';

import { DomainInfo } from '@/app/utils/domain-info';

import { useUserANSDomains } from '../../utils/ans-domains';

export function DomainsCard({ address }: { address: string }) {
    const [domains, domainsLoading] = useUserDomains(address);
    const [domainsANS, domainsANSLoading] = useUserANSDomains(address);

    if (
        (domainsLoading && (!domains || domains.length === 0)) ||
        (domainsANSLoading && (!domainsANS || domainsANS.length === 0))
    ) {
        return <LoadingCard message="Loading domains" />;
    } else if (!domains || !domainsANS) {
        return <ErrorCard text="Failed to fetch domains" />;
    }

    if (domains.length === 0 && domainsANS.length === 0) {
        return <ErrorCard text="No domain name found" />;
    }

    let allDomains = domains;

    if (domainsANS) {
        allDomains = [...allDomains, ...domainsANS];
    }

    allDomains.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Owned Domain Names</h4>
            </div>
            <div className="card-refined-body">
                <div className="table-refined-wrapper">
                    <table className="table-refined">
                        <thead>
                            <tr>
                                <th className="table-refined-label">Domain Name</th>
                                <th className="table-refined-label">Name Service Account</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allDomains.map(domain => (
                                <RenderDomainRow key={domain.address.toBase58()} domainInfo={domain} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function RenderDomainRow({ domainInfo }: { domainInfo: DomainInfo }) {
    return (
        <tr>
            <td>{domainInfo.name}</td>
            <td>
                <Address pubkey={domainInfo.address} link />
            </td>
        </tr>
    );
}
