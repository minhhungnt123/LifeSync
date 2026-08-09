package com.lifesync.controller;

import com.lifesync.dto.ApiResponse;
import com.lifesync.dto.RoutineTemplateRequest;
import com.lifesync.dto.RoutineTemplateResponse;
import com.lifesync.service.RoutineTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/routine-templates")
@RequiredArgsConstructor
public class RoutineTemplateController {

    private final RoutineTemplateService routineTemplateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoutineTemplateResponse>>> getUserTemplates(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<RoutineTemplateResponse> responses = routineTemplateService.getUserTemplates(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(responses, "Lấy danh sách mẫu thói quen thành công!"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoutineTemplateResponse>> createTemplate(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RoutineTemplateRequest request) {
        RoutineTemplateResponse response = routineTemplateService.createTemplate(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo mẫu thói quen thành công!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        routineTemplateService.deleteTemplate(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa mẫu thói quen thành công!"));
    }
}
