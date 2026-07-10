package com.taskflow.modules.workspace.service;

import com.taskflow.common.enums.Role;
import com.taskflow.modules.workspace.entity.WorkspaceMember;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceAccessService {

    private final WorkspaceMemberRepository workspaceMemberRepository;

    public void ensureUserIsMember(Long workspaceId, Long userId) {
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new IllegalArgumentException("You are not a member of this workspace");
        }
    }

    public void ensureUserIsProjectManager(Long workspaceId, Long userId) {
        WorkspaceMember membership = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this workspace"));

        if (membership.getRole() != Role.PROJECT_MANAGER) {
            throw new IllegalArgumentException("Only a Project Manager can perform this action");
        }
    }
}