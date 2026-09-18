import test from 'node:test';
import assert from 'node:assert/strict';
import { parseApiError, getFieldError } from '../src/utils/errorUtils.ts';


test('parseApiError detects Network Refused error', () => {
  const err = {
    code: 'ERR_NETWORK',
    message: 'Network Error',
    isAxiosError: true,
  };

  const parsed = parseApiError(err);
  assert.equal(parsed.isNetworkError, true);
  assert.equal(parsed.status, 0);
  assert.match(parsed.message, /kết nối đến máy chủ/);
});

test('parseApiError detects 503 Service Unavailable', () => {
  const err = {
    response: {
      status: 503,
      data: 'Service Unavailable',
    },
  };

  const parsed = parseApiError(err);
  assert.equal(parsed.isNetworkError, true);
  assert.equal(parsed.status, 503);
  assert.match(parsed.message, /bảo trì hoặc quá tải/);
});

test('parseApiError extracts Spring Boot Bean Validation errors', () => {
  const springBootValidationError = {
    response: {
      status: 400,
      data: {
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        data: {
          title: 'Tiêu đề không được để trống',
          startTime: 'Thời gian bắt đầu không được để trống',
        },
      },
    },
  };

  const parsed = parseApiError(springBootValidationError);
  assert.equal(parsed.isNetworkError, false);
  assert.equal(parsed.status, 400);
  assert.equal(parsed.message, 'Dữ liệu đầu vào không hợp lệ');
  assert.deepEqual(parsed.fieldErrors, {
    title: 'Tiêu đề không được để trống',
    startTime: 'Thời gian bắt đầu không được để trống',
  });

  assert.equal(getFieldError(parsed.fieldErrors, 'title'), 'Tiêu đề không được để trống');
  assert.equal(getFieldError(parsed.fieldErrors, 'startTime'), 'Thời gian bắt đầu không được để trống');
  assert.equal(getFieldError(parsed.fieldErrors, 'category'), null);
});

test('parseApiError handles business exception with message', () => {
  const businessError = {
    response: {
      status: 404,
      data: {
        success: false,
        message: 'Không tìm thấy lịch trình!',
      },
    },
  };

  const parsed = parseApiError(businessError);
  assert.equal(parsed.isNetworkError, false);
  assert.equal(parsed.status, 404);
  assert.equal(parsed.message, 'Không tìm thấy lịch trình!');
});
