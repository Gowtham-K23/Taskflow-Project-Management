package com.taskflow.modules.attachment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponse {

    private Long id;
    private Long taskId;
    private String fileName;
    private Long fileSize;
    private String contentType;
    private Long uploadedByUserId;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private String downloadUrl;
}