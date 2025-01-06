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
exports.VideoRepository = void 0;
const video_schema_1 = __importDefault(require("../model/schema/video.schema"));
class VideoRepository {
    create(videoData) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = new video_schema_1.default(videoData);
            return yield video.save();
        });
    }
    update(videoId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = yield video_schema_1.default.findByIdAndUpdate(videoId, updateData, { new: true });
            if (!video)
                throw new Error('Video not found');
            return video;
        });
    }
    delete(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield video_schema_1.default.findByIdAndDelete(videoId);
        });
    }
    findById(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = yield video_schema_1.default.findById(videoId);
            if (!video)
                throw new Error('Video not found');
            return video;
        });
    }
}
exports.VideoRepository = VideoRepository;
