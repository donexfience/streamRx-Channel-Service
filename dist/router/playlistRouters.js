"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistRoutes = void 0;
const express_1 = require("express");
const playlist_controller_1 = require("../controller/playlist-controller");
const playlist_service_1 = require("../services/playlist-service");
const Playlist_repository_1 = require("../repository/Playlist.repository");
class PlaylistRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    initRoutes() {
        const playlistRepository = new Playlist_repository_1.PlaylistRepository();
        const playlistService = new playlist_service_1.PlaylistService(playlistRepository);
        const playlistController = new playlist_controller_1.PlaylistController(playlistService);
        this.router.post("/:channelId/playlists", playlistController.createPlaylist.bind(playlistController));
        this.router.put("/:playlistId", playlistController.editPlaylist.bind(playlistController));
        this.router.delete("/:playlistId", playlistController.deletePlaylist.bind(playlistController));
        this.router.post("/:playlistId/videos", playlistController.addVideoToPlaylist.bind(playlistController));
    }
}
exports.PlaylistRoutes = PlaylistRoutes;
