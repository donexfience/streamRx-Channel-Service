import { Router } from "express";
import { VideoCollectionRepository } from "../repository/videoCollectionRepository";
import { VideoCollectionService } from "../services/videoCollection-service";
import { VideoCollectionController } from "../controller/video-collection-controller";

export class VideoCollectionRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    const videoCollectionRepository = new VideoCollectionRepository();
    const videoCollectionService = new VideoCollectionService(
      videoCollectionRepository
    );
    const videoCollectionController = new VideoCollectionController(
      videoCollectionService
    );

    // Watch History routes
    this.router.post(
      "/history/:userId",
      videoCollectionController.addToHistory.bind(videoCollectionController)
    );

    this.router.get(
      "/history/:userId",
      videoCollectionController.getHistory.bind(videoCollectionController)
    );

    this.router.delete(
      "/history/:userId/:videoId",
      videoCollectionController.removeFromHistory.bind(
        videoCollectionController
      )
    );

    // Watch Later routes
    this.router.post(
      "/watch-later/:userId",
      videoCollectionController.addToWatchLater.bind(videoCollectionController)
    );

    this.router.get(
      "/watch-later/:userId",
      videoCollectionController.getWatchLater.bind(videoCollectionController)
    );

    this.router.delete(
      "/watch-later/:userId/:videoId",
      videoCollectionController.removeFromWatchLater.bind(
        videoCollectionController
      )
    );
  }
}
