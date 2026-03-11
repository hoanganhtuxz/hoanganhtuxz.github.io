// Quick seed script - run with: node scripts/seed-db.mjs
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://tuhoang260301_db_user:Ssc3Gj0D0jv8ho5i@cluster0.9ysjuyb.mongodb.net/cv_db';

const CvConfigSchema = new mongoose.Schema({
  languages: { type: mongoose.Schema.Types.Mixed },
  allCVData: { type: mongoose.Schema.Types.Mixed },
}, { strict: false });

const CvConfig = mongoose.models.CvConfig || mongoose.model('CvConfig', CvConfigSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  const doc = await CvConfig.findOne().lean();
  console.log('Current doc keys:', doc ? Object.keys(doc) : 'NO_DOC');
  if (doc) {
    console.log('languages field:', JSON.stringify((doc).languages));
    console.log('allCVData keys:', Object.keys((doc).allCVData || {}));
  }
  await mongoose.disconnect();
}

main().catch(console.error);
