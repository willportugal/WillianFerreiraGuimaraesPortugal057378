package com.artistalbum.websocket;

import com.artistalbum.dto.AlbumDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Serviço para notificações em tempo real via WebSocket.
 * Notifica clientes quando um novo álbum é cadastrado.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlbumNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    private static final String ALBUM_TOPIC = "/topic/albums";

    /**
     * Notifica todos os clientes conectados sobre um novo álbum.
     */
    public void notifyNewAlbum(AlbumDTO.Response album) {
        log.info("Enviando notificação de novo álbum: {} (ID: {})", album.getTitle(), album.getId());
        
        AlbumNotification notification = AlbumNotification.builder()
                .type("NEW_ALBUM")
                .message("Novo álbum cadastrado: " + album.getTitle())
                .album(album)
                .build();

        messagingTemplate.convertAndSend(ALBUM_TOPIC, notification);
        log.debug("Notificação enviada para {}", ALBUM_TOPIC);
    }

    /**
     * Notifica sobre atualização de álbum.
     */
    public void notifyAlbumUpdated(AlbumDTO.Response album) {
        log.info("Enviando notificação de álbum atualizado: {} (ID: {})", album.getTitle(), album.getId());
        
        AlbumNotification notification = AlbumNotification.builder()
                .type("ALBUM_UPDATED")
                .message("Álbum atualizado: " + album.getTitle())
                .album(album)
                .build();

        messagingTemplate.convertAndSend(ALBUM_TOPIC, notification);
    }

    /**
     * Notifica sobre remoção de álbum.
     */
    public void notifyAlbumDeleted(Long albumId, String title) {
        log.info("Enviando notificação de álbum removido: {} (ID: {})", title, albumId);
        
        AlbumNotification notification = AlbumNotification.builder()
                .type("ALBUM_DELETED")
                .message("Álbum removido: " + title)
                .albumId(albumId)
                .build();

        messagingTemplate.convertAndSend(ALBUM_TOPIC, notification);
    }
}
