package com.lifesync.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    private final String secretKeyStr = "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b";
    private final long expirationMs = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", secretKeyStr);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", expirationMs);
    }

    @Test
    @DisplayName("TC-M2-UNIT-001: Generate JWT token should return non-null token string")
    void generateToken_ShouldReturnValidJwtToken_WhenGivenValidEmail() {
        // Arrange
        String email = "test.user@lifesync.com";

        // Act
        String token = jwtTokenProvider.generateToken(email);

        // Assert
        assertThat(token).isNotNull().isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("TC-M2-UNIT-002: Validate token should return true for valid token")
    void validateToken_ShouldReturnTrue_WhenTokenIsValid() {
        // Arrange
        String email = "valid.user@lifesync.com";
        String token = jwtTokenProvider.generateToken(email);

        // Act
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Assert
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("TC-M2-UNIT-003: Validate token should return false when token is expired")
    void validateToken_ShouldReturnFalse_WhenTokenIsExpired() {
        // Arrange
        Date now = new Date();
        Date pastExpiry = new Date(now.getTime() - 10000L); // 10 seconds ago
        SecretKey key = Keys.hmacShaKeyFor(secretKeyStr.getBytes(StandardCharsets.UTF_8));

        String expiredToken = Jwts.builder()
                .subject("expired.user@lifesync.com")
                .issuedAt(new Date(now.getTime() - 20000L))
                .expiration(pastExpiry)
                .signWith(key)
                .compact();

        // Act
        boolean isValid = jwtTokenProvider.validateToken(expiredToken);

        // Assert
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("TC-M2-UNIT-004: Validate token should return false when token signature is tampered")
    void validateToken_ShouldReturnFalse_WhenTokenIsTampered() {
        // Arrange
        String email = "secure.user@lifesync.com";
        String validToken = jwtTokenProvider.generateToken(email);
        String tamperedToken = validToken + "tamperedExtraChars";

        // Act
        boolean isValid = jwtTokenProvider.validateToken(tamperedToken);

        // Assert
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("TC-M2-UNIT-005: Extract email from token should return correct subject email")
    void getEmailFromToken_ShouldReturnCorrectEmail_WhenTokenIsValid() {
        // Arrange
        String expectedEmail = "extract.email@lifesync.com";
        String token = jwtTokenProvider.generateToken(expectedEmail);

        // Act
        String actualEmail = jwtTokenProvider.getEmailFromToken(token);

        // Assert
        assertThat(actualEmail).isEqualTo(expectedEmail);
    }
}
