import api from './api';
import { ApiResponse, Artist, ArtistRequest, Page } from '../types';

/**
 * Serviço de artistas - Facade Pattern
 */
export const artistService = {
  /**
   * Lista artistas com paginação e filtro
   */
  async findAll(
    page = 0,
    size = 10,
    sort = 'name,asc',
    name?: string
  ): Promise<Page<Artist>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });
    
    if (name) {
      params.append('name', name);
    }

    const response = await api.get<ApiResponse<Page<Artist>>>(
      `/api/v1/artists?${params}`
    );
    return response.data.data;
  },

  /**
   * Busca artista por ID
   */
  async findById(id: number): Promise<Artist> {
    const response = await api.get<ApiResponse<Artist>>(`/api/v1/artists/${id}`);
    return response.data.data;
  },

  /**
   * Cria novo artista
   */
  async create(artist: ArtistRequest): Promise<Artist> {
    const response = await api.post<ApiResponse<Artist>>('/api/v1/artists', artist);
    return response.data.data;
  },

  /**
   * Atualiza artista existente
   */
  async update(id: number, artist: ArtistRequest): Promise<Artist> {
    const response = await api.put<ApiResponse<Artist>>(`/api/v1/artists/${id}`, artist);
    return response.data.data;
  },

  /**
   * Remove artista
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/artists/${id}`);
  },

  /**
   * Adiciona álbum ao artista
   */
  async addAlbum(artistId: number, albumId: number): Promise<Artist> {
    const response = await api.post<ApiResponse<Artist>>(
      `/api/v1/artists/${artistId}/albums/${albumId}`
    );
    return response.data.data;
  },

  /**
   * Remove álbum do artista
   */
  async removeAlbum(artistId: number, albumId: number): Promise<Artist> {
    const response = await api.delete<ApiResponse<Artist>>(
      `/api/v1/artists/${artistId}/albums/${albumId}`
    );
    return response.data.data;
  },
};
