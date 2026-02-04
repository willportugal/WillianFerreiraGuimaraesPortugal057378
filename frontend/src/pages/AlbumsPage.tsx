import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Music } from 'lucide-react';
import { albumService } from '../services/albumService';
import { Album, Page } from '../types';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { toast } from 'react-toastify';

export const AlbumsPage: React.FC = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Page<Album> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; album: Album | null }>({
    open: false,
    album: null,
  });

  const loadAlbums = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await albumService.findAll(
        currentPage,
        10,
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadAlbums();
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

  const getPrimaryCover = (album: Album) => {
    if (!album.covers || album.covers.length === 0) return null;
    const primary = album.covers.find((c) => c.isPrimary);
    return primary?.presignedUrl || album.covers[0]?.presignedUrl;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Álbuns</h1>
            <p className="text-sm text-gray-500">
              Gerencie os álbuns cadastrados no sistema
            </p>
          </div>
          <Button onClick={() => navigate('/albums/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Álbum
          </Button>
        </div>

        {/* Search and filters */}
        <Card>
          <CardContent className="py-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Albums grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : albums && albums.content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {albums.content.map((album) => (
                <Card key={album.id} hoverable>
                  <div
                    className="aspect-square bg-gray-200 relative overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/albums/${album.id}`)}
                  >
                    {getPrimaryCover(album) ? (
                      <img
                        src={getPrimaryCover(album)!}
                        alt={album.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent>
                    <h3
                      className="font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600"
                      onClick={() => navigate(`/albums/${album.id}`)}
                    >
                      {album.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {album.artists?.map((a) => a.name).join(', ') || 'Artista desconhecido'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {album.releaseYear || 'Ano desconhecido'}
                      </span>
                      {album.genre && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                          {album.genre}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/albums/${album.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/albums/${album.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteModal({ open: true, album })}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Pagination
              currentPage={albums.number}
              totalPages={albums.totalPages}
              totalElements={albums.totalElements}
              pageSize={albums.size}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Nenhum álbum encontrado</p>
              <Button
                className="mt-4"
                onClick={() => navigate('/albums/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar primeiro álbum
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete confirmation modal */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, album: null })}
          title="Confirmar exclusão"
        >
          <p className="text-gray-600">
            Tem certeza que deseja excluir o álbum{' '}
            <strong>{deleteModal.album?.title}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta ação não pode ser desfeita. As capas também serão removidas.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, album: null })}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
