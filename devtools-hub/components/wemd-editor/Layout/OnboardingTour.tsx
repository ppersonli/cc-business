'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  highlight?: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: '欢迎使用 WeMD 编辑器',
    description: '一个专为微信公众号打造的 Markdown 编辑器。左侧编写 Markdown，右侧实时预览效果。',
    icon: '👋',
  },
  {
    title: '丰富的工具栏',
    description: '使用工具栏快速插入加粗、斜体、标题、代码块、表格等常用 Markdown 语法。也支持快捷键 Ctrl+B/I/K。',
    icon: '🛠️',
  },
  {
    title: '13+ 精美主题',
    description: '点击「主题管理」选择 13+ 精心设计的主题风格，一键切换。Pro 用户还可自定义 CSS 和可视化设计。',
    icon: '🎨',
  },
  {
    title: 'AI 写作助手 (Pro)',
    description: 'Pro 用户可使用 AI 润色、扩写、缩写、翻译、续写功能，每天 50 次调用。免费用户每天 3 次体验。',
    icon: '✨',
  },
  {
    title: '一键复制到微信',
    description: '编辑完成后，点击「复制到公众号」按钮，带样式的 HTML 会自动复制到剪贴板，直接粘贴到微信编辑器即可。',
    icon: '📋',
  },
];

const ONBOARDING_KEY = 'wemd-onboarding-done';

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if onboarding was already completed
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (done) {
      onComplete();
      return;
    }
    // Small delay for UI to settle
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  }, [currentStep]);

  const handleFinish = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
    setTimeout(onComplete, 200);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleSkip}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          animation: 'onboardingSlideIn 0.3s ease-out',
        }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-700">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <span className="text-5xl mb-4 block">{step.icon}</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {step.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep
                  ? 'bg-emerald-500'
                  : i < currentStep
                    ? 'bg-emerald-300'
                    : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-8 pb-6">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            跳过引导
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {currentStep + 1} / {STEPS.length}
            </span>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isLast ? '开始使用' : '下一步'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes onboardingSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
