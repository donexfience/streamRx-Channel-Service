import mongoose, { Document, Schema } from "mongoose";

export interface Video extends Document {
  channelId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  presignedUrl?: string;
  presignedUrlExpiry?: Date;
  status: "pending" | "processing" | "ready" | "failed";
  processingProgress: number;
  s3Key:string;
  processingError?: string;
  metadata?: {
    originalFileName: string;
    mimeType: string;
    codec: string;
    fps: number;
    duration: number;
  };
  quality?: {
    resolution: string;
    bitrate: string;
    size: number;
  };
  visibility: "public" | "private" | "unlisted";
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<Video>(
  {
    channelId: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    fileUrl: String,
    s3Key: String,
    presignedUrl: String,
    presignedUrlExpiry: Date,
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },
    processingProgress: {
      type: Number,
      default: 0,
    },
    processingError: String,
    metadata: {
      originalFileName: String,
      mimeType: String,
      codec: String,
      fps: Number,
      duration: Number,
    },
    quality: {
      resolution: String,
      bitrate: String,
      size: Number,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "private",
    },
  },
  { timestamps: true }
);
// Indexes for better query performance
videoSchema.index({ channelId: 1, createdAt: -1 });
videoSchema.index({ title: "text", description: "text" });
videoSchema.index({ tags: 1 });
export default mongoose.model<Video>("Video", videoSchema);
