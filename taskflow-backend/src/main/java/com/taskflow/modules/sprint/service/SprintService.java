package com.taskflow.modules.sprint.service;

import com.taskflow.common.enums.SprintStatus;
import com.taskflow.modules.project.entity.Project;
import com.taskflow.modules.project.repository.ProjectRepository;
import com.taskflow.modules.sprint.dto.CreateSprintRequest;
import com.taskflow.modules.sprint.dto.SprintResponse;
import com.taskflow.modules.sprint.dto.UpdateSprintRequest;
import com.taskflow.modules.sprint.entity.Sprint;
import com.taskflow.modules.sprint.repository.SprintRepository;
import com.taskflow.modules.user.entity.User;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.workspace.service.WorkspaceAccessService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WorkspaceAccessService workspaceAccessService;

    public SprintResponse createSprint(Long workspaceId, Long projectId, CreateSprintRequest request, Long currentUserId) {

        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        Project project = getProjectInWorkspace(workspaceId, projectId);

        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Sprint sprint = Sprint.builder()
                .project(project)
                .name(request.getName())
                .goal(request.getGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(SprintStatus.PLANNED)
                .createdBy(creator)
                .build();

        Sprint saved = sprintRepository.save(sprint);

        return mapToResponse(saved);
    }

    public List<SprintResponse> getSprintsByProject(Long workspaceId, Long projectId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        getProjectInWorkspace(workspaceId, projectId); // validates project belongs to workspace

        return sprintRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SprintResponse getSprintById(Long workspaceId, Long projectId, Long sprintId, Long currentUserId) {
        workspaceAccessService.ensureUserIsMember(workspaceId, currentUserId);

        getProjectInWorkspace(workspaceId, projectId);

        Sprint sprint = getSprintInProject(projectId, sprintId);

        return mapToResponse(sprint);
    }

    public SprintResponse updateSprint(Long workspaceId, Long projectId, Long sprintId,
                                       UpdateSprintRequest request, Long currentUserId) {

        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        getProjectInWorkspace(workspaceId, projectId);
        Sprint sprint = getSprintInProject(projectId, sprintId);

        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());

        Sprint saved = sprintRepository.save(sprint);

        return mapToResponse(saved);
    }

    public SprintResponse updateSprintStatus(Long workspaceId, Long projectId, Long sprintId,
                                             SprintStatus newStatus, Long currentUserId) {

        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        getProjectInWorkspace(workspaceId, projectId);
        Sprint sprint = getSprintInProject(projectId, sprintId);

        sprint.setStatus(newStatus);
        Sprint saved = sprintRepository.save(sprint);

        return mapToResponse(saved);
    }

    // ---- Helpers ----

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

    private SprintResponse mapToResponse(Sprint sprint) {
        return SprintResponse.builder()
                .id(sprint.getId())
                .projectId(sprint.getProject().getId())
                .name(sprint.getName())
                .goal(sprint.getGoal())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus())
                .createdById(sprint.getCreatedBy().getId())
                .createdByName(sprint.getCreatedBy().getName())
                .createdAt(sprint.getCreatedAt())
                .build();
    }
}