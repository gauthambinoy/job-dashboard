# Animation Implementation Examples

This guide provides practical code examples for implementing various animations across the LazyScaper UI.

## Quick Start Examples

### 1. Basic Page Entry Animation

```tsx
// app/page.tsx or any page component
export default function MyPage() {
  return (
    <div className="animate-page-enter">
      <h1>Welcome</h1>
      <p>This page fades in and scales up smoothly</p>
    </div>
  );
}
```

### 2. Staggered List Items

```tsx
// List with animated items
export default function JobList({ jobs }) {
  return (
    <ul className="space-y-4">
      {jobs.map((job, index) => (
        <li
          key={job.id}
          className="animate-stagger-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <JobCard job={job} />
        </li>
      ))}
    </ul>
  );
}
```

### 3. Hover Card Animation

```tsx
// Card with hover lift effect
<div className="animate-card-lift group relative bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300">
  <h3 className="group-hover:text-primary-600 transition-colors">Job Title</h3>
  <p className="text-gray-600">Job Description</p>
</div>
```

### 4. Loading Spinner

```tsx
// Loading indicator
<div className="flex items-center gap-2">
  <div className="animate-spinner w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full" />
  <span>Loading...</span>
</div>
```

### 5. Button with Ripple Effect

```tsx
'use client';

import { useRef } from 'react';

export default function RippleButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    
    ripple.className = 'animate-ripple absolute rounded-full bg-white/60';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.left = `${e.clientX - rect.left - 5}px`;
    ripple.style.top = `${e.clientY - rect.top - 5}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="relative overflow-hidden px-6 py-2 bg-primary-600 text-white rounded-lg"
    >
      Click me
    </button>
  );
}
```

### 6. Toast Notification

```tsx
'use client';

import { useState } from 'react';

export default function ToastNotification() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button onClick={() => setVisible(true)}>Show Notification</button>
      
      {visible && (
        <div className="fixed bottom-6 right-6 animate-toast-enter bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg">
          Success! Your action completed.
          <button onClick={() => setVisible(false)}>×</button>
        </div>
      )}
    </>
  );
}
```

### 7. Animated Counter

```tsx
'use client';

import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
}

export default function AnimatedCounter({ target, duration = 1000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 50);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 50);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <div className="animate-counter-number text-3xl font-bold">{count}</div>;
}
```

### 8. Animated Gradient Text

```tsx
<h1 className="animate-gradient-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent bg-size-200">
  Premium Features
</h1>

<style>{`
  .bg-size-200 {
    background-size: 200% 200%;
  }
`}</style>
```

### 9. Scroll-triggered Animation

```tsx
'use client';

import AnimationWrapper from '@/app/components/AnimationWrapper';

export default function ScrollAnimationExample() {
  return (
    <>
      <AnimationWrapper type="slideUp" triggerOnScroll={true} delay={0} duration={600}>
        <div className="bg-white p-8 rounded-lg">
          <h2>This animates when scrolled into view</h2>
        </div>
      </AnimationWrapper>

      <div style={{ height: '300px' }}>Spacer</div>

      <AnimationWrapper 
        type="slideUp" 
        triggerOnScroll={true} 
        staggerIndex={0}
        staggerDelay={100}
      >
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-primary-50 p-4 rounded">Item {item}</div>
          ))}
        </div>
      </AnimationWrapper>
    </>
  );
}
```

### 10. Form Input with Focus Animation

```tsx
<div className="space-y-4">
  <div className="relative">
    <input
      type="text"
      placeholder="Name"
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-600 animate-input-focus-glow focus:outline-none transition-colors"
    />
  </div>

  <div className="relative">
    <input
      type="email"
      placeholder="Email"
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-600 animate-input-focus-glow focus:outline-none transition-colors"
    />
  </div>
</div>
```

### 11. Modal with Animation

```tsx
'use client';

import { useState } from 'react';

export default function Modal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-primary-600 text-white rounded">
        Open Modal
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 animate-backdrop-fade"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="animate-modal-scale-in bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Modal Title</h2>
              <p className="text-gray-600 mb-6">Modal content goes here</p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
```

### 12. Dropdown with Animation

```tsx
'use client';

