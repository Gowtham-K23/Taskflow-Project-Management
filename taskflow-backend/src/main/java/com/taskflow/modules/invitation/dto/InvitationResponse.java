package com.taskflow.modules.invitation.dto;

import com.taskflow.common.enums.InvitationStatus;
import com.taskflow.common.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {

    private Long id;
    private Long workspaceId;
    private String workspaceName;
    private String email;
    private Role role;
    private InvitationStatus status;
    private String invitedByName;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}