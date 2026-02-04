package com.artistalbum.service;

import com.artistalbum.exception.BusinessException;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Serviço para gerenciamento de arquivos no MinIO.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.presigned-url-expiration}")
    private int presignedUrlExpiration;

    /**
     * Faz upload de um arquivo para o MinIO.
     * 
     * @param file Arquivo a ser enviado
     * @param folder Pasta de destino (ex: "albums", "artists")
     * @return Object key do arquivo no MinIO
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String objectKey = folder + "/" + UUID.randomUUID() + extension;

            log.info("Fazendo upload de arquivo: {} para {}", originalFilename, objectKey);

            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectKey)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build());
            }

            log.info("Upload concluído com sucesso: {}", objectKey);
            return objectKey;

        } catch (Exception e) {
            log.error("Erro ao fazer upload de arquivo: {}", e.getMessage());
            throw new BusinessException("Erro ao fazer upload do arquivo: " + e.getMessage());
        }
    }

    /**
     * Gera URL pré-assinada para acesso ao arquivo.
     * Expira em 30 minutos conforme requisito do edital.
     * 
     * @param objectKey Chave do objeto no MinIO
     * @return URL pré-assinada
     */
    public String getPresignedUrl(String objectKey) {
        try {
            log.debug("Gerando presigned URL para: {}", objectKey);

            String url = minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .object(objectKey)
                    .expiry(presignedUrlExpiration, TimeUnit.SECONDS)
                    .build());

            log.debug("Presigned URL gerada com expiração de {} segundos", presignedUrlExpiration);
            return url;

        } catch (Exception e) {
            log.error("Erro ao gerar presigned URL: {}", e.getMessage());
            throw new BusinessException("Erro ao gerar URL de acesso: " + e.getMessage());
        }
    }

    /**
     * Remove um arquivo do MinIO.
     * 
     * @param objectKey Chave do objeto no MinIO
     */
    public void deleteFile(String objectKey) {
        try {
            log.info("Removendo arquivo: {}", objectKey);

            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .build());

            log.info("Arquivo removido com sucesso: {}", objectKey);

        } catch (Exception e) {
            log.error("Erro ao remover arquivo: {}", e.getMessage());
            throw new BusinessException("Erro ao remover arquivo: " + e.getMessage());
        }
    }

    /**
     * Verifica se um arquivo existe no MinIO.
     * 
     * @param objectKey Chave do objeto no MinIO
     * @return true se o arquivo existe
     */
    public boolean fileExists(String objectKey) {
        try {
            minioClient.statObject(StatObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
