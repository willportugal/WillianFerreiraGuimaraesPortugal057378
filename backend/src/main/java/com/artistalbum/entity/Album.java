package com.artistalbum.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Entidade que representa um álbum musical.
 */
@Entity
@Table(name = "albums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(length = 50)
    private String genre;

    @Column(name = "record_label", length = 100)
    private String recordLabel;

    @Column(name = "total_tracks")
    private Integer totalTracks;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToMany(mappedBy = "albums", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Artist> artists = new HashSet<>();

    @OneToMany(mappedBy = "album", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AlbumCover> covers = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addCover(AlbumCover cover) {
        covers.add(cover);
        cover.setAlbum(this);
    }

    public void removeCover(AlbumCover cover) {
        covers.remove(cover);
        cover.setAlbum(null);
    }
}
