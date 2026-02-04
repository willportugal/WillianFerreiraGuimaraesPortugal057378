package com.artistalbum.service;

import com.artistalbum.dto.AuthDTO;
import com.artistalbum.entity.User;
import com.artistalbum.exception.BusinessException;
import com.artistalbum.repository.UserRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

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
                .role("USER")
                .active(true)
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
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtService.getExpirationTime()).thenReturn(300L);

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
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");
        when(jwtService.getExpirationTime()).thenReturn(300L);

        // When
        AuthDTO.TokenResponse result = authService.register(registerRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("access-token");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando username já existe")
    void shouldThrowExceptionWhenUsernameExists() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Username já está em uso");
    }

    @Test
    @DisplayName("Deve lançar exceção quando email já existe")
    void shouldThrowExceptionWhenEmailExists() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Email já está em uso");
    }

    @Test
    @DisplayName("Deve renovar token com sucesso")
    void shouldRefreshTokenSuccessfully() {
        // Given
        AuthDTO.RefreshRequest refreshRequest = AuthDTO.RefreshRequest.builder()
                .refreshToken("valid-refresh-token")
                .build();

        when(jwtService.extractUsername("valid-refresh-token")).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid("valid-refresh-token", user)).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh-token");
        when(jwtService.getExpirationTime()).thenReturn(300L);

        // When
        AuthDTO.TokenResponse result = authService.refreshToken(refreshRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("new-access-token");
        assertThat(result.getRefreshToken()).isEqualTo("new-refresh-token");
    }

    @Test
    @DisplayName("Deve lançar exceção para refresh token inválido")
    void shouldThrowExceptionForInvalidRefreshToken() {
        // Given
        AuthDTO.RefreshRequest refreshRequest = AuthDTO.RefreshRequest.builder()
                .refreshToken("invalid-refresh-token")
                .build();

        when(jwtService.extractUsername("invalid-refresh-token")).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid("invalid-refresh-token", user)).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> authService.refreshToken(refreshRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Refresh token inválido");
    }
}
