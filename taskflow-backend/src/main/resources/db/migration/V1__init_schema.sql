-- V1__init_schema.sql
CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(150) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       role ENUM('PROJECT_MANAGER', 'TEAM_MEMBER') NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE workspaces (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(150) NOT NULL,
                            created_by BIGINT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT fk_workspace_owner FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE workspace_members (
                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                   workspace_id BIGINT NOT NULL,
                                   user_id BIGINT NOT NULL,
                                   role ENUM('PROJECT_MANAGER', 'TEAM_MEMBER') NOT NULL,
                                   joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   CONSTRAINT fk_wm_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
                                   CONSTRAINT fk_wm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                   UNIQUE KEY uq_workspace_user (workspace_id, user_id)
);