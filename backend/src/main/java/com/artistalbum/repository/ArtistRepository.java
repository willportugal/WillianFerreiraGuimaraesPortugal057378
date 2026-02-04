package com.artistalbum.repository;

import com.artistalbum.entity.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório para operações de persistência de artistas.
 */
@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {

    /**
     * Busca artistas por nome (case-insensitive, parcial).
     */
    Page<Artist> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * Busca artista por ID com álbuns carregados.
     */
    @Query("SELECT a FROM Artist a LEFT JOIN FETCH a.albums WHERE a.id = :id")
    Optional<Artist> findByIdWithAlbums(@Param("id") Long id);

    /**
     * Verifica se existe artista com o nome especificado.
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Busca todos os artistas com contagem de álbuns.
     */
    @Query("SELECT a FROM Artist a LEFT JOIN FETCH a.albums")
    Page<Artist> findAllWithAlbums(Pageable pageable);
}
