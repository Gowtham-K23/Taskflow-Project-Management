package com.taskflow.modules.project.repository;

import com.taskflow.common.enums.ProjectStatus;
import com.taskflow.modules.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByWorkspaceId(Long workspaceId);

    boolean existsByIdAndWorkspaceId(Long projectId, Long workspaceId);

    long countByWorkspaceIdAndStatus(Long workspaceId, ProjectStatus status);

    long countByWorkspaceId(Long workspaceId);
}