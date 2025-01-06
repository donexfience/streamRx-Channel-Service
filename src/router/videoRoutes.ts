import { Router } from "express";
import { ChannelService } from "../services/channel-service";
import { VideoController } from "../controller/video-controller";
import { VideoRepository } from "../repository/VideoRepository";
import { VideoService } from "../services/video-service";

export class VideoRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    const videoRepository = new VideoRepository();
    const videoService = new VideoService(videoRepository);
    const videoController = new VideoController(videoService);
    // this.router.post('/:channelId/videos', upload.single('video'), videoController.uploadVideo.bind(videoController));
    this.router.put(
      "/:videoId",
      videoController.editVideo.bind(videoController)
    );
    this.router.delete(
      "/:videoId",
      videoController.deleteVideo.bind(videoController)
    );
  }
}
