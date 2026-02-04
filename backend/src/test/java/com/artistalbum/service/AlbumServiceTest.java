package com.artistalbum.service;

import com.artistalbum.dto.AlbumDTO;
import com.artistalbum.entity.Album;
import com.artistalbum.entity.Artist;
import com.artistalbum.exception.ResourceNotFoundException;
import com.artistalbum.repository.AlbumCoverRepository;
import com.artistalbum.repository.AlbumRepository;
import com.artistalbum.repository.ArtistRepository;
import com.artistalbum.websocket.AlbumNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AlbumService Unit Tests")
class AlbumServiceTest {

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private AlbumCoverRepository albumCoverRepository;

    @Mock
    private MinioService minioService;

    @Mock
    private AlbumNotificationService notificationService;

    @InjectMocks
    private AlbumService albumService;

    private Album album;
    private Artist artist;
    private AlbumDTO.Request albumRequest;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        artist = Artist.builder()
                .id(1L)
                .name("Legião Urbana")
                .country("Brasil")
                .genre("Rock Nacional")
                .albums(new HashSet<>())
                .build();

        album = Album.builder()
                .id(1L)
                .title("Dois")
                .releaseYear(1986)
                .genre("Rock Nacional")
                .recordLabel("EMI")
                .totalTracks(10)
                .description("Segundo álbum da banda")
                .artists(new HashSet<>(Set.of(artist)))
                .covers(new HashSet<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        albumRequest = AlbumDTO.Request.builder()
                .title("Dois")
                .releaseYear(1986)
                .genre("Rock Nacional")
                .recordLabel("EMI")
                .totalTracks(10)
                .description("Segundo álbum da banda")
                .artistIds(List.of(1L))
                .build();

        pageable = PageRequest.of(0, 10);
    }

    @Test
    @DisplayName("Deve listar todos os álbuns com paginação")
    void shouldFindAllAlbumsWithPagination() {
        // Given
        Page<Album> albumPage = new PageImpl<>(List.of(album), pageable, 1);
        when(albumRepository.findAllWithArtistsAndCovers(pageable)).thenReturn(albumPage);

        // When
        Page<AlbumDTO.Response> result = albumService.findAll(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Dois");
        verify(albumRepository, times(1)).findAllWithArtistsAndCovers(pageable);
    }

    @Test
    @DisplayName("Deve buscar álbum por ID")
    void shouldFindAlbumById() {
        // Given
        when(albumRepository.findByIdWithArtistsAndCovers(1L)).thenReturn(Optional.of(album));

        // When
        AlbumDTO.Response result = albumService.findById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Dois");
        verify(albumRepository, times(1)).findByIdWithArtistsAndCovers(1L);
    }

    @Test
    @DisplayName("Deve lançar exceção quando álbum não encontrado")
    void shouldThrowExceptionWhenAlbumNotFound() {
        // Given
        when(albumRepository.findByIdWithArtistsAndCovers(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> albumService.findById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Álbum");
    }

    @Test
    @DisplayName("Deve criar novo álbum")
    void shouldCreateNewAlbum() {
        // Given
        when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of(artist));
        when(albumRepository.save(any(Album.class))).thenReturn(album);
        doNothing().when(notificationService).notifyNewAlbum(any(Album.class));

        // When
        AlbumDTO.Response result = albumService.create(albumRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Dois");
        verify(albumRepository, times(1)).save(any(Album.class));
        verify(notificationService, times(1)).notifyNewAlbum(any(Album.class));
    }

    @Test
    @DisplayName("Deve atualizar álbum existente")
    void shouldUpdateExistingAlbum() {
        // Given
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
        when(artistRepository.findAllById(List.of(1L))).thenReturn(List.of(artist));
        when(albumRepository.save(any(Album.class))).thenReturn(album);

        albumRequest.setTitle("Dois - Edição Especial");

        // When
        AlbumDTO.Response result = albumService.update(1L, albumRequest);

        // Then
        assertThat(result).isNotNull();
        verify(albumRepository, times(1)).findById(1L);
        verify(albumRepository, times(1)).save(any(Album.class));
    }

    @Test
    @DisplayName("Deve remover álbum existente")
    void shouldDeleteExistingAlbum() {
        // Given
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
        doNothing().when(albumRepository).delete(any(Album.class));
        doNothing().when(notificationService).notifyAlbumDeleted(1L, "Dois");

        // When
        albumService.delete(1L);

        // Then
        verify(albumRepository, times(1)).findById(1L);
        verify(albumRepository, times(1)).delete(any(Album.class));
        verify(notificationService, times(1)).notifyAlbumDeleted(1L, "Dois");
    }

    @Test
    @DisplayName("Deve buscar álbuns por título")
    void shouldFindAlbumsByTitle() {
        // Given
        Page<Album> albumPage = new PageImpl<>(List.of(album), pageable, 1);
        when(albumRepository.findByTitleContainingIgnoreCase("Dois", pageable)).thenReturn(albumPage);

        // When
        Page<AlbumDTO.Response> result = albumService.findByTitle("Dois", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Dois");
    }

    @Test
    @DisplayName("Deve buscar álbuns por artista")
    void shouldFindAlbumsByArtist() {
        // Given
        Page<Album> albumPage = new PageImpl<>(List.of(album), pageable, 1);
        when(albumRepository.findByArtistId(1L, pageable)).thenReturn(albumPage);

        // When
        Page<AlbumDTO.Response> result = albumService.findByArtistId(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }
}
