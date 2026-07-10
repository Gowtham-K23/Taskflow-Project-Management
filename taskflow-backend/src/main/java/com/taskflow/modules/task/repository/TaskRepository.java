package com.taskflow.modules.task.repository;

import com.taskflow.common.enums.TaskStatus;
import com.taskflow.modules.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findBySprintId(Long sprintId);

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssignedToId(Long userId);

    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId " +
            "AND t.dueDate < :today AND t.status <> 'DONE'")
    List<Task> findDelayedTasksByProject(@Param("projectId") Long projectId, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.project.workspace.id = :workspaceId " +
            "AND t.dueDate < :today AND t.status <> 'DONE'")
    List<Task> findDelayedTasksByWorkspace(@Param("workspaceId") Long workspaceId, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.project.workspace.id = :workspaceId AND t.status = :status")
    List<Task> findByWorkspaceIdAndStatus(@Param("workspaceId") Long workspaceId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.workspace.id = :workspaceId")
    long countByWorkspaceId(@Param("workspaceId") Long workspaceId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.workspace.id = :workspaceId AND t.status = :status")
    long countByWorkspaceIdAndStatus(@Param("workspaceId") Long workspaceId, @Param("status") TaskStatus status);

    long countByProjectIdAndStatus(Long projectId, TaskStatus status);

    long countBySprintId(Long sprintId);

    long countBySprintIdAndStatus(Long sprintId, TaskStatus status);

    long countByAssignedToIdAndStatus(Long userId, TaskStatus status);

    long countByAssignedToIdAndDueDateBeforeAndStatusNot(Long userId, LocalDate date, TaskStatus status);
}