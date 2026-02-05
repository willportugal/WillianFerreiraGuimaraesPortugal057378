package com.artistalbum.service;

import com.artistalbum.dto.AuthDTO;
import com.artistalbum.entity.User;
import com.artistalbum.exception.BusinessException;
import com.artistalbum.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User user;
    private AuthDTO.LoginRequest loginRequest;
    private AuthDTO.RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .fullName("Test User")
                .role(User.Role.USER)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        loginRequest = AuthDTO.LoginRequest.builder()
                .username("testuser")
                .password("password123")
                .build();

        registerRequest = AuthDTO.RegisterRequest.builder()
                .username("newuser")
                .email("new@example.com")
                .password("password123")
                .fullName("New User")
                .build();
    }

    @Test
    @DisplayName("Deve realizar login com sucesso")
    void shouldLoginSuccessfully() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(user, null));
        when(jwtService.generateToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtService.getExpirationTime()).thenReturn(300000L);

        // When
        AuthDTO.TokenResponse result = authService.login(loginRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("access-token");
        assertThat(result.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(result.getUser().getUsername()).isEqualTo("testuser");
        verify(authenticationManager, times(1)).authenticate(any());
    }

    @Test
    @DisplayName("Deve lançar exceção para credenciais inválidas")
    void shouldThrowExceptionForInvalidCredentials() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // When/Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("Deve registrar novo usuário com sucesso")
    void shouldRegisterNewUserSuccessfully() {
        // Given
        when(userService.createUser(anyString(), anyString(), anyString(), anyString())).thenReturn(user);
        when(jwtService.generateToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");
        when(jwtService.getExpirationTime()).thenReturn(300000L);

        // When
        AuthDTO.TokenResponse result = authService.register(registerRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("access-token");
        verify(userService, times(1)).createUser(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Deve lançar exceção quando username já existe")
    void shouldThrowExceptionWhenUsernameExists() {
        // Given
        when(userService.createUser(anyString(), anyString(), anyString(), anyString()))
                .thenThrow(new BusinessException("Username já está em uso"));

        // When/Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Username já está em uso");
    }

    @Test
    @DisplayName("Deve lançar exceção quando email já existe")
    void shouldThrowExceptionWhenEmailExists() {
        // Given
        when(userService.createUser(anyString(), anyString(), anyString(), anyString()))
                .thenThrow(new BusinessException("Email já está em uso"));

        // When/Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Email já está em uso");
    }

    @Test
    @DisplayName("Deve renovar token com sucesso")
    void shouldRefreshTokenSuccessfully() {
        // Given
        String refreshToken = "valid-refresh-token";

        when(jwtService.extractUsername(refreshToken)).thenReturn("testuser");
        when(userService.findByUsername("testuser")).thenReturn(user);
        when(jwtService.isTokenValid(refreshToken, user)).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh-token");
        when(jwtService.getExpirationTime()).thenReturn(300000L);

        // When
        AuthDTO.TokenResponse result = authService.refreshToken(refreshToken);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("new-access-token");
        assertThat(result.getRefreshToken()).isEqualTo("new-refresh-token");
    }

    @Test
    @DisplayName("Deve lançar exceção para refresh token inválido")
    void shouldThrowExceptionForInvalidRefreshToken() {
        // Given
        String refreshToken = "invalid-refresh-token";

        when(jwtService.extractUsername(refreshToken)).thenReturn("testuser");
        when(userService.findByUsername("testuser")).thenReturn(user);
        when(jwtService.isTokenValid(refreshToken, user)).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> authService.refreshToken(refreshToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("token");
    }
}
