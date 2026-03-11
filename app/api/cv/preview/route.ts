import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CvConfig from '@/lib/models/cv.model';
import { cvDataVI, cvDataEN, cvDataCN } from '@/data/cv-data';
import { defaultLanguages } from '@/contexts/language-context';

// In-memory draft store — lives only in the Node.js process, never touches MongoDB
let draftStore: { languages?: any[]; allCVData?: Record<string, any> } | null = null;

const defaultData = {
  languages: defaultLanguages,
  allCVData: { vi: cvDataVI, en: cvDataEN, cn: cvDataCN },
};

// GET /api/cv/preview — returns draft if exists, otherwise live DB data
export async function GET() {
  try {
    if (draftStore) {
      return NextResponse.json(draftStore);
    }
    // Fallback: fetch from MongoDB
    await connectDB();
    const doc = await CvConfig.findOne().lean<{ languages?: any[]; allCVData?: any }>();
    const languages = (doc as any)?.languages?.length ? (doc as any).languages : defaultData.languages;
    const allCVData = (doc as any)?.allCVData ?? defaultData.allCVData;
    return NextResponse.json({ languages, allCVData });
  } catch {
    return NextResponse.json(defaultData);
  }
}

// POST /api/cv/preview — store draft in memory (not saved to DB)
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    draftStore = payload;
    return NextResponse.json({ success: true, message: 'Draft saved in preview store' });
  } catch {
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

// DELETE /api/cv/preview — clear draft (called after real Save)
export async function DELETE() {
  draftStore = null;
  return NextResponse.json({ success: true });
}
