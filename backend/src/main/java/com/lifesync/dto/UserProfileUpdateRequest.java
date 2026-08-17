package com.lifesync.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdateRequest {
    @Size(max = 100, message = "Họ và tên không vượt quá 100 ký tự")
    private String fullName;

    private String avatarUrl;
    private String phoneNumber;
    private String bio;
    private String gender;
    private LocalDate dateOfBirth;
    private Double heightCm;
    private Double weightKg;
    private Double targetWeightKg;
    private String activityLevel;
}
