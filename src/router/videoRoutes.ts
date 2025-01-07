import { Router } from "express";
import multer from "multer";
import { VideoController } from "../controller/video-controller";
import { VideoRepository } from "../repository/VideoRepository";
import { VideoService } from "../services/video-service";

const upload = multer({
    storage: multer.memoryStorage(),
});

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
  
      // Direct upload route
      this.router.post(
          '/:channelId/videos',
          upload.single('video'),
          videoController.uploadVideoRecord.bind(videoController)
      );
  
      // Presigned URL routes
      this.router.post(
          '/presigned-url',
          videoController.generatePresignedUrl.bind(videoController)
      );
  
      // Video management routes
      this.router.get(
          '/:videoId',
          videoController.getVideo.bind(videoController)
      );
      
      this.router.put(
          '/:videoId',
          videoController.editVideo.bind(videoController)
      );
      
      this.router.delete(
          '/:videoId',
          videoController.deleteVideo.bind(videoController)
      );
  }
}