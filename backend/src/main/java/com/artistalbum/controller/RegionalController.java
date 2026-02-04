package com.artistalbum.controller;

import com.artistalbum.dto.ApiResponse;
import com.artistalbum.dto.RegionalDTO;
import com.artistalbum.service.RegionalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para gerenciamento de regionais.
 * Endpoints versionados: /api/v1/regionais
 */
@RestController
@RequestMapping("/api/v1/regionais")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Regionais", description = "Endpoints para gerenciamento e sincronização de regionais")
public class RegionalController {

    private final RegionalService regionalService;

    @GetMapping
    @Operation(summary = "Listar regionais ativas", description = "Lista todas as regionais ativas")
    public ResponseEntity<ApiResponse<List<RegionalDTO.Response>>> findAllActive() {
        log.debug("Listando regionais ativas");
        List<RegionalDTO.Response> regionais = regionalService.findAllActive();
        return ResponseEntity.ok(ApiResponse.success(regionais));
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todas as regionais", description = "Lista todas as regionais (ativas e inativas)")
    public ResponseEntity<ApiResponse<List<RegionalDTO.Response>>> findAll() {
        log.debug("Listando todas as regionais");
        List<RegionalDTO.Response> regionais = regionalService.findAll();
        return ResponseEntity.ok(ApiResponse.success(regionais));
    }

    @PostMapping("/sync")
    @Operation(summary = "Sincronizar regionais", description = "Força sincronização com endpoint externo")
    public ResponseEntity<ApiResponse<RegionalDTO.SyncResult>> sync() {
        log.info("Sincronização manual de regionais solicitada");
        RegionalDTO.SyncResult result = regionalService.forceSync();
        return ResponseEntity.ok(ApiResponse.success("Sincronização executada", result));
    }
}
