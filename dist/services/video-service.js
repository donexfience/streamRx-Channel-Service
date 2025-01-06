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
exports.VideoService = void 0;
const aws_sdk_1 = require("aws-sdk");
class VideoService {
    constructor(videoRepository) {
        this.videoRepository = videoRepository;
        this.BUCKET_NAME = process.env.AWS_S3_BUCKET;
        this.s3 = new aws_sdk_1.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });
    }
    generatePresignedUrl(fileName, fileType) {
        const params = {
            Bucket: this.BUCKET_NAME,
            Key: `videos/${fileName}`,
            Expires: 3600,
            ContentType: fileType,
        };
        return this.s3.getSignedUrl("putObject", params);
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
    deleteVideo(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = yield this.videoRepository.findById(videoId);
            if (video && video.fileUrl) {
                const key = video.fileUrl.split("/").pop();
                //     await this.s3.deleteObject({
                //         Bucket: this.BUCKET_NAME,
                //         Key: `videos/${key}`
                //     }).promise();
                // }
                yield this.videoRepository.delete(videoId);
            }
        });
    }
}
exports.VideoService = VideoService;
