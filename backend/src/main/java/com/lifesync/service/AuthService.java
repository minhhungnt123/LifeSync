package com.lifesync.service;

import com.lifesync.dto.AuthResponse;
import com.lifesync.dto.LoginRequest;
import com.lifesync.dto.RegisterRequest;
import com.lifesync.dto.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(String email);
}
