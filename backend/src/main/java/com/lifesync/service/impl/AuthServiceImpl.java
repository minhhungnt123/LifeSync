package com.lifesync.service.impl;

import com.lifesync.dto.AuthResponse;
import com.lifesync.dto.LoginRequest;
import com.lifesync.dto.RegisterRequest;
import com.lifesync.dto.UserResponse;
import com.lifesync.entity.Role;
import com.lifesync.entity.User;
import com.lifesync.exception.BadRequestException;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.entity.UserProfile;
import com.lifesync.entity.UserPreference;
import com.lifesync.repository.UserProfileRepository;
import com.lifesync.repository.UserPreferenceRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.security.JwtTokenProvider;
import com.lifesync.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng!");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create default profile
        userProfileRepository.save(UserProfile.builder()
                .user(savedUser)
                .heightCm(170.0)
                .weightKg(65.0)
                .targetWeightKg(65.0)
                .activityLevel("SEDENTARY")
                .gender("Khác")
                .build());

        // Auto-create default preferences
        userPreferenceRepository.save(UserPreference.builder()
                .user(savedUser)
                .language("vi")
                .timeFormat("24h")
                .weekStartDay("MONDAY")
                .scheduleReminderEnabled(true)
                .scheduleReminderMinutes(15)
                .mealReminderEnabled(true)
                .build());

        String token = tokenProvider.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(savedUser))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng!"));

        String token = tokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng!"));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
