package com.artistalbum.service;

import com.artistalbum.dto.ArtistDTO;
import com.artistalbum.entity.Album;
import com.artistalbum.entity.Artist;
import com.artistalbum.exception.ResourceNotFoundException;
import com.artistalbum.repository.AlbumRepository;
import com.artistalbum.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Serviço para gerenciamento de artistas.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;

    /**
     * Lista todos os artistas com paginação.
     */
    @Transactional(readOnly = true)
    public Page<ArtistDTO.Response> findAll(Pageable pageable) {
        log.debug("Buscando todos os artistas com paginação");
        return artistRepository.findAll(pageable)
                .map(ArtistDTO.Response::fromEntity);
    }

    /**
     * Busca artistas por nome com paginação.
     */
    @Transactional(readOnly = true)
    public Page<ArtistDTO.Response> findByName(String name, Pageable pageable) {
        log.debug("Buscando artistas por nome: {}", name);
        return artistRepository.findByNameContainingIgnoreCase(name, pageable)
                .map(ArtistDTO.Response::fromEntity);
    }

    /**
     * Busca artista por ID com álbuns.
     */
    @Transactional(readOnly = true)
    public ArtistDTO.Response findById(Long id) {
        log.debug("Buscando artista por ID: {}", id);
        Artist artist = artistRepository.findByIdWithAlbums(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista", "id", id));
        return ArtistDTO.Response.fromEntityWithAlbums(artist);
    }

    /**
     * Cria um novo artista.
     */
    @Transactional
    public ArtistDTO.Response create(ArtistDTO.Request request) {
        log.info("Criando novo artista: {}", request.getName());

        Artist artist = Artist.builder()
                .name(request.getName())
                .country(request.getCountry())
                .formationYear(request.getFormationYear())
                .genre(request.getGenre())
                .biography(request.getBiography())
                .imageUrl(request.getImageUrl())
                .build();

        // Associar álbuns se fornecidos
        if (request.getAlbumIds() != null && !request.getAlbumIds().isEmpty()) {
            Set<Album> albums = new HashSet<>(albumRepository.findAllById(request.getAlbumIds()));
            artist.setAlbums(albums);
        }

        Artist saved = artistRepository.save(artist);
        log.info("Artista criado com ID: {}", saved.getId());
        return ArtistDTO.Response.fromEntity(saved);
    }

    /**
     * Atualiza um artista existente.
     */
    @Transactional
    public ArtistDTO.Response update(Long id, ArtistDTO.Request request) {
        log.info("Atualizando artista ID: {}", id);

        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista", "id", id));

        artist.setName(request.getName());
        artist.setCountry(request.getCountry());
        artist.setFormationYear(request.getFormationYear());
        artist.setGenre(request.getGenre());
        artist.setBiography(request.getBiography());
        artist.setImageUrl(request.getImageUrl());

        // Atualizar álbuns se fornecidos
        if (request.getAlbumIds() != null) {
            Set<Album> albums = new HashSet<>(albumRepository.findAllById(request.getAlbumIds()));
            artist.setAlbums(albums);
        }

        Artist updated = artistRepository.save(artist);
        log.info("Artista atualizado: {}", updated.getId());
        return ArtistDTO.Response.fromEntity(updated);
    }

    /**
     * Remove um artista.
     */
    @Transactional
    public void delete(Long id) {
        log.info("Removendo artista ID: {}", id);

        if (!artistRepository.existsById(id)) {
            throw new ResourceNotFoundException("Artista", "id", id);
        }

        artistRepository.deleteById(id);
        log.info("Artista removido: {}", id);
    }

    /**
     * Adiciona um álbum a um artista.
     */
    @Transactional
    public ArtistDTO.Response addAlbum(Long artistId, Long albumId) {
        log.info("Adicionando álbum {} ao artista {}", albumId, artistId);

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artista", "id", artistId));

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum", "id", albumId));

        artist.addAlbum(album);
        Artist updated = artistRepository.save(artist);
        
        return ArtistDTO.Response.fromEntityWithAlbums(updated);
    }

    /**
     * Remove um álbum de um artista.
     */
    @Transactional
    public ArtistDTO.Response removeAlbum(Long artistId, Long albumId) {
        log.info("Removendo álbum {} do artista {}", albumId, artistId);

        Artist artist = artistRepository.findByIdWithAlbums(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artista", "id", artistId));

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum", "id", albumId));

        artist.removeAlbum(album);
        Artist updated = artistRepository.save(artist);
        
        return ArtistDTO.Response.fromEntityWithAlbums(updated);
    }
}
