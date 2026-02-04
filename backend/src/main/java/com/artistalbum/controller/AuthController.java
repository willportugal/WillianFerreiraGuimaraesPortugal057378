package com.artistalbum.controller;

import com.artistalbum.dto.ApiResponse;
import com.artistalbum.dto.AuthDTO;
import com.artistalbum.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para autenticação e gerenciamento de tokens JWT.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Autenticação", description = "Endpoints para autenticação e gerenciamento de tokens JWT")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Realizar login", description = "Autentica usuário e retorna tokens JWT. Token expira em 5 minutos.")
    public ResponseEntity<ApiResponse<AuthDTO.TokenResponse>> login(
            @Valid @RequestBody AuthDTO.LoginRequest request) {
        log.info("Requisição de login para usuário: {}", request.getUsername());
        AuthDTO.TokenResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login realizado com sucesso", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuário", description = "Cria novo usuário e retorna tokens JWT")
    public ResponseEntity<ApiResponse<AuthDTO.TokenResponse>> register(
            @Valid @RequestBody AuthDTO.RegisterRequest request) {
        log.info("Requisição de registro para usuário: {}", request.getUsername());
        AuthDTO.TokenResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Usuário registrado com sucesso", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token", description = "Renova o token de acesso usando o refresh token")
    public ResponseEntity<ApiResponse<AuthDTO.TokenResponse>> refresh(
            @Valid @RequestBody AuthDTO.RefreshTokenRequest request) {
        log.debug("Requisição de renovação de token");
        AuthDTO.TokenResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token renovado com sucesso", response));
    }
}
