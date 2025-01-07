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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const path_1 = require("path");
const aws_sdk_1 = require("aws-sdk");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const validationError_1 = require("../_lib/utils/errors/validationError");
class VideoService {
    constructor(videoRepository) {
        this.videoRepository = videoRepository;
        this.BUCKET_NAME = process.env.AWS_S3_BUCKET;
        this.PROCESSING_OPTIONS = [
            { resolution: "1080p", bitrate: "2500k", fps: 30 },
            { resolution: "720p", bitrate: "1500k", fps: 30 },
            { resolution: "480p", bitrate: "800k", fps: 25 },
        ];
        this.s3 = new aws_sdk_1.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });
    }
    uploadAndProcessVideo(file, videoData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const video = yield this.videoRepository.create(Object.assign(Object.assign({}, videoData), { status: "processing", processingProgress: 0 }));
                // Start processing
                yield this.processVideo(video.id, file);
                return video;
            }
            catch (error) {
                throw new Error(`Failed to upload and process video: ${error.message}`);
            }
        });
    }
    processVideo(videoId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const tempDir = (0, path_1.join)(__dirname, "..", "temp");
            const tempInputPath = (0, path_1.join)(tempDir, `input-${videoId}`);
            const tempOutputPath = (0, path_1.join)(tempDir, `output-${videoId}`);
            try {
                yield this.saveTempFile(file, tempInputPath);
                const metadata = yield this.getVideoMetadata(tempInputPath);
                yield this.videoRepository.update(videoId, {
                    metadata: Object.assign({ originalFileName: file.originalname, mimeType: file.mimetype }, metadata),
                    processingProgress: 10,
                });
                const compressedVideo = yield this.compressVideo(tempInputPath, tempOutputPath);
                const s3Key = `videos/${videoId}/${Date.now()}-compressed.mp4`;
                const uploadResult = yield this.uploadToS3(compressedVideo, s3Key);
                // Update video record with final details
                yield this.videoRepository.update(videoId, {
                    fileUrl: uploadResult.Location,
                    status: "ready",
                    quality: {
                        resolution: "720p", // Default compressed resolution
                        bitrate: "1500k", // Default compressed bitrate
                        size: yield this.getFileSize(compressedVideo),
                    },
                    processingProgress: 100,
                });
                yield this.cleanup([tempInputPath, tempOutputPath]);
            }
            catch (error) {
                yield this.videoRepository.update(videoId, {
                    status: "failed",
                    processingError: error.message,
                });
                yield this.cleanup([tempInputPath, tempOutputPath]);
                throw error;
            }
        });
    }
    uploadToS3(filePath, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileStream = require("fs").createReadStream(filePath);
            if (!this.BUCKET_NAME) {
                throw new Error("Bucket name is not defined");
            }
            return yield this.s3
                .upload({
                Bucket: this.BUCKET_NAME,
                Key: key,
                Body: fileStream,
                ContentType: "video/mp4",
            })
                .promise();
        });
    }
    getFileSize(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield require("fs").promises.stat(filePath);
            return stats.size;
        });
    }
    cleanup(files) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(files.map((file) => (0, promises_1.unlink)(file).catch(() => { })));
        });
    }
    compressVideo(inputPath, outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = this.PROCESSING_OPTIONS[1]; // Using 720p settings
            return new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(inputPath)
                    .outputOptions([
                    `-vf scale=-2:${options.resolution.replace("p", "")}`,
                    `-b:v ${options.bitrate}`,
                    `-r ${options.fps}`,
                    "-c:v libx264",
                    "-preset medium",
                    "-crf 23",
                    "-c:a aac",
                    "-b:a 128k",
                    "-movflags +faststart",
                ])
                    .output(outputPath)
                    .on("end", () => resolve(outputPath))
                    .on("error", reject)
                    .run();
            });
        });
    }
    getVideoMetadata(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
                    if (err)
                        reject(err);
                    const videoStream = metadata.streams.find((s) => s.codec_type === "video");
                    if (!videoStream) {
                        throw new Error("video strema undefined");
                    }
                    const frameRate = videoStream.r_frame_rate
                        ? eval(videoStream.r_frame_rate)
                        : 30; // Default to 30fps
                    resolve({
                        codec: videoStream.codec_name || "unknown",
                        fps: frameRate,
                        duration: metadata.format.duration,
                    });
                });
            });
        });
    }
    saveTempFile(file, path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!file) {
                throw new Error("File is required");
            }
            return new Promise((resolve, reject) => {
                const writeStream = (0, fs_1.createWriteStream)(path);
                writeStream.write(file.buffer);
                writeStream.end();
                writeStream.on("finish", resolve);
                writeStream.on("error", reject);
            });
        });
    }
    generatePresignedUrl(fileName, fileType, videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fileType) {
                throw new validationError_1.ValidationError([
                    {
                        fields: ["fileType"],
                        constants: "fileType is required",
                    },
                ]);
            }
            if (!this.BUCKET_NAME) {
                throw new Error("Bucket name is not defined");
            }
            // Generate a unique key for the video
            const timestamp = Date.now();
            const key = `videos/${videoId || timestamp}/${fileName}`;
            // Generate a pre-signed URL for uploading
            const params = {
                Bucket: this.BUCKET_NAME,
                Key: key,
                Expires: 3600, // Pre-signed URL valid for 1 hour
                ContentType: fileType,
            };
            const url = this.s3.getSignedUrl("putObject", params);
            const expiryDate = new Date(Date.now() + params.Expires * 1000);
            const videoUrl = `https://${this.BUCKET_NAME}.s3.amazonaws.com/${key}`;
            // If no videoId provided, create a new video record
            const video = videoId
                ? yield this.videoRepository.update(videoId, {
                    s3Key: key,
                    presignedUrl: url,
                    presignedUrlExpiry: expiryDate,
                    status: "pending",
                })
                : yield this.videoRepository.create({
                    title: fileName,
                    s3Key: key,
                    presignedUrl: url,
                    presignedUrlExpiry: expiryDate,
                    status: "pending",
                    visibility: "private",
                });
            return {
                url,
                videoUrl,
                expiryDate,
                videoId: video.id,
            };
        });
    }
    saveVideoRecord(videoData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.videoRepository.create(videoData);
        });
    }
    editVideo(videoId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.videoRepository.update(videoId, updateData);
        });
    }
    getVideoById(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.videoRepository.findById(videoId);
        });
    }
    deleteVideo(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = yield this.videoRepository.findById(videoId);
            if (!this.BUCKET_NAME) {
                throw new Error("Bucket name is not defined");
            }
            if (video && video.fileUrl) {
                const key = video.fileUrl.split("/").pop();
                yield this.s3
                    .deleteObject({
                    Bucket: this.BUCKET_NAME,
                    Key: `videos/${key}`,
                })
                    .promise();
            }
            yield this.videoRepository.delete(videoId);
        });
    }
}
exports.VideoService = VideoService;
