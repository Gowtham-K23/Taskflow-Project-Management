package com.taskflow.modules.dashboard.service;

import com.taskflow.common.enums.ProjectStatus;
import com.taskflow.common.enums.TaskStatus;
import com.taskflow.modules.dashboard.dto.*;
import com.taskflow.modules.project.entity.Project;
import com.taskflow.modules.project.repository.ProjectRepository;
import com.taskflow.modules.sprint.entity.Sprint;
import com.taskflow.modules.sprint.repository.SprintRepository;
import com.taskflow.modules.task.entity.Task;
import com.taskflow.modules.task.repository.TaskRepository;
import com.taskflow.modules.workspace.entity.WorkspaceMember;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;
import com.taskflow.modules.workspace.service.WorkspaceAccessService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceAccessService workspaceAccessService;

    // ---- Top-level workspace dashboard (Step 10 in PM workflow) ----

    public DashboardSummaryResponse getWorkspaceSummary(Long workspaceId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        long totalProjects = projectRepository.countByWorkspaceId(workspaceId);
        long activeProjects = projectRepository.countByWorkspaceIdAndStatus(workspaceId, ProjectStatus.ACTIVE);
        long completedProjects = projectRepository.countByWorkspaceIdAndStatus(workspaceId, ProjectStatus.COMPLETED);

        long totalTasks = taskRepository.countByWorkspaceId(workspaceId);
        long doneTasks = taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.DONE);
        long todoTasks = taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.TODO);
        long inProgressTasks = taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.IN_PROGRESS);
        long reviewTasks = taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.REVIEW);
        long pendingTasks = todoTasks + inProgressTasks + reviewTasks;

        long delayedTasks = taskRepository.findDelayedTasksByWorkspace(workspaceId, LocalDate.now()).size();

        List<TeamPerformanceResponse> teamPerformance = getTeamPerformance(workspaceId, currentUserId);
        List<SprintProgressResponse> activeSprints = getActiveSprintProgress(workspaceId);

        return DashboardSummaryResponse.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .totalTasks(totalTasks)
                .pendingTasks(pendingTasks)
                .completedTasks(doneTasks)
                .delayedTasks(delayedTasks)
                .teamPerformance(teamPerformance)
                .activeSprints(activeSprints)
                .build();
    }

    // ---- Per-project overview ----

    public ProjectOverviewResponse getProjectOverview(Long workspaceId, Long projectId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        if (!project.getWorkspace().getId().equals(workspaceId)) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }

        long todo = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.TODO);
        long inProgress = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.IN_PROGRESS);
        long review = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.REVIEW);
        long done = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.DONE);
        long total = todo + inProgress + review + done;

        long delayed = taskRepository.findDelayedTasksByProject(projectId, LocalDate.now()).size();

        double completionPct = total == 0 ? 0.0 : (done * 100.0) / total;

        return ProjectOverviewResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .totalTasks(total)
                .todoCount(todo)
                .inProgressCount(inProgress)
                .reviewCount(review)
                .doneCount(done)
                .delayedCount(delayed)
                .completionPercentage(round(completionPct))
                .build();
    }

    // ---- Sprint progress (single sprint) ----

    public SprintProgressResponse getSprintProgress(Long workspaceId, Long sprintId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));

        if (!sprint.getProject().getWorkspace().getId().equals(workspaceId)) {
            throw new IllegalArgumentException("Sprint does not belong to this workspace");
        }

        return mapSprintProgress(sprint);
    }

    // ---- Team performance across the workspace ----

    public List<TeamPerformanceResponse> getTeamPerformance(Long workspaceId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(workspaceId);

        return members.stream()
                .map(member -> {
                    Long userId = member.getUser().getId();

                    long assigned = taskRepository.findByAssignedToId(userId).size();
                    long completed = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.DONE);
                    long pending = assigned - completed;
                    long delayed = taskRepository.countByAssignedToIdAndDueDateBeforeAndStatusNot(
                            userId, LocalDate.now(), TaskStatus.DONE);

                    double completionRate = assigned == 0 ? 0.0 : (completed * 100.0) / assigned;

                    return TeamPerformanceResponse.builder()
                            .userId(userId)
                            .userName(member.getUser().getName())
                            .assignedTasks(assigned)
                            .completedTasks(completed)
                            .pendingTasks(pending)
                            .delayedTasks(delayed)
                            .completionRate(round(completionRate))
                            .build();
                })
                .toList();
    }

    // ---- Delayed tasks list (workspace-wide) ----

    public List<DelayedTaskResponse> getDelayedTasks(Long workspaceId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        LocalDate today = LocalDate.now();

        return taskRepository.findDelayedTasksByWorkspace(workspaceId, today).stream()
                .map(task -> DelayedTaskResponse.builder()
                        .taskId(task.getId())
                        .title(task.getTitle())
                        .status(task.getStatus())
                        .priority(task.getPriority())
                        .dueDate(task.getDueDate())
                        .daysOverdue(ChronoUnit.DAYS.between(task.getDueDate(), today))
                        .assignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getName() : "Unassigned")
                        .sprintName(task.getSprint().getName())
                        .build())
                .toList();
    }

    // ---- Helpers ----

    private List<SprintProgressResponse> getActiveSprintProgress(Long workspaceId) {
        return sprintRepository.findActiveSprintsByWorkspace(workspaceId).stream()
                .map(this::mapSprintProgress)
                .toList();
    }

    private SprintProgressResponse mapSprintProgress(Sprint sprint) {
        long total = taskRepository.countBySprintId(sprint.getId());
        long completed = taskRepository.countBySprintIdAndStatus(sprint.getId(), TaskStatus.DONE);
        double completionPct = total == 0 ? 0.0 : (completed * 100.0) / total;

        return SprintProgressResponse.builder()
                .sprintId(sprint.getId())
                .sprintName(sprint.getName())
                .status(sprint.getStatus())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .totalTasks(total)
                .completedTasks(completed)
                .completionPercentage(round(completionPct))
                .build();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}