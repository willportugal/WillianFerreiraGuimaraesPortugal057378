import { artistService } from '../artistService';
import api from '../api';

// Mock do módulo api
jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('ArtistService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve buscar artistas com paginação padrão', async () => {
      const mockResponse = {
        data: {
          data: {
            content: [{ id: 1, name: 'Artista 1' }],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10,
          },
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await artistService.findAll();

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/api/v1/artists?page=0&size=10&sort=name%2Casc'
      );
      expect(result.content).toHaveLength(1);
      expect(result.content[0].name).toBe('Artista 1');
    });

    it('deve buscar artistas com filtro de nome', async () => {
      const mockResponse = {
        data: {
          data: {
            content: [{ id: 1, name: 'Legião Urbana' }],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10,
          },
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await artistService.findAll(0, 10, 'name,asc', 'Legião');

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/api/v1/artists?page=0&size=10&sort=name%2Casc&name=Legi%C3%A3o'
      );
      expect(result.content[0].name).toBe('Legião Urbana');
    });
  });

  describe('findById', () => {
    it('deve buscar artista por ID', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, name: 'Artista 1', genre: 'Rock' },
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await artistService.findById(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/artists/1');
      expect(result.id).toBe(1);
      expect(result.name).toBe('Artista 1');
    });
  });

  describe('create', () => {
    it('deve criar novo artista', async () => {
      const newArtist = { name: 'Novo Artista', genre: 'Pop' };
      const mockResponse = {
        data: {
          data: { id: 1, ...newArtist },
        },
      };

      mockedApi.post.mockResolvedValue(mockResponse);

      const result = await artistService.create(newArtist);

      expect(mockedApi.post).toHaveBeenCalledWith('/api/v1/artists', newArtist);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Novo Artista');
    });
  });

  describe('update', () => {
    it('deve atualizar artista existente', async () => {
      const updatedArtist = { name: 'Artista Atualizado', genre: 'Rock' };
      const mockResponse = {
        data: {
          data: { id: 1, ...updatedArtist },
        },
      };

      mockedApi.put.mockResolvedValue(mockResponse);

      const result = await artistService.update(1, updatedArtist);

      expect(mockedApi.put).toHaveBeenCalledWith('/api/v1/artists/1', updatedArtist);
      expect(result.name).toBe('Artista Atualizado');
    });
  });

  describe('delete', () => {
    it('deve remover artista', async () => {
      mockedApi.delete.mockResolvedValue({});

      await artistService.delete(1);

      expect(mockedApi.delete).toHaveBeenCalledWith('/api/v1/artists/1');
    });
  });

  describe('addAlbum', () => {
    it('deve adicionar álbum ao artista', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, name: 'Artista', albums: [{ id: 1, title: 'Álbum 1' }] },
        },
      };

      mockedApi.post.mockResolvedValue(mockResponse);

      const result = await artistService.addAlbum(1, 1);

      expect(mockedApi.post).toHaveBeenCalledWith('/api/v1/artists/1/albums/1');
      expect(result.albums).toHaveLength(1);
    });
  });

  describe('removeAlbum', () => {
    it('deve remover álbum do artista', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, name: 'Artista', albums: [] },
        },
      };

      mockedApi.delete.mockResolvedValue(mockResponse);

      const result = await artistService.removeAlbum(1, 1);

      expect(mockedApi.delete).toHaveBeenCalledWith('/api/v1/artists/1/albums/1');
      expect(result.albums).toHaveLength(0);
    });
  });
});
