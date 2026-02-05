package com.artistalbum.validation;

import com.artistalbum.exception.BusinessException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

/**
 * Validador de arquivos para upload de capas de álbuns.
 * Valida tipo de conteúdo, tamanho e extensão dos arquivos.
 */
@Component
public class FileValidator {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final int MAX_FILES_PER_UPLOAD = 10;

    /**
     * Valida uma lista de arquivos para upload.
     * 
     * @param files Lista de arquivos a serem validados
     * @throws BusinessException se alguma validação falhar
     */
    public void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BusinessException("Nenhum arquivo fornecido para upload");
        }

        if (files.size() > MAX_FILES_PER_UPLOAD) {
            throw new BusinessException(
                    String.format("Número máximo de arquivos excedido. Máximo permitido: %d, Enviados: %d",
                            MAX_FILES_PER_UPLOAD, files.size())
            );
        }

        for (int i = 0; i < files.size(); i++) {
            validateFile(files.get(i), i + 1);
        }
    }

    /**
     * Valida um único arquivo para upload.
     * 
     * @param file Arquivo a ser validado
     * @throws BusinessException se alguma validação falhar
     */
    public void validateFile(MultipartFile file) {
        validateFile(file, 1);
    }

    private void validateFile(MultipartFile file, int fileIndex) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(
                    String.format("Arquivo %d está vazio ou não foi fornecido", fileIndex)
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException(
                    String.format("Tipo de arquivo não permitido para arquivo %d: '%s'. Tipos permitidos: %s",
                            fileIndex, contentType, String.join(", ", ALLOWED_CONTENT_TYPES))
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(
                    String.format("Arquivo %d excede o tamanho máximo permitido. Tamanho: %.2f MB, Máximo: %.2f MB",
                            fileIndex, file.getSize() / (1024.0 * 1024.0), MAX_FILE_SIZE / (1024.0 * 1024.0))
            );
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && !hasValidExtension(originalFilename)) {
            throw new BusinessException(
                    String.format("Extensão de arquivo inválida para arquivo %d: '%s'. Extensões permitidas: jpg, jpeg, png, webp, gif",
                            fileIndex, originalFilename)
            );
        }
    }

    private boolean hasValidExtension(String filename) {
        String lowerFilename = filename.toLowerCase();
        return lowerFilename.endsWith(".jpg") ||
                lowerFilename.endsWith(".jpeg") ||
                lowerFilename.endsWith(".png") ||
                lowerFilename.endsWith(".webp") ||
                lowerFilename.endsWith(".gif");
    }

    /**
     * Retorna o tamanho máximo de arquivo permitido em bytes.
     */
    public long getMaxFileSize() {
        return MAX_FILE_SIZE;
    }

    /**
     * Retorna o número máximo de arquivos permitidos por upload.
     */
    public int getMaxFilesPerUpload() {
        return MAX_FILES_PER_UPLOAD;
    }

    /**
     * Retorna os tipos de conteúdo permitidos.
     */
    public Set<String> getAllowedContentTypes() {
        return ALLOWED_CONTENT_TYPES;
    }
}
