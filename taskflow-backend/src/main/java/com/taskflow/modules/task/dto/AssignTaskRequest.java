package com.taskflow.modules.task.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTaskRequest {

    @NotNull(message = "User ID is required")
    private Long userId;
}