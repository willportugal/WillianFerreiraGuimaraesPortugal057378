import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter, Grid, List, Play, User } from 'lucide-react';
import { artistService } from '../services/artistService';
import { Artist, Page } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

export const ArtistsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artists, setArtists] = useState<Page<Artist> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; artist: Artist | null }>({
    open: false,
    artist: null,
  });
  const isAdmin = user?.role === 'ADMIN';

  const loadArtists = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await artistService.findAll(
        currentPage,
        10,
        `${sortField},${sortDirection}`,
        searchTerm || undefined
      );
      setArtists(data);
    } catch (error) {
      toast.error('Erro ao carregar artistas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortField, sortDirection, searchTerm]);

  useEffect(() => {
    loadArtists();
  }, [loadArtists]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadArtists();
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const handleDelete = async () => {
    if (!deleteModal.artist) return;

    try {
      await artistService.delete(deleteModal.artist.id);
      toast.success('Artista removido com sucesso');
      setDeleteModal({ open: false, artist: null });
      loadArtists();
    } catch (error) {
      toast.error('Erro ao remover artista');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Artistas</h1>
          <p className="text-spotify-text-gray mt-1">
            Explore todos os artistas da sua biblioteca
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate('/artists/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-spotify-green text-black font-bold rounded-full hover:bg-spotify-green-dark hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Novo Artista
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
            placeholder="Buscar artistas..."
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
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="createdAt-desc">Mais recentes</option>
            <option value="createdAt-asc">Mais antigos</option>
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
      ) : artists && artists.content.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {artists.content.map((artist) => (
              <Link
                key={artist.id}
                to={`/artists/${artist.id}`}
                className="card-hover group p-4 rounded-lg transition-all duration-300"
              >
                <div className="relative mb-4">
                  <div className="aspect-square rounded-full overflow-hidden bg-spotify-medium-gray shadow-lg">
                    {artist.imageUrl ? (
                      <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-spotify-medium-gray to-spotify-light-gray">
                        <User className="w-16 h-16 text-spotify-text-gray" />
                      </div>
                    )}
                  </div>
                  <button className="play-button absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-xl hover:scale-105 hover:bg-spotify-green-dark transition-all">
                    <Play className="w-5 h-5 text-black ml-0.5" />
                  </button>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white truncate mb-1 group-hover:underline">{artist.name}</h3>
                  <p className="text-sm text-spotify-text-gray truncate">Artista</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {artists.content.map((artist, index) => (
              <Link
                key={artist.id}
                to={`/artists/${artist.id}`}
                className="flex items-center gap-4 p-3 rounded-md hover:bg-spotify-light-gray transition-colors group"
              >
                <span className="w-8 text-center text-spotify-text-gray">{index + 1}</span>
                <div className="w-12 h-12 rounded-full bg-spotify-medium-gray overflow-hidden flex-shrink-0">
                  {artist.imageUrl ? (
                    <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-spotify-text-gray" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{artist.name}</h3>
                  <p className="text-sm text-spotify-text-gray truncate">{artist.genre} • {artist.country}</p>
                </div>
                <span className="text-sm text-spotify-text-gray">{artist.albumCount || 0} álbuns</span>
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.preventDefault(); navigate(`/artists/${artist.id}/edit`); }} className="p-2 text-spotify-text-gray hover:text-white">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setDeleteModal({ open: true, artist }); }} className="p-2 text-spotify-text-gray hover:text-red-500">
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
          <p className="text-spotify-text-gray text-lg">Nenhum artista encontrado</p>
          {isAdmin && (
            <button
              onClick={() => navigate('/artists/new')}
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-spotify-green text-black font-bold rounded-full hover:bg-spotify-green-dark transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar primeiro artista
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {artists && artists.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-spotify-light-gray text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-spotify-medium-gray transition-colors"
          >
            Anterior
          </button>
          <span className="text-spotify-text-gray px-4">
            Página {currentPage + 1} de {artists.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(artists.totalPages - 1, currentPage + 1))}
            disabled={currentPage >= artists.totalPages - 1}
            className="px-4 py-2 bg-spotify-light-gray text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-spotify-medium-gray transition-colors"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, artist: null })}
        title="Confirmar exclusão"
      >
        <p className="text-spotify-text-gray">
          Tem certeza que deseja excluir o artista{' '}
          <strong className="text-white">{deleteModal.artist?.name}</strong>?
        </p>
        <p className="text-sm text-spotify-text-gray mt-2">
          Esta ação não pode ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDeleteModal({ open: false, artist: null })}
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
