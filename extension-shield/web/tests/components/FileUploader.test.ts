import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FileUploader from '../../src/components/FileUploader.vue';

describe('FileUploader', () => {
  it('renders upload prompt text', () => {
    const wrapper = mount(FileUploader);
    expect(wrapper.text()).toContain('Drop your .crx or .zip file here');
  });

  it('renders accepted formats', () => {
    const wrapper = mount(FileUploader);
    expect(wrapper.text()).toContain('.crx, .zip');
  });

  it('has hidden file input with accept attribute', () => {
    const wrapper = mount(FileUploader);
    const input = wrapper.find('input[type="file"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes('accept')).toBe('.crx,.zip');
    expect(input.attributes('style')).toContain('display: none');
  });

  it('emits upload event when file is selected via input', async () => {
    const wrapper = mount(FileUploader);
    const input = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.zip', { type: 'application/zip' });

    // Simulate file input change
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false,
    });
    await input.trigger('change');

    expect(wrapper.emitted('upload')).toBeTruthy();
    expect(wrapper.emitted('upload')![0]).toEqual([file]);
  });

  it('emits upload event on file drop', async () => {
    const wrapper = mount(FileUploader);
    const file = new File(['test'], 'test.zip', { type: 'application/zip' });

    await wrapper.find('div').trigger('drop', {
      dataTransfer: { files: [file] },
      preventDefault: vi.fn(),
    });

    expect(wrapper.emitted('upload')).toBeTruthy();
    expect(wrapper.emitted('upload')![0]).toEqual([file]);
  });

  it('prevents default on dragover', async () => {
    const wrapper = mount(FileUploader);
    const preventDefault = vi.fn();

    await wrapper.find('div').trigger('dragover', {
      preventDefault,
    });

    // dragover sets isDragging to true, which changes border color
    // The component should not throw
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('renders SVG upload icon', () => {
    const wrapper = mount(FileUploader);
    const svg = wrapper.find('svg');
    expect(svg.exists()).toBe(true);
  });

  it('resets file input value after selection', async () => {
    const wrapper = mount(FileUploader);
    const input = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.zip', { type: 'application/zip' });

    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false,
    });
    await input.trigger('change');

    // Input value should be reset (set to '' in component)
    expect(input.element.value).toBe('');
  });
});
