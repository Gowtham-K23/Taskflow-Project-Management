package com.taskflow.modules.sprint.controller;

import com.taskflow.common.enums.SprintStatus;
import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.sprint.dto.CreateSprintRequest;
import com.taskflow.modules.sprint.dto.SprintResponse;
import com.taskflow.modules.sprint.dto.UpdateSprintRequest;
import com.taskflow.modules.sprint.service.SprintService;
import com.taskflow.security.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<SprintResponse>> createSprint(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @Valid @RequestBody CreateSprintRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        SprintResponse response = sprintService.createSprint(workspaceId, projectId, request, currentUserId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sprint created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SprintResponse>>> getSprints(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<SprintResponse> sprints = sprintService.getSprintsByProject(workspaceId, projectId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Sprints fetched successfully", sprints));
    }

    @GetMapping("/{sprintId}")
    public ResponseEntity<ApiResponse<SprintResponse>> getSprintById(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        SprintResponse response = sprintService.getSprintById(workspaceId, projectId, sprintId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Sprint fetched successfully", response));
    }

    @PutMapping("/{sprintId}")
    public ResponseEntity<ApiResponse<SprintResponse>> updateSprint(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @Valid @RequestBody UpdateSprintRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        SprintResponse response = sprintService.updateSprint(workspaceId, projectId, sprintId, request, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Sprint updated successfully", response));
    }

    @PatchMapping("/{sprintId}/status")
    public ResponseEntity<ApiResponse<SprintResponse>> updateSprintStatus(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @RequestParam SprintStatus status) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        SprintResponse response = sprintService.updateSprintStatus(workspaceId, projectId, sprintId, status, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Sprint status updated successfully", response));
    }
}