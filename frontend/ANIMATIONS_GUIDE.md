# Premium Animations & Micro-Interactions Guide

This document provides a comprehensive guide to the premium animations and micro-interactions implemented throughout the LazyScaper frontend UI.

## Overview

The animation system is built on:
- **CSS Keyframes** - Defined in `/app/globals.css`
- **Tailwind Utilities** - Extended animations in `tailwind.config.ts`
- **React Components** - Reusable animation wrappers in `/app/components`

All animations respect the `prefers-reduced-motion` media query for accessibility.

## Animation System Architecture

### 1. Core Animations (globals.css)

#### Page Transitions
- **Duration**: 300-400ms
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`

| Animation | Purpose | Duration |
|-----------|---------|----------|
| `fadeInScale` | Page/component load | 600ms |
| `pageEnter` | Page navigation in | 400ms |
| `pageExit` | Page navigation out | 300ms |
| `staggerFadeIn` | Staggered list items | 500ms |

**Usage:**
```html
<div class="animate-page-enter">Content</div>
<div class="animate-fade-in-scale">Component</div>
```

#### Button Interactions
- **Hover**: Lift effect with shadow increase
- **Click**: Scale pulse animation (0.96 → 1)
- **Active**: Reduced scale feedback
- **Duration**: 200-300ms

| Animation | Purpose | Effect |
|-----------|---------|--------|
| `buttonPress` | Click feedback | Scale pulse |
| `buttonHoverLift` | Hover state | translateY(-2px) |
| `ripple` | Material design effect | Expanding circle |

**Usage:**
```html
<button class="animate-btn-press hover:animate-btn-hover-lift">Click me</button>
```

#### Input Field Animations
- **Focus**: Smooth glow expansion
- **Error**: Horizontal shake animation
- **Success**: Green glow pulse
- **Duration**: 200-300ms

| Animation | Purpose | Trigger |
|-----------|---------|---------|
| `inputFocusGlow` | Focus indicator | `:focus` |
| `shake` | Error state | `.input-error` |
| `successGlow` | Validation | `.input-success` |

**Usage:**
```html
<input class="animate-input-focus-glow" type="text" />
<input class="animate-input-shake" type="text" />
```

#### Card/Container Effects
- **Hover**: Lift + shadow increase
- **Load**: Fade in + scale
- **Duration**: 300-400ms

| Animation | Purpose | Timing |
|-----------|---------|--------|
| `cardLift` | Hover elevation | 300ms |
| `scrollFadeIn` | Scroll into view | 600ms |
| `parallaxFloat` | Subtle floating | 6s infinite |

**Usage:**
```html
<div class="animate-card-lift hover:animate-card-lift">Card</div>
<div class="animate-scroll-fade-in">Content</div>
```

#### Scroll Effects
- **Fade In**: Elements appear as they scroll into view
- **Parallax**: Subtle 2-3px offset movement
- **Counter**: Smooth number count-up animation
- **Duration**: 600ms - depends on scroll speed

| Animation | Purpose | Duration |
|-----------|---------|----------|
| `scrollFadeIn` | Entrance on scroll | 600ms |
| `parallaxFloat` | Floating movement | 6s |
| `counterAnimation` | Number animation | 500ms |

#### Modal & Dropdown Effects
- **Enter**: Fade + scale from center (0.8 → 1)
- **Exit**: Fade + scale to center (1 → 0.8)
- **Backdrop**: Smooth fade in
- **Duration**: 200-300ms

| Animation | Purpose | Duration |
|-----------|---------|----------|
| `modalScaleIn` | Modal open | 300ms |
| `dropdownSlide` | Dropdown expand | 300ms |
| `backdropFade` | Background fade | 300ms |

**Usage:**
```html
<div class="animate-modal-scale-in">Modal Content</div>
<div class="animate-dropdown-slide">Dropdown Menu</div>
```

#### Form Elements
- **Checkbox**: Scale animation (0.5 → 1)
- **Radio**: Scale + opacity (0.6 → 1)
- **Toggle**: Slide animation
- **Duration**: 150-250ms

| Animation | Purpose | Timing |
|-----------|---------|--------|
| `checkboxCheck` | Checkbox check | 300ms |
| `radioSelect` | Radio selection | 300ms |
| `toggleSlide` | Toggle switch | 300ms |

#### Status Indicators
- **Badge Pulse**: Continuous subtle glow
- **Spinner**: 360° rotation
- **Checkmark**: Draw animation
- **Duration**: 1-2s loops

| Animation | Purpose | Pattern |
|-----------|---------|---------|
| `pulseBadge` | Status badge | 2s infinite |
| `spinnerRotate` | Loading spinner | 1s linear infinite |
| `badgeGlow` | Emphasis glow | 2s infinite |

**Usage:**
```html
<span class="animate-pulse-badge">Status</span>
<div class="animate-spinner">Loading...</div>
```

#### Notifications & Toasts
- **Enter**: Slide in from right + fade
- **Exit**: Slide out + fade
- **Duration**: 200-300ms

| Animation | Purpose | Direction |
|-----------|---------|-----------|
| `toastSlideInRight` | Toast enter | Right → Left |
| `toastSlideOutRight` | Toast exit | Left → Right |

**Usage:**
```html
<div class="animate-toast-enter">Notification</div>
<div class="animate-toast-exit">Exiting...</div>
```

#### Text & Link Effects
- **Underline**: Expand from center on hover
- **Gradient Text**: Shifting gradient colors
- **Icon Rotate**: 180° rotation
- **Duration**: 150-400ms

| Animation | Purpose | Duration |
|-----------|---------|----------|
| `underlineHover` | Link underline | 300ms |
| `gradientText` | Text gradient shift | 3s infinite |
| `iconRotate` | Icon rotation | 400ms |
| `iconScale` | Icon scaling | 400ms |

#### Gradient Effects
- **Gradient Shift**: Animated background gradient
- **Gradient Border**: Moving border gradient
- **Duration**: 2-3s continuous

| Animation | Purpose | Pattern |
|-----------|---------|---------|
| `gradientText` | Text gradient | 3s infinite |
| `gradientShift` | Background gradient | 3s infinite |

#### Particle & Background Effects
- **Float**: Vertical floating motion
- **Drift**: Horizontal drifting
- **Fade In/Out**: Opacity pulsing
- **Duration**: 3-5s loops

| Animation | Purpose | Loop |
|-----------|---------|------|
| `floatUp` | Floating elements | 3s infinite |
| `parallaxFloat` | Parallax floating | 6s infinite |
| `fadeInOut` | Opacity pulse | Variable |

#### Chart Animations
- **Bar Grow**: Height animation from 0
- **Line Draw**: Stroke dash offset animation
- **Pie Rotate**: Rotation animation
- **Tooltip Fade**: Tooltip entrance
- **Duration**: 600ms-1s

| Animation | Purpose | Duration |
|-----------|---------|----------|
| `chartBarGrow` | Bar chart growth | 800ms |
| `chartLineDraw` | Line chart draw | 1000ms |
| `tooltipFadeIn` | Tooltip fade in | 200ms |

**Usage:**
```html
<div class="animate-chart-bar">Bar 1</div>
<div class="animate-chart-bar" style="animation-delay: 100ms">Bar 2</div>
<path class="animate-chart-line" d="..." />
```

#### Badge & Skill Animations
- **Appear**: Scale from 0 + fade in
- **Remove**: Scale to 0 + fade out
- **Hover**: Glow + scale slightly
- **Duration**: 150-300ms

| Animation | Purpose | Trigger |
|-----------|---------|---------|
| `badgeScaleUp` | Badge enter | Appear |
| `badgeScaleDown` | Badge remove | Remove |
| `badgeGlow` | Badge emphasis | Hover |

**Usage:**
```html
<span class="animate-badge-appear">New Skill</span>
<span class="animate-badge-remove">Removing...</span>
```

#### Progress Indicators
- **Progress Fill**: Width animation
- **Percentage Counter**: Number counting
- **Step Indicator**: Height/width transition
- **Duration**: 400-600ms

| Animation | Purpose | Duration |
|-----------|---------|----------|
| `progressFill` | Progress bar fill | 1s |
| `percentCounter` | Percentage number | Variable |
| `stepTransition` | Step height | 300ms |

**Usage:**
```html
<div class="animate-progress-fill" style="--progress-width: 75%">Progress</div>
```

## Component Animations

### AnimationWrapper Component

A reusable component for applying animations to any content:

```tsx
import AnimationWrapper from '@/app/components/AnimationWrapper';

