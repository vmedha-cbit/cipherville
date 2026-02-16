import mongoose from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String },
    background: { type: String },
    story: { type: String },
    lastCase: { type: String },
    dob: { type: String, required: true },
    articleText: { type: String },
    qrLinks: [{ type: String }],
    destructedObject: { type: String },
    objectDescription: { type: String },
    puzzleImageUrl: { type: String },
    puzzlePieces: [{
      id: String,
      x: Number,
      y: Number
    }],
    jumbledWord: { type: String },
    answer: { type: String },
    puzzleFolder: { type: String },
    routeOptions: [{
      label: String,
      content: String,
      isCorrect: Boolean
    }],
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story" }
  },
  { timestamps: true }
);

export const Officer = mongoose.model("Officer", officerSchema);
