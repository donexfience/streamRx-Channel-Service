"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const validationError_1 = require("../_lib/utils/errors/validationError");
class VideoController {
    constructor(videoService) {
        this.videoService = videoService;
        // Generate a pre-signed URL for uploading a video
        this.generatePresignedUrl = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { fileName, fileType } = req.body;
                if (!fileName || !fileType) {
                    throw new validationError_1.ValidationError([
                        {
                            fields: ["fileName", "fileType"],
                            constants: "Both fileName and fileType are required.",
                        },
                    ]);
                }
                const result = yield this.videoService.generatePresignedUrl(fileName, fileType);
                res.status(200).json({
                    uploadUrl: result.url,
                    videoUrl: result.videoUrl,
                    expiryDate: result.expiryDate,
                    videoId: result.videoId,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.getVideo = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const videoId = req.params.videoId;
                if (!videoId) {
                    throw new validationError_1.ValidationError([
                        {
                            fields: ["videoId"],
                            constants: "Video ID is required.",
                        },
                    ]);
                }
                const video = yield this.videoService.getVideoById(videoId);
                if (!video) {
                    res.status(404).json({ error: "Video not found" });
                }
                res.status(200).json(video);
            }
            catch (error) {
                next(error);
            }
        });
        this.uploadVideoRecord = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const videoData = req.body;
                if (!videoData || !videoData.title) {
                    throw new validationError_1.ValidationError([
                        {
                            fields: ["title"],
                            constants: "Video title is required.",
                        },
                    ]);
                }
                const file = req.file;
                if (!file) {
                    throw new validationError_1.ValidationError([
                        {
                            fields: ["file"],
                            constants: "Uploaded file is required.",
                        },
                    ]);
                }
                const video = yield this.videoService.uploadAndProcessVideo(file, videoData);
                res.status(201).json(video);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Edit video metadata
    editVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const videoId = req.params.videoId;
                const updateData = req.body;
                if (!videoId) {
                    throw new validationError_1.ValidationError([
                        {
                            fields: ["videoId"],
                            constants: "Video ID is required.",
                        },
                    ]);
                }
                const video = yield this.videoService.editVideo(videoId, updateData);
                res.status(200).json(video);
            }
            catch (error) {
                if (error instanceof validationError_1.ValidationError) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res
                        .status(500)
                        .json({ error: error.message || "Internal server error" });
                }
            }
        });
    }
    // Delete a video and its S3 object
    deleteVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const videoId = req.params.videoId;
                if (!videoId) {
                    throw new validationError_1.ValidationError([
                        {
                            fields: ["videoId"],
                            constants: "Video ID is required.",
                        },
                    ]);
                }
                yield this.videoService.deleteVideo(videoId);
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ error: error.message || "Internal server error" });
            }
        });
    }
}
exports.VideoController = VideoController;
