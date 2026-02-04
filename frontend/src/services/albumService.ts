import api from './api';
import { ApiResponse, Album, AlbumRequest, AlbumCover, Page } from '../types';

/**
 * Serviço de álbuns - Facade Pattern
 */
export const albumService = {
  /**
   * Lista álbuns com paginação e filtros
   */
  async findAll(
    page = 0,
    size = 10,
    sort = 'title,asc',
    filters?: { title?: string; artistName?: string; artistId?: number }
  ): Promise<Page<Album>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (filters?.title) {
      params.append('title', filters.title);
    }
    if (filters?.artistName) {
      params.append('artistName', filters.artistName);
    }
    if (filters?.artistId) {
      params.append('artistId', filters.artistId.toString());
    }

    const response = await api.get<ApiResponse<Page<Album>>>(`/api/v1/albums?${params}`);
    return response.data.data;
  },

  /**
   * Busca álbum por ID
   */
  async findById(id: number): Promise<Album> {
    const response = await api.get<ApiResponse<Album>>(`/api/v1/albums/${id}`);
    return response.data.data;
  },

  /**
   * Cria novo álbum
   */
  async create(album: AlbumRequest): Promise<Album> {
    const response = await api.post<ApiResponse<Album>>('/api/v1/albums', album);
    return response.data.data;
  },

  /**
   * Atualiza álbum existente
   */
  async update(id: number, album: AlbumRequest): Promise<Album> {
    const response = await api.put<ApiResponse<Album>>(`/api/v1/albums/${id}`, album);
    return response.data.data;
  },

  /**
   * Remove álbum
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/albums/${id}`);
  },

  /**
   * Upload de capas para o álbum
   */
  async uploadCovers(
    albumId: number,
    files: File[],
    setPrimary = true
  ): Promise<AlbumCover[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<ApiResponse<AlbumCover[]>>(
      `/api/v1/albums/${albumId}/covers?setPrimary=${setPrimary}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Remove capa do álbum
   */
  async deleteCover(albumId: number, coverId: number): Promise<void> {
    await api.delete(`/api/v1/albums/${albumId}/covers/${coverId}`);
  },

  /**
   * Define capa como principal
   */
  async setPrimaryCover(albumId: number, coverId: number): Promise<AlbumCover> {
    const response = await api.put<ApiResponse<AlbumCover>>(
      `/api/v1/albums/${albumId}/covers/${coverId}/primary`
    );
    return response.data.data;
  },
};
