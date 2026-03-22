# IoT Air Quality Dashboard

A responsive air quality monitoring dashboard that works seamlessly across desktop, tablet, mobile, and TV displays.

## Features

### Responsive Design
- **Desktop (1200px+)**: Full two-column layout with optimal spacing
- **Tablet (768px-1199px)**: Single column with reordered elements for better flow
- **Mobile (480px-767px)**: Compact layout with 2-column card grid
- **Small Mobile (<480px)**: Optimized for small screens
- **TV/Ultra-wide (1920px+)**: Enhanced for large displays with larger text and touch targets
- **4K TV (3840px+)**: Optimized for ultra-high resolution displays

### TV-Friendly Features
- **Touch Navigation**: Swipe left/right to navigate slides
- **Keyboard Support**: Arrow keys for navigation, Enter/Space to pause/play
- **Large Touch Targets**: Bigger buttons and navigation dots for remote control
- **High Contrast**: Improved shadows and contrast for better TV viewing
- **No Text Selection**: Prevents accidental text selection on TV interfaces

### Interactive Elements
- **Auto-rotating Slideshow**: Cycles through air quality metrics every 5.5 seconds
- **Live Chart**: Real-time CO₂ level monitoring with historical data
- **Live Timer**: Shows monitoring duration
- **Navigation Dots**: Click or tap to jump to specific slides

## Usage

1. Open `index.html` in a web browser
2. The dashboard will automatically start monitoring and displaying data
3. Use touch gestures or keyboard arrows to navigate slides on TV
4. Press Enter or Space to pause/play the slideshow

## Technical Details

- **HTML5/CSS3**: Modern responsive design with CSS Grid and Flexbox
- **Chart.js**: Interactive charts with responsive scaling
- **Vanilla JavaScript**: No dependencies except Chart.js
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

To run locally:
```bash
cd dashboard
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## File Structure
```
dashboard/
├── index.html      # Main HTML structure
├── style.css       # Responsive styles and TV optimizations
├── script.js       # Interactive functionality and touch/keyboard support
└── icons/          # Air quality metric icons
```