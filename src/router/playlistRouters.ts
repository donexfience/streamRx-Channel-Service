import { Router } from "express";
import { PlaylistController } from "../controller/playlist-controller";
import { ChannelService } from "../services/channel-service";

export class PlaylistRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
  }
  private initRoutes() {
    const playlistController = new PlaylistController(new ChannelService());
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
