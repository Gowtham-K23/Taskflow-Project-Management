package com.taskflow.modules.dashboard.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.dashboard.dto.*;
import com.taskflow.modules.dashboard.service.DashboardService;
import com.taskflow.security.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @PathVariable Long workspaceId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        DashboardSummaryResponse response = dashboardService.getWorkspaceSummary(workspaceId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Dashboard summary fetched successfully", response));
    }

    @GetMapping("/projects/{projectId}/overview")
    public ResponseEntity<ApiResponse<ProjectOverviewResponse>> getProjectOverview(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        ProjectOverviewResponse response = dashboardService.getProjectOverview(workspaceId, projectId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Project overview fetched successfully", response));
    }

    @GetMapping("/sprints/{sprintId}/progress")
    public ResponseEntity<ApiResponse<SprintProgressResponse>> getSprintProgress(
            @PathVariable Long workspaceId,
            @PathVariable Long sprintId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        SprintProgressResponse response = dashboardService.getSprintProgress(workspaceId, sprintId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Sprint progress fetched successfully", response));
    }

    @GetMapping("/team-performance")
    public ResponseEntity<ApiResponse<List<TeamPerformanceResponse>>> getTeamPerformance(
            @PathVariable Long workspaceId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<TeamPerformanceResponse> response = dashboardService.getTeamPerformance(workspaceId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Team performance fetched successfully", response));
    }

    @GetMapping("/delayed-tasks")
    public ResponseEntity<ApiResponse<List<DelayedTaskResponse>>> getDelayedTasks(
            @PathVariable Long workspaceId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<DelayedTaskResponse> response = dashboardService.getDelayedTasks(workspaceId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Delayed tasks fetched successfully", response));
    }
}