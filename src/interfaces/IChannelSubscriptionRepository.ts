import { Types } from "mongoose";
import { ChannelSubscription } from "../model/schema/subscription.schema";

export interface IChannelSubscriptionRepository {
  subscribe(userId: string, channelId: string): Promise<ChannelSubscription>;
  unsubscribe(userId: string, channelId: string): Promise<ChannelSubscription>;
  getSubscriptionStatus(
    userId: string,
    channelId: string
  ): Promise<boolean | null>;
  getSubscriberCount(channelId: string): Promise<number>;
  getSubscriptions(userId: string): Promise<ChannelSubscription[]>;
}
