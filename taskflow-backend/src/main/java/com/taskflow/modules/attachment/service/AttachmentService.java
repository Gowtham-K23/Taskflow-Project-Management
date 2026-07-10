package com.taskflow.modules.attachment.service;

import com.taskflow.config.FileStorageConfig;
import com.taskflow.modules.attachment.dto.AttachmentResponse;
import com.taskflow.modules.attachment.entity.Attachment;
import com.taskflow.modules.attachment.repository.AttachmentRepository;
import com.taskflow.modules.task.entity.Task;
import com.taskflow.modules.task.repository.TaskRepository;
import com.taskflow.modules.user.entity.User;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.workspace.service.WorkspaceAccessService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WorkspaceAccessService workspaceAccessService;
    private final FileStorageConfig fileStorageConfig;

    public AttachmentResponse uploadFile(Long workspaceId, Long taskId, MultipartFile file, Long currentUserId) {

        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        long maxBytes = fileStorageConfig.getMaxFileSizeMb() * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("File exceeds maximum size of " + fileStorageConfig.getMaxFileSizeMb() + "MB");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        User uploader = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        try {
            Path uploadPath = Paths.get(fileStorageConfig.getUploadDir(), "task-" + taskId);
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String storedFilename = UUID.randomUUID() + extension;
            Path targetPath = uploadPath.resolve(storedFilename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = Attachment.builder()
                    .task(task)
                    .uploadedBy(uploader)
                    .fileName(originalFilename != null ? originalFilename : storedFilename)
                    .filePath(targetPath.toString())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .build();

            Attachment saved = attachmentRepository.save(attachment);

            return mapToResponse(saved);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public List<AttachmentResponse> getAttachmentsByTask(Long workspaceId, Long taskId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        return attachmentRepository.findByTaskId(taskId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Resource downloadFile(Long workspaceId, Long attachmentId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalArgumentException("File not found on server");
            }

            return resource;

        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid file path");
        }
    }

    public void deleteAttachment(Long workspaceId, Long attachmentId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

        try {
            Files.deleteIfExists(Paths.get(attachment.getFilePath()));
        } catch (IOException e) {
            // Log and continue — don't block DB cleanup if the physical file is already gone
        }

        attachmentRepository.delete(attachment);
    }

    private AttachmentResponse mapToResponse(Attachment attachment) {
        Long workspaceId = attachment.getTask().getProject().getWorkspace().getId();

        return AttachmentResponse.builder()
                .id(attachment.getId())
                .taskId(attachment.getTask().getId())
                .fileName(attachment.getFileName())
                .fileSize(attachment.getFileSize())
                .contentType(attachment.getContentType())
                .uploadedByUserId(attachment.getUploadedBy().getId())
                .uploadedByName(attachment.getUploadedBy().getName())
                .uploadedAt(attachment.getUploadedAt())
                .downloadUrl("/api/workspaces/" + workspaceId + "/attachments/" + attachment.getId() + "/download")
                .build();
    }
}