package com.taskflow.modules.dashboard.dto;

import com.taskflow.common.enums.Priority;
import com.taskflow.common.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DelayedTaskResponse {

    private Long taskId;
    private String title;
    private TaskStatus status;
    private Priority priority;
    private LocalDate dueDate;
    private long daysOverdue;
    private String assignedToName;
    private String sprintName;
}