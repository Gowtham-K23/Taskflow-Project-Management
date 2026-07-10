package com.taskflow.modules.invitation.repository;

import com.taskflow.common.enums.InvitationStatus;
import com.taskflow.modules.invitation.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByToken(String token);

    Optional<Invitation> findByWorkspaceIdAndEmailAndStatus(Long workspaceId, String email, InvitationStatus status);

    List<Invitation> findByWorkspaceId(Long workspaceId);

    List<Invitation> findByEmailAndStatus(String email, InvitationStatus status);
}