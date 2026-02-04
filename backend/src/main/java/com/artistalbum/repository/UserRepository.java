package com.artistalbum.repository;

import com.artistalbum.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório para operações de persistência de usuários.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Busca usuário por username.
     */
    Optional<User> findByUsername(String username);

    /**
     * Busca usuário por email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica se existe usuário com o username especificado.
     */
    boolean existsByUsername(String username);

    /**
     * Verifica se existe usuário com o email especificado.
     */
    boolean existsByEmail(String email);
}
