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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("./middlewares/error-middleware");
const morgan_1 = __importDefault(require("morgan"));
const connection_1 = require("./config/MongoDB/connection");
const user_service_1 = require("./services/user-service");
const userRepository_1 = require("./repository/userRepository");
const consumer_1 = require("./communication/consumer");
class App {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.initializeMiddleware();
        this.initializeServices();
        this.startConsuming();
    }
    initializeMiddleware() {
        this.app.use((0, morgan_1.default)("tiny"));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(error_middleware_1.ErrorMiddleware.handleError);
    }
    initializeServices() {
        return __awaiter(this, void 0, void 0, function* () {
            yield connection_1.Database.connect();
        });
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`CHANNEL-SERVICE RUNNING ON PORT  ${this.port}`);
        });
    }
    startConsuming() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user_repostiory = new userRepository_1.UserRepository();
                const userService = new user_service_1.UserService(user_repostiory);
                const channelServiceConsumer = new consumer_1.ChannelServiceConsumer(userService);
                yield channelServiceConsumer.consumeUserCreatedQueue();
                yield channelServiceConsumer.consumeUserUpdatedQueue();
                console.log("[INFO] Started consuming messages from RabbitMQ queues.");
            }
            catch (error) {
                console.error("[ERROR] Failed to start consuming:", error);
            }
        });
    }
}
exports.default = App;
