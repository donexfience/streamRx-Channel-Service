import { Request, RequestHandler, Response } from "express";
import { RelatedVideosService } from "../services/RelatedVIdeo-service";

export class RelatedVideosController {
  constructor(private relatedVideosService: RelatedVideosService) {}

  getRelatedVideos: RequestHandler = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const result = await this.relatedVideosService.getRelatedVideos(videoId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}
