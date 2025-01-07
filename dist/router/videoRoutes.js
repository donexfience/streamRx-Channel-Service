"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const video_controller_1 = require("../controller/video-controller");
const VideoRepository_1 = require("../repository/VideoRepository");
const video_service_1 = require("../services/video-service");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
});
class VideoRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        const videoRepository = new VideoRepository_1.VideoRepository();
        const videoService = new video_service_1.VideoService(videoRepository);
        const videoController = new video_controller_1.VideoController(videoService);
        // Direct upload route
        this.router.post('/:channelId/videos', upload.single('video'), videoController.uploadVideoRecord.bind(videoController));
        // Presigned URL routes
        this.router.post('/presigned-url', videoController.generatePresignedUrl.bind(videoController));
        // Video management routes
        this.router.get('/:videoId', videoController.getVideo.bind(videoController));
        this.router.put('/:videoId', videoController.editVideo.bind(videoController));
        this.router.delete('/:videoId', videoController.deleteVideo.bind(videoController));
    }
}
exports.VideoRoutes = VideoRoutes;
