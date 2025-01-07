import { Router } from "express";
import { ChannelRoutes } from "./channelRoutes";
import { VideoRoutes } from "./videoRoutes";
import { PlaylistRoutes } from "./playlistRouters";

class CommonRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.use('/channels', new ChannelRoutes().router);
        this.router.use('/videoes', new VideoRoutes().router);
        this.router.use('/playlist', new PlaylistRoutes().router);
    }
}

export default new CommonRoutes().router