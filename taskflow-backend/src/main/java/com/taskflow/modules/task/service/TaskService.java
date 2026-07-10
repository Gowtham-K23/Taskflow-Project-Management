package com.taskflow.modules.task.service;

import com.taskflow.common.enums.NotificationType;
import com.taskflow.common.enums.Priority;
import com.taskflow.common.enums.TaskStatus;
import com.taskflow.modules.project.entity.Project;
import com.taskflow.modules.project.repository.ProjectRepository;
import com.taskflow.modules.sprint.entity.Sprint;
import com.taskflow.modules.sprint.repository.SprintRepository;
import com.taskflow.modules.task.dto.*;
import com.taskflow.modules.task.entity.Task;
import com.taskflow.modules.task.entity.TaskLabel;
import com.taskflow.modules.task.repository.TaskRepository;
import com.taskflow.modules.user.entity.User;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;
import com.taskflow.modules.workspace.service.WorkspaceAccessService;
import com.taskflow.modules.notification.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceAccessService workspaceAccessService;
    private final NotificationService notificationService;

    public TaskResponse createTask(Long workspaceId, Long projectId, Long sprintId,
                                   CreateTaskRequest request, Long currentUserId) {

        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        Project project = getProjectInWorkspace(workspaceId, projectId);
        Sprint sprint = getSprintInProject(projectId, sprintId);

        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        User assignee = null;
        if (request.getAssignedToUserId() != null) {
            assignee = resolveAssignee(workspaceId, request.getAssignedToUserId());
        }

        Task task = Task.builder()
                .sprint(sprint)
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .estimatedHours(request.getEstimatedHours())
                .assignedTo(assignee)
                .createdBy(creator)
                .build();

        Task saved = taskRepository.save(task);
        attachLabels(saved, request.getLabels());
        Task finalTask = taskRepository.save(saved);

        if (assignee != null) {
            notificationService.notify(
                    assignee,
                    NotificationType.TASK_ASSIGNED,
                    "New task assigned",
                    "You've been assigned to \"" + finalTask.getTitle() + "\"",
                    "TASK",
                    finalTask.getId()
            );
        }

        return mapToResponse(finalTask);
    }

    public List<TaskResponse> getTasksBySprint(Long workspaceId, Long projectId, Long sprintId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        getProjectInWorkspace(workspaceId, projectId);
        getSprintInProject(projectId, sprintId);

        return taskRepository.findBySprintId(sprintId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TaskResponse> getMyTasks(Long workspaceId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        return taskRepository.findByAssignedToId(currentUserId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TaskResponse getTaskById(Long workspaceId, Long projectId, Long sprintId, Long taskId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        getProjectInWorkspace(workspaceId, projectId);
        getSprintInProject(projectId, sprintId);
        Task task = getTaskInSprint(sprintId, taskId);

        return mapToResponse(task);
    }

    public TaskResponse updateTask(Long workspaceId, Long projectId, Long sprintId, Long taskId,
                                   UpdateTaskRequest request, Long currentUserId) {

        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        getProjectInWorkspace(workspaceId, projectId);
        getSprintInProject(projectId, sprintId);
        Task task = getTaskInSprint(sprintId, taskId);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        task.setDueDate(request.getDueDate());
        task.setEstimatedHours(request.getEstimatedHours());

        task.getLabels().clear();
        Task saved = taskRepository.save(task);
        attachLabels(saved, request.getLabels());

        return mapToResponse(taskRepository.save(saved));
    }

    public TaskResponse assignTask(Long workspaceId, Long projectId, Long sprintId, Long taskId,
                                   AssignTaskRequest request, Long currentUserId) {

        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        getProjectInWorkspace(workspaceId, projectId);
        getSprintInProject(projectId, sprintId);
        Task task = getTaskInSprint(sprintId, taskId);

        User assignee = resolveAssignee(workspaceId, request.getUserId());
        task.setAssignedTo(assignee);

        Task saved = taskRepository.save(task);

        notificationService.notify(
                assignee,
                NotificationType.TASK_ASSIGNED,
                "New task assigned",
                "You've been assigned to \"" + saved.getTitle() + "\"",
                "TASK",
                saved.getId()
        );

        return mapToResponse(saved);
    }

    /**
     * Status changes are allowed by:
     * - The Project Manager (any transition)
     * - The assigned Team Member (moving their own task forward: TODO -> IN_PROGRESS -> REVIEW)
     * Only a Project Manager can move a task to DONE (acts as the "approval" step from your workflow).
     */
    public TaskResponse updateTaskStatus(Long workspaceId, Long projectId, Long sprintId, Long taskId,
                                         UpdateTaskStatusRequest request, Long currentUserId) {

        getProjectInWorkspace(workspaceId, projectId);
        getSprintInProject(projectId, sprintId);
        Task task = getTaskInSprint(sprintId, taskId);

        boolean isProjectManager = isProjectManager(workspaceId, currentUserId);
        boolean isAssignee = task.getAssignedTo() != null
                && Objects.equals(task.getAssignedTo().getId(), currentUserId);

        if (!isProjectManager && !isAssignee) {
            throw new IllegalArgumentException("You do not have permission to update this task");
        }

        if (request.getStatus() == TaskStatus.DONE && !isProjectManager) {
            throw new IllegalArgumentException("Only a Project Manager can mark a task as Done");
        }

        task.setStatus(request.getStatus());

        if (request.getStatus() == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }

        Task saved = taskRepository.save(task);

        // Notify the creator (if they're not the one making the change)
        if (!Objects.equals(saved.getCreatedBy().getId(), currentUserId)) {
            notificationService.notify(
                    saved.getCreatedBy(),
                    NotificationType.TASK_STATUS_CHANGED,
                    "Task status updated",
                    "\"" + saved.getTitle() + "\" is now " + saved.getStatus().name().replace("_", " "),
                    "TASK",
                    saved.getId()
            );
        }

        return mapToResponse(saved);
    }

    public void deleteTask(Long workspaceId, Long projectId, Long sprintId, Long taskId, Long currentUserId) {
        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        getProjectInWorkspace(workspaceId, projectId);
        getSprintInProject(projectId, sprintId);
        Task task = getTaskInSprint(sprintId, taskId);

        taskRepository.delete(task);
    }

    // ---- Helpers ----

    private User resolveAssignee(Long workspaceId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new IllegalArgumentException("Cannot assign task: user is not a member of this workspace");
        }

        return user;
    }

    private boolean isProjectManager(Long workspaceId, Long userId) {
        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(m -> m.getRole().name().equals("PROJECT_MANAGER"))
                .orElse(false);
    }

    private void attachLabels(Task task, List<String> labels) {
        if (labels == null) return;
        for (String label : labels) {
            if (label == null || label.isBlank()) continue;
            TaskLabel taskLabel = TaskLabel.builder()
                    .task(task)
                    .label(label.trim())
                    .build();
            task.getLabels().add(taskLabel);
        }
    }

    private Project getProjectInWorkspace(Long workspaceId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        if (!project.getWorkspace().getId().equals(workspaceId)) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }
        return project;
    }

    private Sprint getSprintInProject(Long projectId, Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));

        if (!sprint.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Sprint does not belong to this project");
        }
        return sprint;
    }

    private Task getTaskInSprint(Long sprintId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (!task.getSprint().getId().equals(sprintId)) {
            throw new IllegalArgumentException("Task does not belong to this sprint");
        }
        return task;
    }

    private TaskResponse mapToResponse(Task task) {
        boolean isOverdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != TaskStatus.DONE;

        return TaskResponse.builder()
                .id(task.getId())
                .sprintId(task.getSprint().getId())
                .projectId(task.getProject().getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .estimatedHours(task.getEstimatedHours())
                .assignedToUserId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .assignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getName() : null)
                .createdById(task.getCreatedBy().getId())
                .createdByName(task.getCreatedBy().getName())
                .labels(task.getLabels().stream().map(TaskLabel::getLabel).toList())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .completedAt(task.getCompletedAt())
                .overdue(isOverdue)
                .build();
    }
}