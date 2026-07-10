package com.taskflow.modules.invitation.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.invitation.dto.CreateInvitationRequest;
import com.taskflow.modules.invitation.dto.InvitationResponse;
import com.taskflow.modules.invitation.service.InvitationService;
import com.taskflow.security.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<InvitationResponse>> createInvitation(
            @PathVariable Long workspaceId,
            @Valid @RequestBody CreateInvitationRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        InvitationResponse response = invitationService.createInvitation(workspaceId, request, currentUserId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invitation sent successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvitationResponse>>> getInvitations(
            @PathVariable Long workspaceId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<InvitationResponse> invitations = invitationService.getWorkspaceInvitations(workspaceId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Invitations fetched successfully", invitations));
    }

    @DeleteMapping("/{invitationId}")
    public ResponseEntity<ApiResponse<Void>> cancelInvitation(
            @PathVariable Long workspaceId,
            @PathVariable Long invitationId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        invitationService.cancelInvitation(workspaceId, invitationId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Invitation cancelled successfully", null));
    }
}