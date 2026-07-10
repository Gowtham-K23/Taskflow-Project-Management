CREATE TABLE tasks (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       sprint_id BIGINT NOT NULL,
                       project_id BIGINT NOT NULL,
                       title VARCHAR(200) NOT NULL,
                       description TEXT,
                       status ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE') NOT NULL DEFAULT 'TODO',
                       priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
                       due_date DATE,
                       estimated_hours DECIMAL(6,2),
                       assigned_to BIGINT,
                       created_by BIGINT NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       completed_at TIMESTAMP NULL,

                       CONSTRAINT fk_task_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
                       CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                       CONSTRAINT fk_task_assignee FOREIGN KEY (assigned_to) REFERENCES users(id),
                       CONSTRAINT fk_task_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE task_labels (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             task_id BIGINT NOT NULL,
                             label VARCHAR(50) NOT NULL,

                             CONSTRAINT fk_label_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);