import { Request, RequestHandler, Response } from "express";
import { ValidationError } from "../_lib/utils/errors/validationError";
import { VideoService } from "../services/video-service";

export class VideoController {
  constructor(private videoService: VideoService) {}

  // Generate a pre-signed URL for uploading a video
  generatePresignedUrl: RequestHandler = async (req, res, next) => {
    try {
      const { fileName, fileType } = req.body;
      if (!fileName || !fileType) {
        throw new ValidationError([
          {
            fields: ["fileName", "fileType"],
            constants: "Both fileName and fileType are required.",
          },
        ]);
      }

      const result = await this.videoService.generatePresignedUrl(
        fileName,
        fileType
      );
      res.status(200).json({
        uploadUrl: result.url,
        videoUrl: result.videoUrl,
        expiryDate: result.expiryDate,
        videoId: result.videoId,
      });
    } catch (error) {
      next(error);
    }
  };

  getVideo: RequestHandler = async (req, res, next) => {
    try {
      const videoId = req.params.videoId;
      if (!videoId) {
        throw new ValidationError([
          {
            fields: ["videoId"],
            constants: "Video ID is required.",
          },
        ]);
      }

      const video = await this.videoService.getVideoById(videoId);
      if (!video) {
        res.status(404).json({ error: "Video not found" });
      }

      res.status(200).json(video);
    } catch (error) {
      next(error);
    }
  };

  uploadVideoRecord: RequestHandler = async (req, res, next) => {
    try {
      const videoData = req.body;
      if (!videoData || !videoData.title) {
        throw new ValidationError([
          {
            fields: ["title"],
            constants: "Video title is required.",
          },
        ]);
      }

      const file = req.file;
      if (!file) {
        throw new ValidationError([
          {
            fields: ["file"],
            constants: "Uploaded file is required.",
          },
        ]);
      }

      const video = await this.videoService.uploadAndProcessVideo(
        file,
        videoData
      );
      res.status(201).json(video);
    } catch (error) {
      next(error);
    }
  };

  // Edit video metadata
  async editVideo(req: Request, res: Response) {
    try {
      const videoId = req.params.videoId;
      const updateData = req.body;
      if (!videoId) {
        throw new ValidationError([
          {
            fields: ["videoId"],
            constants: "Video ID is required.",
          },
        ]);
      }

      const video = await this.videoService.editVideo(videoId, updateData);
      res.status(200).json(video);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: error.message || "Internal server error" });
      }
    }
  }

  // Delete a video and its S3 object
  async deleteVideo(req: Request, res: Response) {
    try {
      const videoId = req.params.videoId;
      if (!videoId) {
        throw new ValidationError([
          {
            fields: ["videoId"],
            constants: "Video ID is required.",
          },
        ]);
      }

      await this.videoService.deleteVideo(videoId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // Fetch video details
}
