'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function AdvertisePage() {
    const [formData, setFormData] = useState({
        tokenName: '',
        tokenTicker: '',
        email: '',
        website: '',
        twitter: '',
        telegram: '',
        discord: '',
        adTitle: '',
        description: '',
        duration: '8hours',
        placement: 'standard',
        artwork: null as File | null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Check file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size must be less than 2MB');
                e.target.value = '';
                return;
            }
            
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (PNG, JPG, etc.)');
                e.target.value = '';
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                artwork: file
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const formDataToSend = new FormData();
            
            // Add all form fields
            formDataToSend.append('tokenName', formData.tokenName);
            formDataToSend.append('tokenTicker', formData.tokenTicker);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('website', formData.website);
            formDataToSend.append('twitter', formData.twitter);
            formDataToSend.append('telegram', formData.telegram);
            formDataToSend.append('discord', formData.discord);
            formDataToSend.append('adTitle', formData.adTitle);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('duration', formData.duration);
            formDataToSend.append('placement', formData.placement);
            
            // Add file if present
            if (formData.artwork) {
                formDataToSend.append('artwork', formData.artwork);
            }
            
            const response = await fetch('/api/advertise', {
                method: 'POST',
                body: formDataToSend,
            });
            
            const result = await response.json();
            
            if (result.success) {
                setSubmitSuccess(true);
            } else {
                alert('Error: ' + (result.message || 'Failed to submit'));
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit advertisement. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="container-refined" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: 'var(--space-3xl)' }}>
                <div className="card-refined" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <svg 
                        className="error-refined-icon" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        style={{ width: '64px', height: '64px', color: 'var(--success)', margin: '0 auto var(--space-lg)' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>Submission Received!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
                        Thank you for your interest in advertising on Gorbagana Explorer. 
                        We\'ll review your submission and contact you within 24 hours.
                    </p>
                    <Link href="/" className="btn-refined btn-refined-primary">
                        Back to Explorer
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container-refined" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="ad-form-header">
                <Link href="/" className="ad-form-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Explorer
                </Link>
                <h1 className="ad-form-title">Advertise on Gorbagana Explorer</h1>
                <p className="ad-form-subtitle">
                    Reach thousands of blockchain enthusiasts and developers with targeted advertisements
                </p>
            </div>

            <div className="ad-form-pricing-cards">
                <div className="ad-pricing-card">
                    <h3 className="ad-pricing-title">8 Hour Boost</h3>
                    <div className="ad-pricing-price">
                        <span className="ad-pricing-value">$199</span>
                        <span className="ad-pricing-period">/8 hours</span>
                    </div>
                    <ul className="ad-pricing-features">
                        <li>8 hours of exposure</li>
                        <li>Homepage placement</li>
                        <li>Basic analytics</li>
                        <li>Perfect for launches</li>
                    </ul>
                </div>
                <div className="ad-pricing-card ad-pricing-card-featured">
                    <div className="ad-pricing-badge">Most Popular</div>
                    <h3 className="ad-pricing-title">12 Hour Campaign</h3>
                    <div className="ad-pricing-price">
                        <span className="ad-pricing-value">$299</span>
                        <span className="ad-pricing-period">/12 hours</span>
                    </div>
                    <ul className="ad-pricing-features">
                        <li>12 hours of exposure</li>
                        <li>Premium placement</li>
                        <li>Detailed analytics</li>
                        <li>1 creative update</li>
                        <li>Priority support</li>
                    </ul>
                </div>
                <div className="ad-pricing-card">
                    <h3 className="ad-pricing-title">24 Hour Spotlight</h3>
                    <div className="ad-pricing-price">
                        <span className="ad-pricing-value">$399</span>
                        <span className="ad-pricing-period">/24 hours</span>
                    </div>
                    <ul className="ad-pricing-features">
                        <li>Full day exposure</li>
                        <li>Premium placement</li>
                        <li>Advanced analytics</li>
                        <li>2 creative updates</li>
                        <li>Priority support</li>
                    </ul>
                </div>
            </div>
            
            <div className="ad-pricing-custom">
                <div className="ad-pricing-card ad-pricing-card-custom">
                    <h3 className="ad-pricing-title">Enterprise & Custom Deals</h3>
                    <p className="ad-pricing-custom-description">
                        Need longer exposure or multiple campaigns? We offer custom packages for enterprise clients and special promotions.
                    </p>
                    <div className="ad-pricing-custom-features">
                        <div className="ad-pricing-custom-feature">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Extended campaigns (48hrs+)</span>
                        </div>
                        <div className="ad-pricing-custom-feature">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Bundle packages</span>
                        </div>
                        <div className="ad-pricing-custom-feature">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Recurring campaigns</span>
                        </div>
                        <div className="ad-pricing-custom-feature">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Dedicated account manager</span>
                        </div>
                    </div>
                    <a href="mailto:team@cli.support?subject=Custom%20Advertising%20Inquiry" className="btn-refined btn-refined-secondary" style={{ marginTop: 'var(--space-lg)', display: 'inline-block' }}>
                        Contact for Custom Quote
                    </a>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="ad-form">
                <div className="ad-form-section">
                    <h3 className="ad-form-section-title">Token Information</h3>
                    <div className="ad-form-grid">
                        <div className="ad-form-group">
                            <label htmlFor="tokenName">Token Name *</label>
                            <input
                                type="text"
                                id="tokenName"
                                name="tokenName"
                                value={formData.tokenName}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., Gorbagana"
                                className="ad-form-input"
                            />
                        </div>
                        <div className="ad-form-group">
                            <label htmlFor="tokenTicker">Token Ticker *</label>
                            <input
                                type="text"
                                id="tokenTicker"
                                name="tokenTicker"
                                value={formData.tokenTicker}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., GOR"
                                className="ad-form-input"
                            />
                        </div>
                        <div className="ad-form-group">
                            <label htmlFor="email">Contact Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="ad-form-input"
                            />
                        </div>
                        <div className="ad-form-group">
                            <label htmlFor="website">Website URL</label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                placeholder="https://"
                                className="ad-form-input"
                            />
                        </div>
                    </div>
                    
                    <h4 className="ad-form-section-subtitle">Social Media</h4>
                    <div className="ad-form-grid">
                        <div className="ad-form-group">
                            <label htmlFor="twitter">Twitter/X</label>
                            <input
                                type="text"
                                id="twitter"
                                name="twitter"
                                value={formData.twitter}
                                onChange={handleInputChange}
                                placeholder="@username or URL"
                                className="ad-form-input"
                            />
                        </div>
                        <div className="ad-form-group">
                            <label htmlFor="telegram">Telegram</label>
                            <input
                                type="text"
                                id="telegram"
                                name="telegram"
                                value={formData.telegram}
                                onChange={handleInputChange}
                                placeholder="t.me/groupname"
                                className="ad-form-input"
                            />
                        </div>
                        <div className="ad-form-group">
                            <label htmlFor="discord">Discord</label>
                            <input
                                type="text"
                                id="discord"
                                name="discord"
                                value={formData.discord}
                                onChange={handleInputChange}
                                placeholder="Discord invite link"
                                className="ad-form-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="ad-form-section">
                    <h3 className="ad-form-section-title">Advertisement Details</h3>
                    <div className="ad-form-group">
                        <label htmlFor="adTitle">Ad Title *</label>
                        <input
                            type="text"
                            id="adTitle"
                            name="adTitle"
                            value={formData.adTitle}
                            onChange={handleInputChange}
                            required
                            maxLength={60}
                            className="ad-form-input"
                        />
                        <small className="ad-form-hint">{formData.adTitle.length}/60 characters</small>
                    </div>
                    <div className="ad-form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            maxLength={300}
                            className="ad-form-input"
                        />
                        <small className="ad-form-hint">{formData.description.length}/300 characters</small>
                    </div>
                    <div className="ad-form-group">
                        <label htmlFor="artwork">Upload Artwork *</label>
                        <div className="ad-form-upload">
                            <input
                                type="file"
                                id="artwork"
                                name="artwork"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                                className="ad-form-upload-input"
                            />
                            <label htmlFor="artwork" className="ad-form-upload-label">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {formData.artwork ? formData.artwork.name : 'Choose file or drag here'}
                            </label>
                        </div>
                        <small className="ad-form-hint">Recommended: 1200x300px, PNG or JPG, max 2MB</small>
                    </div>
                </div>

                <div className="ad-form-section">
                    <h3 className="ad-form-section-title">Campaign Settings</h3>
                    <div className="ad-form-grid">
                        <div className="ad-form-group">
                            <label htmlFor="duration">Duration *</label>
                            <select
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                                className="ad-form-input"
                            >
                                <option value="8hours">8 Hours ($199)</option>
                                <option value="12hours">12 Hours ($299)</option>
                                <option value="24hours">24 Hours ($399)</option>
                                <option value="custom">Custom Duration</option>
                            </select>
                        </div>
                        <div className="ad-form-group">
                            <label htmlFor="placement">Placement Type *</label>
                            <select
                                id="placement"
                                name="placement"
                                value={formData.placement}
                                onChange={handleInputChange}
                                required
                                className="ad-form-input"
                            >
                                <option value="standard">Standard Banner</option>
                                <option value="premium">Premium Banner</option>
                                <option value="sidebar">Sidebar Ad</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="ad-form-actions">
                    <button 
                        type="submit" 
                        className="btn-refined btn-refined-primary"
                        disabled={isSubmitting}
                        style={{ minWidth: '200px' }}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner-refined" style={{ width: '16px', height: '16px', marginRight: 'var(--space-xs)' }}>
                                    <div className="spinner-refined-inner" style={{ borderWidth: '2px' }}></div>
                                </div>
                                Submitting...
                            </>
                        ) : (
                            'Submit Advertisement'
                        )}
                    </button>
                    <p className="ad-form-disclaimer">
                        By submitting, you agree to our advertising terms and conditions. 
                        All advertisements are subject to review and approval.
                    </p>
                </div>
            </form>
        </div>
    );
}