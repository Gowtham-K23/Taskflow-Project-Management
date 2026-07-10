package com.taskflow.modules.task.dto;

import com.taskflow.common.enums.Priority;
import com.taskflow.common.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private Long sprintId;
    private Long projectId;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private LocalDate dueDate;
    private BigDecimal estimatedHours;

    private Long assignedToUserId;
    private String assignedToName;

    private Long createdById;
    private String createdByName;

    private List<String> labels;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    private boolean overdue;
}