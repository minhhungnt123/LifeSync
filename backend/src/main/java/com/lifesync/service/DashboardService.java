package com.lifesync.service;

import com.lifesync.dto.DashboardSummaryResponse;

public interface DashboardService {

    DashboardSummaryResponse getDashboardSummary(String userEmail);
}
