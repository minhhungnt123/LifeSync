package com.lifesync.repository;

import com.lifesync.entity.MealLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MealLogRepository extends JpaRepository<MealLog, Long> {

    List<MealLog> findByUserIdOrderByLoggedAtDesc(Long userId);

    List<MealLog> findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(Long userId, LocalDateTime start, LocalDateTime end);
}
