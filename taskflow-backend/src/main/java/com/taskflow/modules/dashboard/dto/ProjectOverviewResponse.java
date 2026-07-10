package com.taskflow.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectOverviewResponse {

    private Long projectId;
    private String projectName;

    private long totalTasks;
    private long todoCount;
    private long inProgressCount;
    private long reviewCount;
    private long doneCount;
    private long delayedCount;

    private double completionPercentage;
}