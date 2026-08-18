package com.lifesync.repository;

import com.lifesync.entity.Schedule;
import com.lifesync.entity.ScheduleCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByUserIdOrderByStartTimeAsc(Long userId);

    @Query("SELECT s FROM Schedule s WHERE s.user.id = :userId " +
           "AND (cast(:start as string) IS NULL OR s.endTime >= :start) " +
           "AND (cast(:end as string) IS NULL OR s.startTime <= :end) " +
           "AND (cast(:category as string) IS NULL OR s.category = :category) " +
           "ORDER BY s.startTime ASC")
    List<Schedule> findSchedulesByFilter(@Param("userId") Long userId,
                                         @Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end,
                                         @Param("category") ScheduleCategory category);

    @Query("SELECT s FROM Schedule s WHERE s.user.id = :userId " +
           "AND s.startTime < :endTime AND s.endTime > :startTime " +
           "AND (cast(:excludeId as string) IS NULL OR s.id <> :excludeId)")
    List<Schedule> findOverlappingSchedules(@Param("userId") Long userId,
                                           @Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime,
                                           @Param("excludeId") Long excludeId);

    List<Schedule> findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(Long userId, LocalDateTime start, LocalDateTime end);
}

