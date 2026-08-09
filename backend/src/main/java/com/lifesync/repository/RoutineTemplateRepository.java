package com.lifesync.repository;

import com.lifesync.entity.RoutineTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineTemplateRepository extends JpaRepository<RoutineTemplate, Long> {

    List<RoutineTemplate> findByUserIdOrderByCreatedAtAsc(Long userId);
}
