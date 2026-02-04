package com.artistalbum.repository;

import com.artistalbum.entity.Regional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório para operações de persistência de regionais.
 */
@Repository
public interface RegionalRepository extends JpaRepository<Regional, Long> {

    /**
     * Busca regional ativa por ID externo.
     */
    Optional<Regional> findByExternalIdAndAtivoTrue(Long externalId);

    /**
     * Busca todas as regionais ativas.
     */
    List<Regional> findByAtivoTrue();

    /**
     * Busca todas as regionais ativas por lista de IDs externos.
     */
    List<Regional> findByExternalIdInAndAtivoTrue(List<Long> externalIds);

    /**
     * Inativa todas as regionais que não estão na lista de IDs externos.
     */
    @Modifying
    @Query("UPDATE Regional r SET r.ativo = false WHERE r.externalId NOT IN :externalIds AND r.ativo = true")
    int inactivateNotInList(@Param("externalIds") List<Long> externalIds);

    /**
     * Inativa regional por ID externo.
     */
    @Modifying
    @Query("UPDATE Regional r SET r.ativo = false WHERE r.externalId = :externalId AND r.ativo = true")
    int inactivateByExternalId(@Param("externalId") Long externalId);
}
