package com.taskflow.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamPerformanceResponse {

    private Long userId;
    private String userName;

    private long assignedTasks;
    private long completedTasks;
    private long pendingTasks;
    private long delayedTasks;
    private double completionRate;
}