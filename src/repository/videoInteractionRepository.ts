import { Types } from "mongoose";
import VideoInteraction from "../model/schema/video.interaction.schema";
import Video from "../model/schema/video.schema";

export class VideoInteractionRepository {
  async toggleLike(videoId: string, userId: string): Promise<{ liked: boolean }> {
    const session = await VideoInteraction.startSession();
    
    try {
      await session.withTransaction(async () => {
        const existingInteraction = await VideoInteraction.findOne({
          videoId,
          userId
        });

        if (existingInteraction) {
          if (existingInteraction.interactionType === "like") {
            // Remove like
            await VideoInteraction.deleteOne({ _id: existingInteraction._id });
            await Video.findByIdAndUpdate(videoId, {
              $inc: { "engagement.likeCount": -1 }
            });
            return { liked: false };
          } else {
            existingInteraction.interactionType = "like";
            await existingInteraction.save();
            await Video.findByIdAndUpdate(videoId, {
              $inc: { 
                "engagement.likeCount": 1,
                "engagement.dislikeCount": -1
              }
            });
            return { liked: true };
          }
        } else {
          // Add new like
          await VideoInteraction.create({
            videoId: new Types.ObjectId(videoId),
            userId: new Types.ObjectId(userId),
            interactionType: "like"
          });
          await Video.findByIdAndUpdate(videoId, {
            $inc: { "engagement.likeCount": 1 }
          });
          return { liked: true };
        }
      });

      const finalState = await VideoInteraction.findOne({
        videoId,
        userId,
        interactionType: "like"
      });

      return { liked: !!finalState };
    } finally {
      session.endSession();
    }
  }

  async toggleDislike(videoId: string, userId: string): Promise<{ disliked: boolean }> {
    const session = await VideoInteraction.startSession();
    
    try {
      await session.withTransaction(async () => {
        const existingInteraction = await VideoInteraction.findOne({
          videoId,
          userId
        });

        if (existingInteraction) {
          if (existingInteraction.interactionType === "dislike") {
            // Remove dislike
            await VideoInteraction.deleteOne({ _id: existingInteraction._id });
            await Video.findByIdAndUpdate(videoId, {
              $inc: { "engagement.dislikeCount": -1 }
            });
            return { disliked: false };
          } else {
            // Change like to dislike
            existingInteraction.interactionType = "dislike";
            await existingInteraction.save();
            await Video.findByIdAndUpdate(videoId, {
              $inc: { 
                "engagement.likeCount": -1,
                "engagement.dislikeCount": 1
              }
            });
            return { disliked: true };
          }
        } else {
          // Add new dislike
          await VideoInteraction.create({
            videoId: new Types.ObjectId(videoId),
            userId: new Types.ObjectId(userId),
            interactionType: "dislike"
          });
          await Video.findByIdAndUpdate(videoId, {
            $inc: { "engagement.dislikeCount": 1 }
          });
          return { disliked: true };
        }
      });

      const finalState = await VideoInteraction.findOne({
        videoId,
        userId,
        interactionType: "dislike"
      });

      return { disliked: !!finalState };
    } finally {
      session.endSession();
    }
  }

  async getInteractionStatus(videoId: string, userId: string): Promise<{ liked: boolean; disliked: boolean }> {
    const interaction = await VideoInteraction.findOne({ videoId, userId });
    
    return {
      liked: interaction?.interactionType === "like",
      disliked: interaction?.interactionType === "dislike"
    };
  }
}
