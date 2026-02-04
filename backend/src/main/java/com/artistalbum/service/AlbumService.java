package com.artistalbum.service;

import com.artistalbum.dto.AlbumDTO;
import com.artistalbum.entity.Album;
import com.artistalbum.entity.AlbumCover;
import com.artistalbum.entity.Artist;
import com.artistalbum.exception.ResourceNotFoundException;
import com.artistalbum.repository.AlbumCoverRepository;
import com.artistalbum.repository.AlbumRepository;
import com.artistalbum.repository.ArtistRepository;
import com.artistalbum.websocket.AlbumNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Serviço para gerenciamento de álbuns.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final AlbumCoverRepository albumCoverRepository;
    private final MinioService minioService;
    private final AlbumNotificationService notificationService;

    /**
     * Lista todos os álbuns com paginação.
     */
    @Transactional(readOnly = true)
    public Page<AlbumDTO.Response> findAll(Pageable pageable) {
        log.debug("Buscando todos os álbuns com paginação");
        return albumRepository.findAll(pageable)
                .map(this::toResponseWithPresignedUrls);
    }

    /**
     * Busca álbuns por título com paginação.
     */
    @Transactional(readOnly = true)
    public Page<AlbumDTO.Response> findByTitle(String title, Pageable pageable) {
        log.debug("Buscando álbuns por título: {}", title);
        return albumRepository.findByTitleContainingIgnoreCase(title, pageable)
                .map(this::toResponseWithPresignedUrls);
    }

    /**
     * Busca álbuns por nome do artista.
     */
    @Transactional(readOnly = true)
    public Page<AlbumDTO.Response> findByArtistName(String artistName, Pageable pageable) {
        log.debug("Buscando álbuns por nome do artista: {}", artistName);
        return albumRepository.findByArtistNameContaining(artistName, pageable)
                .map(this::toResponseWithPresignedUrls);
    }

    /**
     * Busca álbuns de um artista específico.
     */
    @Transactional(readOnly = true)
    public Page<AlbumDTO.Response> findByArtistId(Long artistId, Pageable pageable) {
        log.debug("Buscando álbuns do artista ID: {}", artistId);
        return albumRepository.findByArtistId(artistId, pageable)
                .map(this::toResponseWithPresignedUrls);
    }

    /**
     * Busca álbum por ID com detalhes.
     */
    @Transactional(readOnly = true)
    public AlbumDTO.Response findById(Long id) {
        log.debug("Buscando álbum por ID: {}", id);
        Album album = albumRepository.findByIdWithArtistsAndCovers(id)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum", "id", id));
        return toResponseWithPresignedUrls(album);
    }

    /**
     * Cria um novo álbum.
     */
    @Transactional
    public AlbumDTO.Response create(AlbumDTO.Request request) {
        log.info("Criando novo álbum: {}", request.getTitle());

        Album album = Album.builder()
                .title(request.getTitle())
                .releaseYear(request.getReleaseYear())
                .genre(request.getGenre())
                .recordLabel(request.getRecordLabel())
                .totalTracks(request.getTotalTracks())
                .description(request.getDescription())
                .build();

        // Associar artistas se fornecidos
        if (request.getArtistIds() != null && !request.getArtistIds().isEmpty()) {
            Set<Artist> artists = new HashSet<>(artistRepository.findAllById(request.getArtistIds()));
            for (Artist artist : artists) {
                artist.getAlbums().add(album);
            }
            album.setArtists(artists);
        }

        Album saved = albumRepository.save(album);
        log.info("Álbum criado com ID: {}", saved.getId());

        // Notificar via WebSocket
        notificationService.notifyNewAlbum(AlbumDTO.Response.fromEntity(saved));

        return AlbumDTO.Response.fromEntity(saved);
    }

    /**
     * Atualiza um álbum existente.
     */
    @Transactional
    public AlbumDTO.Response update(Long id, AlbumDTO.Request request) {
        log.info("Atualizando álbum ID: {}", id);

        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum", "id", id));

        album.setTitle(request.getTitle());
        album.setReleaseYear(request.getReleaseYear());
        album.setGenre(request.getGenre());
        album.setRecordLabel(request.getRecordLabel());
        album.setTotalTracks(request.getTotalTracks());
        album.setDescription(request.getDescription());

        // Atualizar artistas se fornecidos
        if (request.getArtistIds() != null) {
            // Remover álbum dos artistas antigos
            for (Artist artist : album.getArtists()) {
                artist.getAlbums().remove(album);
            }
            
            // Adicionar álbum aos novos artistas
            Set<Artist> newArtists = new HashSet<>(artistRepository.findAllById(request.getArtistIds()));
            for (Artist artist : newArtists) {
                artist.getAlbums().add(album);
            }
            album.setArtists(newArtists);
        }

        Album updated = albumRepository.save(album);
        log.info("Álbum atualizado: {}", updated.getId());
        return toResponseWithPresignedUrls(updated);
    }

    /**
     * Remove um álbum.
     */
    @Transactional
    public void delete(Long id) {
        log.info("Removendo álbum ID: {}", id);

        Album album = albumRepository.findByIdWithArtistsAndCovers(id)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum", "id", id));

        // Remover capas do MinIO
        for (AlbumCover cover : album.getCovers()) {
            try {
                minioService.deleteFile(cover.getObjectKey());
            } catch (Exception e) {
                log.warn("Erro ao remover capa do MinIO: {}", e.getMessage());
            }
        }

        // Remover associações com artistas
        for (Artist artist : album.getArtists()) {
            artist.getAlbums().remove(album);
        }

        albumRepository.delete(album);
        log.info("Álbum removido: {}", id);
    }

    /**
     * Faz upload de uma ou mais capas para um álbum.
     */
    @Transactional
    public List<AlbumDTO.CoverResponse> uploadCovers(Long albumId, List<MultipartFile> files, boolean setPrimary) {
        log.info("Fazendo upload de {} capas para álbum ID: {}", files.size(), albumId);

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum", "id", albumId));

        // Se setPrimary, remover flag de todas as capas existentes
        if (setPrimary) {
            albumCoverRepository.clearPrimaryForAlbum(albumId);
        }

        List<AlbumCover> covers = files.stream().map(file -> {
            String objectKey = minioService.uploadFile(file, "albums/" + albumId);
            
            AlbumCover cover = AlbumCover.builder()
                    .album(album)
                    .fileName(file.getOriginalFilename())
                    .objectKey(objectKey)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .isPrimary(setPrimary && files.indexOf(file) == 0)
                    .build();
            
            return albumCoverRepository.save(cover);
        }).collect(Collectors.toList());

        return covers.stream()
                .map(cover -> {
                    AlbumDTO.CoverResponse response = AlbumDTO.CoverResponse.fromEntity(cover);
                    response.setPresignedUrl(minioService.getPresignedUrl(cover.getObjectKey()));
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Remove uma capa de álbum.
     */
    @Transactional
    public void deleteCover(Long albumId, Long coverId) {
        log.info("Removendo capa {} do álbum {}", coverId, albumId);

        AlbumCover cover = albumCoverRepository.findById(coverId)
                .orElseThrow(() -> new ResourceNotFoundException("Capa", "id", coverId));

        if (!cover.getAlbum().getId().equals(albumId)) {
            throw new ResourceNotFoundException("Capa", "albumId", albumId);
        }

        minioService.deleteFile(cover.getObjectKey());
        albumCoverRepository.delete(cover);
        log.info("Capa removida: {}", coverId);
    }

    /**
     * Define uma capa como principal.
     */
    @Transactional
    public AlbumDTO.CoverResponse setPrimaryCover(Long albumId, Long coverId) {
        log.info("Definindo capa {} como principal do álbum {}", coverId, albumId);

        AlbumCover cover = albumCoverRepository.findById(coverId)
                .orElseThrow(() -> new ResourceNotFoundException("Capa", "id", coverId));

        if (!cover.getAlbum().getId().equals(albumId)) {
            throw new ResourceNotFoundException("Capa", "albumId", albumId);
        }

        albumCoverRepository.clearPrimaryForAlbum(albumId);
        cover.setIsPrimary(true);
        AlbumCover updated = albumCoverRepository.save(cover);

        AlbumDTO.CoverResponse response = AlbumDTO.CoverResponse.fromEntity(updated);
        response.setPresignedUrl(minioService.getPresignedUrl(updated.getObjectKey()));
        return response;
    }

    /**
     * Converte entidade para DTO com URLs pré-assinadas.
     */
    private AlbumDTO.Response toResponseWithPresignedUrls(Album album) {
        AlbumDTO.Response response = AlbumDTO.Response.fromEntityWithDetails(album);
        
        if (response.getCovers() != null) {
            response.getCovers().forEach(cover -> {
                cover.setPresignedUrl(minioService.getPresignedUrl(cover.getObjectKey()));
            });
        }
        
        return response;
    }
}
