-- V2__insert_initial_data.sql
-- Dados iniciais conforme especificado no edital do processo seletivo

-- Usuário admin padrão (senha: admin123 - BCrypt encoded)
-- Usuário user padrão (senha: user123 - BCrypt encoded)
INSERT INTO users (username, password, email, full_name, role, enabled) VALUES
('admin', '$2a$10$rDkPvvAFV6kqwvKJzwlHMOY.YpLqPCeLjXNFfhLJKFGPVVnqCnGHi', 'admin@artistalbum.com', 'Administrador do Sistema', 'ADMIN', TRUE),
('user', '$2a$10$rDkPvvAFV6kqwvKJzwlHMOY.YpLqPCeLjXNFfhLJKFGPVVnqCnGHi', 'user@artistalbum.com', 'Usuário Padrão', 'USER', TRUE);

-- Artistas conforme exemplos do edital
INSERT INTO artists (name, country, formation_year, genre, biography) VALUES
('Serj Tankian', 'Armênia/EUA', 1967, 'Rock Alternativo', 'Serj Tankian é um cantor, compositor e multi-instrumentista armênio-americano, mais conhecido como vocalista da banda System of a Down.'),
('Mike Shinoda', 'EUA', 1977, 'Rock Alternativo', 'Mike Shinoda é um músico, rapper, cantor, compositor e produtor musical americano, co-fundador da banda Linkin Park.'),
('Michel Teló', 'Brasil', 1981, 'Sertanejo', 'Michel Teló é um cantor, compositor e empresário brasileiro, conhecido por sucessos como "Ai Se Eu Te Pego".'),
('Guns N'' Roses', 'EUA', 1985, 'Hard Rock', 'Guns N'' Roses é uma banda americana de hard rock formada em Los Angeles em 1985, conhecida por clássicos como "Sweet Child O'' Mine".');

-- Álbuns conforme exemplos do edital
INSERT INTO albums (title, release_year, genre, record_label, total_tracks, description) VALUES
-- Álbuns de Serj Tankian
('Harakiri', 2012, 'Rock Alternativo', 'Serjical Strike', 10, 'Terceiro álbum solo de Serj Tankian.'),
('Black Blooms', 2019, 'Rock Experimental', 'Serjical Strike', 8, 'EP colaborativo com o pianista Tigran Hamasyan.'),
('The Rough Dog', 2021, 'Rock', 'Serjical Strike', 6, 'EP de Serj Tankian.'),

-- Álbuns de Mike Shinoda
('The Rising Tied', 2005, 'Hip Hop', 'Warner Bros.', 16, 'Álbum de estreia do projeto Fort Minor de Mike Shinoda.'),
('Post Traumatic', 2018, 'Rock Alternativo', 'Warner Bros.', 16, 'Primeiro álbum solo de Mike Shinoda após a morte de Chester Bennington.'),
('Post Traumatic EP', 2018, 'Rock Alternativo', 'Warner Bros.', 3, 'EP que precedeu o álbum Post Traumatic.'),
('Where''d You Go', 2006, 'Hip Hop', 'Warner Bros.', 1, 'Single de Fort Minor.'),

-- Álbuns de Michel Teló
('Bem Sertanejo', 2014, 'Sertanejo', 'Som Livre', 14, 'Álbum de estúdio de Michel Teló.'),
('Bem Sertanejo - O Show (Ao Vivo)', 2015, 'Sertanejo', 'Som Livre', 20, 'Álbum ao vivo gravado durante a turnê Bem Sertanejo.'),
('Bem Sertanejo - (1ª Temporada) - EP', 2019, 'Sertanejo', 'Som Livre', 5, 'EP da primeira temporada do projeto Bem Sertanejo.'),

-- Álbuns de Guns N' Roses
('Use Your Illusion I', 1991, 'Hard Rock', 'Geffen', 16, 'Terceiro álbum de estúdio do Guns N'' Roses.'),
('Use Your Illusion II', 1991, 'Hard Rock', 'Geffen', 14, 'Quarto álbum de estúdio do Guns N'' Roses.'),
('Greatest Hits', 2004, 'Hard Rock', 'Geffen', 14, 'Coletânea de maiores sucessos do Guns N'' Roses.');

-- Relacionamentos artista-álbum (N:N)
-- Serj Tankian
INSERT INTO artist_album (artist_id, album_id) VALUES
(1, 1), (1, 2), (1, 3);

-- Mike Shinoda
INSERT INTO artist_album (artist_id, album_id) VALUES
(2, 4), (2, 5), (2, 6), (2, 7);

-- Michel Teló
INSERT INTO artist_album (artist_id, album_id) VALUES
(3, 8), (3, 9), (3, 10);

-- Guns N' Roses
INSERT INTO artist_album (artist_id, album_id) VALUES
(4, 11), (4, 12), (4, 13);
