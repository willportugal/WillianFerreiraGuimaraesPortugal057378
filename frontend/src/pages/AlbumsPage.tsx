import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Filter, Grid, List, Play, Disc3 } from 'lucide-react';
import { albumService } from '../services/albumService';
import { Album, Page } from '../types';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

export const AlbumsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Page<Album> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; album: Album | null }>({
    open: false,
    album: null,
  });
  const isAdmin = user?.role === 'ADMIN';

  const loadAlbums = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await albumService.findAll(
        currentPage,
        24,
        `${sortField},${sortDirection}`,
        searchTerm ? { title: searchTerm } : undefined
      );
      setAlbums(data);
    } catch (error) {
      toast.error('Erro ao carregar álbuns');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortField, sortDirection, searchTerm]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const handleDelete = async () => {
    if (!deleteModal.album) return;

    try {
      await albumService.delete(deleteModal.album.id);
      toast.success('Álbum removido com sucesso');
      setDeleteModal({ open: false, album: null });
      loadAlbums();
    } catch (error) {
      toast.error('Erro ao remover álbum');
      console.error(error);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchTerm(query);
      setCurrentPage(0);
    }, 300),
    []
  );

  const getPrimaryCover = (album: Album) => {
    if (!album.covers || album.covers.length === 0) return null;
    const primary = album.covers.find((c) => c.isPrimary);
    return primary?.presignedUrl || album.covers[0]?.presignedUrl;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Álbuns</h1>
          <p className="text-spotify-text-gray mt-1">
            Explore todos os álbuns da sua biblioteca
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate('/albums/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-spotify-green text-black font-bold rounded-full hover:bg-spotify-green-dark hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Novo Álbum
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 bg-spotify-light-gray/50 rounded-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-spotify-text-gray" />
          <input
            type="text"
            placeholder="Buscar álbuns..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-spotify-medium-gray text-white rounded-md placeholder-spotify-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-spotify-text-gray" />
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [newSortBy, newSortDir] = e.target.value.split('-');
              setSortField(newSortBy);
              setSortDirection(newSortDir as 'asc' | 'desc');
            }}
            className="bg-spotify-medium-gray text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green"
          >
            <option value="title-asc">Título (A-Z)</option>
            <option value="title-desc">Título (Z-A)</option>
            <option value="releaseYear-desc">Mais recentes</option>
            <option value="releaseYear-asc">Mais antigos</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-spotify-medium-gray rounded-md p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-spotify-green text-black' : 'text-spotify-text-gray hover:text-white'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-spotify-green text-black' : 'text-spotify-text-gray hover:text-white'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : albums && albums.content.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {albums.content.map((album) => (
              <Link
                key={album.id}
                to={`/albums/${album.id}`}
                className="card-hover group p-4 rounded-lg transition-all duration-300"
              >
                <div className="relative mb-4">
                  <div className="aspect-square rounded-md overflow-hidden bg-spotify-medium-gray shadow-lg">
                    {getPrimaryCover(album) ? (
                      <img
                        src={getPrimaryCover(album)!}
                        alt={album.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-spotify-medium-gray to-spotify-light-gray">
                        <Disc3 className="w-16 h-16 text-spotify-text-gray" />
                      </div>
                    )}
                  </div>
                  <button
                    className="play-button absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-xl hover:scale-105 hover:bg-spotify-green-dark transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      // Play album
                    }}
                  >
                    <Play className="w-5 h-5 text-black ml-0.5" />
                  </button>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white truncate mb-1 group-hover:underline">
                    {album.title}
                  </h3>
                  <p className="text-sm text-spotify-text-gray truncate">
                    {album.releaseYear} • {album.artists?.map((a) => a.name).join(', ') || 'Artista desconhecido'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {albums.content.map((album, index) => (
              <Link
                key={album.id}
                to={`/albums/${album.id}`}
                className="flex items-center gap-4 p-3 rounded-md hover:bg-spotify-light-gray transition-colors group"
              >
                <span className="w-8 text-center text-spotify-text-gray">{index + 1}</span>
                <div className="w-12 h-12 rounded bg-spotify-medium-gray overflow-hidden flex-shrink-0">
                  {getPrimaryCover(album) ? (
                    <img
                      src={getPrimaryCover(album)!}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Disc3 className="w-6 h-6 text-spotify-text-gray" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{album.title}</h3>
                  <p className="text-sm text-spotify-text-gray truncate">
                    {album.artists?.map((a) => a.name).join(', ') || 'Artista desconhecido'}
                  </p>
                </div>
                <span className="text-sm text-spotify-text-gray">{album.releaseYear}</span>
                {album.genre && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-spotify-medium-gray text-spotify-text-gray">
                    {album.genre}
                  </span>
                )}
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/albums/${album.id}/edit`);
                      }}
                      className="p-2 text-spotify-text-gray hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteModal({ open: true, album });
                      }}
                      className="p-2 text-spotify-text-gray hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <p className="text-spotify-text-gray text-lg">Nenhum álbum encontrado</p>
          {isAdmin && (
            <button
              onClick={() => navigate('/albums/new')}
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-spotify-green text-black font-bold rounded-full hover:bg-spotify-green-dark transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar primeiro álbum
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {albums && albums.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-spotify-light-gray text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-spotify-medium-gray transition-colors"
          >
            Anterior
          </button>
          <span className="text-spotify-text-gray px-4">
            Página {currentPage + 1} de {albums.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(albums.totalPages - 1, currentPage + 1))}
            disabled={currentPage >= albums.totalPages - 1}
            className="px-4 py-2 bg-spotify-light-gray text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-spotify-medium-gray transition-colors"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, album: null })}
        title="Confirmar exclusão"
      >
        <p className="text-spotify-text-gray">
          Tem certeza que deseja excluir o álbum{' '}
          <strong className="text-white">{deleteModal.album?.title}</strong>?
        </p>
        <p className="text-sm text-spotify-text-gray mt-2">
          Esta ação não pode ser desfeita. As capas também serão removidas.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDeleteModal({ open: false, album: null })}
            className="px-4 py-2 bg-spotify-medium-gray text-white rounded-full hover:bg-spotify-light-gray transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
};
