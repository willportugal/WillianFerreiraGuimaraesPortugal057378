package com.artistalbum.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller para health checks da aplicação.
 * Complementa os endpoints do Spring Actuator.
 */
@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Health Check", description = "Endpoints para verificação de saúde da aplicação")
public class HealthController {

    private final DataSource dataSource;

    @GetMapping
    @Operation(summary = "Health check básico", description = "Verifica se a API está respondendo")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "artist-album-api");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }

    @GetMapping("/liveness")
    @Operation(summary = "Liveness probe", description = "Verifica se a aplicação está viva")
    public ResponseEntity<Map<String, String>> liveness() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/readiness")
    @Operation(summary = "Readiness probe", description = "Verifica se a aplicação está pronta para receber tráfego")
    public ResponseEntity<Map<String, Object>> readiness() {
        Map<String, Object> response = new HashMap<>();
        
        // Verificar conexão com banco de dados
        boolean dbHealthy = checkDatabaseConnection();
        
        response.put("status", dbHealthy ? "UP" : "DOWN");
        response.put("database", dbHealthy ? "UP" : "DOWN");
        
        if (dbHealthy) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(503).body(response);
        }
    }

    private boolean checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(5);
        } catch (Exception e) {
            log.error("Erro ao verificar conexão com banco de dados: {}", e.getMessage());
            return false;
        }
    }
}
