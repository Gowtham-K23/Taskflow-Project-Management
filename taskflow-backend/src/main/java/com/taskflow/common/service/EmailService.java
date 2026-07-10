package com.taskflow.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public void sendInvitationEmail(String toEmail, String workspaceName, String inviterName, String inviteLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("You've been invited to join " + workspaceName + " on TaskFlow");
            message.setText(
                    "Hi,\n\n" +
                            inviterName + " has invited you to join the workspace \"" + workspaceName + "\" on TaskFlow.\n\n" +
                            "Click the link below to accept the invitation and create your account:\n" +
                            inviteLink + "\n\n" +
                            "This link will expire in 72 hours.\n\n" +
                            "If you weren't expecting this invitation, you can safely ignore this email.\n\n" +
                            "— TaskFlow Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            // Don't let email failure block the invite from being created in the DB
            log.error("Failed to send invitation email to {}: {}", toEmail, e.getMessage());
        }
    }
}