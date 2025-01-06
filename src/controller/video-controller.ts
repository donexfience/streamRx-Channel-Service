import { ValidationError } from './../_lib/utils/errors/validationError';
import { Request, Response } from 'express';
import { ChannelService } from '../services/channel-service';

export class VideoController {
    constructor(private channelService: ChannelService) {}

    async uploadVideo(req: Request, res: Response) {
        try {
            const video = await this.channelService.uploadVideo(
                req.params.channelId,
                req.body,
                req.file
            );
            res.status(201).json(video);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async editVideo(req: Request, res: Response) {
        try {
            const video = await this.channelService.editVideo(req.params.videoId, req.body);
            res.json(video);
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async deleteVideo(req: Request, res: Response) {
        try {
            await this.channelService.deleteVideo(req.params.videoId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}