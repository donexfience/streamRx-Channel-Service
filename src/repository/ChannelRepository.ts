import Channel, {
  Channel as ChannelType,
} from "./../model/schema/channel.schema";
import { IChannelRepository } from "../interfaces/IChannelRepository";

export class ChannleRepostiory implements IChannelRepository {
  async create(channelData: Partial<ChannelType>): Promise<ChannelType> {
    const channel = new Channel(channelData);
    return await channel.save();
  }

  async update(
    channelId: string,
    updateData: Partial<ChannelType>
  ): Promise<ChannelType> {
    const channel = await Channel.findByIdAndUpdate(channelId, updateData, {
      new: true,
    });
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }
    return channel;
  }

  async delete(channelId: string): Promise<void> {
    await Channel.findByIdAndDelete(channelId);
  }

  async findById(channelId: string): Promise<ChannelType> {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }
    return channel;
  }
}
