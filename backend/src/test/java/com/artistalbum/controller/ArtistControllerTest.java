package com.artistalbum.controller;

import com.artistalbum.dto.ArtistDTO;
import com.artistalbum.exception.ResourceNotFoundException;
import com.artistalbum.security.JwtService;
import com.artistalbum.service.ArtistService;
import com.artistalbum.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ArtistController.class)
@DisplayName("ArtistController Integration Tests")
class ArtistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ArtistService artistService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    private ArtistDTO.Response artistResponse;
    private ArtistDTO.Request artistRequest;

    @BeforeEach
    void setUp() {
        artistResponse = ArtistDTO.Response.builder()
                .id(1L)
                .name("Legião Urbana")
                .country("Brasil")
                .formationYear(1982)
                .genre("Rock Nacional")
                .biography("Banda brasileira de rock")
                .albumCount(8)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        artistRequest = ArtistDTO.Request.builder()
                .name("Legião Urbana")
                .country("Brasil")
                .formationYear(1982)
                .genre("Rock Nacional")
                .biography("Banda brasileira de rock")
                .build();
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/artists - Deve listar artistas com paginação")
    void shouldListArtistsWithPagination() throws Exception {
        // Given
        Page<ArtistDTO.Response> page = new PageImpl<>(List.of(artistResponse), PageRequest.of(0, 10), 1);
        when(artistService.findAll(any())).thenReturn(page);

        // When/Then
        mockMvc.perform(get("/api/v1/artists")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Legião Urbana"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/artists - Deve buscar artistas por nome")
    void shouldSearchArtistsByName() throws Exception {
        // Given
        Page<ArtistDTO.Response> page = new PageImpl<>(List.of(artistResponse), PageRequest.of(0, 10), 1);
        when(artistService.findByName(eq("Legião"), any())).thenReturn(page);

        // When/Then
        mockMvc.perform(get("/api/v1/artists")
                        .param("name", "Legião"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Legião Urbana"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/artists/{id} - Deve retornar artista por ID")
    void shouldGetArtistById() throws Exception {
        // Given
        when(artistService.findById(1L)).thenReturn(artistResponse);

        // When/Then
        mockMvc.perform(get("/api/v1/artists/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Legião Urbana"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/artists/{id} - Deve retornar 404 para artista inexistente")
    void shouldReturn404ForNonExistentArtist() throws Exception {
        // Given
        when(artistService.findById(999L)).thenThrow(new ResourceNotFoundException("Artista", "id", 999L));

        // When/Then
        mockMvc.perform(get("/api/v1/artists/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/artists - Deve criar novo artista")
    void shouldCreateNewArtist() throws Exception {
        // Given
        when(artistService.create(any(ArtistDTO.Request.class))).thenReturn(artistResponse);

        // When/Then
        mockMvc.perform(post("/api/v1/artists")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(artistRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Legião Urbana"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/artists - Deve retornar 400 para dados inválidos")
    void shouldReturn400ForInvalidData() throws Exception {
        // Given
        ArtistDTO.Request invalidRequest = ArtistDTO.Request.builder()
                .name("") // Nome vazio - inválido
                .build();

        // When/Then
        mockMvc.perform(post("/api/v1/artists")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/v1/artists/{id} - Deve atualizar artista existente")
    void shouldUpdateExistingArtist() throws Exception {
        // Given
        when(artistService.update(eq(1L), any(ArtistDTO.Request.class))).thenReturn(artistResponse);

        // When/Then
        mockMvc.perform(put("/api/v1/artists/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(artistRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Legião Urbana"));
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/v1/artists/{id} - Deve remover artista")
    void shouldDeleteArtist() throws Exception {
        // Given
        doNothing().when(artistService).delete(1L);

        // When/Then
        mockMvc.perform(delete("/api/v1/artists/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(artistService, times(1)).delete(1L);
    }

    @Test
    @DisplayName("GET /api/v1/artists - Deve retornar 401 sem autenticação")
    void shouldReturn401WithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/artists"))
                .andExpect(status().isUnauthorized());
    }
}
