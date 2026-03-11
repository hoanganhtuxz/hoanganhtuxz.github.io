import mongoose, { Schema, model, models } from 'mongoose';

const CvConfigSchema = new Schema(
  {
    languages: {
      type: [
        {
          code: { type: String, required: true },
          label: { type: String, required: true },
          fullName: { type: String, required: true },
        },
      ],
      default: [],
    },
    allCVData: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Prevent model re-compilation in Next.js dev hot-reload
const CvConfig = models.CvConfig || model('CvConfig', CvConfigSchema);

export default CvConfig;
