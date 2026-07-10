package com.taskflow.modules.attachment.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.attachment.dto.AttachmentResponse;
import com.taskflow.modules.attachment.service.AttachmentService;
import com.taskflow.security.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping(value = "/tasks/{taskId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadFile(
            @PathVariable Long workspaceId,
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        AttachmentResponse response = attachmentService.uploadFile(workspaceId, taskId, file, currentUserId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File uploaded successfully", response));
    }

    @GetMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachments(
            @PathVariable Long workspaceId,
            @PathVariable Long taskId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<AttachmentResponse> attachments = attachmentService.getAttachmentsByTask(workspaceId, taskId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Attachments fetched successfully", attachments));
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long workspaceId,
            @PathVariable Long attachmentId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        Resource resource = attachmentService.downloadFile(workspaceId, attachmentId, currentUserId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable Long workspaceId,
            @PathVariable Long attachmentId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        attachmentService.deleteAttachment(workspaceId, attachmentId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Attachment deleted successfully", null));
    }
}