import mongoose, { Types, Document, Schema } from "mongoose";

export interface Playlist extends Document {
  _id: Types.ObjectId;
  name: string;
  channelId: Types.ObjectId;
  description: string;
  visibility: "public" | "private" | "unlisted";
  category: string;
  tags: string[];
  thumbnailUrl: string;
  selectedVideos: Types.ObjectId[];
  videoUrls: string[];
  videoIds: Types.ObjectId[];
  status: "active" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new Schema<Playlist>(
  {
    channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "private",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    thumbnailUrl: {
      type: String,
      required: true,
    },
    selectedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
      },
    ],
    videoUrls: [
      {
        type: String,
      },
    ],
    videoIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
playlistSchema.index({ channelId: 1, createdAt: -1 });
playlistSchema.index({ visibility: 1, category: 1 });
playlistSchema.index({ status: 1 });

const Playlist = mongoose.model<Playlist>("Playlist", playlistSchema);

export default Playlist;
