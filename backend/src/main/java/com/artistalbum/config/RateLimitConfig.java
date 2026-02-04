package com.artistalbum.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Configuração do Rate Limiter usando Bucket4j.
 * Limite: 10 requisições por minuto por usuário.
 */
@Configuration
public class RateLimitConfig {

    @Value("${rate-limit.requests-per-minute}")
    private int requestsPerMinute;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * Obtém ou cria um bucket para o usuário especificado.
     */
    public Bucket resolveBucket(String userId) {
        return buckets.computeIfAbsent(userId, this::createNewBucket);
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
}
