import mongoose, { Types, Document, Schema } from "mongoose";

export interface CommentNode extends Document {
  _id: Types.ObjectId;
  videoId: Types.ObjectId;
  channelId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  parentId?: Types.ObjectId;
  children: Types.ObjectId[];
  likes: number;
  dislikes: number;
  depth: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  type: "like" | "dislike" | "none";
}

const commentSchema = new Schema<CommentNode>(
  {
    videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
    channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    children: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    type: { type: String, enum: ["like", "dislike", "none"], default: "none" },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },
    path: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes for efficient queries and graph traversal
commentSchema.index({ videoId: 1, createdAt: -1 });
commentSchema.index({ path: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ text: "text" });

export default mongoose.model<CommentNode>("Comment", commentSchema);
