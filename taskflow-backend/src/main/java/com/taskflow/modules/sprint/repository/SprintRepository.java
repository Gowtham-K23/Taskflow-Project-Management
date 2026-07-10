package com.taskflow.modules.sprint.repository;

import com.taskflow.common.enums.SprintStatus;
import com.taskflow.modules.sprint.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectId(Long projectId);

    List<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);

    @Query("SELECT s FROM Sprint s WHERE s.project.workspace.id = :workspaceId AND s.status = 'ACTIVE'")
    List<Sprint> findActiveSprintsByWorkspace(@Param("workspaceId") Long workspaceId);
}