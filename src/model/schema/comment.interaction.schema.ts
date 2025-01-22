import mongoose, { Schema, Types, Document } from 'mongoose';

interface ICommentInteraction extends Document {
  userId: Types.ObjectId;
  commentId: Types.ObjectId;
  type: 'like' | 'dislike' | 'none';
}

const commentInteractionSchema = new Schema<ICommentInteraction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  commentId: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
  type: { type: String, enum: ['like', 'dislike', 'none'], default: 'none' },
}, { timestamps: true });

commentInteractionSchema.index({ userId: 1, commentId: 1 }, { unique: true });

export const CommentInteraction = mongoose.model<ICommentInteraction>('CommentInteraction', commentInteractionSchema);
