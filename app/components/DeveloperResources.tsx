'use client';

export function DeveloperResources() {
    return (
        <div className="card-refined" style={{ marginTop: 'var(--space-xl)' }}>
            <div className="card-refined-header">
                <h4 className="card-refined-title">Developer Resources</h4>
                <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: 'var(--primary-500)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
            <div className="card-refined-body">
                <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
                    Kickstart your development journey on Gorbagana. Find more on{' '}
                    <a href="https://solana.com/developers" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)' }}>
                        solana.com/developers
                    </a>
                </p>
                <div className="grid-refined grid-refined-cols-4 grid-responsive" style={{ gap: 'var(--space-lg)' }}>
                    <ResourceCard
                        title="Setup Your Gorbagana Environment"
                        description="Get started in 5 minutes or less!"
                        image="https://solana.com/opengraph/developers/docs/intro/installation"
                        link="https://solana.com/docs/intro/installation"
                    />
                    <ResourceCard
                        title="Quick Start Guide"
                        description="Hands-on guide to the core concepts for building on Gorbagana"
                        image="https://solana.com/_next/image?url=%2Fassets%2Fdocs%2Fintro%2Fquickstart%2Fpg-not-connected.png&w=1920&q=75"
                        link="https://solana.com/docs/intro/quick-start"
                    />
                    <ResourceCard
                        title="Gorbagana Developer Bootcamp"
                        description="11 hours of video lessons on Gorbagana Development"
                        image="https://i.ytimg.com/vi/amAq-WHAFs8/maxresdefault.jpg"
                        link="https://www.youtube.com/watch?v=amAq-WHAFs8"
                    />
                    <ResourceCard
                        title="60 Days of Gorbagana"
                        description="A course designed for EVM developers to learn Gorbagana"
                        image="https://www.rareskills.io/wp-content/uploads/2024/08/og-image-rareskills.png"
                        imageBackground="white"
                        link="https://www.rareskills.io/solana-tutorial"
                    />
                </div>
            </div>
        </div>
    );
}

function ResourceCard({
    title,
    description,
    image,
    link,
    imageBackground,
}: {
    title: string;
    description: string;
    image: string;
    imageBackground?: string;
    link: string;
}) {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="card-refined card-refined-hover" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ 
                height: '120px', 
                overflow: 'hidden', 
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                backgroundColor: imageBackground || 'var(--bg-secondary)'
            }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={image}
                    alt={`${title} preview`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>
            <div className="card-refined-body">
                <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-sm)', color: 'var(--text-primary)' }}>{title}</h5>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{description}</p>
            </div>
        </a>
    );
}