<AnimationWrapper 
  type="slideUp"
  delay={100}
  duration={600}
  triggerOnScroll={true}
  staggerIndex={0}
  staggerDelay={100}
>
  <YourContent />
</AnimationWrapper>
```

**Supported Types:**
- `fadeIn` - Simple fade in
- `slideUp` - Slide up animation
- `slideDown` - Slide down animation
- `slideLeft` - Slide left animation
- `slideRight` - Slide right animation
- `scale` - Scale animation
- `zoom` - Zoom animation
- `bounce` - Bounce animation
- `stagger` - Staggered animation

### Enhanced Components

All reusable components include animations:

#### DashboardCard
```tsx
<DashboardCard 
  title="Matches"
  value={45}
  icon={<Icon />}
  trend={{ value: 12, direction: 'up' }}
/>
```
- Title: `animate-fade-in-smooth`
- Value: `animate-count-up`
- Icon: `animate-icon-scale`
- Trend: `animate-stagger-fade-in`

#### SkillTag
```tsx
<SkillTag skill="React" variant="skill" onRemove={() => {}} />
```
- Appear: `animate-badge-appear`
- Remove button: `animate-icon-scale` on hover

#### MatchScore
```tsx
<MatchScore score={85} size="lg" showLabel={true} />
```
- Container: `animate-pulse-badge`
- Circle: `animate-chart-line`
- Percentage: `animate-counter-number`

#### StatusBadge
```tsx
<StatusBadge status="offered" size="md" />
```
- Badge: `animate-badge-appear`
- Icon: `animate-icon-scale` if "Offered"
- Pulse: `animate-pulse-badge` if "Offered"

#### SalaryDisplay
```tsx
<SalaryDisplay min={50000} max={80000} currency="EUR" />
```
- Container: `animate-fade-in-smooth`
- Currency: `animate-icon-scale`
- Value: `animate-gradient-text`

#### PieChart
```tsx
<PieChart matchPercentage={75} />
```
- Chart: `animate-chart-line`
- Percentage: `animate-counter-number`
- Glow: `animate-parallax-float`

#### ConversionFunnel
```tsx
<ConversionFunnel stages={stages} />
```
- Bars: `animate-chart-bar` with stagger
- Stats: `animate-stagger-fade-in` with delay
- Counters: `animate-counter-number`

## Customization

### Adding Custom Animations

1. Define keyframes in `globals.css`:
```css
@keyframes myAnimation {
  from { /* start state */ }
  to { /* end state */ }
}
```

2. Add to Tailwind config in `tailwind.config.ts`:
```ts
keyframes: {
  myAnimation: {
    'from': { /* start */ },
    'to': { /* end */ }
  }
},
animation: {
  'my-anim': 'myAnimation 0.3s ease-out'
}
```

3. Use in components:
```html
<div class="animate-my-anim">Content</div>
```

### Animation Timing Best Practices

| Use Case | Duration | Easing |
|----------|----------|--------|
| Micro interactions | 150-200ms | ease-out |
| Page transitions | 300-400ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Entrance animations | 400-600ms | ease-out |
| Hover effects | 200-300ms | ease |
| Loading states | 1-2s | linear or ease-in-out |
| Continuous effects | 2-6s | ease-in-out |

### Performance Optimization

1. **Use `will-change`** for frequently animated elements:
```css
.animate-element {
  will-change: transform, opacity;
}
```

2. **GPU acceleration** for transforms:
```css
transform: translateZ(0);
backface-visibility: hidden;
```

3. **Reduce motion** for accessibility:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (webkit prefixes included)
- **IE11**: Limited support (fallbacks recommended)

## Testing Animations

### Visual Testing
- Test on multiple devices (mobile, tablet, desktop)
- Test on 4K displays
- Test dark mode animations

### Performance Testing
- Chrome DevTools Performance tab
- Look for 60fps consistency
- Check GPU utilization

### Accessibility Testing
- Test with `prefers-reduced-motion` enabled
- Ensure animations don't prevent interactions
- Test keyboard navigation with animations

## Animation Examples

### Button with Ripple Effect
```tsx
<button class="relative overflow-hidden">
  Click me
  <span class="animate-ripple absolute"></span>
