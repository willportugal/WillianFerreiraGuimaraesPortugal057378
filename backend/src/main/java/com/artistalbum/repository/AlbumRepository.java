package com.artistalbum.repository;

import com.artistalbum.entity.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório para operações de persistência de álbuns.
 */
@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {

    /**
     * Busca álbuns por título (case-insensitive, parcial).
     */
    Page<Album> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    /**
     * Busca álbuns de um artista específico.
     */
    @Query("SELECT al FROM Album al JOIN al.artists ar WHERE ar.id = :artistId")
    Page<Album> findByArtistId(@Param("artistId") Long artistId, Pageable pageable);

    /**
     * Busca álbum por ID com artistas e capas carregados.
     */
    @Query("SELECT DISTINCT a FROM Album a LEFT JOIN FETCH a.artists LEFT JOIN FETCH a.covers WHERE a.id = :id")
    Optional<Album> findByIdWithArtistsAndCovers(@Param("id") Long id);

    /**
     * Busca álbuns por nome do artista.
     */
    @Query("SELECT DISTINCT al FROM Album al JOIN al.artists ar WHERE LOWER(ar.name) LIKE LOWER(CONCAT('%', :artistName, '%'))")
    Page<Album> findByArtistNameContaining(@Param("artistName") String artistName, Pageable pageable);

    /**
     * Busca todos os álbuns com artistas carregados.
     */
    @Query("SELECT DISTINCT a FROM Album a LEFT JOIN FETCH a.artists LEFT JOIN FETCH a.covers")
    List<Album> findAllWithArtistsAndCovers();

    /**
     * Busca todos os álbuns com artistas e capas carregados (paginado).
     */
    @Query(value = "SELECT DISTINCT a FROM Album a LEFT JOIN FETCH a.artists LEFT JOIN FETCH a.covers",
           countQuery = "SELECT COUNT(DISTINCT a) FROM Album a")
    Page<Album> findAllWithArtistsAndCoversPageable(Pageable pageable);

    /**
     * Verifica se existe álbum com o título especificado.
     */
    boolean existsByTitleIgnoreCase(String title);
}
