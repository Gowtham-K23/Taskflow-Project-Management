package com.taskflow.modules.project.service;

import com.taskflow.common.enums.ProjectStatus;
import com.taskflow.common.enums.Role;
import com.taskflow.modules.project.dto.CreateProjectRequest;
import com.taskflow.modules.project.dto.ProjectResponse;
import com.taskflow.modules.project.dto.UpdateProjectRequest;
import com.taskflow.modules.project.entity.Project;
import com.taskflow.modules.project.repository.ProjectRepository;
import com.taskflow.modules.user.entity.User;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.workspace.entity.Workspace;
import com.taskflow.modules.workspace.entity.WorkspaceMember;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;
import com.taskflow.modules.workspace.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    public ProjectResponse createProject(Long workspaceId, CreateProjectRequest request, Long currentUserId) {

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureUserIsProjectManager(workspaceId, currentUserId);

        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Project project = Project.builder()
                .workspace(workspace)
                .name(request.getName())
                .description(request.getDescription())
                .status(ProjectStatus.ACTIVE)
                .createdBy(creator)
                .build();

        Project saved = projectRepository.save(project);

        return mapToResponse(saved);
    }

    public List<ProjectResponse> getProjectsByWorkspace(Long workspaceId, Long currentUserId) {
        ensureUserIsMember(workspaceId, currentUserId);

        return projectRepository.findByWorkspaceId(workspaceId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProjectResponse getProjectById(Long workspaceId, Long projectId, Long currentUserId) {
        ensureUserIsMember(workspaceId, currentUserId);

        Project project = getProjectInWorkspace(workspaceId, projectId);

        return mapToResponse(project);
    }

    public ProjectResponse updateProject(Long workspaceId, Long projectId, UpdateProjectRequest request, Long currentUserId) {

        ensureUserIsProjectManager(workspaceId, currentUserId);

        Project project = getProjectInWorkspace(workspaceId, projectId);

        project.setName(request.getName());
        project.setDescription(request.getDescription());

        Project saved = projectRepository.save(project);

        return mapToResponse(saved);
    }

    public ProjectResponse completeProject(Long workspaceId, Long projectId, Long currentUserId) {

        ensureUserIsProjectManager(workspaceId, currentUserId);

        Project project = getProjectInWorkspace(workspaceId, projectId);

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new IllegalArgumentException("Project is already marked as completed");
        }

        project.setStatus(ProjectStatus.COMPLETED);
        project.setCompletedAt(LocalDateTime.now());

        Project saved = projectRepository.save(project);

        return mapToResponse(saved);
    }

    public void archiveProject(Long workspaceId, Long projectId, Long currentUserId) {
        ensureUserIsProjectManager(workspaceId, currentUserId);

        Project project = getProjectInWorkspace(workspaceId, projectId);
        project.setStatus(ProjectStatus.ARCHIVED);

        projectRepository.save(project);
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

    private void ensureUserIsMember(Long workspaceId, Long userId) {
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new IllegalArgumentException("You are not a member of this workspace");
        }
    }

    private void ensureUserIsProjectManager(Long workspaceId, Long userId) {
        WorkspaceMember membership = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this workspace"));

        if (membership.getRole() != Role.PROJECT_MANAGER) {
            throw new IllegalArgumentException("Only a Project Manager can perform this action");
        }
    }

    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .workspaceId(project.getWorkspace().getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .createdById(project.getCreatedBy().getId())
                .createdByName(project.getCreatedBy().getName())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .completedAt(project.getCompletedAt())
                .build();
    }
}