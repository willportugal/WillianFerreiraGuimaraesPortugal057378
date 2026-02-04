package com.artistalbum.websocket;

import com.artistalbum.dto.AlbumDTO;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO para notificações de álbuns via WebSocket.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AlbumNotification {

    private String type;
    private String message;
    private AlbumDTO.Response album;
    private Long albumId;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
