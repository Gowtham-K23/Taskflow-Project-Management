package com.taskflow.modules.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateSprintRequest {

    @NotBlank(message = "Sprint name is required")
    @Size(max = 150, message = "Sprint name must be under 150 characters")
    private String name;

    @Size(max = 2000, message = "Goal must be under 2000 characters")
    private String goal;

    private LocalDate startDate;

    private LocalDate endDate;
}