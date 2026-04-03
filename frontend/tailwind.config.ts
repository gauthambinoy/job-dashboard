import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          600: '#3B82F6',
          700: '#1e40af',
        },
        success: {
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          500: '#F59E0B',
          600: '#d97706',
        },
        danger: {
          500: '#EF4444',
          600: '#dc2626',
        },
        neutral: {
          400: '#9ca3af',
          500: '#6B7280',
          600: '#4b5563',
        },
        dark: {
          900: '#1F2937',
          950: '#030712',
        },
        light: {
          50: '#F9FAFB',
          100: '#f3f4f6',
        },
        accent: {
          500: '#8B5CF6',
          600: '#7c3aed',
        },
      },
      fontSize: {
        headline: ['32px', { fontWeight: '700', lineHeight: '1.2' }],
        subhead: ['24px', { fontWeight: '600', lineHeight: '1.3' }],
        body: ['16px', { fontWeight: '400', lineHeight: '1.5' }],
        small: ['14px', { fontWeight: '400', lineHeight: '1.4' }],
        label: ['12px', { fontWeight: '500', lineHeight: '1.3' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
      },
      borderRadius: {
        button: '8px',
        card: '12px',
        input: '8px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.1)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.15)',
        button: '0 2px 4px rgba(0,0,0,0.1)',
        'button-hover': '0 4px 12px rgba(0,0,0,0.15)',
      },
      transitionDuration: {
        fast: '200ms',
        normal: '300ms',
      },
      keyframes: {
        // Page transitions
        fadeInScale: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        pageEnter: {
          'from': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          'to': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pageExit: {
          'from': { opacity: '1', transform: 'scale(1) translateY(0)' },
          'to': { opacity: '0', transform: 'scale(0.98) translateY(-10px)' },
        },
        // Stagger animation
        staggerFadeIn: {
          'from': { opacity: '0', transform: 'translateY(15px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        // Button animations
        buttonPress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
        buttonHoverLift: {
          'from': { transform: 'translateY(0)' },
          'to': { transform: 'translateY(-2px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        // Input animations
        inputFocusGlow: {
          '0%': { 'box-shadow': '0 0 0 0 rgba(59, 130, 246, 0.3)' },
          '100%': { 'box-shadow': '0 0 0 8px rgba(59, 130, 246, 0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        // Card animations
        cardLift: {
          '0%': { transform: 'translateY(0)', 'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)' },
          '100%': { transform: 'translateY(-6px)', 'box-shadow': '0 12px 32px rgba(0, 0, 0, 0.2)' },
        },
        // Scroll effects
        scrollFadeIn: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        parallaxFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        // Modal animations
        backdropFade: {
          'from': { 'background-color': 'rgba(0, 0, 0, 0)' },
          'to': { 'background-color': 'rgba(0, 0, 0, 0.5)' },
        },
        modalScaleIn: {
          'from': { opacity: '0', transform: 'scale(0.8) translateY(-50px)' },
          'to': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        dropdownSlide: {
          'from': { opacity: '0', transform: 'scaleY(0.9) translateY(-10px)' },
          'to': { opacity: '1', transform: 'scaleY(1) translateY(0)' },
        },
        // Loading
        spinnerRotate: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        // Status badges
        pulseBadge: {
          '0%, 100%': { 'box-shadow': '0 0 0 0 rgba(59, 130, 246, 0.7)' },
          '50%': { 'box-shadow': '0 0 0 8px rgba(59, 130, 246, 0)' },
        },
        floatUp: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        // Progress
        progressFill: {
          'from': { width: '0' },
          'to': { width: 'var(--progress-width, 100%)' },
        },
        // Gradient text
        gradientText: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        // Icon animations
        iconRotate: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(180deg)' },
        },
        iconScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
        // Notifications
        toastSlideInRight: {
          'from': { opacity: '0', transform: 'translateX(400px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        toastSlideOutRight: {
          'from': { opacity: '1', transform: 'translateX(0)' },
          'to': { opacity: '0', transform: 'translateX(400px)' },
        },
        // Badge animations
        badgeScaleUp: {
          'from': { transform: 'scale(0)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        badgeScaleDown: {
          'from': { transform: 'scale(1)', opacity: '1' },
          'to': { transform: 'scale(0)', opacity: '0' },
        },
        badgeGlow: {
          'from': { 'box-shadow': '0 0 0 0 rgba(59, 130, 246, 0.5)' },
          'to': { 'box-shadow': '0 0 12px 4px rgba(59, 130, 246, 0)' },
        },
        // Form elements
        toggleSlide: {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(24px)' },
        },
        checkboxCheck: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        radioSelect: {
          'from': { transform: 'scale(0.6)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        // Smooth fade
        fadeInSmooth: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        // Chart animations
        chartBarGrow: {
          'from': { height: '0', opacity: '0' },
          'to': { height: '100%', opacity: '1' },
        },
        chartLineDraw: {
          'from': { 'stroke-dasharray': '1000', 'stroke-dashoffset': '1000', opacity: '0' },
          'to': { 'stroke-dasharray': '1000', 'stroke-dashoffset': '0', opacity: '1' },
        },
        // Tooltip
        tooltipFadeIn: {
          'from': { opacity: '0', transform: 'translateY(-5px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // Page transitions
        'page-enter': 'pageEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'page-exit': 'pageExit 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-scale': 'fadeInScale 0.6s ease-out',
        'stagger-fade-in': 'staggerFadeIn 0.5s ease-out',
        // Button
        'btn-press': 'buttonPress 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'btn-hover-lift': 'buttonHoverLift 0.3s ease-out',
        'ripple': 'ripple 0.6s ease-out',
        // Input
        'input-focus-glow': 'inputFocusGlow 0.5s ease-out',
        'input-shake': 'shake 0.4s ease-in-out',
        // Card
        'card-lift': 'cardLift 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        // Scroll
        'scroll-fade-in': 'scrollFadeIn 0.6s ease-out',
        'parallax-float': 'parallaxFloat 6s ease-in-out infinite',
        // Modal
        'backdrop-fade': 'backdropFade 0.3s ease-out',
        'modal-scale-in': 'modalScaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'dropdown-slide': 'dropdownSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        // Loading
        'spinner': 'spinnerRotate 1s linear infinite',
        // Status
        'pulse-badge': 'pulseBadge 2s ease-in-out infinite',
        'float-up': 'floatUp 3s ease-in-out infinite',
        // Progress
        'progress-fill': 'progressFill 1s ease-out',
        // Gradient
        'gradient-text': 'gradientText 3s ease infinite',
        // Icon
        'icon-rotate': 'iconRotate 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'icon-scale': 'iconScale 0.4s ease',
        // Notifications
        'toast-enter': 'toastSlideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'toast-exit': 'toastSlideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        // Badge
        'badge-appear': 'badgeScaleUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'badge-remove': 'badgeScaleDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'badge-glow': 'badgeGlow 2s ease-in-out infinite',
        // Form
        'toggle-active': 'toggleSlide 0.3s ease',
        'checkbox-checked': 'checkboxCheck 0.3s ease',
        'radio-selected': 'radioSelect 0.3s ease',
        // Fade
        'fade-in-smooth': 'fadeInSmooth 0.4s ease-out',
        // Chart
        'chart-bar': 'chartBarGrow 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'chart-line': 'chartLineDraw 1s cubic-bezier(0.4, 0, 0.2, 1)',
        // Tooltip
        'tooltip-enter': 'tooltipFadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
