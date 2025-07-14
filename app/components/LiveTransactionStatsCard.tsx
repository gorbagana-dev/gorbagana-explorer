'use client';

import { StatsNotReady } from '@components/StatsNotReady';
import { ClusterStatsStatus, PERF_UPDATE_SEC, usePerformanceInfo } from '@providers/stats/solanaClusterStats';
import { PerformanceInfo } from '@providers/stats/solanaPerformanceInfo';
import { BarElement, CategoryScale, Chart, ChartData, ChartOptions, LinearScale, Tooltip } from 'chart.js';
import classNames from 'classnames';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import CountUp from 'react-countup';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip);

type Series = 'short' | 'medium' | 'long';
type SetSeries = (series: Series) => void;
const SERIES: Series[] = ['short', 'medium', 'long'];
const SERIES_INFO = {
    long: {
        interval: '6h',
        label: (index: number) => index * 12,
    },
    medium: {
        interval: '2h',
        label: (index: number) => index * 4,
    },
    short: {
        interval: '30m',
        label: (index: number) => index,
    },
};

export function LiveTransactionStatsCard() {
    const [series, setSeries] = React.useState<Series>('short');
    return (
        <div className="card-refined">
            <div className="card-refined-header">
                <h4 className="card-refined-title">Live Transaction Stats</h4>
                <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: 'var(--primary-500)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </div>
            <TpsCardBody series={series} setSeries={setSeries} />
        </div>
    );
}

