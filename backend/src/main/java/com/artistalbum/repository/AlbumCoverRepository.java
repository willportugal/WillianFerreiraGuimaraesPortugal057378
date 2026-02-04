package com.artistalbum.repository;

import com.artistalbum.entity.AlbumCover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório para operações de persistência de capas de álbuns.
 */
@Repository
public interface AlbumCoverRepository extends JpaRepository<AlbumCover, Long> {

    /**
     * Busca todas as capas de um álbum.
     */
    List<AlbumCover> findByAlbumId(Long albumId);

    /**
     * Busca a capa principal de um álbum.
     */
    Optional<AlbumCover> findByAlbumIdAndIsPrimaryTrue(Long albumId);

    /**
     * Remove a marcação de capa principal de todas as capas de um álbum.
     */
    @Modifying
    @Query("UPDATE AlbumCover ac SET ac.isPrimary = false WHERE ac.album.id = :albumId")
    void clearPrimaryForAlbum(@Param("albumId") Long albumId);

    /**
     * Conta o número de capas de um álbum.
     */
    long countByAlbumId(Long albumId);
}
