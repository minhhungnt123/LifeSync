package com.lifesync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "meal_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;

    @Column(name = "food_name", nullable = false)
    private String foodName;

    @Column(nullable = false)
    private Double calories;

    @Column(nullable = false)
    @Builder.Default
    private Double protein = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double carbs = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double fat = 0.0;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
