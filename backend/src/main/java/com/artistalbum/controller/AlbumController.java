package com.artistalbum.controller;

import com.artistalbum.dto.AlbumDTO;
import com.artistalbum.dto.ApiResponse;
import com.artistalbum.service.AlbumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller para gerenciamento de álbuns.
 * Endpoints versionados: /api/v1/albums
 */
@RestController
@RequestMapping("/api/v1/albums")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Álbuns", description = "Endpoints para gerenciamento de álbuns")
public class AlbumController {

    private final AlbumService albumService;

    @GetMapping
    @Operation(summary = "Listar álbuns", description = "Lista todos os álbuns com paginação e filtros")
    public ResponseEntity<ApiResponse<Page<AlbumDTO.Response>>> findAll(
            @Parameter(description = "Filtro por título do álbum")
            @RequestParam(required = false) String title,
            @Parameter(description = "Filtro por nome do artista")
            @RequestParam(required = false) String artistName,
            @Parameter(description = "Filtro por ID do artista")
            @RequestParam(required = false) Long artistId,
            @Parameter(description = "Parâmetros de paginação e ordenação")
            @PageableDefault(size = 10, sort = "title", direction = Sort.Direction.ASC) Pageable pageable) {
        
        log.debug("Listando álbuns - título: {}, artista: {}, artistId: {}", title, artistName, artistId);
        
        Page<AlbumDTO.Response> albums;
        if (artistId != null) {
            albums = albumService.findByArtistId(artistId, pageable);
        } else if (artistName != null && !artistName.isBlank()) {
            albums = albumService.findByArtistName(artistName, pageable);
        } else if (title != null && !title.isBlank()) {
            albums = albumService.findByTitle(title, pageable);
        } else {
            albums = albumService.findAll(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success(albums));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar álbum por ID", description = "Retorna um álbum específico com artistas e capas")
    public ResponseEntity<ApiResponse<AlbumDTO.Response>> findById(
            @Parameter(description = "ID do álbum") @PathVariable Long id) {
        log.debug("Buscando álbum por ID: {}", id);
        AlbumDTO.Response album = albumService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(album));
    }

    @PostMapping
    @Operation(summary = "Criar álbum", description = "Cria um novo álbum. Notifica clientes via WebSocket.")
    public ResponseEntity<ApiResponse<AlbumDTO.Response>> create(
            @Valid @RequestBody AlbumDTO.Request request) {
        log.info("Criando álbum: {}", request.getTitle());
        AlbumDTO.Response album = albumService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Álbum criado com sucesso", album));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar álbum", description = "Atualiza um álbum existente")
    public ResponseEntity<ApiResponse<AlbumDTO.Response>> update(
            @Parameter(description = "ID do álbum") @PathVariable Long id,
            @Valid @RequestBody AlbumDTO.Request request) {
        log.info("Atualizando álbum ID: {}", id);
        AlbumDTO.Response album = albumService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Álbum atualizado com sucesso", album));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover álbum", description = "Remove um álbum e suas capas do MinIO")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "ID do álbum") @PathVariable Long id) {
        log.info("Removendo álbum ID: {}", id);
        albumService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Álbum removido com sucesso", null));
    }

    @PostMapping(value = "/{id}/covers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload de capas", description = "Faz upload de uma ou mais capas para o álbum. Armazena no MinIO.")
    public ResponseEntity<ApiResponse<List<AlbumDTO.CoverResponse>>> uploadCovers(
            @Parameter(description = "ID do álbum") @PathVariable Long id,
            @Parameter(description = "Arquivos de imagem das capas")
            @RequestParam("files") List<MultipartFile> files,
            @Parameter(description = "Define a primeira imagem como capa principal")
            @RequestParam(defaultValue = "true") boolean setPrimary) {
        log.info("Upload de {} capas para álbum ID: {}", files.size(), id);
        List<AlbumDTO.CoverResponse> covers = albumService.uploadCovers(id, files, setPrimary);
        return ResponseEntity.ok(ApiResponse.success("Capas enviadas com sucesso", covers));
    }

    @DeleteMapping("/{albumId}/covers/{coverId}")
    @Operation(summary = "Remover capa", description = "Remove uma capa específica do álbum")
    public ResponseEntity<ApiResponse<Void>> deleteCover(
            @Parameter(description = "ID do álbum") @PathVariable Long albumId,
            @Parameter(description = "ID da capa") @PathVariable Long coverId) {
        log.info("Removendo capa {} do álbum {}", coverId, albumId);
        albumService.deleteCover(albumId, coverId);
        return ResponseEntity.ok(ApiResponse.success("Capa removida com sucesso", null));
    }

    @PutMapping("/{albumId}/covers/{coverId}/primary")
    @Operation(summary = "Definir capa principal", description = "Define uma capa como principal do álbum")
    public ResponseEntity<ApiResponse<AlbumDTO.CoverResponse>> setPrimaryCover(
            @Parameter(description = "ID do álbum") @PathVariable Long albumId,
            @Parameter(description = "ID da capa") @PathVariable Long coverId) {
        log.info("Definindo capa {} como principal do álbum {}", coverId, albumId);
        AlbumDTO.CoverResponse cover = albumService.setPrimaryCover(albumId, coverId);
        return ResponseEntity.ok(ApiResponse.success("Capa principal definida", cover));
    }
}
