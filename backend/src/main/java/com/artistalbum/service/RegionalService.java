package com.artistalbum.service;

import com.artistalbum.dto.RegionalDTO;
import com.artistalbum.entity.Regional;
import com.artistalbum.repository.RegionalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Serviço para sincronização de regionais com endpoint externo.
 * Implementa as regras de sincronização conforme edital:
 * 1. Novo no endpoint → inserir na tabela local
 * 2. Não disponível no endpoint → inativar na tabela local
 * 3. Atributo alterado → inativar anterior e criar novo registro
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RegionalService {

    private final RegionalRepository regionalRepository;
    private final RestTemplate restTemplate;

    @Value("${regionais.api-url}")
    private String regionaisApiUrl;

    /**
     * Lista todas as regionais ativas.
     */
    @Transactional(readOnly = true)
    public List<RegionalDTO.Response> findAllActive() {
        log.debug("Buscando todas as regionais ativas");
        return regionalRepository.findByAtivoTrue().stream()
                .map(RegionalDTO.Response::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lista todas as regionais (ativas e inativas).
     */
    @Transactional(readOnly = true)
    public List<RegionalDTO.Response> findAll() {
        log.debug("Buscando todas as regionais");
        return regionalRepository.findAll().stream()
                .map(RegionalDTO.Response::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Sincroniza regionais com o endpoint externo.
     * Executa automaticamente a cada hora.
     */
    @Scheduled(fixedRate = 3600000) // 1 hora
    @Transactional
    public RegionalDTO.SyncResult syncRegionais() {
        log.info("Iniciando sincronização de regionais com endpoint externo");

        int inserted = 0;
        int inactivated = 0;
        int updated = 0;

        try {
            // Buscar dados do endpoint externo
            List<RegionalDTO.ExternalRegional> externalRegionais = fetchExternalRegionais();
            
            if (externalRegionais == null || externalRegionais.isEmpty()) {
                log.warn("Nenhuma regional retornada do endpoint externo");
                return RegionalDTO.SyncResult.builder()
                        .message("Nenhuma regional retornada do endpoint externo")
                        .build();
            }

            log.info("Recebidas {} regionais do endpoint externo", externalRegionais.size());

            // Criar mapa de regionais externas por ID
            Map<Long, RegionalDTO.ExternalRegional> externalMap = externalRegionais.stream()
                    .collect(Collectors.toMap(
                            RegionalDTO.ExternalRegional::getId,
                            r -> r,
                            (r1, r2) -> r1
                    ));

            // Buscar regionais ativas locais
            List<Regional> localRegionais = regionalRepository.findByAtivoTrue();
            Map<Long, Regional> localMap = localRegionais.stream()
                    .collect(Collectors.toMap(
                            Regional::getExternalId,
                            r -> r,
                            (r1, r2) -> r1
                    ));

            // Processar cada regional externa
            for (RegionalDTO.ExternalRegional external : externalRegionais) {
                Regional local = localMap.get(external.getId());

                if (local == null) {
                    // Regra 1: Novo no endpoint → inserir
                    Regional newRegional = Regional.builder()
                            .externalId(external.getId())
                            .nome(external.getNome())
                            .ativo(true)
                            .build();
                    regionalRepository.save(newRegional);
                    inserted++;
                    log.debug("Regional inserida: {} - {}", external.getId(), external.getNome());
                } else if (!local.getNome().equals(external.getNome())) {
                    // Regra 3: Atributo alterado → inativar anterior e criar novo
                    local.setAtivo(false);
                    regionalRepository.save(local);

                    Regional newRegional = Regional.builder()
                            .externalId(external.getId())
                            .nome(external.getNome())
                            .ativo(true)
                            .build();
                    regionalRepository.save(newRegional);
                    updated++;
                    log.debug("Regional atualizada: {} - {} -> {}", external.getId(), local.getNome(), external.getNome());
                }
            }

            // Regra 2: Não disponível no endpoint → inativar
            Set<Long> externalIds = externalMap.keySet();
            for (Regional local : localRegionais) {
                if (!externalIds.contains(local.getExternalId())) {
                    local.setAtivo(false);
                    regionalRepository.save(local);
                    inactivated++;
                    log.debug("Regional inativada: {} - {}", local.getExternalId(), local.getNome());
                }
            }

            log.info("Sincronização concluída: {} inseridas, {} inativadas, {} atualizadas",
                    inserted, inactivated, updated);

            return RegionalDTO.SyncResult.builder()
                    .inserted(inserted)
                    .inactivated(inactivated)
                    .updated(updated)
                    .message("Sincronização concluída com sucesso")
                    .build();

        } catch (Exception e) {
            log.error("Erro na sincronização de regionais: {}", e.getMessage());
            return RegionalDTO.SyncResult.builder()
                    .message("Erro na sincronização: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Busca regionais do endpoint externo.
     */
    private List<RegionalDTO.ExternalRegional> fetchExternalRegionais() {
        try {
            log.debug("Buscando regionais de: {}", regionaisApiUrl);
            
            ResponseEntity<List<RegionalDTO.ExternalRegional>> response = restTemplate.exchange(
                    regionaisApiUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<RegionalDTO.ExternalRegional>>() {}
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Erro ao buscar regionais do endpoint externo: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Força sincronização manual.
     */
    public RegionalDTO.SyncResult forceSync() {
        log.info("Sincronização manual solicitada");
        return syncRegionais();
    }
}
