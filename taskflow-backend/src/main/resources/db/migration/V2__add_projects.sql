CREATE TABLE projects (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          workspace_id BIGINT NOT NULL,
                          name VARCHAR(200) NOT NULL,
                          description TEXT,
                          status ENUM('ACTIVE', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
                          created_by BIGINT NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          completed_at TIMESTAMP NULL,

                          CONSTRAINT fk_project_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
                          CONSTRAINT fk_project_creator FOREIGN KEY (created_by) REFERENCES users(id)
);