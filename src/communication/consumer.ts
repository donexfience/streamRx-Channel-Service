import { QUEUES, RabbitMQConnection, RabbitMQConsumer } from "streamrx_common";
import { UserService } from "../services/user-service";
import amqplib from "amqplib";
import { VideoService } from "../services/video-service";

export class ChannelServiceConsumer {
  private rabbitMQConsumer: RabbitMQConsumer;
  private userService: UserService;
  private videoService: VideoService;
  private rabbitMQConnection: RabbitMQConnection;

  constructor(userService: UserService, videoService: VideoService) {
    this.userService = userService;
    this.videoService = videoService;
    this.rabbitMQConnection = RabbitMQConnection.getInstance();
    this.rabbitMQConsumer = new RabbitMQConsumer(this.rabbitMQConnection);
  } 

  public async start() {
    try {
      await this.rabbitMQConnection.connect(
        process.env.amqp_port || "amqp://localhost"
      );
      await this.rabbitMQConsumer.consumeFromExchange(
        "user-updated",
        this.handleUserUpdatedMessage.bind(this)
      );
      await this.rabbitMQConsumer.consumeFromExchange(
        "user-created",
        this.handleUserCreatedMessage.bind(this)
      );
      await this.rabbitMQConsumer.consumeFromExchange(
        "engagment-changed",
        this.handleEngagementUpdate.bind(this)
      );

      // queue based consuming
      //   await this.rabbitMQConsumer.consume(
      //     QUEUES.USER_CREATED,
      //     this.handleUserCreatedMessage.bind(this)
      //   );

      console.log(
        "[INFO] Started consuming messages from RabbitMQ queues and exchanges."
      );
    } catch (error) {
      console.error("[ERROR] Failed to start consuming:", error);
      throw error;
    }
  }

  private async handleUserCreatedMessage(msg: amqplib.ConsumeMessage | null) {
    if (!msg) return;

    try {
      const message = JSON.parse(msg.content.toString());
      console.log("[INFO] User Created message:", message);
      await this.userService.createUser(message);
    } catch (error) {
      console.error("[ERROR] Failed to handle user created message:", error);
      throw error;
    }
  }

  private async handleUserUpdatedMessage(msg: amqplib.ConsumeMessage | null) {
    if (!msg) return;

    try {
      const message = JSON.parse(msg.content.toString());
      console.log("[INFO] User Updated message:", message);
      await this.userService.updateUserById(message.id, message);
    } catch (error) {
      console.error("[ERROR] Failed to handle user updated message:", error);
      throw error;
    }
  }

  private async handleEngagementUpdate(msg: amqplib.ConsumeMessage | null) {
    if (!msg) {
      return;
    }
    try {
      const message = JSON.parse(msg.content.toString());
      console.log("[info] engagement updated message", message);
      await this.videoService.updateEngagementByVideoId(
        message.videoId,
        message.interactionType
      );
    } catch (error) {
      console.error("[ERROR] Failed to handle user updated message:", error);
      throw error;
    }
  }
}
