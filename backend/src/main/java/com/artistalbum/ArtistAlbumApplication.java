package com.artistalbum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Aplicação principal para gerenciamento de artistas e álbuns.
 * 
 * @author Engenheiro Full-Stack Sênior
 * @version 1.0.0
 */
@SpringBootApplication
@EnableScheduling
public class ArtistAlbumApplication {

    public static void main(String[] args) {
        SpringApplication.run(ArtistAlbumApplication.class, args);
    }
}
