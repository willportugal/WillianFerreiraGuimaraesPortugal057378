package com.artistalbum.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Configuração do Rate Limiter usando Bucket4j com Caffeine Cache.
 * Limite: 10 requisições por minuto por usuário.
 * Cache expira após 10 minutos de inatividade para evitar memory leak.
 */
@Configuration
public class RateLimitConfig {

    @Value("${rate-limit.requests-per-minute:10}")
    private int requestsPerMinute;

    private final Cache<String, Bucket> buckets;

    public RateLimitConfig() {
        this.buckets = Caffeine.newBuilder()
                .expireAfterAccess(Duration.ofMinutes(10))
                .maximumSize(10_000)
                .recordStats()
                .build();
    }

    /**
     * Obtém ou cria um bucket para o usuário especificado.
     */
    public Bucket resolveBucket(String userId) {
        return buckets.get(userId, this::createNewBucket);
    }

    /**
     * Cria um novo bucket com limite de requisições.
     */
    private Bucket createNewBucket(String userId) {
        Bandwidth limit = Bandwidth.classic(
            requestsPerMinute,
            Refill.greedy(requestsPerMinute, Duration.ofMinutes(1))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Verifica se o usuário pode fazer uma requisição.
     */
    public boolean tryConsume(String userId) {
        Bucket bucket = resolveBucket(userId);
        return bucket.tryConsume(1);
    }

    /**
     * Obtém tokens disponíveis para o usuário.
     */
    public long getAvailableTokens(String userId) {
        Bucket bucket = resolveBucket(userId);
        return bucket.getAvailableTokens();
    }

    /**
     * Retorna estatísticas do cache.
     */
    public String getCacheStats() {
        return buckets.stats().toString();
    }

    /**
     * Retorna o número de entradas no cache.
     */
    public long getCacheSize() {
        return buckets.estimatedSize();
    }
}
