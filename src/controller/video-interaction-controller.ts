import { RequestHandler } from "express";
import { ValidationError } from "../_lib/utils/errors/validationError";
import { VideoInteractionService } from "../services/video-interaction-service";

export class VideoInteractionController {
  constructor(private videoInteractionService: VideoInteractionService) {}

  toggleLike: RequestHandler = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const { userId } = req.body;
      console.log(videoId, userId, "datas got for like");

      if (!videoId || !userId) {
        throw new ValidationError([
          {
            fields: ["videoId", "userId"],
            constants: "Video ID and User ID are required.",
          },
        ]);
      }

      const result = await this.videoInteractionService.toggleLike(
        videoId,
        userId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleDislike: RequestHandler = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const { userId } = req.body;
      if (!videoId) {
        throw new ValidationError([
          {
            fields: ["videoId", "userId"],
            constants: "Video ID and User ID are required.",
          },
        ]);
      }

      const result = await this.videoInteractionService.toggleDislike(
        videoId,
        userId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getInteractionStatus: RequestHandler = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const { userId } = req.body;

      if (!videoId || !userId) {
        throw new ValidationError([
          {
            fields: ["videoId", "userId"],
            constants: "Video ID and User ID are required.",
          },
        ]);
      }

      const result = await this.videoInteractionService.getInteractionStatus(
        videoId,
        userId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
