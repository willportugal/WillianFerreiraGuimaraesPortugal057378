package com.artistalbum.service;

import com.artistalbum.dto.AuthDTO;
import com.artistalbum.entity.User;
import com.artistalbum.exception.BusinessException;
import com.artistalbum.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

/**
 * Serviço de autenticação JWT.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    /**
     * Realiza login e retorna tokens JWT.
     */
    public AuthDTO.TokenResponse login(AuthDTO.LoginRequest request) {
        log.info("Tentativa de login para usuário: {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();
        return generateTokenResponse(user);
    }

    /**
     * Registra novo usuário e retorna tokens JWT.
     */
    public AuthDTO.TokenResponse register(AuthDTO.RegisterRequest request) {
        log.info("Registrando novo usuário: {}", request.getUsername());

        User user = userService.createUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getFullName()
        );

        return generateTokenResponse(user);
    }

    /**
     * Renova o token de acesso usando o refresh token.
     */
    public AuthDTO.TokenResponse refreshToken(String refreshToken) {
        log.debug("Renovando token de acesso");

        try {
            String username = jwtService.extractUsername(refreshToken);
            User user = userService.findByUsername(username);

            if (!jwtService.isTokenValid(refreshToken, user)) {
                throw new BusinessException("Refresh token inválido ou expirado");
            }

            return generateTokenResponse(user);
        } catch (Exception e) {
            log.error("Erro ao renovar token: {}", e.getMessage());
            throw new BusinessException("Não foi possível renovar o token");
        }
    }

    /**
     * Gera resposta com tokens JWT.
     */
    private AuthDTO.TokenResponse generateTokenResponse(User user) {
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthDTO.TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime() / 1000) // em segundos
                .user(AuthDTO.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}
