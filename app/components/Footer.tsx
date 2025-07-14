import React from 'react';

export function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer-refined">
            <div className="container-refined">
                <div className="footer-content">
                    <div className="footer-links">
                        <a href="https://faucet.gorbagana.wtf" target="_blank" rel="noopener noreferrer" className="footer-link">
                            Faucet
                        </a>
                        <span className="footer-divider">•</span>
                        <a href="https://status.gorbagana.wtf" target="_blank" rel="noopener noreferrer" className="footer-link">
                            Status
                        </a>
                    </div>
                    <div className="footer-copyright">
                        © {currentYear} Gorbagana Network. All rights reserved.
                    </div>
                    <div className="footer-cli">
                        Served by <a href="https://v1.cliapp.ai" target="_blank" rel="noopener noreferrer" className="footer-cli-link">CLI</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}