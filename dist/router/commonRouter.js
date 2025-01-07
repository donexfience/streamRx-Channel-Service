"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const channelRoutes_1 = require("./channelRoutes");
const videoRoutes_1 = require("./videoRoutes");
const playlistRouters_1 = require("./playlistRouters");
class CommonRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.use('/channels', new channelRoutes_1.ChannelRoutes().router);
        this.router.use('/videoes', new videoRoutes_1.VideoRoutes().router);
        this.router.use('/playlist', new playlistRouters_1.PlaylistRoutes().router);
    }
}
exports.default = new CommonRoutes().router;
