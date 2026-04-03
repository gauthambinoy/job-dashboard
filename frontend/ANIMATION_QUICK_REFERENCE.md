# Animation Quick Reference Card

## Page & Component Animations

### Page Transitions
```tsx
animate-page-enter       // 400ms fade in + scale
animate-fade-in-scale    // 600ms fade in + scale 0.95→1
animate-stagger-fade-in  // 500ms staggered item entrance
```

### Loading & Waiting
```tsx
animate-spinner          // 1s continuous rotation
animate-pulse-badge      // 2s subtle pulsing
animate-pulse-glow       // 2s glow pulse (all variations)
```

### Button & Interactive
```tsx
animate-btn-press        // Click feedback scale pulse
animate-btn-hover-lift   // Hover lift 2px up
animate-ripple           // Material ripple effect
animate-icon-rotate      // 180° icon rotation
animate-icon-scale       // Icon scale pulse
```

### Input & Form
```tsx
animate-input-focus-glow // Focus state glow expansion
animate-input-shake      // Error state horizontal shake
animate-checkbox-checked // Checkbox check animation
animate-radio-selected   // Radio selection
animate-toggle-active    // Toggle switch slide
```

### Cards & Containers
```tsx
animate-card-lift        // Hover lift 4px + shadow
animate-scroll-fade-in   // Scroll entrance fade in
animate-parallax-float   // 6s floating motion
```

### Modals & Dropdowns
```tsx
animate-backdrop-fade    // Backdrop fade in 300ms
animate-modal-scale-in   // Modal open 0.8→1 scale
animate-dropdown-slide   // Dropdown expand/collapse
```

### Text & Links
```tsx
animate-gradient-text    // Shifting gradient colors
animate-underline-hover  // Expanding underline
animate-counter-number   // Number entry animation
animate-fade-in-smooth   // Smooth opacity fade
```

### Status & Notifications
```tsx
animate-badge-appear     // Badge scale up 0→1
animate-badge-remove     // Badge scale down 1→0
animate-badge-glow       // Badge glow pulse
animate-toast-enter      // Toast slide in from right
animate-toast-exit       // Toast slide out right
```

### Charts & Data
```tsx
animate-chart-bar        // Bar grow height 0→100%
animate-chart-line       // Line stroke draw animation
animate-progress-fill    // Progress bar width animation
```

## Common Usage Patterns

### Entry Animations
```tsx
// Simple fade in
<div className="animate-fade-in-smooth">Content</div>

// Fade in with scale
<div className="animate-fade-in-scale">Content</div>

// Staggered list
<div className="animate-stagger-fade-in" style={{ animationDelay: '100ms' }}>
  Item
</div>
```

### Hover Effects
```tsx
// Card lift on hover
<div className="group hover:animate-card-lift">Card</div>

// Button lift on hover
<button className="hover:animate-btn-hover-lift">Button</button>

// Icon rotate on hover
<span className="hover:animate-icon-rotate">Icon</span>
```

### Loading States
```tsx
// Spinner
<div className="animate-spinner w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />

// Pulsing badge
<span className="animate-pulse-badge bg-yellow-500 rounded-full px-3 py-1">Loading</span>
```

### Status Indicators
```tsx
// Active status
<span className="animate-pulse-badge bg-green-500" />

// Important badge
<span className="animate-badge-glow bg-blue-500" />
```

### Form Validation
```tsx
// Focus glow
<input className="focus:animate-input-focus-glow" />

// Error shake
<input className="animate-input-shake border-red-500" />
```

## Timing Quick Guide

| Duration | Use Case |
|----------|----------|
| 150-200ms | Button clicks, micro-interactions |
| 200-300ms | Hover effects, input focus |
| 300-400ms | Page transitions, modals |
| 400-600ms | Component entrance, scroll |
| 1s | Loading spinners, continuous |
| 2-3s | Background effects, pulsing |
| 6s | Floating/parallax effects |

## Duration Modifiers

