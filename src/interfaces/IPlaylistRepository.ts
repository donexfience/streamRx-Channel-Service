import { Playlist } from "../model/schema/playlist.schema";

export interface IPlaylistRepository {
    create(playlistData: Partial<Playlist>): Promise<Playlist>;
    update(playlistId: string, updateData: Partial<Playlist>): Promise<Playlist>;
    delete(playlistId: string): Promise<void>;
    findById(playlistId: string): Promise<Playlist>;
    addVideo(playlistId: string, videoId: string): Promise<Playlist>;
}