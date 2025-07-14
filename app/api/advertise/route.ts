import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SUBMISSIONS_FILE = path.join(process.cwd(), 'advertise-submissions.json');

interface Submission {
    id: string;
    timestamp: string;
    tokenName: string;
    tokenTicker: string;
    email: string;
    website: string;
    twitter: string;
    telegram: string;
    discord: string;
    adTitle: string;
    description: string;
    duration: string;
    placement: string;
    artworkBase64: string;
}

interface SubmissionsData {
    submissions: Submission[];
}

async function ensureSubmissionsFile() {
    try {
        await fs.access(SUBMISSIONS_FILE);
    } catch {
        // File doesn't exist, create it
        const initialData: SubmissionsData = { submissions: [] };
        await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(initialData, null, 2));
    }
}

async function readSubmissions(): Promise<SubmissionsData> {
    await ensureSubmissionsFile();
    const data = await fs.readFile(SUBMISSIONS_FILE, 'utf-8');
    return JSON.parse(data);
}

async function writeSubmissions(data: SubmissionsData): Promise<void> {
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        // Get all form fields
        const tokenName = formData.get('tokenName') as string;
        const tokenTicker = formData.get('tokenTicker') as string;
        const email = formData.get('email') as string;
        const website = formData.get('website') as string || '';
        const twitter = formData.get('twitter') as string || '';
        const telegram = formData.get('telegram') as string || '';
        const discord = formData.get('discord') as string || '';
        const adTitle = formData.get('adTitle') as string;
        const description = formData.get('description') as string;
        const duration = formData.get('duration') as string;
        const placement = formData.get('placement') as string;
        
        // Handle file upload
        const artwork = formData.get('artwork') as File;
        let artworkBase64 = '';
        
        if (artwork && artwork.size > 0) {
            const bytes = await artwork.arrayBuffer();
            const buffer = Buffer.from(bytes);
            artworkBase64 = `data:${artwork.type};base64,${buffer.toString('base64')}`;
        }
        
        // Create submission object
        const submission: Submission = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            tokenName,
            tokenTicker,
            email,
            website,
            twitter,
            telegram,
            discord,
            adTitle,
            description,
            duration,
            placement,
            artworkBase64
        };
        
        // Read existing submissions
        const data = await readSubmissions();
        
        // Add new submission
        data.submissions.push(submission);
        
        // Write updated data
        await writeSubmissions(data);
        
        return NextResponse.json({
            success: true,
            message: 'Advertisement submission received successfully',
            submissionId: submission.id
        });
        
    } catch (error) {
        console.error('Error processing advertisement submission:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to process submission',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}