import { Request, Response } from "express";
import { ValidationError } from "../_lib/utils/errors/validationError";
import { VideoService } from "../services/video-service";

export class VideoController {
    constructor(private videoService: VideoService) {}

    async generatePresignedUrl(req: Request, res: Response) {
        try {
            const { fileName, fileType } = req.body;
            const url = this.videoService.generatePresignedUrl(fileName, fileType);
            res.status(200).json({ url });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async uploadVideoRecord(req: Request, res: Response) {
        try {
            const videoData = req.body;
            const video = await this.videoService.saveVideoRecord(videoData);
            res.status(201).json(video);
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async editVideo(req: Request, res: Response) {
        try {
            const video = await this.videoService.editVideo(req.params.videoId, req.body);
            res.status(200).json(video);
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    }

    async deleteVideo(req: Request, res: Response) {
        try {
            await this.videoService.deleteVideo(req.params.videoId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
