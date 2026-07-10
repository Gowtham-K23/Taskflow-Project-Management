package com.taskflow.modules.comment.service;

import com.taskflow.modules.comment.dto.CommentResponse;
import com.taskflow.modules.comment.dto.CreateCommentRequest;
import com.taskflow.modules.comment.entity.Comment;
import com.taskflow.modules.comment.repository.CommentRepository;
import com.taskflow.modules.notification.service.NotificationService;
import com.taskflow.modules.task.entity.Task;
import com.taskflow.modules.task.repository.TaskRepository;
import com.taskflow.modules.user.entity.User;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.workspace.service.WorkspaceAccessService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WorkspaceAccessService workspaceAccessService;
    private final NotificationService notificationService;

    public CommentResponse addComment(Long workspaceId, Long taskId, CreateCommentRequest request, Long currentUserId) {

        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Comment comment = Comment.builder()
                .task(task)
                .user(user)
                .content(request.getContent())
                .build();

        Comment saved = commentRepository.save(comment);

        // Notify the assignee if someone else commented (and the assignee exists)
        if (task.getAssignedTo() != null && !Objects.equals(task.getAssignedTo().getId(), currentUserId)) {
            notificationService.notify(
                    task.getAssignedTo(),
                    com.taskflow.common.enums.NotificationType.COMMENT_ADDED,
                    "New comment on your task",
                    user.getName() + " commented on \"" + task.getTitle() + "\"",
                    "TASK",
                    task.getId()
            );
        }

        // Also notify the task creator if they're different from both the commenter and assignee
        boolean creatorIsDifferent = !Objects.equals(task.getCreatedBy().getId(), currentUserId)
                && (task.getAssignedTo() == null || !Objects.equals(task.getCreatedBy().getId(), task.getAssignedTo().getId()));

        if (creatorIsDifferent) {
            notificationService.notify(
                    task.getCreatedBy(),
                    com.taskflow.common.enums.NotificationType.COMMENT_ADDED,
                    "New comment on a task",
                    user.getName() + " commented on \"" + task.getTitle() + "\"",
                    "TASK",
                    task.getId()
            );
        }

        return mapToResponse(saved);
    }

    public List<CommentResponse> getCommentsByTask(Long workspaceId, Long taskId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        // Confirms the task exists before returning an (potentially empty) list
        taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void deleteComment(Long workspaceId, Long commentId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        boolean isOwner = Objects.equals(comment.getUser().getId(), currentUserId);
        boolean isProjectManager = isProjectManager(workspaceId, currentUserId);

        if (!isOwner && !isProjectManager) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private boolean isProjectManager(Long workspaceId, Long userId) {
        try {
            workspaceAccessService.ensureUserIsProjectManager(workspaceId, userId);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .taskId(comment.getTask().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}