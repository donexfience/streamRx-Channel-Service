import { Request, RequestHandler, Response } from "express";
import { ValidationError } from "../_lib/utils/errors/validationError";
import { VideoService } from "../services/video-service";
import mongoose, { Types, Document, Schema } from "mongoose";

export class VideoController {
  constructor(private videoService: VideoService) {}

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

  getAllVideo: RequestHandler = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const videos = await this.videoService.getAllVideo(page, limit);

      if (!videos || videos.length === 0) {
        res.status(404).json({
          success: false,
          message: "No videos found",
          data: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Videos retrieved successfully",
        data: videos,
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error in getAllVideo:", error);
      next(error);
    }
  };
  createVideoRecord: RequestHandler = async (req, res, next) => {
    try {
      const videoData = req.body;
      const { channelId } = req.params;
      if (!videoData || !videoData.title) {
        throw new ValidationError([
          {
            fields: ["title"],
            constants: "Video title is required.",
          },
        ]);
      }
      if (!channelId) {
        throw new ValidationError([
          { fields: ["channelId"], constants: "channel Id is required" },
        ]);
      }

      console.log(videoData, "video data here in controller");
      console.log("channel id is here", channelId);
      const video = await this.videoService.createVideoRecord(
        videoData,
        channelId
      );
      res.status(201).json(video);
    } catch (error) {
      console.log(error, "error in controller");
    }
  };

  editVideo: RequestHandler = async (req, res, next) => {
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
    } catch (error) {
      next(error);
    }
  };

  deleteVideo: RequestHandler = async (req, res, next) => {
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
    } catch (error) {
      next(error);
    }
  };
}
