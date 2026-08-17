package com.lifesync.service;

import com.lifesync.dto.*;

public interface UserService {
    UserProfileResponse getProfile(String userEmail);
    UserProfileResponse updateProfile(String userEmail, UserProfileUpdateRequest request);
    UserPreferenceResponse getPreference(String userEmail);
    UserPreferenceResponse updatePreference(String userEmail, UserPreferenceUpdateRequest request);
    BodyMetricsRecommendationResponse getBodyMetricsRecommendation(String userEmail);
    void changePassword(String userEmail, ChangePasswordRequest request);
    UserDataExportResponse exportUserData(String userEmail);
}
