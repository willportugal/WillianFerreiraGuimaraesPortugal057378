import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { artistService } from '../services/artistService';
import { Artist } from '../types';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { toast } from 'react-toastify';

const artistSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  country: z.string().max(100, 'País muito longo').optional(),
  formationYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional().or(z.literal('')),
  genre: z.string().max(50, 'Gênero muito longo').optional(),
  biography: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type ArtistFormData = z.infer<typeof artistSchema>;

export const ArtistFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
  });

  useEffect(() => {
    const loadArtist = async () => {
      if (!id) return;

      setIsFetching(true);
      try {
        const artist = await artistService.findById(parseInt(id));
        reset({
          name: artist.name,
          country: artist.country || '',
          formationYear: artist.formationYear || '',
          genre: artist.genre || '',
          biography: artist.biography || '',
          imageUrl: artist.imageUrl || '',
        });
      } catch (error) {
        toast.error('Erro ao carregar artista');
        navigate('/artists');
      } finally {
        setIsFetching(false);
      }
    };

    loadArtist();
  }, [id, navigate, reset]);

  const onSubmit = async (data: ArtistFormData) => {
    setIsLoading(true);
    try {
      const artistData = {
        name: data.name,
        country: data.country || undefined,
        formationYear: data.formationYear ? Number(data.formationYear) : undefined,
        genre: data.genre || undefined,
        biography: data.biography || undefined,
        imageUrl: data.imageUrl || undefined,
      };

      if (isEditing) {
        await artistService.update(parseInt(id!), artistData);
        toast.success('Artista atualizado com sucesso');
      } else {
        await artistService.create(artistData);
        toast.success('Artista criado com sucesso');
      }
      navigate('/artists');
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar artista' : 'Erro ao criar artista');
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
          <Button variant="ghost" onClick={() => navigate('/artists')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Artista' : 'Novo Artista'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Atualize as informações do artista' : 'Preencha os dados do novo artista'}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Informações do Artista</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome *"
                {...register('name')}
                error={errors.name?.message}
                placeholder="Nome do artista ou banda"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="País"
                  {...register('country')}
                  error={errors.country?.message}
                  placeholder="Ex: Brasil"
                />

                <Input
                  label="Ano de Formação"
                  type="number"
                  {...register('formationYear')}
                  error={errors.formationYear?.message}
                  placeholder="Ex: 1985"
                />
              </div>

              <Input
                label="Gênero Musical"
                {...register('genre')}
                error={errors.genre?.message}
                placeholder="Ex: Rock, Pop, Sertanejo"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biografia
                </label>
                <textarea
                  {...register('biography')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Conte a história do artista..."
                />
                {errors.biography && (
                  <p className="mt-1 text-sm text-red-600">{errors.biography.message}</p>
                )}
              </div>

              <Input
                label="URL da Imagem"
                {...register('imageUrl')}
                error={errors.imageUrl?.message}
                placeholder="https://exemplo.com/imagem.jpg"
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/artists')}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Salvar Alterações' : 'Criar Artista'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
