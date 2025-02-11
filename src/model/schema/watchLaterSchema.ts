import mongoose, { Document, Schema, Types } from "mongoose";

interface IWatchLaterVideo {
  videoId: Types.ObjectId;
  addedAt: Date;
}

export interface IWatchLater extends Document {
  userId: Types.ObjectId;
  videos: IWatchLaterVideo[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchLaterSchema = new Schema<IWatchLater>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    videos: [
      {
        videoId: {
          type: Schema.Types.ObjectId,
          ref: "Video",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IWatchLater>("WatchLater", WatchLaterSchema);
