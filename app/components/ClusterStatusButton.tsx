'use client';

import { useCluster, useClusterModal } from '@providers/cluster';
import { Cluster, ClusterStatus } from '@utils/cluster';
import React, { useCallback } from 'react';
import { AlertCircle, CheckCircle } from 'react-feather';

function getCustomUrlClusterName(customUrl: string) {
    try {
        const url = new URL(customUrl);
        if (url.hostname === 'localhost') {
            return customUrl;
        }
        return `${url.protocol}//${url.hostname}`;
    } catch (e) {
        return customUrl;
    }
}

export const ClusterStatusButton = () => {
    const { status, cluster, name, customUrl } = useCluster();
    const [, setShow] = useClusterModal();

    const onClickHandler = useCallback(() => setShow(true), [setShow]);
    const statusName = cluster !== Cluster.Custom ? `${name}` : getCustomUrlClusterName(customUrl);

    const getStatusClass = () => {
        switch (status) {
            case ClusterStatus.Connected:
                return 'cluster-status-refined cluster-status-refined-success';
            case ClusterStatus.Connecting:
                return 'cluster-status-refined cluster-status-refined-warning';
            case ClusterStatus.Failure:
                return 'cluster-status-refined cluster-status-refined-danger';
        }
    };

    const renderStatusIcon = () => {
        switch (status) {
            case ClusterStatus.Connected:
                return <CheckCircle size={15} />;
            case ClusterStatus.Connecting:
                return (
                    <div className="spinner-refined" role="status" aria-hidden="true">
                        <div className="spinner-refined-inner"></div>
                    </div>
                );
            case ClusterStatus.Failure:
                return <AlertCircle size={15} />;
        }
    };

    return (
        <button className={getStatusClass()} onClick={onClickHandler} title={statusName}>
            {renderStatusIcon()}
            <span className="d-none d-xl-inline">{statusName}</span>
        </button>
    );
};
