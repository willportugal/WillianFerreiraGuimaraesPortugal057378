import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, X } from 'lucide-react';
import { albumService } from '../services/albumService';
import { artistService } from '../services/artistService';
import { Artist } from '../types';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { toast } from 'react-toastify';

const albumSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  releaseYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 5).optional().or(z.literal('')),
  genre: z.string().max(50, 'Gênero muito longo').optional(),
  recordLabel: z.string().max(100, 'Gravadora muito longa').optional(),
  totalTracks: z.coerce.number().min(1).max(100).optional().or(z.literal('')),
  description: z.string().optional(),
});

type AlbumFormData = z.infer<typeof albumSchema>;

export const AlbumFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [artistSearch, setArtistSearch] = useState('');
  const isEditing = !!id;

  // Get artistId from location state (when coming from artist detail page)
  const initialArtistId = (location.state as { artistId?: number })?.artistId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all artists for selection
        const artistsData = await artistService.findAll(0, 100, 'name,asc');
        setAllArtists(artistsData.content);

        // If editing, load album data
        if (id) {
          setIsFetching(true);
          const album = await albumService.findById(parseInt(id));
          reset({
            title: album.title,
            releaseYear: album.releaseYear || '',
            genre: album.genre || '',
            recordLabel: album.recordLabel || '',
            totalTracks: album.totalTracks || '',
            description: album.description || '',
          });

          // Set selected artists
          if (album.artists) {
            const selected = artistsData.content.filter((a) =>
              album.artists!.some((aa) => aa.id === a.id)
            );
            setSelectedArtists(selected);
          }
        } else if (initialArtistId) {
          // Pre-select artist if coming from artist detail page
          const artist = artistsData.content.find((a) => a.id === initialArtistId);
          if (artist) {
            setSelectedArtists([artist]);
          }
        }
      } catch (error) {
        toast.error('Erro ao carregar dados');
        navigate('/albums');
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [id, navigate, reset, initialArtistId]);

  const handleAddArtist = (artist: Artist) => {
    if (!selectedArtists.find((a) => a.id === artist.id)) {
      setSelectedArtists([...selectedArtists, artist]);
    }
    setArtistSearch('');
  };

  const handleRemoveArtist = (artistId: number) => {
    setSelectedArtists(selectedArtists.filter((a) => a.id !== artistId));
  };

  const filteredArtists = allArtists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(artistSearch.toLowerCase()) &&
      !selectedArtists.find((a) => a.id === artist.id)
  );

  const onSubmit = async (data: AlbumFormData) => {
    setIsLoading(true);
    try {
      const albumData = {
        title: data.title,
        releaseYear: data.releaseYear ? Number(data.releaseYear) : undefined,
        genre: data.genre || undefined,
        recordLabel: data.recordLabel || undefined,
        totalTracks: data.totalTracks ? Number(data.totalTracks) : undefined,
        description: data.description || undefined,
        artistIds: selectedArtists.map((a) => a.id),
      };

      if (isEditing) {
        await albumService.update(parseInt(id!), albumData);
        toast.success('Álbum atualizado com sucesso');
      } else {
        await albumService.create(albumData);
        toast.success('Álbum criado com sucesso');
      }
      navigate('/albums');
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar álbum' : 'Erro ao criar álbum');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/albums')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Álbum' : 'Novo Álbum'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Atualize as informações do álbum' : 'Preencha os dados do novo álbum'}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Informações do Álbum</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Título *"
                {...register('title')}
                error={errors.title?.message}
                placeholder="Título do álbum"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Ano de Lançamento"
                  type="number"
                  {...register('releaseYear')}
                  error={errors.releaseYear?.message}
                  placeholder="Ex: 2023"
                />

                <Input
                  label="Total de Faixas"
                  type="number"
                  {...register('totalTracks')}
                  error={errors.totalTracks?.message}
                  placeholder="Ex: 12"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Gênero Musical"
                  {...register('genre')}
                  error={errors.genre?.message}
                  placeholder="Ex: Rock, Pop"
                />

                <Input
                  label="Gravadora"
                  {...register('recordLabel')}
                  error={errors.recordLabel?.message}
                  placeholder="Ex: Sony Music"
                />
              </div>

              {/* Artist selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artistas
                </label>

                {/* Selected artists */}
                {selectedArtists.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedArtists.map((artist) => (
                      <span
                        key={artist.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                      >
                        {artist.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveArtist(artist.id)}
                          className="hover:text-primary-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Artist search */}
                <div className="relative">
                  <Input
                    placeholder="Buscar artista para adicionar..."
                    value={artistSearch}
                    onChange={(e) => setArtistSearch(e.target.value)}
                  />
                  {artistSearch && filteredArtists.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredArtists.slice(0, 10).map((artist) => (
                        <button
                          key={artist.id}
                          type="button"
                          onClick={() => handleAddArtist(artist)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          {artist.name}
                          {artist.genre && (
                            <span className="ml-2 text-gray-400">({artist.genre})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Descrição do álbum..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/albums')}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Salvar Alterações' : 'Criar Álbum'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
