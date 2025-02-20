import { Router } from "express";
import { VideoController } from "../controller/video-controller";
import { VideoRepository } from "../repository/VideoRepository";
import { VideoService } from "../services/video-service";
import { ChannelRepostiory } from "../repository/ChannelRepository";
import { RabbitMQConnection } from "streamrx_common";
import { VideoInteractionController } from "../controller/video-interaction-controller";
import { VideoInteractionService } from "../services/video-interaction-service";
import { VideoInteractionRepository } from "../repository/videoInteractionRepository";
import { PlaylistRepository } from "../repository/Playlist.repository";
import { RelatedVideosService } from "../services/RelatedVIdeo-service";
import { RelatedVideosRepository } from "../repository/RelatedVideoRepository";
import { RelatedVideosController } from "../controller/related-video-controller";
import { ElasticsearchService } from "../services/elasti-search-service";
import client from "../config/MongoDB/elastic search/elasticSearchConnection";

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
    const relatedVideoRepository = new RelatedVideosRepository();
    const relatedVideoService = new RelatedVideosService(
      relatedVideoRepository
    );
    const relatedVideoController = new RelatedVideosController(
      relatedVideoService
    );
    const rabbitMQConnection = RabbitMQConnection.getInstance();
    await rabbitMQConnection.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );

    const elasticsearchService = new ElasticsearchService(client);

    const videoController = new VideoController(
      videoService,
      rabbitMQConnection,
      elasticsearchService
    );
    const videoInteractionRepository = new VideoInteractionRepository();
    const videoInteractionService = new VideoInteractionService(
      videoInteractionRepository
    );
    const videoInteractionController = new VideoInteractionController(
      videoInteractionService,
      rabbitMQConnection
    );
    //get all video route
    this.router.get(
      "/:channelId/all",
      videoController.getAllVideo.bind(videoController)
    );

    //video like and dislike

    this.router.post(
      "/:videoId/like",
      videoInteractionController.toggleLike.bind(videoInteractionController)
    );
    this.router.post(
      "/:videoId/dislike",
      videoInteractionController.toggleDislike.bind(videoInteractionController)
    );
    this.router.post(
      "/:videoId/interaction-status",
      videoInteractionController.getInteractionStatus.bind(
        videoInteractionController
      )
    );

    this.router.get(
      "/video/:channelId",
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

    this.router.post("/comment/:videoId");

    this.router.patch(
      "/:videoId/playlist",
      videoController.updateVideoplaylist.bind(videoController)
    );

    this.router.patch(
      "/bulkupdate",
      videoController.bulkUpdateVideo.bind(videoController)
    );

    this.router.get(
      "/channel/:channelId",
      videoController.getVideosByChannelId.bind(videoController)
    );

    this.router.get(
      "/channel/viewer/:channelId",
      videoController.getVideosByChannelIdViewer.bind(videoController)
    );

    this.router.get(
      "/videos/:videoId/related",
      relatedVideoController.getRelatedVideos.bind(relatedVideoController)
    );
    this.router.get(
      "/videos/recent",
      videoController.getRecentVideo.bind(videoController)
    );
    this.router.get(
      "/videos/popular",
      videoController.getPopularVideo.bind(videoController)
    );
    this.router.get(
      "/videos/mostviewed",
      videoController.getPopularVideo.bind(videoController)
    );
    this.router.get(
      "/videos/mostliked",
      videoController.getPopularVideo.bind(videoController)
    );
    this.router.get(
      "/videos/search",
      videoController.searchVideos.bind(videoController)
    );
    // this.router.get(
    //   "/videos/auto-complete",
    //   videoController.searchAutocomplete.bind(videoController)
    // );
  }
}
