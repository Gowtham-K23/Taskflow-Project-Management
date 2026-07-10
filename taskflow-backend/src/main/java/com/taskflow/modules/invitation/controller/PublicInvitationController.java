package com.taskflow.modules.invitation.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.auth.dto.AuthResponse;
import com.taskflow.modules.invitation.dto.AcceptInvitationRequest;
import com.taskflow.modules.invitation.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class PublicInvitationController {

    private final InvitationService invitationService;

    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<AuthResponse>> acceptInvitation(
            @Valid @RequestBody AcceptInvitationRequest request) {

        AuthResponse response = invitationService.acceptInvitation(request);

        return ResponseEntity.ok(ApiResponse.success("Invitation accepted successfully", response));
    }
}