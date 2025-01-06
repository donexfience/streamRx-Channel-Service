import mongoose, { Schema } from "mongoose";

export interface Video extends Document {
    title: string;
    description: string;
    channelId: string;
    fileUrl: string;
    thumbnailUrl: string;
    duration: number;
    status: 'processing' | 'ready' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const VideoSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    channelId: { type: Schema.Types.ObjectId, required: true, ref: 'Channel' },
    fileUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    duration: { type: Number },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
}, { timestamps: true });

export default mongoose.model<Video>('Video', VideoSchema);
