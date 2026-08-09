package com.lifesync.service.impl;

import com.lifesync.dto.RoutineTemplateRequest;
import com.lifesync.dto.RoutineTemplateResponse;
import com.lifesync.entity.RoutineTemplate;
import com.lifesync.entity.ScheduleCategory;
import com.lifesync.entity.User;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.repository.RoutineTemplateRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.service.RoutineTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoutineTemplateServiceImpl implements RoutineTemplateService {

    private final RoutineTemplateRepository routineTemplateRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public List<RoutineTemplateResponse> getUserTemplates(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<RoutineTemplate> templates = routineTemplateRepository.findByUserIdOrderByCreatedAtAsc(user.getId());

        // Nếu người dùng chưa có mẫu nào, tự động seed 5 mẫu thói quen phổ biến vào DB
        if (templates.isEmpty()) {
            List<RoutineTemplate> defaultTemplates = Arrays.asList(
                    RoutineTemplate.builder().user(user).title("Tập thể dục").durationMinutes(30).category(ScheduleCategory.HEALTH).build(),
                    RoutineTemplate.builder().user(user).title("Đọc sách").durationMinutes(45).category(ScheduleCategory.STUDY).build(),
                    RoutineTemplate.builder().user(user).title("Học Tiếng Anh").durationMinutes(60).category(ScheduleCategory.STUDY).build(),
                    RoutineTemplate.builder().user(user).title("Thiền định").durationMinutes(15).category(ScheduleCategory.PERSONAL).build(),
                    RoutineTemplate.builder().user(user).title("Nghỉ ngơi & Giải trí").durationMinutes(30).category(ScheduleCategory.PERSONAL).build()
            );
            templates = routineTemplateRepository.saveAll(defaultTemplates);
        }

        return templates.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoutineTemplateResponse createTemplate(String userEmail, RoutineTemplateRequest request) {
        User user = getUserByEmail(userEmail);

        RoutineTemplate template = RoutineTemplate.builder()
                .user(user)
                .title(request.getTitle())
                .durationMinutes(request.getDurationMinutes())
                .category(request.getCategory())
                .build();

        RoutineTemplate saved = routineTemplateRepository.save(template);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteTemplate(String userEmail, Long templateId) {
        User user = getUserByEmail(userEmail);
        RoutineTemplate template = routineTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu thói quen!"));

        if (!template.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Không tìm thấy mẫu thói quen hoặc bạn không có quyền xóa!");
        }

        routineTemplateRepository.delete(template);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng!"));
    }

    private RoutineTemplateResponse mapToResponse(RoutineTemplate template) {
        return RoutineTemplateResponse.builder()
                .id(template.getId())
                .title(template.getTitle())
                .durationMinutes(template.getDurationMinutes())
                .category(template.getCategory())
                .createdAt(template.getCreatedAt())
                .build();
    }
}
