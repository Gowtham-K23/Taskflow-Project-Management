package com.taskflow.modules.task.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.task.dto.*;
import com.taskflow.modules.task.service.TaskService;
import com.taskflow.security.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/sprints/{sprintId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @Valid @RequestBody CreateTaskRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        TaskResponse response = taskService.createTask(workspaceId, projectId, sprintId, request, currentUserId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasks(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<TaskResponse> tasks = taskService.getTasksBySprint(workspaceId, projectId, sprintId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Tasks fetched successfully", tasks));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @PathVariable Long taskId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        TaskResponse response = taskService.getTaskById(workspaceId, projectId, sprintId, taskId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Task fetched successfully", response));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        TaskResponse response = taskService.updateTask(workspaceId, projectId, sprintId, taskId, request, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", response));
    }

    @PatchMapping("/{taskId}/assign")
    public ResponseEntity<ApiResponse<TaskResponse>> assignTask(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @PathVariable Long taskId,
            @Valid @RequestBody AssignTaskRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        TaskResponse response = taskService.assignTask(workspaceId, projectId, sprintId, taskId, request, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Task assigned successfully", response));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        TaskResponse response = taskService.updateTaskStatus(workspaceId, projectId, sprintId, taskId, request, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", response));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @PathVariable Long taskId) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        taskService.deleteTask(workspaceId, projectId, sprintId, taskId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}