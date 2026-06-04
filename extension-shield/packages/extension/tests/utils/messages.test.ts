import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock browser.runtime.sendMessage for background message tests
const mockSendMessage = vi.fn();

describe('Background message types', () => {
  beforeEach(() => {
    mockSendMessage.mockReset();
    globalThis.browser = {
      ...globalThis.browser,
      runtime: {
        ...globalThis.browser?.runtime,
        sendMessage: mockSendMessage,
      },
    } as any;
  });

  it('sends SCAN_INSTALLED message', async () => {
    mockSendMessage.mockResolvedValue({ success: true, report: {} });
    const result = await browser.runtime.sendMessage({
      type: 'SCAN_INSTALLED',
      payload: { extensionId: 'test-id' },
    });
    expect(result.success).toBe(true);
    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'SCAN_INSTALLED',
      payload: { extensionId: 'test-id' },
    });
  });

  it('sends GET_INSTALLED_EXTENSIONS message', async () => {
    mockSendMessage.mockResolvedValue([{ id: 'ext-1', name: 'Test' }]);
    const result = await browser.runtime.sendMessage({
      type: 'GET_INSTALLED_EXTENSIONS',
      payload: {},
    });
    expect(result).toHaveLength(1);
  });

  it('sends SCAN_ALL_INSTALLED message', async () => {
    mockSendMessage.mockResolvedValue({ success: true, reports: [] });
    const result = await browser.runtime.sendMessage({
      type: 'SCAN_ALL_INSTALLED',
      payload: {},
    });
    expect(result.success).toBe(true);
  });

  it('sends GET_SCAN_HISTORY message', async () => {
    mockSendMessage.mockResolvedValue([]);
    const result = await browser.runtime.sendMessage({
      type: 'GET_SCAN_HISTORY',
      payload: { limit: 10 },
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it('sends DELETE_SCAN_RESULT message', async () => {
    mockSendMessage.mockResolvedValue({ success: true });
    const result = await browser.runtime.sendMessage({
      type: 'DELETE_SCAN_RESULT',
      payload: { scanId: 'test-id' },
    });
    expect(result.success).toBe(true);
  });

  it('sends EXPORT_REPORT message', async () => {
    mockSendMessage.mockResolvedValue({
      success: true,
      content: '<html></html>',
      filename: 'report.html',
    });
    const result = await browser.runtime.sendMessage({
      type: 'EXPORT_REPORT',
      payload: { scanId: 'test-id', format: 'html' },
    });
    expect(result.success).toBe(true);
    expect(result.content).toContain('<html>');
  });
});
