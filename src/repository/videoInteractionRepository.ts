import { Types } from "mongoose";
import VideoInteraction from "../model/schema/video.interaction.schema";
import Video from "../model/schema/video.schema";

export class VideoInteractionRepository {
  async toggleLike(
    videoId: string,
    userId: string
  ): Promise<{ liked: boolean; likeCount: number; disliked: boolean }> {
    const session = await VideoInteraction.startSession();
    session.startTransaction();

    try {
      const existingInteraction = await VideoInteraction.findOne({
        videoId,
        userId,
      }).session(session);

      let video;
      if (existingInteraction) {
        if (existingInteraction.interactionType === "like") {
          // Remove like
          await VideoInteraction.deleteOne({
            _id: existingInteraction._id,
          }).session(session);
          video = await Video.findByIdAndUpdate(
            videoId,
            {
              $inc: { "engagement.likeCount": -1 },
            },
            { new: true, session }
          );
        } else {
          // Switch from dislike to like
          existingInteraction.interactionType = "like";
          await existingInteraction.save({ session });
          video = await Video.findByIdAndUpdate(
            videoId,
            {
              $inc: {
                "engagement.likeCount": 1,
                "engagement.dislikeCount": -1,
              },
            },
            { new: true, session }
          );
        }
      } else {
        // Add new like
        await VideoInteraction.create(
          [
            {
              videoId: new Types.ObjectId(videoId),
              userId: new Types.ObjectId(userId),
              interactionType: "like",
            },
          ],
          { session }
        );
        video = await Video.findByIdAndUpdate(
          videoId,
          {
            $inc: { "engagement.likeCount": 1 },
          },
          { new: true, session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      const finalState = await VideoInteraction.findOne({
        videoId,
        userId,
      });

      return {
        liked: finalState?.interactionType === "like",
        likeCount: video?.engagement?.likeCount || 0,
        disliked: finalState?.interactionType === "dislike",
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async toggleDislike(
    videoId: string,
    userId: string
  ): Promise<{ disliked: boolean; dislikeCount: number; liked: boolean }> {
    const session = await VideoInteraction.startSession();
    session.startTransaction();

    try {
      const existingInteraction = await VideoInteraction.findOne({
        videoId,
        userId,
      }).session(session);

      let video;
      if (existingInteraction) {
        if (existingInteraction.interactionType === "dislike") {
          // Remove dislike
          await VideoInteraction.deleteOne({
            _id: existingInteraction._id,
          }).session(session);
          video = await Video.findByIdAndUpdate(
            videoId,
            {
              $inc: { "engagement.dislikeCount": -1 },
            },
            { new: true, session }
          );
        } else {
          // Switch from like to dislike
          existingInteraction.interactionType = "dislike";
          await existingInteraction.save({ session });
          video = await Video.findByIdAndUpdate(
            videoId,
            {
              $inc: {
                "engagement.likeCount": -1,
                "engagement.dislikeCount": 1,
              },
            },
            { new: true, session }
          );
        }
      } else {
        // Add new dislike
        await VideoInteraction.create(
          [
            {
              videoId: new Types.ObjectId(videoId),
              userId: new Types.ObjectId(userId),
              interactionType: "dislike",
            },
          ],
          { session }
        );
        video = await Video.findByIdAndUpdate(
          videoId,
          {
            $inc: { "engagement.dislikeCount": 1 },
          },
          { new: true, session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      const finalState = await VideoInteraction.findOne({
        videoId,
        userId,
      });

      return {
        disliked: finalState?.interactionType === "dislike",
        dislikeCount: video?.engagement?.dislikeCount || 0,
        liked: finalState?.interactionType === "like",
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getInteractionStatus(
    videoId: string,
    userId: string
  ): Promise<{ liked: boolean; disliked: boolean }> {
    const interaction = await VideoInteraction.findOne({ videoId, userId });

    return {
      liked: interaction?.interactionType === "like",
      disliked: interaction?.interactionType === "dislike",
    };
  }
}
