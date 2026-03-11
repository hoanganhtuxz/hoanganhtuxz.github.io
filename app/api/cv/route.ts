import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CvConfig from '@/lib/models/cv.model';
import { cvDataVI, cvDataEN, cvDataCN } from '@/data/cv-data';
import { defaultLanguages } from '@/contexts/language-context';

const defaultData = {
  languages: defaultLanguages,
  allCVData: {
    vi: cvDataVI,
    en: cvDataEN,
    cn: cvDataCN,
  },
};

export async function GET() {
  try {
    await connectDB();

    let doc = await CvConfig.findOne().lean<{
      languages?: typeof defaultLanguages;
      allCVData?: Record<string, unknown>;
    }>();

    if (!doc) {
      // Seed initial data on first run — re-fetch as lean after creation
      await CvConfig.create(defaultData);
      doc = await CvConfig.findOne().lean();
    }

    const languages = (doc as any)?.languages?.length
      ? (doc as any).languages
      : defaultData.languages;

    const allCVData = (doc as any)?.allCVData ?? defaultData.allCVData;

    return NextResponse.json({ languages, allCVData });
  } catch (error) {
    console.error('Error reading CV data from MongoDB:', error);
    // Fallback to default data if DB is unreachable
    return NextResponse.json(defaultData);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    await connectDB();

    await CvConfig.findOneAndUpdate(
      {},
      {
        $set: {
          languages: payload.languages,
          allCVData: payload.allCVData,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving CV data to MongoDB:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
