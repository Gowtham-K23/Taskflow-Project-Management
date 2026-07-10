package com.taskflow.modules.comment.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.comment.dto.CommentResponse;
import com.taskflow.modules.comment.dto.CreateCommentRequest;
import com.taskflow.modules.comment.service.CommentService;
import com.taskflow.security.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/tasks/{taskId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long workspaceId,
            @PathVariable Long taskId,
            @Valid @RequestBody CreateCommentRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        CommentResponse response = commentService.addComment(workspaceId, taskId, request, currentUserId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Long workspaceId,
            @PathVariable Long taskId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<CommentResponse> comments = commentService.getCommentsByTask(workspaceId, taskId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Comments fetched successfully", comments));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long workspaceId,
            @PathVariable Long taskId,
            @PathVariable Long commentId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        commentService.deleteComment(workspaceId, commentId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }
}