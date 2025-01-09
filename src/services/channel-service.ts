import { ObjectId, Types, Schema } from "mongoose";

import { IChannelService } from "../interfaces/IChannelService";
import { Channel } from "../model/schema/channel.schema";
import { ChannelRepostiory } from "../repository/ChannelRepository";
import { UserRepository } from "../repository/userRepository";

export class ChannelService implements IChannelService {
  constructor(
    private channelRepository: ChannelRepostiory,
    private userRepository: UserRepository
  ) {}

  async createChannel(channelData: Partial<Channel>): Promise<Channel> {
    let user;
    if (channelData.email) {
      const existingChannel = await this.channelRepository.findByEmail(
        channelData.email
      );
      if (existingChannel) {
        throw new Error("Channel with this email already exists");
      }
    }

    if (channelData.email) {
      user = await this.userRepository.findByEmail(channelData.email);

      if (!user) {
        throw new Error("User not found");
      }
    }

    const newData: Partial<Channel> = {
      ...channelData,
      ownerId: user ? new Types.ObjectId(user._id.toString()) : undefined,
    };

    if (!newData.ownerId) {
      throw new Error("Owner ID is missing");
    }

    return await this.channelRepository.create(newData);
  }

  async editChannel(
    channelId: string,
    updateData: Partial<Channel>
  ): Promise<Channel> {
    return await this.channelRepository.update(channelId, updateData);
  }

  async deleteChannel(channelId: string): Promise<void> {
    await this.channelRepository.delete(channelId);
  }
  async getChannelByEmail(email: string): Promise<Channel> {
    return await this.channelRepository.findByEmail(email);
  }
}
