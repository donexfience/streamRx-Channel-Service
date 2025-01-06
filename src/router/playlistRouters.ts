import { Router } from "express";
import { PlaylistController } from "../controller/playlist-controller";
import { PlaylistService } from "../services/playlist-service";
import { PlaylistRepository } from "../repository/Playlist.repository";

export class PlaylistRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
  }
  private initRoutes() {
    const playlistRepository = new PlaylistRepository();
    const playlistService = new PlaylistService(playlistRepository);
    const playlistController = new PlaylistController(playlistService);
    this.router.post(
      "/:channelId/playlists",
      playlistController.createPlaylist.bind(playlistController)
    );
    this.router.put(
      "/:playlistId",
      playlistController.editPlaylist.bind(playlistController)
    );
    this.router.delete(
      "/:playlistId",
      playlistController.deletePlaylist.bind(playlistController)
    );
    this.router.post(
      "/:playlistId/videos",
      playlistController.addVideoToPlaylist.bind(playlistController)
    );
  }
}