</button>
```

### Staggered List
```tsx
<ul>
  {items.map((item, i) => (
    <li 
      key={i}
      class="animate-stagger-fade-in"
      style={{ animationDelay: `${i * 0.1}s` }}
    >
      {item}
    </li>
  ))}
</ul>
```

### Scroll-triggered Animation
```tsx
<AnimationWrapper 
  type="slideUp"
  triggerOnScroll={true}
  delay={0}
  duration={600}
>
  <YourContent />
</AnimationWrapper>
```

### Gradient Text Animation
```tsx
<h1 class="animate-gradient-text bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
  Animated Gradient Text
</h1>
```

### Loading Spinner
```tsx
<div class="animate-spinner">
  <svg className="w-8 h-8">...</svg>
</div>
```

## Common Patterns

### Card Hover Animation
```tsx
<div class="animate-card-lift hover:animate-card-lift">
  Card Content
</div>
```

### Badge Entry Animation
```tsx
<span class="animate-badge-appear">
  New Badge
</span>
```

### Counter Animation
```tsx
<div class="animate-counter-number">
  {value}
</div>
```

## Troubleshooting

### Animations not playing
- Check if `prefers-reduced-motion` is enabled
- Verify animation class names are correct
- Check browser console for errors
- Ensure CSS is compiled correctly

### Performance issues
- Reduce number of simultaneously animated elements
- Use `transform` and `opacity` only (GPU accelerated)
- Avoid animating computed/layout properties
- Use `will-change` sparingly

### Jank/stuttering
- Profile with Chrome DevTools
- Check for layout thrashing
- Enable GPU acceleration
- Reduce animation complexity

## Future Enhancements

- [ ] Framer Motion integration for complex animations
- [ ] Page transition animations
- [ ] Gesture-based animations
- [ ] Scroll snap with animations
- [ ] Advanced parallax effects

## References

- [CSS Animations MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Tailwind CSS Animation](https://tailwindcss.com/docs/animation)
- [Animation Performance](https://web.dev/animations-guide/)
- [Accessibility & Animations](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)
