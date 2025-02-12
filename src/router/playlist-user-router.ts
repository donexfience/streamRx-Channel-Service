import { Router } from "express";
import { UserPlaylistRepository } from "../repository/userPlaylistRepository";
import { PlaylistUserService } from "../services/user-playlist-service";
import { PlaylistUserController } from "../controller/user-playlist-controller";

export class UserPlaylistRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    const playlistRepository = new UserPlaylistRepository();
    const playlistService = new PlaylistUserService(playlistRepository);
    const playlistController = new PlaylistUserController(playlistService);

    // Playlist routes
    this.router.post(
      "/:userId",
      playlistController.createPlaylist.bind(playlistController)
    );
    this.router.get(
      "/user/:userId",
      playlistController.getUserPlaylists.bind(playlistController)
    );
    this.router.get(
      "/:playlistId",
      playlistController.getPlaylistById.bind(playlistController)
    );
    this.router.post(
      "/:playlistId/videos",
      playlistController.addVideoToPlaylist.bind(playlistController)
    );
    this.router.delete(
      "/:playlistId/videos/:videoId",
      playlistController.removeVideoFromPlaylist.bind(playlistController)
    );
    this.router.delete(
      "/:playlistId",
      playlistController.deletePlaylist.bind(playlistController)
    );
  }
}
