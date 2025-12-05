# Animation Quick Reference Guide

## 🎯 How to Use the New Animations

### Adding Animations to Elements

#### 1. Scroll-Triggered Animations (Already Applied)

The `.reveal` class is already applied to major sections. Elements will automatically animate when scrolled into view.

#### 2. Fade Animations

```html
<!-- Fade in from different directions -->
<div class="fade-in">Fades in</div>
<div class="fade-in-up">Slides up while fading</div>
<div class="fade-in-down">Slides down while fading</div>
<div class="fade-in-left">Slides from left</div>
<div class="fade-in-right">Slides from right</div>
```

#### 3. Stagger Animations (For Lists)

```html
<ul>
  <li class="stagger-item">Item 1 (0.1s delay)</li>
  <li class="stagger-item">Item 2 (0.2s delay)</li>
  <li class="stagger-item">Item 3 (0.3s delay)</li>
</ul>
```

#### 4. Smooth Transitions (For Hover Effects)

```html
<!-- Add to any element for smooth hover transitions -->
<button class="smooth-transition">Hover me</button>
<a class="smooth-transition-fast">Quick transition</a>
<div class="smooth-transition-slow">Slow transition</div>
```

#### 5. Special Effects

```html
<div class="pulse">Pulsing element</div>
<div class="bounce">Bouncing element</div>
<div class="float">Floating element</div>
<div class="shimmer">Loading shimmer</div>
<div class="glow">Glowing element</div>
<span class="gradient-text">Animated gradient text</span>
```

## 🎨 Animation Delays

Add inline styles for custom delays:

```html
<div class="fade-in-up" style="animation-delay: 0.2s;">Delayed animation</div>
<div class="fade-in-up" style="animation-delay: 0.4s;">More delayed</div>
```

## 🔧 Customizing Animations

### Change Animation Duration

```css
.my-element {
  animation-duration: 1.5s; /* Default is 0.6s-1s */
}
```

### Change Easing

```css
.my-element {
  transition-timing-function: ease-in-out;
  /* Default is cubic-bezier(0.16, 1, 0.3, 1) */
}
```

### Disable Specific Animations

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

## 📱 Testing Animations

### In Browser

1. Open `index.html` in your browser
2. Scroll down to see reveal animations
3. Hover over cards, buttons, and links
4. Click buttons to see ripple effects
5. Watch the scroll progress bar at the top

### Checking Performance

1. Open DevTools (F12)
2. Go to Performance tab
3. Record while scrolling
4. Check for 60fps (green line)

## 🎯 What's Animated

### ✅ Already Applied

- [x] Header (fade-in-down)
- [x] Navigation links (stagger-item + smooth-transition)
- [x] Hero title (fade-in-up)
- [x] Hero subtitle (fade-in-up with 0.2s delay)
- [x] Typed text (fade-in-up with 0.4s delay)
- [x] All buttons (smooth-transition + ripple effect)
- [x] All expertise cards (smooth-transition + hover lift)
- [x] All form inputs (smooth-transition + focus glow)
- [x] CV dropdown (smooth-transition)
- [x] Social media icons (smooth-transition + hover scale)
- [x] Back to top button (smooth-transition + hover lift)
- [x] Scroll progress indicator

### 🎨 Hover Effects Active On

- Navigation links (underline animation)
- All buttons (lift + shadow)
- All cards (lift + scale + shadow)
- Expertise card icons (rotation)
- Images (scale + rotate)
- Social media icons (scale + color change)
- Form inputs (glow on focus)
- Links (color transition)

## 🚀 Performance Tips

1. **Use transform and opacity** for animations (GPU accelerated)
2. **Avoid animating** width, height, top, left (causes reflow)
3. **Use will-change** sparingly (already applied to .reveal)
4. **Test on mobile** devices for performance
5. **Respect reduced motion** (already implemented)

## 🎨 Color Scheme

The animations use your existing color scheme:

- Primary gradient: `#667eea` to `#764ba2`
- Shadows: `rgba(0, 0, 0, 0.2)` to `rgba(0, 0, 0, 0.3)`
- Hover states: Brightness and shadow adjustments

## 📝 Common Use Cases

### Adding Animation to New Section

```html
<section class="reveal">
  <h2 class="fade-in-up">Section Title</h2>
  <p class="fade-in-up" style="animation-delay: 0.2s;">Content</p>
</section>
```

### Creating Animated List

```html
<ul>
  <li class="stagger-item">First item</li>
  <li class="stagger-item">Second item</li>
  <li class="stagger-item">Third item</li>
</ul>
```

### Adding Smooth Button

```html
<button class="smooth-transition">Click Me</button>
```

## 🔍 Troubleshooting

### Animations Not Working?

1. Check if CSS file is loaded: `micro-interactions.css`
2. Check browser console for errors
3. Verify class names are correct
4. Check if `prefers-reduced-motion` is enabled

### Animations Too Fast/Slow?

Adjust in `animited.css`:

```css
.fade-in-up {
  animation-duration: 1.2s; /* Increase for slower */
}
```

### Hover Effects Not Smooth?

Check that `smooth-transition` class is applied:

```html
<div class="smooth-transition">...</div>
```

## 🎉 Enjoy Your Animated Portfolio!

All animations are now active and ready to impress your visitors!
