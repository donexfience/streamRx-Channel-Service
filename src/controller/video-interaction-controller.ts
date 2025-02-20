import { RequestHandler } from "express";
import { VideoInteractionService } from "../services/video-interaction-service";
import { RabbitMQConnection, RabbitMQProducer } from "streamrx_common";

export class VideoInteractionController {
  private rabbitMQProducer: RabbitMQProducer;

  constructor(
    private videoInteractionService: VideoInteractionService,
    private readonly rabbitMQConnection: RabbitMQConnection
  ) {
    this.rabbitMQProducer = new RabbitMQProducer(this.rabbitMQConnection);
  }

  toggleLike: RequestHandler = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const { userId } = req.body;

      const result = await this.videoInteractionService.toggleLike(
        videoId,
        userId
      );

      await this.rabbitMQProducer.publishToExchange("toggle-like", "", {
        videoId,
        userId,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleDislike: RequestHandler = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const { userId } = req.body;

      const result = await this.videoInteractionService.toggleDislike(
        videoId,
        userId
      );

      await this.rabbitMQProducer.publishToExchange("toggle-dislike", "", {
        videoId,
        userId,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getInteractionStatus: RequestHandler = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const { userId } = req.body;
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