import { useState } from 'react';

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
      >
        Options ▼
      </button>

      {isOpen && (
        <div className="animate-dropdown-slide absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg overflow-hidden z-50">
          {['Option 1', 'Option 2', 'Option 3'].map((option) => (
            <button
              key={option}
              onClick={() => {
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 13. Badge with Remove Animation

```tsx
'use client';

import { useState } from 'react';

interface SkillBadgeProps {
  skill: string;
  onRemove: () => void;
}

export default function SkillBadge({ skill, onRemove }: SkillBadgeProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(onRemove, 300);
  };

  return (
    <span
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        bg-blue-100 text-blue-700 text-sm font-semibold
        ${isRemoving ? 'animate-badge-remove' : 'animate-badge-appear'}
      `}
    >
      {skill}
      <button
        onClick={handleRemove}
        className="hover:bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center"
      >
        ×
      </button>
    </span>
  );
}
```

### 14. Progress Bar with Animation

```tsx
'use client';

interface ProgressBarProps {
  progress: number; // 0-100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 animate-progress-fill transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Progress</span>
        <span className="text-sm font-semibold animate-counter-number">{progress}%</span>
      </div>
    </div>
  );
}
```

### 15. Chart Bar Animation

```tsx
'use client';

interface ChartBarProps {
  label: string;
  value: number;
  maxValue: number;
  index: number;
}

export default function ChartBar({ label, value, maxValue, index }: ChartBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold animate-counter-number">{value}</span>
      </div>
      <div className="h-8 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 animate-chart-bar"
          style={{
            width: `${percentage}%`,
            animationDelay: `${index * 100}ms`,
          }}
        />
      </div>
    </div>
  );
}
```

### 16. Icon Animation on Hover

```tsx
import { ChevronRight } from 'lucide-react';

export default function LinkWithIcon() {
  return (
    <a href="#" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
      Learn More
      <ChevronRight className="w-4 h-4 animate-icon-rotate hover:animate-icon-rotate" />
    </a>
  );
}
```

### 17. Status Pulse Animation

```tsx
export default function StatusIndicator({ status }: { status: 'online' | 'offline' }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full ${
          status === 'online'
            ? 'bg-green-500 animate-pulse-badge'
            : 'bg-gray-400'
        }`}
      />
      <span className="text-sm capitalize">{status}</span>
    </div>
  );
}
```

### 18. Animated Stat Card

```tsx
import AnimatedCounter from './AnimatedCounter';

interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, unit = '', icon }: StatCardProps) {
  return (
    <div className="animate-fade-in-scale p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {icon && (
        <div className="text-2xl mb-2 animate-icon-scale">{icon}</div>
      )}
      <p className="text-gray-600 text-sm">{title}</p>
      <div className="flex items-baseline gap-1 mt-2">
        <AnimatedCounter target={value} duration={1000} />
        {unit && <span className="text-gray-600 text-sm">{unit}</span>}
      </div>
    </div>
  );
}
```

### 19. Checkbox with Animation

```tsx
'use client';

import { useState } from 'react';

export default function AnimatedCheckbox({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
            checked
              ? 'bg-primary-600 border-primary-600 animate-checkbox-checked'
              : 'border-gray-300'
          }`}
        >
          {checked && (
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              />
            </svg>
          )}
        </div>
      </div>
      <span>{label}</span>
    </label>
  );
}
```

### 20. Floating Action Button

```tsx
import { Plus } from 'lucide-react';

export default function FloatingActionButton() {
  return (
    <button
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:shadow-xl animate-float-up hover:scale-110 transition-all duration-300 flex items-center justify-center"
      aria-label="Add new"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
```

## Animation Combinations

### Combining Multiple Animations

```tsx
// Fade in + Lift on hover
<div className="animate-fade-in-scale hover:animate-card-lift">
  Content
</div>

// Stagger + Glow
<div className="animate-stagger-fade-in animate-pulse-badge">
  Important Item
</div>

// Counter + Gradient
<div className="animate-counter-number animate-gradient-text">
  85%
</div>
```

### Sequential Animations

```tsx
// First fade in, then respond to hover
<div
  className="animate-fade-in-scale hover:shadow-lg transition-shadow duration-300"
  style={{ animationDuration: '600ms' }}
>
  Content animates in on load, then responds to hover
</div>
```

## Performance Tips

1. **Limit simultaneous animations:**
```tsx
{isVisible && (
  <div className="animate-fade-in-scale">Only animate when needed</div>
)}
```

2. **Use hardware acceleration:**
```css
.animate-expensive {
  will-change: transform;
  transform: translateZ(0);
}
```

3. **Stagger heavy animations:**
```tsx
{items.map((item, i) => (
  <div
    key={i}
    className="animate-expensive"
    style={{ animationDelay: `${i * 50}ms` }}
  >
    {item}
  </div>
))}
```

## Testing Animations

### Unit Testing with Vitest
```tsx
import { render } from '@testing-library/react';

test('animation class is applied', () => {
  const { container } = render(
    <div className="animate-fade-in-scale">Test</div>
  );
  
  const element = container.querySelector('.animate-fade-in-scale');
  expect(element).toHaveClass('animate-fade-in-scale');
});
```

### E2E Testing with Cypress
```javascript
cy.get('.animate-fade-in-scale').should('be.visible');
cy.get('button').click();
cy.get('.animate-modal-scale-in').should('exist');
```
