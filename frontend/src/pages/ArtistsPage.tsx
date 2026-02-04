import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { artistService } from '../services/artistService';
import { Artist, Page } from '../types';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { toast } from 'react-toastify';

export const ArtistsPage: React.FC = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Page<Artist> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; artist: Artist | null }>({
    open: false,
    artist: null,
  });

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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Artistas</h1>
            <p className="text-sm text-gray-500">
              Gerencie os artistas cadastrados no sistema
            </p>
          </div>
          <Button onClick={() => navigate('/artists/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Artista
          </Button>
        </div>

        {/* Search and filters */}
        <Card>
          <CardContent className="py-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome..."
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

        {/* Artists list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : artists && artists.content.length > 0 ? (
          <>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Nome {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      País
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('genre')}
                    >
                      Gênero {sortField === 'genre' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Álbuns
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {artists.content.map((artist) => (
                    <tr key={artist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {artist.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {artist.country || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                          {artist.genre || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {artist.albumCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/artists/${artist.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/artists/${artist.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteModal({ open: true, artist })}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={artists.number}
                totalPages={artists.totalPages}
                totalElements={artists.totalElements}
                pageSize={artists.size}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Nenhum artista encontrado</p>
              <Button
                className="mt-4"
                onClick={() => navigate('/artists/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar primeiro artista
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete confirmation modal */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, artist: null })}
          title="Confirmar exclusão"
        >
          <p className="text-gray-600">
            Tem certeza que deseja excluir o artista{' '}
            <strong>{deleteModal.artist?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta ação não pode ser desfeita.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, artist: null })}
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
