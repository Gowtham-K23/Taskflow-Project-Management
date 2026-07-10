package com.taskflow.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalProjects;
    private long activeProjects;
    private long completedProjects;

    private long totalTasks;
    private long pendingTasks;   // TODO + IN_PROGRESS + REVIEW
    private long completedTasks;
    private long delayedTasks;

    private List<TeamPerformanceResponse> teamPerformance;
    private List<SprintProgressResponse> activeSprints;
}