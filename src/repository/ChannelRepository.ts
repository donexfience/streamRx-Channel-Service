import mongoose from "mongoose";
import Channel, {
  Channel as ChannelType,
} from "./../model/schema/channel.schema";

import Playlist, {
  Playlist as PlaylistType,
} from "../model/schema/playlist.schema";
import { IChannelRepository } from "../interfaces/IChannelRepository";
import UserModel, { User } from "../model/schema/user.schema";
import Video, { Video as VideoType } from "../model/schema/video.schema";

export class ChannelRepostiory implements IChannelRepository {
  async create(channelData: Partial<ChannelType>): Promise<ChannelType> {
    const channel = new Channel(channelData);
    await channel.save();
    const plainDocument = channel.toObject();
    return plainDocument;
  }

  async update(
    channelId: string,
    updateData: Partial<ChannelType>
  ): Promise<ChannelType> {
    const session = await mongoose.startSession();
    session.startTransaction();

    const channel = await Channel.findByIdAndUpdate(channelId, updateData, {
      new: true,
    }).session(session);

    console.log(updateData, "update data in the repository");
    console.log(channel, "upated data of ");
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }
    if (updateData.channelAccessibility) {
      let newVisibility: "private" | "unlisted" | undefined;

      if (updateData.channelAccessibility === "private") {
        newVisibility = "private";
      } else if (updateData.channelAccessibility === "unlisted") {
        newVisibility = "unlisted";
      }
      if (newVisibility) {
        const video = await Video.updateMany(
          { channelId: channelId },
          { visibility: newVisibility },
          { session }
        );
        const playlist = await Playlist.updateMany(
          { channelId: channelId },
          { visibility: newVisibility },
          { session }
        );
        console.log(video, playlist, "upaaaaaaaaaaaaaated videeeeeeeeeeeeeo");
      }
    }
    return channel;
  }

  async delete(channelId: string): Promise<void> {
    await Channel.findByIdAndDelete(channelId);
  }

  async subscribe(channelId: string): Promise<void> {
    console.log(channelId, "channel Id of the subscribing");
    try {
      const channel = await Channel.updateOne(
        {
          _id: channelId,
        },
        { $inc: { subscribersCount: 1 } }
      );
      console.log(channel, "channel count after subscription");
    } catch (error) {
      console.error(error, "error of increasing count");
    }
  }

  async unsubscribe(channelId: string): Promise<void> {
    try {
      const channel = await Channel.updateOne(
        {
          _id: channelId,
        },
        { $inc: { subscribersCount: -1 } }
      );
    } catch (error) {
      console.error(error, "error of increasing count");
    }
  }

  async findById(channelId: string): Promise<ChannelType> {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }
    return channel;
  }

  async findByChannelId(channelId: string): Promise<ChannelType> {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }
    return channel;
  }

  async findByEmails(email: string): Promise<ChannelType> {
    const user = await UserModel.findOne({ email }).select("_id");
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    const channel = await Channel.findOne({ ownerId: user._id }).exec();
    if (!channel) {
      throw new Error(`Channel with owner email ${email} not found`);
    }

    return channel;
  }

  async findByEmail(email: string): Promise<ChannelType> {
    const channel = await Channel.findOne({ email })
      .populate({ path: "ownerId", select: "email" })
      .exec();

    if (!channel) {
      throw new Error(`Channel with email ${email} not found`);
    }

    return channel;
  }
}
