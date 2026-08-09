package com.lifesync.service;

import com.lifesync.dto.RoutineTemplateRequest;
import com.lifesync.dto.RoutineTemplateResponse;

import java.util.List;

public interface RoutineTemplateService {

    List<RoutineTemplateResponse> getUserTemplates(String userEmail);

    RoutineTemplateResponse createTemplate(String userEmail, RoutineTemplateRequest request);

    void deleteTemplate(String userEmail, Long templateId);
}
