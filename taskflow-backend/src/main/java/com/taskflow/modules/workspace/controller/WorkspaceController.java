package com.taskflow.modules.workspace.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.workspace.dto.*;
import com.taskflow.modules.workspace.service.WorkspaceService;
import com.taskflow.security.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(
            @Valid @RequestBody CreateWorkspaceRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        WorkspaceResponse response = workspaceService.createWorkspace(request, currentUserId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Workspace created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkspaceResponse>>> getMyWorkspaces() {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<WorkspaceResponse> workspaces = workspaceService.getMyWorkspaces(currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Workspaces fetched successfully", workspaces));
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspaceById(
            @PathVariable Long workspaceId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        WorkspaceResponse response = workspaceService.getWorkspaceById(workspaceId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Workspace fetched successfully", response));
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<ApiResponse<WorkspaceMemberResponse>> addMember(
            @PathVariable Long workspaceId,
            @Valid @RequestBody AddMemberRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        WorkspaceMemberResponse response = workspaceService.addMember(workspaceId, request, currentUserId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member added successfully", response));
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<ApiResponse<List<WorkspaceMemberResponse>>> getMembers(
            @PathVariable Long workspaceId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<WorkspaceMemberResponse> members = workspaceService.getMembers(workspaceId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Members fetched successfully", members));
    }
}