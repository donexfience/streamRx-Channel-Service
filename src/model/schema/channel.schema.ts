import mongoose, { Schema, Document } from 'mongoose';

export interface Channel extends Document {
    name: string;
    description: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChannelSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, required: true },
}, { timestamps: true });

export default mongoose.model<Channel>('Channel', ChannelSchema);