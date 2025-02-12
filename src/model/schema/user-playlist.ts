import mongoose, { Schema, Document } from "mongoose";

export interface IPlaylist extends Document {
  userId: string;
  name: string;
  description?: string;
  videos: {
    videoId: string;
    addedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserplaylistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    videos: [
      {
        videoId: { type: Schema.Types.ObjectId, ref: "Video" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IPlaylist>("UserPlaylist", UserplaylistSchema);
