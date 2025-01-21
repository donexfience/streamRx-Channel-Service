
import mongoose, { Types, Document, Schema } from "mongoose";

export interface VideoInteraction extends Document {
  _id: Types.ObjectId;
  videoId: Types.ObjectId;
  userId: Types.ObjectId;
  interactionType: "like" | "dislike";
  createdAt: Date;
  updatedAt: Date;
}

const videoInteractionSchema = new Schema<VideoInteraction>(
  {
    videoId: { 
      type: Schema.Types.ObjectId, 
      ref: "Video", 
      required: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    interactionType: { 
      type: String, 
      enum: ["like", "dislike"], 
      required: true 
    }
  },
  { timestamps: true }
);

videoInteractionSchema.index({ videoId: 1, userId: 1 }, { unique: true });

export default mongoose.model<VideoInteraction>("VideoInteraction", videoInteractionSchema);