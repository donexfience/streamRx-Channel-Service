import { join } from "path";
import { S3 } from "aws-sdk";
import ffmpeg from "fluent-ffmpeg";
import { VideoRepository } from "../repository/VideoRepository";
import { Video } from "../model/schema/video.schema";
import { createWriteStream } from "fs";
import { unlink } from "fs/promises";
import { ValidationError } from "../_lib/utils/errors/validationError";

interface ProcessingOptions {
  resolution: string;
  bitrate: string;
  fps: number;
}

export class VideoService {
  private s3: S3;
  private readonly BUCKET_NAME = process.env.AWS_S3_BUCKET;
  private readonly PROCESSING_OPTIONS: ProcessingOptions[] = [
    { resolution: "1080p", bitrate: "2500k", fps: 30 },
    { resolution: "720p", bitrate: "1500k", fps: 30 },
    { resolution: "480p", bitrate: "800k", fps: 25 },
  ];

  constructor(private videoRepository: VideoRepository) {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadAndProcessVideo(
    file: Express.Multer.File,
    videoData: Partial<Video>
  ): Promise<Video> {
    try {
      const video = await this.videoRepository.create({
        ...videoData,
        status: "processing",
        processingProgress: 0,
      });

      // Start processing
      await this.processVideo(video.id, file);

      return video;
    } catch (error: any) {
      throw new Error(`Failed to upload and process video: ${error.message}`);
    }
  }

  private async processVideo(
    videoId: string,
    file: Express.Multer.File
  ): Promise<void> {
    const tempDir = join(__dirname, "..", "temp");
    const tempInputPath = join(tempDir, `input-${videoId}`);
    const tempOutputPath = join(tempDir, `output-${videoId}`);
    try {
      await this.saveTempFile(file, tempInputPath);
      const metadata = await this.getVideoMetadata(tempInputPath);
      await this.videoRepository.update(videoId, {
        metadata: {
          originalFileName: file.originalname,
          mimeType: file.mimetype,
          ...metadata,
        },
        processingProgress: 10,
      });
      const compressedVideo = await this.compressVideo(
        tempInputPath,
        tempOutputPath
      );
      const s3Key = `videos/${videoId}/${Date.now()}-compressed.mp4`;
      const uploadResult = await this.uploadToS3(compressedVideo, s3Key);

      // Update video record with final details
      await this.videoRepository.update(videoId, {
        fileUrl: uploadResult.Location,
        status: "ready",
        quality: {
          resolution: "720p", // Default compressed resolution
          bitrate: "1500k", // Default compressed bitrate
          size: await this.getFileSize(compressedVideo),
        },
        processingProgress: 100,
      });
      await this.cleanup([tempInputPath, tempOutputPath]);
    } catch (error: any) {
      await this.videoRepository.update(videoId, {
        status: "failed",
        processingError: error.message,
      });
      await this.cleanup([tempInputPath, tempOutputPath]);
      throw error;
    }
  }

  private async uploadToS3(
    filePath: string,
    key: string
  ): Promise<S3.ManagedUpload.SendData> {
    const fileStream = require("fs").createReadStream(filePath);
    if (!this.BUCKET_NAME) {
      throw new Error("Bucket name is not defined");
    }
    return await this.s3
      .upload({
        Bucket: this.BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: "video/mp4",
      })
      .promise();
  }

  private async getFileSize(filePath: string): Promise<number> {
    const stats = await require("fs").promises.stat(filePath);
    return stats.size;
  }

  private async cleanup(files: string[]): Promise<void> {
    await Promise.all(files.map((file) => unlink(file).catch(() => {})));
  }

  private async compressVideo(
    inputPath: string,
    outputPath: string
  ): Promise<string> {
    const options = this.PROCESSING_OPTIONS[1]; // Using 720p settings

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          `-vf scale=-2:${options.resolution.replace("p", "")}`,
          `-b:v ${options.bitrate}`,
          `-r ${options.fps}`,
          "-c:v libx264",
          "-preset medium",
          "-crf 23",
          "-c:a aac",
          "-b:a 128k",
          "-movflags +faststart",
        ])
        .output(outputPath)
        .on("end", () => resolve(outputPath))
        .on("error", reject)
        .run();
    });
  }

  private async getVideoMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata:any) => {
        if (err) reject(err);
        const videoStream = metadata.streams.find(
          (s:any) => s.codec_type === "video"
        );
        if (!videoStream) {
          throw new Error("video strema undefined");
        }
        const frameRate = videoStream.r_frame_rate
          ? eval(videoStream.r_frame_rate)
          : 30; // Default to 30fps
        resolve({
          codec: videoStream.codec_name || "unknown",
          fps: frameRate,
          duration: metadata.format.duration,
        });
      });
    });
  }

  private async saveTempFile(
    file: Express.Multer.File | undefined,
    path: string
  ): Promise<void> {
    if (!file) {
      throw new Error("File is required");
    }
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(path);
      writeStream.write(file.buffer);
      writeStream.end();
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
  }

  async generatePresignedUrl(
    fileName: string,
    fileType: string,
    videoId?: string
  ): Promise<{
    url: string; // Pre-signed URL for upload
    videoUrl: string; // Permanent S3 object URL
    expiryDate: Date; // Expiry for the pre-signed URL
    videoId: string;
  }> {
    if (!fileType) {
      throw new ValidationError([
        {
          fields: ["fileType"],
          constants: "fileType is required",
        },
      ]);
    }

    if (!this.BUCKET_NAME) {
      throw new Error("Bucket name is not defined");
    }

    // Generate a unique key for the video
    const timestamp = Date.now();
    const key = `videos/${videoId || timestamp}/${fileName}`;

    // Generate a pre-signed URL for uploading
    const params = {
      Bucket: this.BUCKET_NAME,
      Key: key,
      Expires: 3600, // Pre-signed URL valid for 1 hour
      ContentType: fileType,
    };

    const url = this.s3.getSignedUrl("putObject", params);
    const expiryDate = new Date(Date.now() + params.Expires * 1000);

    const videoUrl = `https://${this.BUCKET_NAME}.s3.amazonaws.com/${key}`;

    // If no videoId provided, create a new video record
    const video = videoId
      ? await this.videoRepository.update(videoId, {
          s3Key: key,
          presignedUrl: url,
          presignedUrlExpiry: expiryDate,
          status: "pending",
        })
      : await this.videoRepository.create({
          title: fileName,
          s3Key: key,
          presignedUrl: url,
          presignedUrlExpiry: expiryDate,
          status: "pending",
          visibility: "private",
        });

    return {
      url,
      videoUrl,
      expiryDate,
      videoId: video.id,
    };
  }

  async saveVideoRecord(videoData: Partial<Video>): Promise<Video> {
    return await this.videoRepository.create(videoData);
  }

  async editVideo(videoId: string, updateData: Partial<Video>): Promise<Video> {
    return await this.videoRepository.update(videoId, updateData);
  }

  async getVideoById(videoId: string): Promise<Video> {
    return await this.videoRepository.findById(videoId);
  }

  async deleteVideo(videoId: string): Promise<void> {
    const video = await this.videoRepository.findById(videoId);
    if (!this.BUCKET_NAME) {
      throw new Error("Bucket name is not defined");
    }
    if (video && video.fileUrl) {
      const key = video.fileUrl.split("/").pop();
      await this.s3
        .deleteObject({
          Bucket: this.BUCKET_NAME,
          Key: `videos/${key}`,
        })
        .promise();
    }
    await this.videoRepository.delete(videoId);
  }
  
}
