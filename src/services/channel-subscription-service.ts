import { ChannelSubscription } from "../model/schema/subscription.schema";
import { ChannelRepostiory } from "../repository/ChannelRepository";
import { ChannelSubscriptionRepository } from "../repository/ChannelSubscriptionRepository";

export class ChannelSubscriptionService {
  constructor(
    private repository: ChannelSubscriptionRepository,
    private channelRepository: ChannelRepostiory
  ) {}

  async subscribe(
    userId: string,
    channelId: string
  ): Promise<ChannelSubscription> {
    try {
      const currentStatus = await this.repository.getSubscriptionStatus(
        userId,
        channelId
      );
      if (currentStatus === true) {
        throw new Error("Already subscribed to this channel");
      }
      await this.channelRepository.subscribe(channelId);
      return await this.repository.subscribe(userId, channelId);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Already subscribed to this channel"
      ) {
        throw error;
      }
      throw new Error("Failed to subscribe to channel");
    }
  }

  async unsubscribe(
    userId: string,
    channelId: string
  ): Promise<ChannelSubscription> {
    try {
      const currentStatus = await this.repository.getSubscriptionStatus(
        userId,
        channelId
      );
      if (currentStatus === false) {
        throw new Error("Not currently subscribed to this channel");
      }
      await this.channelRepository.unsubscribe(channelId);
      return await this.repository.unsubscribe(userId, channelId);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Not currently subscribed to this channel"
      ) {
        throw error;
      }
      throw new Error("Failed to unsubscribe from channel");
    }
  }
  async getSubscriptionStatus(
    userId: string,
    channelId: string
  ): Promise<boolean> {
    try {
      const subscription = await this.repository.getSubscriptionStatus(
        userId,
        channelId
      );
      console.log(subscription, "status of sub");
      return subscription;
    } catch (error) {
      throw new Error("Failed to get subscription status");
    }
  }

  async getSubscriberCount(channelId: string): Promise<number> {
    try {
      return await this.repository.getSubscriberCount(channelId);
    } catch (error) {
      throw new Error("Failed to get subscriber count");
    }
  }
}
