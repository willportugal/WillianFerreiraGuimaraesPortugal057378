import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Music, Calendar, MapPin, Tag } from 'lucide-react';
import { artistService } from '../services/artistService';
import { Artist } from '../types';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { toast } from 'react-toastify';

export const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArtist = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await artistService.findById(parseInt(id));
        setArtist(data);
      } catch (error) {
        toast.error('Erro ao carregar artista');
        navigate('/artists');
      } finally {
        setIsLoading(false);
      }
    };

    loadArtist();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }

  if (!artist) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/artists')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{artist.name}</h1>
              <p className="text-sm text-gray-500">Detalhes do artista</p>
            </div>
          </div>
          <Button onClick={() => navigate(`/artists/${artist.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <h2 className="text-lg font-semibold">Informações</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {artist.country && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">País</p>
                    <p className="font-medium">{artist.country}</p>
                  </div>
                </div>
              )}

              {artist.formationYear && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ano de Formação</p>
                    <p className="font-medium">{artist.formationYear}</p>
                  </div>
                </div>
              )}

              {artist.genre && (
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Gênero</p>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                      {artist.genre}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total de Álbuns</p>
                  <p className="font-medium">{artist.albumCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biography card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-lg font-semibold">Biografia</h2>
            </CardHeader>
            <CardContent>
              {artist.biography ? (
                <p className="text-gray-600 whitespace-pre-wrap">{artist.biography}</p>
              ) : (
                <p className="text-gray-400 italic">Nenhuma biografia cadastrada</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Albums */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Álbuns</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/albums/new', { state: { artistId: artist.id } })}
              >
                Adicionar Álbum
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {artist.albums && artist.albums.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {artist.albums.map((album) => (
                  <Link
                    key={album.id}
                    to={`/albums/${album.id}`}
                    className="group"
                  >
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {album.primaryCoverUrl ? (
                          <img
                            src={album.primaryCoverUrl}
                            alt={album.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 truncate group-hover:text-primary-600">
                        {album.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {album.releaseYear || 'Ano desconhecido'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum álbum cadastrado para este artista
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
