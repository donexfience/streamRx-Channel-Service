import mongoose, { Types, Document, Schema } from "mongoose";

export interface Video extends Document {
  _id: Types.ObjectId;
  channelId: Types.ObjectId;
  title: string;
  description?: string;
  fileUrl?: string;
  presignedUrl?: string;
  presignedUrlExpiry?: Date;
  status: "pending" | "processing" | "ready" | "failed";
  processingProgress: number;
  s3Key: string;
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
  engagement: {
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    commentCount: number;
    averageWatchDuration: number;
    completionRate: number;
  };
  thumbnailUrl: string;
  visibility: "public" | "private" | "unlisted";
  createdAt: Date;
  updatedAt: Date;
  category: string;
  tags: string[];
  selectedPlaylist: Types.ObjectId[];
}

const videoSchema = new Schema<Video>(
  {
    channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    title: { type: String, required: true },
    description: String,
    fileUrl: String,
    thumbnailUrl: String,
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
    selectedPlaylist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
        required: true,
      },
    ],
    tags: [{ type: String, index: true }],
    category: { type: String, index: true },
    engagement: {
      viewCount: { type: Number, default: 0 },
      likeCount: { type: Number, default: 0 },
      dislikeCount: { type: Number, default: 0 },
      commentCount: { type: Number, default: 0 },
      averageWatchDuration: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);
// Indexes for better query performance
videoSchema.index({ channelId: 1, createdAt: -1 });
videoSchema.index({ title: "text", description: "text" });
videoSchema.index({ tags: 1 });
export default mongoose.model<Video>("Video", videoSchema);
