package com.taskflow.modules.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 200, message = "Project name must be under 200 characters")
    private String name;

    @Size(max = 2000, message = "Description must be under 2000 characters")
    private String description;
}