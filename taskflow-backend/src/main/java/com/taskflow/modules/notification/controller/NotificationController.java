package com.taskflow.modules.notification.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.notification.dto.NotificationResponse;
import com.taskflow.modules.notification.service.NotificationService;
import com.taskflow.security.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications() {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<NotificationResponse> notifications = notificationService.getMyNotifications(currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", notifications));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnread() {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Unread notifications fetched successfully", notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        long count = notificationService.getUnreadCount(currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Unread count fetched successfully", Map.of("count", count)));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long notificationId) {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        notificationService.markAsRead(notificationId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        notificationService.markAllAsRead(currentUserId);

        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}