CREATE TABLE invitations (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             workspace_id BIGINT NOT NULL,
                             email VARCHAR(150) NOT NULL,
                             role ENUM('PROJECT_MANAGER', 'TEAM_MEMBER') NOT NULL,
                             token VARCHAR(255) NOT NULL UNIQUE,
                             status ENUM('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
                             invited_by BIGINT NOT NULL,
                             expires_at TIMESTAMP NOT NULL,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                             CONSTRAINT fk_invitation_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
                             CONSTRAINT fk_invitation_inviter FOREIGN KEY (invited_by) REFERENCES users(id),
                             UNIQUE KEY uq_workspace_email_pending (workspace_id, email)
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);