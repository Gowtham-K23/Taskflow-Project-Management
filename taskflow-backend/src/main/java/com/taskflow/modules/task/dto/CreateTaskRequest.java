package com.taskflow.modules.task.dto;

import com.taskflow.common.enums.Priority;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(max = 200, message = "Title must be under 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must be under 2000 characters")
    private String description;

    private Priority priority; // defaults to MEDIUM in service if null

    private LocalDate dueDate;

    @DecimalMin(value = "0.0", inclusive = true, message = "Estimated hours cannot be negative")
    private BigDecimal estimatedHours;

    private Long assignedToUserId; // nullable — can be assigned later

    private List<String> labels;
}