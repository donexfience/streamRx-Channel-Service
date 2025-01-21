import { Router } from "express";
import { ChannelRoutes } from "./channelRoutes";
import { VideoRoutes } from "./videoRoutes";
import { PlaylistRoutes } from "./playlistRouters";
import { CommentRoutes } from "./commentRouter";

class CommonRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.use((req, res, next) => {
      console.log(
        `[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`
      );
      next();
    });
    this.router.use("/channels", new ChannelRoutes().router);
    this.router.use("/videoes", new VideoRoutes().router);
    this.router.use("/playlist", new PlaylistRoutes().router);
    this.router.use("/comments", new CommentRoutes().router);
  }
}

export default new CommonRoutes().router;
