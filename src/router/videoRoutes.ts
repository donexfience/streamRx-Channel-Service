import { Router } from "express";
import { VideoController } from "../controller/video-controller";
import { VideoRepository } from "../repository/VideoRepository";
import { VideoService } from "../services/video-service";
import { ChannelRepostiory } from "../repository/ChannelRepository";
import { RabbitMQConnection } from "streamrx_common";

export class VideoRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private async initRoutes() {
    const videoRepository = new VideoRepository();
    const channelRepository = new ChannelRepostiory();
    const videoService = new VideoService(videoRepository, channelRepository);

    const rabbitMQConnection = RabbitMQConnection.getInstance();
    await rabbitMQConnection.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );
    const videoController = new VideoController(
      videoService,
      rabbitMQConnection
    );
    //get all video route
    this.router.get("/all", videoController.getAllVideo.bind(videoController));

    this.router.get(
      "/video",
      videoController.getVideoBySearchQuery.bind(videoController)
    );

    // Create video record route
    this.router.post(
      "/channel/:channelId",
      videoController.createVideoRecord.bind(videoController)
    );

    // Video management routes
    this.router.get(
      "/:videoId",
      videoController.getVideo.bind(videoController)
    );

    this.router.put(
      "/:videoId",
      videoController.editVideo.bind(videoController)
    );

    this.router.delete(
      "/:videoId",
      videoController.deleteVideo.bind(videoController)
    );

    this.router.post('/comment/:videoId')
  }
}
