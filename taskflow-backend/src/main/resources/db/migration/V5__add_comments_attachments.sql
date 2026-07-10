CREATE TABLE comments (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          task_id BIGINT NOT NULL,
                          user_id BIGINT NOT NULL,
                          content TEXT NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                          CONSTRAINT fk_comment_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                          CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE attachments (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             task_id BIGINT NOT NULL,
                             uploaded_by BIGINT NOT NULL,
                             file_name VARCHAR(255) NOT NULL,
                             file_path VARCHAR(500) NOT NULL,
                             file_size BIGINT,
                             content_type VARCHAR(100),
                             uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                             CONSTRAINT fk_attachment_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                             CONSTRAINT fk_attachment_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_attachments_task_id ON attachments(task_id);