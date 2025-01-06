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
exports.PlaylistController = void 0;
const validationError_1 = require("../_lib/utils/errors/validationError");
class PlaylistController {
    constructor(PlaylistService) {
        this.PlaylistService = PlaylistService;
    }
    createPlaylist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const playlist = yield this.PlaylistService.createPlaylist(req.params.channelId, req.body);
                res.status(201).json(playlist);
            }
            catch (error) {
                if (error instanceof validationError_1.ValidationError) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Internal server error" });
                }
            }
        });
    }
    editPlaylist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const playlist = yield this.PlaylistService.editPlaylist(req.params.playlistId, req.body);
                res.json(playlist);
            }
            catch (error) {
                if (error instanceof validationError_1.ValidationError) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Internal server error" });
                }
            }
        });
    }
    deletePlaylist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.PlaylistService.deletePlaylist(req.params.playlistId);
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    addVideoToPlaylist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const playlist = yield this.PlaylistService.addVideoToPlaylist(req.params.playlistId, req.body.videoId);
                res.json(playlist);
            }
            catch (error) {
                if (error instanceof validationError_1.ValidationError) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Internal server error" });
                }
            }
        });
    }
}
exports.PlaylistController = PlaylistController;
