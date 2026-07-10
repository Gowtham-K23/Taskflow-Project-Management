package com.taskflow.modules.workspace.service;

import com.taskflow.common.enums.Role;
import com.taskflow.modules.user.entity.User;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.workspace.dto.*;
import com.taskflow.modules.workspace.entity.Workspace;
import com.taskflow.modules.workspace.entity.WorkspaceMember;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;
import com.taskflow.modules.workspace.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request, Long currentUserId) {

        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .createdBy(owner)
                .build();

        Workspace saved = workspaceRepository.save(workspace);

        // Automatically add the creator as a PROJECT_MANAGER member of their own workspace
        WorkspaceMember ownerMembership = WorkspaceMember.builder()
                .workspace(saved)
                .user(owner)
                .role(Role.PROJECT_MANAGER)
                .build();

        workspaceMemberRepository.save(ownerMembership);

        return mapToResponse(saved);
    }

    public List<WorkspaceResponse> getMyWorkspaces(Long currentUserId) {
        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUserId(currentUserId);

        return memberships.stream()
                .map(m -> mapToResponse(m.getWorkspace()))
                .toList();
    }

    public WorkspaceResponse getWorkspaceById(Long workspaceId, Long currentUserId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureUserIsMember(workspaceId, currentUserId);

        return mapToResponse(workspace);
    }

    public WorkspaceMemberResponse addMember(Long workspaceId, AddMemberRequest request, Long currentUserId) {

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureUserIsProjectManager(workspaceId, currentUserId);

        User userToAdd = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No account found with email: " + request.getEmail() + ". They must register first."));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userToAdd.getId())) {
            throw new IllegalArgumentException("User is already a member of this workspace");
        }

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(workspace)
                .user(userToAdd)
                .role(request.getRole())
                .build();

        WorkspaceMember saved = workspaceMemberRepository.save(member);

        return WorkspaceMemberResponse.builder()
                .userId(saved.getUser().getId())
                .name(saved.getUser().getName())
                .email(saved.getUser().getEmail())
                .role(saved.getRole())
                .build();
    }

    public List<WorkspaceMemberResponse> getMembers(Long workspaceId, Long currentUserId) {
        ensureUserIsMember(workspaceId, currentUserId);

        return workspaceMemberRepository.findByWorkspaceId(workspaceId).stream()
                .map(m -> WorkspaceMemberResponse.builder()
                        .userId(m.getUser().getId())
                        .name(m.getUser().getName())
                        .email(m.getUser().getEmail())
                        .role(m.getRole())
                        .build())
                .toList();
    }

    // ---- Access control helpers ----

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

    private WorkspaceResponse mapToResponse(Workspace workspace) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .createdById(workspace.getCreatedBy().getId())
                .createdByName(workspace.getCreatedBy().getName())
                .createdAt(workspace.getCreatedAt())
                .build();
    }
}