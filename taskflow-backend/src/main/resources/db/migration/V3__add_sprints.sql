CREATE TABLE sprints (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         project_id BIGINT NOT NULL,
                         name VARCHAR(150) NOT NULL,
                         goal TEXT,
                         start_date DATE,
                         end_date DATE,
                         status ENUM('PLANNED', 'ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'PLANNED',
                         created_by BIGINT NOT NULL,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                         CONSTRAINT fk_sprint_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                         CONSTRAINT fk_sprint_creator FOREIGN KEY (created_by) REFERENCES users(id)
);