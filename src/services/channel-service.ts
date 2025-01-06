import { IChannelService } from "../interfaces/IChannelService";
import { Channel } from "../model/schema/channel.schema";
import { ChannelRepostiory } from "../repository/ChannelRepository";

export class ChannelService implements IChannelService {
  constructor(private channelRepository: ChannelRepostiory) {}

  async createChannel(channelData: Partial<Channel>): Promise<Channel> {
    return await this.channelRepository.create(channelData);
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
}
