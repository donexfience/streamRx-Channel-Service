import { Router } from "express";
import { PlaylistService } from "../services/playlist-service";
import { PlaylistController } from "../controller/playlist-controller";
import { PlaylistRepository } from "../repository/Playlist.repository";

export class PlaylistRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    const playlistRepository = new PlaylistRepository();
    const playlistService = new PlaylistService(playlistRepository);
    const playlistController = new PlaylistController(playlistService);

    // Get all playlists route
    this.router.get(
      "/",
      playlistController.getAllPlaylists.bind(playlistController)
    );

    // Get playlist by channelID
    this.router.get(
      "/:channelId/all",
      playlistController.getAllPlaylists.bind(playlistController)
    );

    // Create playlist route
    this.router.post(
      "/",
      playlistController.createPlaylist.bind(playlistController)
    );

    // Update playlist route
    this.router.put(
      "/:playlistId",
      playlistController.updatePlaylist.bind(playlistController)
    );

    // Delete playlist route
    this.router.delete(
      "/:playlistId",
      playlistController.deletePlaylist.bind(playlistController)
    );
  }
}
