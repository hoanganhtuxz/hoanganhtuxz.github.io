import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { cvDataVI, cvDataEN, cvDataCN } from '@/data/cv-data';
import { defaultLanguages } from '@/contexts/language-context';


const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

export async function GET() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Return default data if file doesn't exist
      const defaultData = {
        languages: defaultLanguages,
        allCVData: {
          vi: cvDataVI,
          en: cvDataEN,
          cn: cvDataCN,
        },
        _version: 1
      };
      return NextResponse.json(defaultData);
    }

    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading CV data:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(DB_PATH, JSON.stringify(payload, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving CV data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
