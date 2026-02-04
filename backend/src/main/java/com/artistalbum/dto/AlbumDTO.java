package com.artistalbum.dto;

import com.artistalbum.entity.Album;
import com.artistalbum.entity.AlbumCover;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO para transferência de dados de álbuns.
 */
public class AlbumDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Título do álbum é obrigatório")
        @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
        private String title;

        private Integer releaseYear;

        @Size(max = 50, message = "Gênero deve ter no máximo 50 caracteres")
        private String genre;

        @Size(max = 100, message = "Gravadora deve ter no máximo 100 caracteres")
        private String recordLabel;

        private Integer totalTracks;

        private String description;

        private List<Long> artistIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private Integer releaseYear;
        private String genre;
        private String recordLabel;
        private Integer totalTracks;
        private String description;
        private List<ArtistDTO.Summary> artists;
        private List<CoverResponse> covers;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Album album) {
            return Response.builder()
                    .id(album.getId())
                    .title(album.getTitle())
                    .releaseYear(album.getReleaseYear())
                    .genre(album.getGenre())
                    .recordLabel(album.getRecordLabel())
                    .totalTracks(album.getTotalTracks())
                    .description(album.getDescription())
                    .createdAt(album.getCreatedAt())
                    .updatedAt(album.getUpdatedAt())
                    .build();
        }

        public static Response fromEntityWithDetails(Album album) {
            Response response = fromEntity(album);
            if (album.getArtists() != null) {
                response.setArtists(album.getArtists().stream()
                        .map(ArtistDTO.Summary::fromEntity)
                        .collect(Collectors.toList()));
            }
            if (album.getCovers() != null) {
                response.setCovers(album.getCovers().stream()
                        .map(CoverResponse::fromEntity)
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
        private String title;
        private Integer releaseYear;
        private String genre;
        private String primaryCoverUrl;

        public static Summary fromEntity(Album album) {
            Summary summary = Summary.builder()
                    .id(album.getId())
                    .title(album.getTitle())
                    .releaseYear(album.getReleaseYear())
                    .genre(album.getGenre())
                    .build();
            
            if (album.getCovers() != null && !album.getCovers().isEmpty()) {
                album.getCovers().stream()
                        .filter(AlbumCover::getIsPrimary)
                        .findFirst()
                        .ifPresent(cover -> summary.setPrimaryCoverUrl(cover.getObjectKey()));
            }
            return summary;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoverResponse {
        private Long id;
        private String fileName;
        private String objectKey;
        private String contentType;
        private Long fileSize;
        private Boolean isPrimary;
        private String presignedUrl;
        private LocalDateTime createdAt;

        public static CoverResponse fromEntity(AlbumCover cover) {
            return CoverResponse.builder()
                    .id(cover.getId())
                    .fileName(cover.getFileName())
                    .objectKey(cover.getObjectKey())
                    .contentType(cover.getContentType())
                    .fileSize(cover.getFileSize())
                    .isPrimary(cover.getIsPrimary())
                    .createdAt(cover.getCreatedAt())
                    .build();
        }
    }
}
