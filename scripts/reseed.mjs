/**
 * Re-seed MongoDB with correct data from database.json
 * Run: node scripts/reseed.mjs
 */
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONGODB_URI = 'mongodb+srv://tuhoang260301_db_user:Ssc3Gj0D0jv8ho5i@cluster0.9ysjuyb.mongodb.net/cv_db';

const CvConfigSchema = new mongoose.Schema({
  languages: { type: mongoose.Schema.Types.Mixed },
  allCVData: { type: mongoose.Schema.Types.Mixed },
}, { strict: false });

const CvConfig = mongoose.models.CvConfig || mongoose.model('CvConfig', CvConfigSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Read the source of truth JSON file
  const dbPath = join(__dirname, '..', 'data', 'database.json');
  const rawData = readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(rawData);

  // Delete existing document and re-create with correct data
  await CvConfig.deleteMany({});
  await CvConfig.create({
    languages: data.languages,
    allCVData: data.allCVData,
  });

  console.log('✅ MongoDB re-seeded successfully!');
  console.log('Languages:', data.languages.map(l => l.code).join(', '));
  console.log('CV Data keys:', Object.keys(data.allCVData).join(', '));
  console.log('Sample name (vi):', data.allCVData.vi.personal.name);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
