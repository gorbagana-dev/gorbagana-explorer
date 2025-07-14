'use client';

import { useCluster, useClusterModal, useUpdateCustomUrl } from '@providers/cluster';
import { useDebounceCallback } from '@react-hook/debounce';
import { ClusterStatus } from '@utils/cluster';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { Overlay } from './common/Overlay';

const ClusterModalDeveloperSettings = dynamic(() => import('./ClusterModalDeveloperSettings'), { ssr: false });

export function ClusterModal() {
    const [show, setShow] = useClusterModal();
    const onClose = () => setShow(false);

    return (
        <>
            <div className={`offcanvas offcanvas-end${show ? ' show' : ''}`}>
                <div className="modal-body" onClick={e => e.stopPropagation()}>
                    <span className="c-pointer" onClick={onClose}>
                        &times;
                    </span>

                    <h2 className="text-center mb-4 mt-4">Network Settings</h2>
                    <ClusterToggle />
                    <ClusterModalDeveloperSettings />
                </div>
            </div>

            <div onClick={onClose}>
                <Overlay show={show} />
            </div>
        </>
    );
}

type InputProps = { activeSuffix: string; active: boolean };
function CustomClusterInput({ activeSuffix, active }: InputProps) {
    const { customUrl } = useCluster();
    const updateCustomUrl = useUpdateCustomUrl();
    const [editing, setEditing] = React.useState(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const btnClass = active ? `border-${activeSuffix} text-${activeSuffix}` : 'btn-white';

    const onUrlInput = useDebounceCallback((url: string) => {
        updateCustomUrl(url);
        if (url.length > 0) {
            const nextSearchParams = new URLSearchParams(searchParams?.toString());
            nextSearchParams.set('customUrl', url);
            const nextQueryString = nextSearchParams.toString();
            router.push(`${pathname}${nextQueryString ? `?${nextQueryString}` : ''}`);
        }
    }, 500);

    const inputTextClass = editing ? '' : 'text-muted';
    return (
        <>
            <Link
                className={`btn col-12 mb-3 ${btnClass}`}
                href={{ query: { cluster: 'custom', ...(customUrl.length > 0 ? { customUrl } : null) } }}
            >
                Gorbagana Devnet
            </Link>
            {active && (
                <input
                    type="url"
                    defaultValue={customUrl}
                    className={`form-control ${inputTextClass}`}
                    onFocus={() => setEditing(true)}
                    onBlur={() => setEditing(false)}
                    onInput={e => onUrlInput(e.currentTarget.value)}
                />
            )}
        </>
    );
}

function assertUnreachable(_x: never): never {
    throw new Error('Unreachable!');
}

function ClusterToggle() {
    const { status } = useCluster();

    let activeSuffix = '';
    switch (status) {
        case ClusterStatus.Connected:
            activeSuffix = 'primary';
            break;
        case ClusterStatus.Connecting:
            activeSuffix = 'warning';
            break;
        case ClusterStatus.Failure:
            activeSuffix = 'danger';
            break;
        default:
            assertUnreachable(status);
    }
    return (
        <div className="btn-group-toggle d-flex flex-wrap mb-4">
            <CustomClusterInput activeSuffix={activeSuffix} active={true} />
        </div>
    );
}
