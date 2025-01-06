import { S3 } from 'aws-sdk';

import { VideoRepository } from '../repository/VideoRepository';


export class VideoService {
    private s3: S3;
    private readonly BUCKET_NAME = process.env.AWS_S3_BUCKET;

    constructor(private videoRepository: VideoRepository) {
        this.s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
    }

    generatePresignedUrl(fileName: string, fileType: string): string {
        const params = {
            Bucket: this.BUCKET_NAME,
            Key: `videos/${fileName}`,
            Expires: 3600,
            ContentType: fileType
        };

        return this.s3.getSignedUrl('putObject', params);
    }

    async saveVideoRecord(videoData: Partial<Video>): Promise<Video> {
        return await this.videoRepository.create(videoData);
    }

    async editVideo(videoId: string, updateData: Partial<Video>): Promise<Video> {
        return await this.videoRepository.update(videoId, updateData);
    }

    async deleteVideo(videoId: string): Promise<void> {
        const video = await this.videoRepository.findById(videoId);
        if (video && video.fileUrl) {
            const key = video.fileUrl.split('/').pop();
            await this.s3.deleteObject({
                Bucket: this.BUCKET_NAME,
                Key: `videos/${key}`
            }).promise();
        }
        await this.videoRepository.delete(videoId);
    }
}
