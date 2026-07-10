package com.taskflow.modules.task.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.task.dto.TaskResponse;
import com.taskflow.modules.task.service.TaskService;
import com.taskflow.security.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/my-tasks")
@RequiredArgsConstructor
public class MyTasksController {

    private final TaskService taskService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasks(@PathVariable Long workspaceId) {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<TaskResponse> tasks = taskService.getMyTasks(workspaceId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Your tasks fetched successfully", tasks));
    }
}