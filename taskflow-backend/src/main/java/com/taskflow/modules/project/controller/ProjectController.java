package com.taskflow.modules.project.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.project.dto.CreateProjectRequest;
import com.taskflow.modules.project.dto.ProjectResponse;
import com.taskflow.modules.project.dto.UpdateProjectRequest;
import com.taskflow.modules.project.service.ProjectService;
import com.taskflow.security.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @PathVariable Long workspaceId,
            @Valid @RequestBody CreateProjectRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        ProjectResponse response = projectService.createProject(workspaceId, request, currentUserId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects(
            @PathVariable Long workspaceId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<ProjectResponse> projects = projectService.getProjectsByWorkspace(workspaceId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Projects fetched successfully", projects));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        ProjectResponse response = projectService.getProjectById(workspaceId, projectId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Project fetched successfully", response));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        ProjectResponse response = projectService.updateProject(workspaceId, projectId, request, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", response));
    }

    @PatchMapping("/{projectId}/complete")
    public ResponseEntity<ApiResponse<ProjectResponse>> completeProject(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        ProjectResponse response = projectService.completeProject(workspaceId, projectId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Project marked as completed", response));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> archiveProject(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        projectService.archiveProject(workspaceId, projectId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Project archived successfully", null));
    }
}