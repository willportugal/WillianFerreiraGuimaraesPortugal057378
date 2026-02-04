package com.artistalbum.controller;

import com.artistalbum.dto.ApiResponse;
import com.artistalbum.dto.ArtistDTO;
import com.artistalbum.service.ArtistService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para gerenciamento de artistas.
 * Endpoints versionados: /api/v1/artists
 */
@RestController
@RequestMapping("/api/v1/artists")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Artistas", description = "Endpoints para gerenciamento de artistas")
public class ArtistController {

    private final ArtistService artistService;

    @GetMapping
    @Operation(summary = "Listar artistas", description = "Lista todos os artistas com paginação e filtro por nome")
    public ResponseEntity<ApiResponse<Page<ArtistDTO.Response>>> findAll(
            @Parameter(description = "Filtro por nome do artista")
            @RequestParam(required = false) String name,
            @Parameter(description = "Parâmetros de paginação e ordenação")
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        
        log.debug("Listando artistas - filtro: {}, página: {}", name, pageable.getPageNumber());
        
        Page<ArtistDTO.Response> artists;
        if (name != null && !name.isBlank()) {
            artists = artistService.findByName(name, pageable);
        } else {
            artists = artistService.findAll(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success(artists));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar artista por ID", description = "Retorna um artista específico com seus álbuns")
    public ResponseEntity<ApiResponse<ArtistDTO.Response>> findById(
            @Parameter(description = "ID do artista") @PathVariable Long id) {
        log.debug("Buscando artista por ID: {}", id);
        ArtistDTO.Response artist = artistService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(artist));
    }

    @PostMapping
    @Operation(summary = "Criar artista", description = "Cria um novo artista")
    public ResponseEntity<ApiResponse<ArtistDTO.Response>> create(
            @Valid @RequestBody ArtistDTO.Request request) {
        log.info("Criando artista: {}", request.getName());
        ArtistDTO.Response artist = artistService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Artista criado com sucesso", artist));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar artista", description = "Atualiza um artista existente")
    public ResponseEntity<ApiResponse<ArtistDTO.Response>> update(
            @Parameter(description = "ID do artista") @PathVariable Long id,
            @Valid @RequestBody ArtistDTO.Request request) {
        log.info("Atualizando artista ID: {}", id);
        ArtistDTO.Response artist = artistService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Artista atualizado com sucesso", artist));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover artista", description = "Remove um artista")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "ID do artista") @PathVariable Long id) {
        log.info("Removendo artista ID: {}", id);
        artistService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Artista removido com sucesso", null));
    }

    @PostMapping("/{artistId}/albums/{albumId}")
    @Operation(summary = "Adicionar álbum ao artista", description = "Associa um álbum existente a um artista")
    public ResponseEntity<ApiResponse<ArtistDTO.Response>> addAlbum(
            @Parameter(description = "ID do artista") @PathVariable Long artistId,
            @Parameter(description = "ID do álbum") @PathVariable Long albumId) {
        log.info("Adicionando álbum {} ao artista {}", albumId, artistId);
        ArtistDTO.Response artist = artistService.addAlbum(artistId, albumId);
        return ResponseEntity.ok(ApiResponse.success("Álbum adicionado ao artista", artist));
    }

    @DeleteMapping("/{artistId}/albums/{albumId}")
    @Operation(summary = "Remover álbum do artista", description = "Remove a associação entre um álbum e um artista")
    public ResponseEntity<ApiResponse<ArtistDTO.Response>> removeAlbum(
            @Parameter(description = "ID do artista") @PathVariable Long artistId,
            @Parameter(description = "ID do álbum") @PathVariable Long albumId) {
        log.info("Removendo álbum {} do artista {}", albumId, artistId);
        ArtistDTO.Response artist = artistService.removeAlbum(artistId, albumId);
        return ResponseEntity.ok(ApiResponse.success("Álbum removido do artista", artist));
    }
}
