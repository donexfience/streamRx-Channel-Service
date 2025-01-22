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
    try {
      console.log(channelData.email, "channel data email");

      if (!channelData.email) {
        throw new Error("Email is required");
      }
      try {
        const existingChannel = await this.channelRepository.findByEmail(
          channelData.email
        );
        if (existingChannel) {
          throw new Error("Channel with this email already exists");
        }
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("not found")) {
          throw error;
        }
      }
      const user = await this.userRepository.findByEmail(channelData.email);
      if (!user) {
        throw new Error("User not found");
      }
      const newData: Partial<Channel> = {
        ...channelData,
        ownerId: new Types.ObjectId(user._id.toString()),
      };

      return await this.channelRepository.create(newData);
    } catch (error) {
      console.error("Error in createChannel:", error);
      throw error;
    }
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
    return await this.channelRepository.findByEmails(email);
  }

  async getChannelById(id: string): Promise<Channel> {
    return await this.channelRepository.findById(id);
  }
}
