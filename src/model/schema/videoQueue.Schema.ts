import mongoose, { Types, Schema, Document } from "mongoose";
export interface VideoQueueGraph extends Document {
  userId: Types.ObjectId;
  head?: Types.ObjectId | null;
  tail?: Types.ObjectId | null;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoQueueGraphSchema = new Schema<VideoQueueGraph>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    head: { type: Schema.Types.ObjectId, ref: "VideoNode", default: null },
    tail: { type: Schema.Types.ObjectId, ref: "VideoNode", default: null },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);
