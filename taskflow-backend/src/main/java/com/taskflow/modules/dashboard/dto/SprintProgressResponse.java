package com.taskflow.modules.dashboard.dto;

import com.taskflow.common.enums.SprintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintProgressResponse {

    private Long sprintId;
    private String sprintName;
    private SprintStatus status;
    private LocalDate startDate;
    private LocalDate endDate;

    private long totalTasks;
    private long completedTasks;
    private double completionPercentage;
}