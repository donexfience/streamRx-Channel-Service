import { Request, Response } from "express";
import { VideoCollectionService } from "../services/videoCollection-service";

export class VideoCollectionController {
  constructor(private readonly service: VideoCollectionService) {}

  async addToHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const videoData = req.body;
      const result = await this.service.addToHistory(userId, videoData);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addToWatchLater(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { videoId } = req.body;
      const result = await this.service.addToWatchLater(userId, videoId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, search = "" } = req.query;

      const result = await this.service.getHistory(
        userId,
        Number(page),
        Number(limit),
        String(search)
      );

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getWatchLater(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const result = await this.service.getWatchLater(
        userId,
        Number(page),
        Number(limit)
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeFromHistory(req: Request, res: Response) {
    try {
      const { userId, videoId } = req.params;
      const result = await this.service.removeFromHistory(userId, videoId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeFromWatchLater(req: Request, res: Response) {
    try {
      const { userId, videoId } = req.params;
      const result = await this.service.removeFromWatchLater(userId, videoId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
