"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelRoutes = void 0;
const express_1 = require("express");
const channel_controller_1 = require("../controller/channel-controller");
const channel_service_1 = require("../services/channel-service");
const ChannelRepository_1 = require("../repository/ChannelRepository");
// Channel routes
class ChannelRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        const channelRepository = new ChannelRepository_1.ChannelRepostiory();
        const channelService = new channel_service_1.ChannelService(channelRepository);
        const channelController = new channel_controller_1.ChannelController(channelService);
        this.router.post("/", channelController.createChannel.bind(channelController));
        this.router.put("/:id", channelController.editChannel.bind(channelController));
        this.router.delete("/:id", channelController.deleteChannel.bind(channelController));
    }
}
exports.ChannelRoutes = ChannelRoutes;
