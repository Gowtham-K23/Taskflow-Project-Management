package com.taskflow.modules.invitation.service;

import com.taskflow.common.enums.InvitationStatus;
import com.taskflow.common.service.EmailService;
import com.taskflow.modules.auth.dto.AuthResponse;
import com.taskflow.modules.invitation.dto.AcceptInvitationRequest;
import com.taskflow.modules.invitation.dto.CreateInvitationRequest;
import com.taskflow.modules.invitation.dto.InvitationResponse;
import com.taskflow.modules.invitation.entity.Invitation;
import com.taskflow.modules.invitation.repository.InvitationRepository;
import com.taskflow.modules.user.entity.User;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.workspace.entity.Workspace;
import com.taskflow.modules.workspace.entity.WorkspaceMember;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;
import com.taskflow.modules.workspace.repository.WorkspaceRepository;
import com.taskflow.modules.workspace.service.WorkspaceAccessService;
import com.taskflow.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final WorkspaceAccessService workspaceAccessService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.invitation.expiry-hours}")
    private long expiryHours;

    public InvitationResponse createInvitation(Long workspaceId, CreateInvitationRequest request, Long currentUserId) {

        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        User inviter = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // If the person already has an account, add them directly instead of inviting
        boolean userExists = userRepository.existsByEmail(request.getEmail());
        if (userExists) {
            User existingUser = userRepository.findByEmail(request.getEmail()).get();
            if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, existingUser.getId())) {
                throw new IllegalArgumentException("User is already a member of this workspace");
            }
        }

        // Reuse an existing pending invite for this email if one exists, instead of creating a duplicate
        Invitation invitation = invitationRepository
                .findByWorkspaceIdAndEmailAndStatus(workspaceId, request.getEmail(), InvitationStatus.PENDING)
                .orElse(Invitation.builder().workspace(workspace).email(request.getEmail()).build());

        invitation.setRole(request.getRole());
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setInvitedBy(inviter);
        invitation.setExpiresAt(LocalDateTime.now().plusHours(expiryHours));

        Invitation saved = invitationRepository.save(invitation);

        String inviteLink = frontendUrl + "/accept-invite?token=" + saved.getToken();
        emailService.sendInvitationEmail(request.getEmail(), workspace.getName(), inviter.getName(), inviteLink);

        return mapToResponse(saved);
    }

    public List<InvitationResponse> getWorkspaceInvitations(Long workspaceId, Long currentUserId) {
        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        return invitationRepository.findByWorkspaceId(workspaceId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void cancelInvitation(Long workspaceId, Long invitationId, Long currentUserId) {
        workspaceAccessService.ensureUserIsProjectManager(workspaceId, currentUserId);

        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));

        if (!invitation.getWorkspace().getId().equals(workspaceId)) {
            throw new IllegalArgumentException("Invitation does not belong to this workspace");
        }

        invitation.setStatus(InvitationStatus.CANCELLED);
        invitationRepository.save(invitation);
    }

    /**
     * Handles two cases:
     * 1. Brand-new user: creates their account using the name/password provided, then joins the workspace.
     * 2. Existing user (already registered, just invited to a new workspace): ignores name/password, just joins.
     */
    public AuthResponse acceptInvitation(AcceptInvitationRequest request) {

        Invitation invitation = invitationRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired invitation link"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException("This invitation is no longer valid");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new IllegalArgumentException("This invitation has expired. Please ask for a new one.");
        }

        User user = userRepository.findByEmail(invitation.getEmail())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .name(request.getName())
                            .email(invitation.getEmail())
                            .password(passwordEncoder.encode(request.getPassword()))
                            .role(invitation.getRole())
                            .build();
                    return userRepository.save(newUser);
                });

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(invitation.getWorkspace().getId(), user.getId())) {
            WorkspaceMember member = WorkspaceMember.builder()
                    .workspace(invitation.getWorkspace())
                    .user(user)
                    .role(invitation.getRole())
                    .build();
            workspaceMemberRepository.save(member);
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private InvitationResponse mapToResponse(Invitation invitation) {
        return InvitationResponse.builder()
                .id(invitation.getId())
                .workspaceId(invitation.getWorkspace().getId())
                .workspaceName(invitation.getWorkspace().getName())
                .email(invitation.getEmail())
                .role(invitation.getRole())
                .status(invitation.getStatus())
                .invitedByName(invitation.getInvitedBy().getName())
                .expiresAt(invitation.getExpiresAt())
                .createdAt(invitation.getCreatedAt())
                .build();
    }
}