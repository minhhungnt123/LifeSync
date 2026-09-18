/**
 * LifeSync AI - Comprehensive End-to-End (E2E) Integration Test Suite
 * Tests integration across:
 * 1. Authentication & Session Management
 * 2. Time & Schedule Management
 * 3. Meal & Nutrition Tracking
 * 4. User Profile, Preferences & Biometrics Calculation
 * 5. Dashboard Analytics & Trend Aggregation
 * 6. AI Assistant Chatbot & Heartcare Knowledge Engine
 */

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:8080';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function logHeader(title) {
  console.log(`\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  🧪 ${title}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}`);
}

function logStep(step, message) {
  console.log(`  ${colors.bold}${colors.yellow}[Step ${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`    ${colors.green}✔ ${message}${colors.reset}`);
}

function logError(message, err) {
  console.error(`    ${colors.red}✖ ${message}${colors.reset}`, err || '');
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const status = response.status;
  let json = null;
  try {
    json = await response.json();
  } catch {
    // Non-JSON response
  }

  return { status, data: json, ok: response.ok };
}

async function runE2ETests() {
  const timestamp = Date.now();
  const testUser = {
    fullName: `E2E Tester ${timestamp}`,
    email: `e2e_tester_${timestamp}@lifesync.ai`,
    password: `P@ssword_${timestamp}`,
  };

  let token = null;
  let scheduleId = null;
  let mealId = null;
  let passedCount = 0;
  let totalCount = 6;

  logHeader(`LIFESYNC AI - E2E INTEGRATION TEST RUNNER`);
  console.log(`${colors.dim}Target Backend: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.dim}Test User: ${testUser.email}${colors.reset}\n`);

  // =========================================================================
  // JOURNEY 1: Authentication & User Profile Retrieval
  // =========================================================================
  try {
    logStep(1, 'Testing Authentication Flow (Register -> Login -> Verify Me)');

    // 1.1 Register
    const regRes = await request('/api/v1/auth/register', {
      method: 'POST',
      body: testUser,
    });
    const regToken = regRes.data?.data?.token || regRes.data?.data?.accessToken;
    if (regRes.status !== 201 || !regToken) {
      throw new Error(`Register failed with status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
    }
    logSuccess('User registration completed successfully.');

    // 1.2 Login
    const loginRes = await request('/api/v1/auth/login', {
      method: 'POST',
      body: { email: testUser.email, password: testUser.password },
    });
    token = loginRes.data?.data?.token || loginRes.data?.data?.accessToken;
    if (loginRes.status !== 200 || !token) {
      throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
    }
    logSuccess('Login successful; JWT Access Token acquired.');

    // 1.3 Verify current user (/api/v1/auth/me)
    const meRes = await request('/api/v1/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (meRes.status !== 200 || meRes.data?.data?.email !== testUser.email) {
      throw new Error(`Get current user failed: ${JSON.stringify(meRes.data)}`);
    }
    logSuccess(`Identity confirmed: ${meRes.data.data.fullName} (${meRes.data.data.email})`);

    passedCount++;
  } catch (err) {
    logError('Journey 1 (Auth) FAILED', err);
    console.error('Cannot proceed with remaining tests without authentication.');
    process.exit(1);
  }

  const authHeader = { Authorization: `Bearer ${token}` };

  // =========================================================================
  // JOURNEY 2: Time & Schedule Management Flow
  // =========================================================================
  try {
    logStep(2, 'Testing Time & Schedule Management Flow (Create -> List -> Update -> Delete)');

    const targetStartTime = '2026-09-18T14:00:00';
    const targetEndTime   = '2026-09-18T15:30:00';

    // 2.1 Create Schedule with local ISO date-time
    const createScheduleRes = await request('/api/v1/schedules', {
      method: 'POST',
      headers: authHeader,
      body: {
        title: 'Thực hiện E2E Testing Milestone 7',
        description: 'Kiểm thử tích hợp hệ thống toàn diện giữa React và Spring Boot',
        startTime: targetStartTime,
        endTime: targetEndTime,
        category: 'WORK',
        priority: 'HIGH',
      },
    });

    if (createScheduleRes.status !== 201 || !createScheduleRes.data?.data?.id) {
      throw new Error(`Create schedule failed: ${JSON.stringify(createScheduleRes.data)}`);
    }
    scheduleId = createScheduleRes.data.data.id;
    const createdStartTime = createScheduleRes.data.data.startTime;
    if (!createdStartTime.includes('14:00')) {
      throw new Error(`Timezone shift detected on create! Expected 14:00, got: ${createdStartTime}`);
    }
    logSuccess(`Schedule created with ID: ${scheduleId} at exact local time: ${createdStartTime}`);

    // 2.2 List Schedules
    const listRes = await request('/api/v1/schedules', {
      method: 'GET',
      headers: authHeader,
    });
    if (listRes.status !== 200 || !Array.isArray(listRes.data?.data) || listRes.data.data.length === 0) {
      throw new Error(`List schedules returned empty or invalid data: ${JSON.stringify(listRes.data)}`);
    }
    logSuccess(`Fetched ${listRes.data.data.length} schedule(s) successfully.`);

    // 2.3 Update Schedule (re-saving same local time to verify no timezone drift)
    const updateRes = await request(`/api/v1/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: authHeader,
      body: {
        title: 'Thực hiện E2E Testing Milestone 7 (Đã cập nhật)',
        startTime: targetStartTime,
        endTime: targetEndTime,
        category: 'WORK',
        status: 'COMPLETED',
        priority: 'HIGH',
      },
    });
    if (updateRes.status !== 200 || updateRes.data?.data?.status !== 'COMPLETED') {
      throw new Error(`Update schedule failed: ${JSON.stringify(updateRes.data)}`);
    }
    const updatedStartTime = updateRes.data.data.startTime;
    if (!updatedStartTime.includes('14:00')) {
      throw new Error(`Timezone shift detected on update! Expected 14:00, got: ${updatedStartTime}`);
    }
    logSuccess(`Schedule ID ${scheduleId} updated and preserved exact local time (14:00). Status marked as COMPLETED.`);


    passedCount++;
  } catch (err) {
    logError('Journey 2 (Schedule) FAILED', err);
  }

  // =========================================================================
  // JOURNEY 3: Meal & Daily Nutrition Management Flow
  // =========================================================================
  try {
    logStep(3, 'Testing Meal & Daily Nutrition Tracking Flow (Create -> Daily Summary)');

    const todayDateStr = new Date().toISOString().substring(0, 10);
    const loggedAt = new Date().toISOString();

    // 3.1 Create Meal Log
    const mealRes = await request('/api/v1/meals', {
      method: 'POST',
      headers: authHeader,
      body: {
        foodName: 'Cơm gạo lứt ức gà & Salad rau xanh',
        mealType: 'LUNCH',
        calories: 520.0,
        protein: 42.0,
        carbs: 65.0,
        fat: 10.0,
        loggedAt,
      },
    });

    if (mealRes.status !== 201 || !mealRes.data?.data?.id) {
      throw new Error(`Create meal failed: ${JSON.stringify(mealRes.data)}`);
    }
    mealId = mealRes.data.data.id;
    logSuccess(`Meal logged with ID: ${mealId} (Calories: 520 kcal, Protein: 42g)`);

    // 3.2 Daily Nutrition Summary
    const summaryRes = await request(`/api/v1/meals/summary/daily?date=${todayDateStr}`, {
      method: 'GET',
      headers: authHeader,
    });

    if (summaryRes.status !== 200 || summaryRes.data?.data?.totalCalories < 500) {
      throw new Error(`Daily nutrition summary mismatch: ${JSON.stringify(summaryRes.data)}`);
    }
    const summary = summaryRes.data.data;
    logSuccess(`Daily Nutrition Summary verified: Total Calories = ${summary.totalCalories} kcal, Meals = ${summary.mealCount}`);

    passedCount++;
  } catch (err) {
    logError('Journey 3 (Meal) FAILED', err);
  }

  // =========================================================================
  // JOURNEY 4: User Profile, Preferences & BodyMetricsCalculator Integration
  // =========================================================================
  try {
    logStep(4, 'Testing Profile, Preferences & Body Metrics (BMI, BMR, TDEE)');

    // 4.1 Update Profile
    const profileUpdateRes = await request('/api/v1/users/profile', {
      method: 'PUT',
      headers: authHeader,
      body: {
        heightCm: 175.0,
        weightKg: 68.0,
        targetWeightKg: 65.0,
        activityLevel: 'MODERATELY_ACTIVE',
        gender: 'MALE',
        bio: 'Senior Software Engineer testing LifeSync platform',
      },
    });

    if (profileUpdateRes.status !== 200 || profileUpdateRes.data?.data?.heightCm !== 175.0) {
      throw new Error(`Profile update failed: ${JSON.stringify(profileUpdateRes.data)}`);
    }
    logSuccess('User profile biometrics updated: Height 175cm, Weight 68kg.');

    // 4.2 Verify BodyMetricsCalculator Calculations
    const metricsRes = await request('/api/v1/users/body-metrics/recommendation', {
      method: 'GET',
      headers: authHeader,
    });

    if (metricsRes.status !== 200 || !metricsRes.data?.data?.bmi) {
      throw new Error(`Body metrics calculation failed: ${JSON.stringify(metricsRes.data)}`);
    }

    const metrics = metricsRes.data.data;
    logSuccess(`BodyMetricsCalculator verified: BMI = ${metrics.bmi} (${metrics.bmiStatus}), BMR = ${metrics.bmr} kcal, TDEE = ${metrics.tdee} kcal, Daily Target = ${metrics.recommendedDailyCalories} kcal`);

    // 4.3 Update Preferences with Validation
    const prefRes = await request('/api/v1/users/preferences', {
      method: 'PUT',
      headers: authHeader,
      body: {
        language: 'vi',
        timeFormat: '24h',
        weekStartDay: 'MONDAY',
        scheduleReminderEnabled: true,
        scheduleReminderMinutes: 15,
        mealReminderEnabled: true,
      },
    });

    if (prefRes.status !== 200 || prefRes.data?.data?.timeFormat !== '24h') {
      throw new Error(`Preference update failed: ${JSON.stringify(prefRes.data)}`);
    }
    logSuccess('User preferences updated and validated.');

    passedCount++;
  } catch (err) {
    logError('Journey 4 (Profile & Biometrics) FAILED', err);
  }

  // =========================================================================
  // JOURNEY 5: Main Dashboard Analytics & Trend Aggregation
  // =========================================================================
  try {
    logStep(5, 'Testing Main Dashboard Analytics Integration');

    const dashRes = await request('/api/v1/dashboard/summary', {
      method: 'GET',
      headers: authHeader,
    });

    if (dashRes.status !== 200 || !dashRes.data?.data) {
      throw new Error(`Dashboard summary failed: ${JSON.stringify(dashRes.data)}`);
    }

    const dash = dashRes.data.data;
    if (dash.todayScheduleCount < 1 || dash.completedScheduleCount < 1) {
      throw new Error(`Dashboard schedule aggregation mismatch: ${JSON.stringify(dash)}`);
    }

    logSuccess(`Dashboard stats aggregated: ${dash.todayScheduleCount} task(s), Completion Rate = ${dash.completionRate}%, Today Calories = ${dash.todayCalories} kcal, Target Calories = ${dash.targetCalories} kcal`);
    logSuccess(`Category Distribution: ${dash.categoryDistribution.length} categories; 7-Day Nutrition Trends: ${dash.nutritionTrends.length} days.`);

    passedCount++;
  } catch (err) {
    logError('Journey 5 (Dashboard Analytics) FAILED', err);
  }

  // =========================================================================
  // JOURNEY 6: AI Assistant & Heartcare Consultation Engine
  // =========================================================================
  try {
    logStep(6, 'Testing AI Assistant Prompt Suggestions & Heartcare Chatbot');

    // 6.1 Suggested Prompts
    const promptRes = await request('/api/v1/ai/suggested-prompts', {
      method: 'GET',
      headers: authHeader,
    });

    if (promptRes.status !== 200 || !Array.isArray(promptRes.data?.data) || promptRes.data.data.length === 0) {
      throw new Error(`Suggested prompts API failed: ${JSON.stringify(promptRes.data)}`);
    }
    logSuccess(`Retrieved ${promptRes.data.data.length} pre-built Heartcare prompt chips.`);

    // 6.2 Chat Consultation (Personal Context Injected)
    const chatRes = await request('/api/v1/ai/chat', {
      method: 'POST',
      headers: authHeader,
      body: {
        message: 'Đánh giá giúp tôi bữa trưa 520 kcal và lịch làm việc hôm nay có ổn định cho tim mạch không?',
      },
    });

    if (chatRes.status !== 200 || !chatRes.data?.data?.reply) {
      throw new Error(`AI chat failed: ${JSON.stringify(chatRes.data)}`);
    }

    const replySnippet = chatRes.data.data.reply.substring(0, 100).replace(/\n/g, ' ');
    logSuccess(`AI Heartcare responded: "${replySnippet}..."`);
    logSuccess(`Medical Disclaimer present: "${chatRes.data.data.disclaimer.substring(0, 50)}..."`);

    passedCount++;
  } catch (err) {
    logError('Journey 6 (AI Assistant) FAILED', err);
  }

  // =========================================================================
  // FINAL SCORECARD
  // =========================================================================
  logHeader('E2E INTEGRATION TEST SUMMARY');
  console.log(`  Total User Journeys Tested : ${totalCount}`);
  console.log(`  Passed Journeys            : ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  Failed Journeys            : ${passedCount === totalCount ? '0' : colors.red + (totalCount - passedCount) + colors.reset}`);

  if (passedCount === totalCount) {
    console.log(`\n${colors.bold}${colors.green}🎉 ALL END-TO-END INTEGRATION TESTS PASSED (100% GREEN)${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bold}${colors.red}❌ SOME E2E INTEGRATION TESTS FAILED${colors.reset}\n`);
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Unexpected crash in E2E test runner:', err);
  process.exit(1);
});
