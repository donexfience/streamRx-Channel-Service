import { VideoInteractionRepository } from "../repository/videoInteractionRepository";

export class VideoInteractionService {
  constructor(private videoInteractionRepository: VideoInteractionRepository) {}

  async toggleLike(videoId: string, userId: string) {
    try {
      const { liked, likeCount, disliked } =
        await this.videoInteractionRepository.toggleLike(videoId, userId);

      return {
        success: true,
        message: liked
          ? "Video liked successfully"
          : "Video like removed successfully",
        data: {
          liked,
          disliked,
          likeCount,
        },
      };
    } catch (error) {
      console.error("Error in toggleLike service:", error);
      throw error;
    }
  }

  async toggleDislike(videoId: string, userId: string) {
    try {
      const { disliked, dislikeCount, liked } =
        await this.videoInteractionRepository.toggleDislike(videoId, userId);

      return {
        success: true,
        message: disliked
          ? "Video disliked successfully"
          : "Video dislike removed successfully",
        data: {
          liked,
          disliked,
          dislikeCount,
        },
      };
    } catch (error) {
      console.error("Error in toggleDislike service:", error);
      throw error;
    }
  }

  async getInteractionStatus(videoId: string, userId: string) {
    try {
      const status = await this.videoInteractionRepository.getInteractionStatus(
        videoId,
        userId
      );

      return {
        success: true,
        message: "Interaction status retrieved successfully",
        data: status,
      };
    } catch (error) {
      console.error("Error in getInteractionStatus service:", error);
      throw error;
    }
  }
}
