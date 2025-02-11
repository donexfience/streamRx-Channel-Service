import mongoose, { Types, Schema, Document } from "mongoose";

export interface VideoHistory extends Document {
  userId: Types.ObjectId;
  videos: {
    videoId: Types.ObjectId;
    watchedAt: Date;
    watchDuration: number;
    completedWatching: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const VideoHistorySchema = new Schema<VideoHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    videos: [
      {
        videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
        watchedAt: { type: Date, default: Date.now },
        watchDuration: { type: Number, required: true },
        completedWatching: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<VideoHistory>("VideoHistory", VideoHistorySchema);
