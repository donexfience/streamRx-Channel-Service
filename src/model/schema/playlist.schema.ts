import mongoose, { Schema } from "mongoose";

export interface Playlist extends Document {
  name: string;
  description: string;
  channelId: string;
  videos: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    channelId: { type: Schema.Types.ObjectId, required: true, ref: 'Channel' },
    videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
}, { timestamps: true });

export default mongoose.model<Playlist>('Playlist', PlaylistSchema);