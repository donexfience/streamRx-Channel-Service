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
exports.ChannelRepostiory = void 0;
const channel_schema_1 = __importDefault(require("./../model/schema/channel.schema"));
class ChannelRepostiory {
    create(channelData) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = new channel_schema_1.default(channelData);
            yield channel.save();
            const plainDocument = channel.toObject();
            return plainDocument;
        });
    }
    update(channelId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield channel_schema_1.default.findByIdAndUpdate(channelId, updateData, {
                new: true,
            });
            if (!channel) {
                throw new Error(`Channel with ID ${channelId} not found`);
            }
            return channel;
        });
    }
    delete(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield channel_schema_1.default.findByIdAndDelete(channelId);
        });
    }
    subscribe(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(channelId, "channel Id of the subscribing");
            try {
                const channel = yield channel_schema_1.default.updateOne({
                    _id: channelId,
                }, { $inc: { subscribersCount: 1 } });
                console.log(channel, "channel count after subscription");
            }
            catch (error) {
                console.error(error, "error of increasing count");
            }
        });
    }
    unsubscribe(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = yield channel_schema_1.default.updateOne({
                    _id: channelId,
                }, { $inc: { subscribersCount: -1 } });
            }
            catch (error) {
                console.error(error, "error of increasing count");
            }
        });
    }
    findById(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield channel_schema_1.default.findById(channelId);
            if (!channel) {
                throw new Error(`Channel with ID ${channelId} not found`);
            }
            return channel;
        });
    }
    findByEmails(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield channel_schema_1.default.findOne()
                .populate({
                path: "ownerId",
                match: { email: email },
                select: "email",
            })
                .exec();
            if (!channel || !channel.ownerId) {
                throw new Error(`Channel with owner email ${email} not found`);
            }
            return channel;
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield channel_schema_1.default.findOne({ email })
                .populate({ path: "ownerId", select: "email" })
                .exec();
            if (!channel) {
                throw new Error(`Channel with email ${email} not found`);
            }
            return channel;
        });
    }
}
exports.ChannelRepostiory = ChannelRepostiory;
