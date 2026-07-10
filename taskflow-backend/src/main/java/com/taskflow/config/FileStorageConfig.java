package com.taskflow.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class FileStorageConfig {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @Value("${app.file.max-file-size-mb}")
    private long maxFileSizeMb;
}