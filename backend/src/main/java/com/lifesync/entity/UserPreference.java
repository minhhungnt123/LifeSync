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
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private String language = "vi";

    @Column(name = "time_format", nullable = false)
    @Builder.Default
    private String timeFormat = "24h";

    @Column(name = "week_start_day", nullable = false)
    @Builder.Default
    private String weekStartDay = "MONDAY";

    @Column(name = "schedule_reminder_enabled", nullable = false)
    @Builder.Default
    private Boolean scheduleReminderEnabled = true;

    @Column(name = "schedule_reminder_minutes", nullable = false)
    @Builder.Default
    private Integer scheduleReminderMinutes = 15;

    @Column(name = "meal_reminder_enabled", nullable = false)
    @Builder.Default
    private Boolean mealReminderEnabled = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
