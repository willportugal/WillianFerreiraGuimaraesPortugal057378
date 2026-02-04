package com.artistalbum.service;

import com.artistalbum.dto.ArtistDTO;
import com.artistalbum.entity.Artist;
import com.artistalbum.exception.ResourceNotFoundException;
import com.artistalbum.repository.AlbumRepository;
import com.artistalbum.repository.ArtistRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ArtistService Unit Tests")
class ArtistServiceTest {

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private AlbumRepository albumRepository;

    @InjectMocks
    private ArtistService artistService;

    private Artist artist;
    private ArtistDTO.Request artistRequest;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        artist = Artist.builder()
                .id(1L)
                .name("Serj Tankian")
                .country("Armênia/EUA")
                .formationYear(1967)
                .genre("Rock Alternativo")
                .biography("Vocalista do System of a Down")
                .albums(new HashSet<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        artistRequest = ArtistDTO.Request.builder()
                .name("Serj Tankian")
                .country("Armênia/EUA")
                .formationYear(1967)
                .genre("Rock Alternativo")
                .biography("Vocalista do System of a Down")
                .build();

        pageable = PageRequest.of(0, 10);
    }

    @Test
    @DisplayName("Deve listar todos os artistas com paginação")
    void shouldFindAllArtistsWithPagination() {
        // Given
        Page<Artist> artistPage = new PageImpl<>(List.of(artist), pageable, 1);
        when(artistRepository.findAll(pageable)).thenReturn(artistPage);

        // When
        Page<ArtistDTO.Response> result = artistService.findAll(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Serj Tankian");
        verify(artistRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Deve buscar artistas por nome")
    void shouldFindArtistsByName() {
        // Given
        Page<Artist> artistPage = new PageImpl<>(List.of(artist), pageable, 1);
        when(artistRepository.findByNameContainingIgnoreCase("Serj", pageable)).thenReturn(artistPage);

        // When
        Page<ArtistDTO.Response> result = artistService.findByName("Serj", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Serj Tankian");
        verify(artistRepository, times(1)).findByNameContainingIgnoreCase("Serj", pageable);
    }

    @Test
    @DisplayName("Deve buscar artista por ID com álbuns")
    void shouldFindArtistByIdWithAlbums() {
        // Given
        when(artistRepository.findByIdWithAlbums(1L)).thenReturn(Optional.of(artist));

        // When
        ArtistDTO.Response result = artistService.findById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Serj Tankian");
        verify(artistRepository, times(1)).findByIdWithAlbums(1L);
    }

    @Test
    @DisplayName("Deve lançar exceção quando artista não encontrado")
    void shouldThrowExceptionWhenArtistNotFound() {
        // Given
        when(artistRepository.findByIdWithAlbums(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> artistService.findById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Artista");
    }

    @Test
    @DisplayName("Deve criar novo artista")
    void shouldCreateNewArtist() {
        // Given
        when(artistRepository.save(any(Artist.class))).thenReturn(artist);

        // When
        ArtistDTO.Response result = artistService.create(artistRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Serj Tankian");
        verify(artistRepository, times(1)).save(any(Artist.class));
    }

    @Test
    @DisplayName("Deve atualizar artista existente")
    void shouldUpdateExistingArtist() {
        // Given
        when(artistRepository.findById(1L)).thenReturn(Optional.of(artist));
        when(artistRepository.save(any(Artist.class))).thenReturn(artist);

        artistRequest.setName("Serj Tankian Updated");

        // When
        ArtistDTO.Response result = artistService.update(1L, artistRequest);

        // Then
        assertThat(result).isNotNull();
        verify(artistRepository, times(1)).findById(1L);
        verify(artistRepository, times(1)).save(any(Artist.class));
    }

    @Test
    @DisplayName("Deve remover artista existente")
    void shouldDeleteExistingArtist() {
        // Given
        when(artistRepository.existsById(1L)).thenReturn(true);
        doNothing().when(artistRepository).deleteById(1L);

        // When
        artistService.delete(1L);

        // Then
        verify(artistRepository, times(1)).existsById(1L);
        verify(artistRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Deve lançar exceção ao remover artista inexistente")
    void shouldThrowExceptionWhenDeletingNonExistentArtist() {
        // Given
        when(artistRepository.existsById(999L)).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> artistService.delete(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