function TpsCardBody({ series, setSeries }: { series: Series; setSeries: SetSeries }) {
    const performanceInfo = usePerformanceInfo();

    if (performanceInfo.status !== ClusterStatsStatus.Ready) {
        const isError = performanceInfo.status === ClusterStatsStatus.Error;
        return (
            <div className="card-refined-body">
                {isError ? (
                    <div className="error-refined" style={{ padding: 'var(--space-xl)' }}>
                        <svg className="error-refined-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '48px', height: '48px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="error-refined-title">Unable to Load Stats</h3>
                        <p className="error-refined-message">There was a problem loading transaction stats.</p>
                    </div>
                ) : (
                    <>
                        <table className="table-refined" style={{ marginBottom: 'var(--space-lg)' }}>
                            <tbody>
                                <tr>
                                    <td className="table-refined-label">Transaction count</td>
                                    <td className="table-refined-value">
                                        <div className="skeleton-refined skeleton-refined-text" style={{ width: '100px', marginLeft: 'auto' }}></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="table-refined-label">Transactions per second (TPS)</td>
                                    <td className="table-refined-value">
                                        <div className="skeleton-refined skeleton-refined-text" style={{ width: '80px', marginLeft: 'auto' }}></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="chart-refined">
                            <div className="chart-refined-header">
                                <span className="chart-refined-title">TPS history</span>
                                <div className="skeleton-refined" style={{ width: '200px', height: '32px', borderRadius: 'var(--radius-sm)' }}></div>
                            </div>
                            <div className="skeleton-refined" style={{ width: '100%', height: '200px', marginTop: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}></div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return <TpsBarChart performanceInfo={performanceInfo} series={series} setSeries={setSeries} />;
}

const TPS_CHART_OPTIONS = (historyMaxTps: number): ChartOptions<'bar'> => {
    return {
        animation: false,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                enabled: false, // Disable the on-canvas tooltip
                external(context) {
                    // Tooltip Element
                    let tooltipEl = document.getElementById('chartjs-tooltip');

                    // Create element on first render
                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.id = 'chartjs-tooltip';
                        tooltipEl.innerHTML = '<div class="content"></div>';
                        document.body.appendChild(tooltipEl);
                    }

                    // Hide if no tooltip
                    const tooltipModel = context.tooltip;
                    if (tooltipModel.opacity === 0) {
                        tooltipEl.style.opacity = '0';
                        return;
                    }

                    // Set caret Position
                    tooltipEl.classList.remove('above', 'below', 'no-transform');
                    if (tooltipModel.yAlign) {
                        tooltipEl.classList.add(tooltipModel.yAlign);
                    } else {
                        tooltipEl.classList.add('no-transform');
                    }

                    // Set Text
                    if (tooltipModel.body) {
                        const { label, raw } = tooltipModel.dataPoints[0];
                        const tooltipContent = tooltipEl.querySelector('div');
                        if (tooltipContent) {
                            let innerHtml = `<div class="value">${raw} TPS</div>`;
                            innerHtml += `<div class="label">${label}</div>`;
                            tooltipContent.innerHTML = innerHtml;
                        }
                    }

                    const position = context.chart.canvas.getBoundingClientRect();

                    // Display, position, and set styles for font
                    tooltipEl.style.opacity = '1';
                    tooltipEl.style.position = 'absolute';
                    tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                    tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                    tooltipEl.style.pointerEvents = 'none';
                },
                intersect: false,
            },
            legend: {
                display: false,
            },
        },
        resizeDelay: 0,
        scales: {
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                border: {
                    display: false,
                },
                min: 0,
                suggestedMax: historyMaxTps,
                ticks: {
                    count: 5,
                    display: true,
                    color: 'var(--text-secondary)',
                    font: {
                        size: 10,
                    },
                    precision: 0,
                    stepSize: 500,
                },
            },
        },
    };
};

type TpsBarChartProps = {
    performanceInfo: PerformanceInfo;
    series: Series;
    setSeries: SetSeries;
};
function TpsBarChart({ performanceInfo, series, setSeries }: TpsBarChartProps) {
    const { perfHistory, avgTps, historyMaxTps } = performanceInfo;
    const averageTps = Math.round(avgTps).toLocaleString('en-US');
    const transactionCount = <AnimatedTransactionCount info={performanceInfo} />;
    const seriesData = perfHistory[series];
    const chartOptions = React.useMemo<ChartOptions<'bar'>>(() => TPS_CHART_OPTIONS(historyMaxTps), [historyMaxTps]);

    const seriesLength = seriesData.length;
    const chartData: ChartData<'bar'> = {
        datasets: [
            {
                backgroundColor: 'var(--primary-500)',
                borderWidth: 0,
                data: seriesData.map(val => val || 0),
                hoverBackgroundColor: 'var(--primary-600)',
                borderRadius: 4,
            },
        ],
        labels: seriesData.map((val, i) => {
            return `${SERIES_INFO[series].label(seriesLength - i)}min ago`;
        }),
    };

    return (
        <div className="card-refined-body">
            <table className="table-refined" style={{ marginBottom: 'var(--space-lg)' }}>
                <tbody>
                    <tr>
                        <td className="table-refined-label">Transaction count</td>
                        <td className="table-refined-value">{transactionCount}</td>
                    </tr>
                    <tr>
                        <td className="table-refined-label">Transactions per second (TPS)</td>
                        <td className="table-refined-value">{averageTps}</td>
                    </tr>
                </tbody>
            </table>

            <div className="chart-refined">
                <div className="chart-refined-header">
                    <span className="chart-refined-title">TPS history</span>
                    <div className="tabs-refined">
                        {SERIES.map(key => (
                            <button
                                key={key}
                                onClick={() => setSeries(key)}
                                className={classNames('tab-refined', {
                                    'tab-refined-active': series === key,
                                })}
                            >
                                {SERIES_INFO[key].interval}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="chart-refined-body" style={{ height: '200px', position: 'relative' }}>
                    <Bar data={chartData} options={chartOptions} />
                </div>

                <div className="chart-refined-footer">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                        For transaction confirmation time statistics, please visit{' '}
                        <a href="https://www.validators.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-500)' }}>
                            validators.app
                        </a>{' '}
                        or{' '}
                        <a href="https://solscan.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-500)' }}>
                            solscan.io
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

function AnimatedTransactionCount({ info }: { info: PerformanceInfo }) {
    const txCountRef = React.useRef(0);
    const countUpRef = React.useRef({ lastUpdate: 0, period: 0, start: 0 });
    const countUp = countUpRef.current;

    const { transactionCount, avgTps } = info;
    const txCount = Number(transactionCount);

    // Track last tx count to reset count up options
    if (txCount !== txCountRef.current) {
        if (countUp.lastUpdate > 0) {
            // Since we overshoot below, calculate the elapsed value
            // and start from there.
            const elapsed = Date.now() - countUp.lastUpdate;
            const elapsedPeriods = elapsed / (PERF_UPDATE_SEC * 1000);
            countUp.start = Math.floor(countUp.start + elapsedPeriods * countUp.period);

            // if counter gets ahead of actual count, just hold for a bit
            // until txCount catches up (this will sometimes happen when a tab is
            // sent to the background and/or connection drops)
            countUp.period = Math.max(txCount - countUp.start, 1);
        } else {
            // Since this is the first tx count value, estimate the previous
            // tx count in order to have a starting point for our animation
            countUp.period = PERF_UPDATE_SEC * avgTps;
            countUp.start = txCount - countUp.period;
        }
        countUp.lastUpdate = Date.now();
        txCountRef.current = txCount;
    }

    // Overshoot the target tx count in case the next update is delayed
    const COUNT_PERIODS = 3;
    const countUpEnd = countUp.start + COUNT_PERIODS * countUp.period;
    return (
        <CountUp
            start={countUp.start}
            end={countUpEnd}
            duration={PERF_UPDATE_SEC * COUNT_PERIODS}
            delay={0}
            useEasing={false}
            preserveValue={true}
            separator=","
        />
    );
}
