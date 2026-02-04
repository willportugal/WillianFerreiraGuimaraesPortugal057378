package com.artistalbum.security;

import com.artistalbum.config.RateLimitConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Filtro para aplicar rate limiting nas requisições.
 * Limite: 10 requisições por minuto por usuário.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitConfig rateLimitConfig;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Não aplicar rate limit em endpoints públicos
        String path = request.getRequestURI();
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Identificar usuário (por username autenticado ou IP)
        String userId = getUserIdentifier(request);

        if (!rateLimitConfig.tryConsume(userId)) {
            log.warn("Rate limit excedido para usuário: {}", userId);
            sendRateLimitExceededResponse(response);
            return;
        }

        // Adicionar headers de rate limit
        long availableTokens = rateLimitConfig.getAvailableTokens(userId);
        response.setHeader("X-Rate-Limit-Remaining", String.valueOf(availableTokens));
        response.setHeader("X-Rate-Limit-Limit", "10");

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/v1/auth/") ||
               path.startsWith("/actuator/") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/api-docs") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/ws");
    }

    private String getUserIdentifier(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName();
        }
        return request.getRemoteAddr();
    }

    private void sendRateLimitExceededResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", "Limite de requisições excedido. Máximo: 10 requisições por minuto.");
        body.put("status", HttpStatus.TOO_MANY_REQUESTS.value());

        objectMapper.writeValue(response.getWriter(), body);
    }
}
