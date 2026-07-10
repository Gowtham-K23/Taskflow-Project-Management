package com.taskflow.modules.workspace.dto;

import com.taskflow.common.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMemberResponse {

    private Long userId;
    private String name;
    private String email;
    private Role role;
}