'use client';

import Link from 'next/link';
import React from 'react';

export function AdBanner() {
    return (
        <div className="card-refined promo-card">
            <div className="promo-pattern"></div>
            <div className="promo-content">
                <div className="promo-main">
                    <h3 className="promo-title">Advertise on Gorbagana Explorer</h3>
                    <p className="promo-subtitle">Reach thousands of blockchain enthusiasts and developers</p>
                    <div className="promo-prices">
                        <div className="promo-price-item">
                            <span className="promo-amount">$199</span>
                            <span className="promo-duration">/8hrs</span>
                        </div>
                        <span className="promo-separator">•</span>
                        <div className="promo-price-item">
                            <span className="promo-amount">$299</span>
                            <span className="promo-duration">/12hrs</span>
                        </div>
                        <span className="promo-separator">•</span>
                        <div className="promo-price-item">
                            <span className="promo-amount">$399</span>
                            <span className="promo-duration">/24hrs</span>
                        </div>
                    </div>
                </div>
                
                <div className="promo-features">
                    <div className="promo-feature-item">
                        <svg className="promo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>High Visibility</span>
                    </div>
                    <div className="promo-feature-item">
                        <svg className="promo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Instant Setup</span>
                    </div>
                    <div className="promo-feature-item">
                        <svg className="promo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Analytics</span>
                    </div>
                </div>
                
                <Link href="/advertise" className="promo-cta-button">
                    <span>Get Started</span>
                    <svg className="promo-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}