package com.taskflow.modules.user.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.modules.user.dto.ChangePasswordRequest;
import com.taskflow.modules.user.dto.UpdateProfileRequest;
import com.taskflow.modules.user.dto.UserProfileResponse;
import com.taskflow.modules.user.service.UserService;
import com.taskflow.security.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile() {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        UserProfileResponse response = userService.getProfile(currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        UserProfileResponse response = userService.updateProfile(currentUserId, request);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PatchMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        Long currentUserId = currentUserUtil.getCurrentUserId();
        userService.changePassword(currentUserId, request);

        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}