```tsx
// Custom duration
<div className="animate-fade-in-scale" style={{ animationDuration: '800ms' }}>
  Content
</div>

// Custom delay
<div className="animate-stagger-fade-in" style={{ animationDelay: '200ms' }}>
  Content
</div>
```

## Easing Functions

```css
ease-out         /* Quick, responsive feedback */
ease-in-out      /* Smooth, natural motion */
cubic-bezier()   /* Custom curves */
linear           /* Spinners, rotations */
```

## Component Animation Matrix

| Component | Load | Hover | Click | Focus |
|-----------|------|-------|-------|-------|
| Button | fade-in | lift | press | - |
| Card | fade-in | lift | - | - |
| Input | fade-in | - | - | glow |
| Badge | appear | glow | remove | - |
| Link | fade-in | underline | - | - |
| Modal | scale-in | - | - | - |
| Toast | slide-in | - | - | slide-out |
| Chart | chart-* | - | - | - |

## Performance Tips

```tsx
// Good: Limits simultaneous animations
{isVisible && <div className="animate-fade-in-scale">Content</div>}

// Good: Uses transform (GPU accelerated)
<div className="hover:scale-110 transition-transform">Scale</div>

// Good: Staggered expensive animations
{items.map((item, i) => (
  <div
    key={i}
    className="animate-expensive"
    style={{ animationDelay: `${i * 50}ms` }}
  />
))}

// Avoid: Too many simultaneous animations
{items.map(item => <div className="animate-expensive">{item}</div>)}

// Avoid: Animating layout properties
<div className="animate-width-change">Avoid!</div>
```

## Accessibility

```tsx
// Respect user motion preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

// Use animations for enhancement, not info
// Provide fallback for important content
```

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Animations | ✓ | ✓ | ✓ | ✓ |
| Transforms | ✓ | ✓ | ✓ | ✓ |
| GPU Acceleration | ✓ | ✓ | ✓ | ✓ |

## Creating New Animations

1. **Define in globals.css:**
```css
@keyframes myNewAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

2. **Add to tailwind.config.ts:**
```ts
keyframes: {
  myNewAnimation: { /* ... */ }
},
animation: {
  'my-new': 'myNewAnimation 0.3s ease-out'
}
```

3. **Use in component:**
```tsx
<div className="animate-my-new">Content</div>
```

## Debugging

```tsx
// Check applied classes
<div className="animate-fade-in-scale">
  {/* Open DevTools → Elements → check Computed styles */}
</div>

// Performance check
// DevTools → Performance → Record → Look for 60fps
// Avoid red bars (dropped frames)

// Check animation timing
// DevTools → Animations panel → Pause/replay animations
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Animation not playing | Check class name spelling, verify CSS loaded |
| Jank/stuttering | Use transform/opacity only, add will-change |
| Animation too slow | Reduce duration or check custom timing |
| Jumpy animation | Add backface-visibility: hidden |
| Animation blocking interaction | Use pointer-events: none during animation |

## Useful Commands

```bash
# Check compilation
npm run build

# Check file sizes
npm run build -- --analyze

# Dev server with hot reload
npm run dev

# Performance profiling
npm run analyze
```

## Reference Files

- **ANIMATIONS_GUIDE.md** - Comprehensive reference
- **ANIMATION_EXAMPLES.md** - 20+ code examples
- **AnimationWrapper.tsx** - Reusable component
- **globals.css** - All animation definitions
- **tailwind.config.ts** - Tailwind animation config

## Quick Links

- MDN CSS Animations: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations
- Tailwind Animations: https://tailwindcss.com/docs/animation
- Animation Performance: https://web.dev/animations-guide/

---

**Pro Tips:**
1. Always test animations on actual devices
2. Use DevTools Performance tab to verify 60fps
3. Combine animations sparingly for complexity
4. Keep animations purposeful and brief
5. Test with prefers-reduced-motion enabled
6. Profile before and after adding animations
7. Document any custom timing in comments
8. Use consistent easing curves throughout
