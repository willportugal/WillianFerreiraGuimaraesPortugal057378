package com.artistalbum.dto;

import com.artistalbum.entity.Artist;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO para transferência de dados de artistas.
 */
public class ArtistDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Nome do artista é obrigatório")
        @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
        private String name;

        @Size(max = 100, message = "País deve ter no máximo 100 caracteres")
        private String country;

        private Integer formationYear;

        @Size(max = 50, message = "Gênero deve ter no máximo 50 caracteres")
        private String genre;

        private String biography;

        private String imageUrl;

        private List<Long> albumIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String country;
        private Integer formationYear;
        private String genre;
        private String biography;
        private String imageUrl;
        private Integer albumCount;
        private List<AlbumDTO.Summary> albums;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Artist artist) {
            return Response.builder()
                    .id(artist.getId())
                    .name(artist.getName())
                    .country(artist.getCountry())
                    .formationYear(artist.getFormationYear())
                    .genre(artist.getGenre())
                    .biography(artist.getBiography())
                    .imageUrl(artist.getImageUrl())
                    .albumCount(artist.getAlbums() != null ? artist.getAlbums().size() : 0)
                    .createdAt(artist.getCreatedAt())
                    .updatedAt(artist.getUpdatedAt())
                    .build();
        }

        public static Response fromEntityWithAlbums(Artist artist) {
            Response response = fromEntity(artist);
            if (artist.getAlbums() != null) {
                response.setAlbums(artist.getAlbums().stream()
                        .map(AlbumDTO.Summary::fromEntity)
                        .collect(Collectors.toList()));
            }
            return response;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private Long id;
        private String name;
        private String genre;
        private Integer albumCount;

        public static Summary fromEntity(Artist artist) {
            return Summary.builder()
                    .id(artist.getId())
                    .name(artist.getName())
                    .genre(artist.getGenre())
                    .albumCount(artist.getAlbums() != null ? artist.getAlbums().size() : 0)
                    .build();
        }
    }
}
