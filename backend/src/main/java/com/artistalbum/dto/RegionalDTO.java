package com.artistalbum.dto;

import com.artistalbum.entity.Regional;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTOs para regionais.
 */
public class RegionalDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long externalId;
        private String nome;
        private Boolean ativo;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Regional regional) {
            return Response.builder()
                    .id(regional.getId())
                    .externalId(regional.getExternalId())
                    .nome(regional.getNome())
                    .ativo(regional.getAtivo())
                    .createdAt(regional.getCreatedAt())
                    .updatedAt(regional.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExternalRegional {
        private Long id;
        private String nome;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SyncResult {
        private int inserted;
        private int inactivated;
        private int updated;
        private String message;
    }
}
