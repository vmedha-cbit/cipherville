import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    pdfUrl: { type: String },
    sqliteTemplateId: { type: String },
    criminalName: { type: String, required: true },
    evidenceRecords: [{ type: mongoose.Schema.Types.Mixed }],
    questions: [
      {
        prompt: { type: String, required: true },
        answer: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

export const Story = mongoose.model("Story", storySchema);
