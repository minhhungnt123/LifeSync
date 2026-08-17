package com.lifesync.service;

import com.lifesync.dto.AuthResponse;
import com.lifesync.dto.LoginRequest;
import com.lifesync.dto.RegisterRequest;
import com.lifesync.dto.UserResponse;
import com.lifesync.entity.Role;
import com.lifesync.entity.User;
import com.lifesync.exception.BadRequestException;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.UserProfileRepository;
import com.lifesync.repository.UserPreferenceRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.security.JwtTokenProvider;
import com.lifesync.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserPreferenceRepository userPreferenceRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthServiceImpl authService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = User.builder()
                .id(1L)
                .email("john.doe@lifesync.com")
                .password("$2a$10$encodedPassword")
                .fullName("John Doe")
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("TC-M2-UNIT-006: Register user should encode password, save entity, and return AuthResponse")
    void register_ShouldSaveUserAndReturnAuthResponse_WhenRequestIsValid() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .email("new.user@lifesync.com")
                .password("Password123@")
                .fullName("New User")
                .build();

        given(userRepository.existsByEmail(request.getEmail())).willReturn(false);
        given(passwordEncoder.encode(request.getPassword())).willReturn("hashedPassword123");

        User savedUser = User.builder()
                .id(2L)
                .email(request.getEmail())
                .password("hashedPassword123")
                .fullName(request.getFullName())
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        given(userRepository.save(any(User.class))).willReturn(savedUser);
        given(tokenProvider.generateToken(savedUser.getEmail())).willReturn("mocked-jwt-token");

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked-jwt-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo("new.user@lifesync.com");

        verify(userRepository).existsByEmail(request.getEmail());
        verify(passwordEncoder).encode(request.getPassword());
        verify(userRepository).save(any(User.class));
        verify(tokenProvider).generateToken(savedUser.getEmail());
    }

    @Test
    @DisplayName("TC-M2-UNIT-007: Register user should throw BadRequestException when email already exists")
    void register_ShouldThrowBadRequestException_WhenEmailAlreadyExists() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .email("john.doe@lifesync.com")
                .password("Password123@")
                .fullName("John Doe")
                .build();

        given(userRepository.existsByEmail(request.getEmail())).willReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email đã được sử dụng!");

        verify(userRepository).existsByEmail(request.getEmail());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-M2-UNIT-008: Login user should authenticate and return AuthResponse when credentials are valid")
    void login_ShouldReturnAuthResponse_WhenCredentialsAreValid() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("john.doe@lifesync.com")
                .password("Password123@")
                .build();

        given(userRepository.findByEmail(request.getEmail())).willReturn(Optional.of(existingUser));
        given(tokenProvider.generateToken(existingUser.getEmail())).willReturn("mocked-login-token");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked-login-token");
        assertThat(response.getUser().getEmail()).isEqualTo("john.doe@lifesync.com");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail(request.getEmail());
        verify(tokenProvider).generateToken(existingUser.getEmail());
    }

    @Test
    @DisplayName("TC-M2-UNIT-009: Login user should throw BadCredentialsException when authentication fails")
    void login_ShouldThrowException_WhenAuthenticationFails() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("john.doe@lifesync.com")
                .password("WrongPassword")
                .build();

        doThrow(new BadCredentialsException("Invalid credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid credentials");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    @DisplayName("GetCurrentUser should return UserResponse when user exists")
    void getCurrentUser_ShouldReturnUserResponse_WhenUserExists() {
        // Arrange
        given(userRepository.findByEmail(existingUser.getEmail())).willReturn(Optional.of(existingUser));

        // Act
        UserResponse response = authService.getCurrentUser(existingUser.getEmail());

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(existingUser.getId());
        assertThat(response.getEmail()).isEqualTo(existingUser.getEmail());
    }

    @Test
    @DisplayName("GetCurrentUser should throw ResourceNotFoundException when user does not exist")
    void getCurrentUser_ShouldThrowResourceNotFoundException_WhenUserDoesNotExist() {
        // Arrange
        given(userRepository.findByEmail("unknown@lifesync.com")).willReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.getCurrentUser("unknown@lifesync.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy thông tin người dùng!");
    }
}
