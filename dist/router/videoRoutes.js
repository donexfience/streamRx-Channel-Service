"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRoutes = void 0;
const express_1 = require("express");
const video_controller_1 = require("../controller/video-controller");
const VideoRepository_1 = require("../repository/VideoRepository");
const video_service_1 = require("../services/video-service");
class VideoRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        const videoRepository = new VideoRepository_1.VideoRepository();
        const videoService = new video_service_1.VideoService(videoRepository);
        const videoController = new video_controller_1.VideoController(videoService);
        // this.router.post('/:channelId/videos', upload.single('video'), videoController.uploadVideo.bind(videoController));
        this.router.put("/:videoId", videoController.editVideo.bind(videoController));
        this.router.delete("/:videoId", videoController.deleteVideo.bind(videoController));
    }
}
exports.VideoRoutes = VideoRoutes;
