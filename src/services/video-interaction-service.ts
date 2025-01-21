
import { ValidationError } from "../_lib/utils/errors/validationError";
import { VideoInteractionRepository } from "../repository/videoInteractionRepository";

export class VideoInteractionService {
  constructor(private videoInteractionRepository: VideoInteractionRepository) {}

  async toggleLike(videoId: string, userId: string) {
    try {
      if (!videoId || !userId) {
        throw new ValidationError([
          {
            fields: ["videoId", "userId"],
            constants: "Video ID and User ID are required.",
          },
        ]);
      }

      const result = await this.videoInteractionRepository.toggleLike(videoId, userId);
      const status = await this.videoInteractionRepository.getInteractionStatus(
        videoId,
        userId
      );

      return {
        success: true,
        message: result.liked
          ? "Video liked successfully"
          : "Video like removed successfully",
        data: status,
      };
    } catch (error) {
      console.error("Error in toggleLike service:", error);
      throw error;
    }
  }

  async toggleDislike(videoId: string, userId: string) {
    try {
      if (!videoId || !userId) {
        throw new ValidationError([
          {
            fields: ["videoId", "userId"],
            constants: "Video ID and User ID are required.",
          },
        ]);
      }

      const result = await this.videoInteractionRepository.toggleDislike(
        videoId,
        userId
      );
      const status = await this.videoInteractionRepository.getInteractionStatus(
        videoId,
        userId
      );

      return {
        success: true,
        message: result.disliked
          ? "Video disliked successfully"
          : "Video dislike removed successfully",
        data: status,
      };
    } catch (error) {
      console.error("Error in toggleDislike service:", error);
      throw error;
    }
  }

  async getInteractionStatus(videoId: string, userId: string) {
    try {
      if (!videoId || !userId) {
        throw new ValidationError([
          {
            fields: ["videoId", "userId"],
            constants: "Video ID and User ID are required.",
          },
        ]);
      }

      const status = await this.videoInteractionRepository.getInteractionStatus(
        videoId,
        userId
      );

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      console.error("Error in getInteractionStatus service:", error);
      throw error;
    }
  }
}
