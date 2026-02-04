import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Music, Calendar, Tag, Upload, Trash2, Star, Users } from 'lucide-react';
import { albumService } from '../services/albumService';
import { Album, AlbumCover } from '../types';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { toast } from 'react-toastify';

export const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; cover: AlbumCover | null }>({
    open: false,
    cover: null,
  });

  const loadAlbum = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await albumService.findById(parseInt(id));
      setAlbum(data);
    } catch (error) {
      toast.error('Erro ao carregar álbum');
      navigate('/albums');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlbum();
  }, [id, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !album) return;

    setIsUploading(true);
    try {
      await albumService.uploadCovers(album.id, Array.from(files), true);
      toast.success('Capa(s) enviada(s) com sucesso');
      loadAlbum();
    } catch (error) {
      toast.error('Erro ao enviar capa(s)');
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimary = async (coverId: number) => {
    if (!album) return;

    try {
      await albumService.setPrimaryCover(album.id, coverId);
      toast.success('Capa principal definida');
      loadAlbum();
    } catch (error) {
      toast.error('Erro ao definir capa principal');
      console.error(error);
    }
  };

  const handleDeleteCover = async () => {
    if (!album || !deleteModal.cover) return;

    try {
      await albumService.deleteCover(album.id, deleteModal.cover.id);
      toast.success('Capa removida');
      setDeleteModal({ open: false, cover: null });
      loadAlbum();
    } catch (error) {
      toast.error('Erro ao remover capa');
      console.error(error);
    }
  };

  const getPrimaryCover = () => {
    if (!album?.covers || album.covers.length === 0) return null;
    const primary = album.covers.find((c) => c.isPrimary);
    return primary?.presignedUrl || album.covers[0]?.presignedUrl;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }

  if (!album) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/albums')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{album.title}</h1>
              <p className="text-sm text-gray-500">Detalhes do álbum</p>
            </div>
          </div>
          <Button onClick={() => navigate(`/albums/${album.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cover and info */}
          <Card className="lg:col-span-1">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 relative overflow-hidden">
                {getPrimaryCover() ? (
                  <img
                    src={getPrimaryCover()!}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
            <CardContent className="space-y-4">
              {album.releaseYear && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ano de Lançamento</p>
                    <p className="font-medium">{album.releaseYear}</p>
                  </div>
                </div>
              )}

              {album.genre && (
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Gênero</p>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                      {album.genre}
                    </span>
                  </div>
                </div>
              )}

              {album.recordLabel && (
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Gravadora</p>
                    <p className="font-medium">{album.recordLabel}</p>
                  </div>
                </div>
              )}

              {album.totalTracks && (
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total de Faixas</p>
                    <p className="font-medium">{album.totalTracks}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description and artists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artists */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-semibold">Artistas</h2>
                </div>
              </CardHeader>
              <CardContent>
                {album.artists && album.artists.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {album.artists.map((artist) => (
                      <Link
                        key={artist.id}
                        to={`/artists/${artist.id}`}
                        className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{artist.name}</span>
                        {artist.genre && (
                          <span className="ml-2 text-xs text-gray-500">({artist.genre})</span>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum artista associado</p>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Descrição</h2>
              </CardHeader>
              <CardContent>
                {album.description ? (
                  <p className="text-gray-600 whitespace-pre-wrap">{album.description}</p>
                ) : (
                  <p className="text-gray-400 italic">Nenhuma descrição cadastrada</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Covers gallery */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Capas do Álbum</h2>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Capa
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {album.covers && album.covers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {album.covers.map((cover) => (
                  <div
                    key={cover.id}
                    className={`relative group rounded-lg overflow-hidden border-2 ${
                      cover.isPrimary ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <div className="aspect-square bg-gray-200">
                      <img
                        src={cover.presignedUrl}
                        alt={cover.fileName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {cover.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Principal
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {!cover.isPrimary && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSetPrimary(cover.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteModal({ open: true, cover })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma capa cadastrada</p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar primeira capa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete cover modal */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, cover: null })}
          title="Remover capa"
        >
          <p className="text-gray-600">
            Tem certeza que deseja remover esta capa?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta ação não pode ser desfeita.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, cover: null })}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteCover}>
              Remover
            </Button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
