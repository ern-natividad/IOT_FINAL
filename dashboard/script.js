const ctx = document.getElementById('co2Chart').getContext('2d');

const labels = Array.from({ length: 13 }, (_, i) => `${i * 5} min ago`).reverse();

const data = {
  labels,
  datasets: [
    {
      label: 'CO₂ (ppm)',
      data: [520, 528, 535, 549, 572, 595, 618, 636, 648, 655, 642, 628, 615],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      tension: 0.25,
      fill: true,
      pointRadius: 0,
      borderWidth: 3
    }
  ]
};

const config = {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 450,
        max: 800,
        ticks: {
          stepSize: 50,
          font: { size: 13 }
        },
        grid: { color: '#e2e8f0' }
      },
      x: {
        ticks: {
          font: { size: 13 },
          maxRotation: 0
        },
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        radius: function(context) {
          // Make points larger on TV screens
          return window.innerWidth > 1920 ? 4 : 0;
        }
      }
    }
  }
};

const slides = document.querySelectorAll('.slideshow .slide');
const dots = document.querySelectorAll('.slide-dots .dot');

let currentSlide = 0;
let interval;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
    dots[i].classList.toggle('active', i === index);
  });

  const activeBar = slides[index].querySelector('.bar');

  if (activeBar) {
    activeBar.style.width = '0%';

    setTimeout(() => {
      const targetWidth = activeBar.dataset.width || '50';
      activeBar.style.width = targetWidth + '%';
    }, 200);
  }

  currentSlide = index;
}

function startInterval() {
  interval = setInterval(() => {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }, 5500);
}

startInterval();

const slideshowEl = document.querySelector('.slideshow');

slideshowEl.addEventListener('mouseenter', () => clearInterval(interval));
slideshowEl.addEventListener('mouseleave', startInterval);

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    clearInterval(interval);
    showSlide(i);
    startInterval();
  });
});

// Touch and keyboard navigation for TV/remote control support
let touchStartX = 0;
let touchEndX = 0;

slideshowEl.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

slideshowEl.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    clearInterval(interval);
    if (diff > 0) {
      // Swipe left - next slide
      const next = (currentSlide + 1) % slides.length;
      showSlide(next);
    } else {
      // Swipe right - previous slide
      const prev = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prev);
    }
    startInterval();
  }
}

// Keyboard navigation for TV remote
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      clearInterval(interval);
      const prev = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prev);
      startInterval();
      break;
    case 'ArrowRight':
      e.preventDefault();
      clearInterval(interval);
      const next = (currentSlide + 1) % slides.length;
      showSlide(next);
      startInterval();
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      // Toggle slideshow pause/play
      if (interval) {
        clearInterval(interval);
        interval = null;
      } else {
        startInterval();
      }
      break;
  }
});

// Make dots larger and more touch-friendly on TV screens
function updateDotSizes() {
  const dots = document.querySelectorAll('.slide-dots .dot');
  const isTV = window.innerWidth > 1200;

  dots.forEach(dot => {
    if (isTV) {
      dot.style.width = '12px';
      dot.style.height = '12px';
      dot.style.margin = '0 2px';
    } else {
      dot.style.width = '';
      dot.style.height = '';
      dot.style.margin = '';
    }
  });
}

// Update dot sizes on load and resize
updateDotSizes();
window.addEventListener('resize', updateDotSizes);

const MONITORING_START = new Date();
MONITORING_START.setHours(0, 0, 0, 0);

function updateLiveTime() {
  const now = new Date();
  const diffMs = now - MONITORING_START;

  if (diffMs < 0) {
    document.getElementById('liveTime').textContent = '0 h 00 min';
    return;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const displayText =
    hours > 0
      ? `${hours} h ${minutes.toString().padStart(2, '0')} min`
      : `${minutes} min`;

  document.getElementById('liveTime').textContent = displayText;
}

setInterval(updateLiveTime, 60000);

updateLiveTime();

const chart = new Chart(ctx, config);

setInterval(() => {
  const newValue = Math.round(580 + Math.random() * 90 - 45);

  chart.data.datasets[0].data.shift();
  chart.data.datasets[0].data.push(newValue);

  const temp = (23.8 + Math.random() * 1.4).toFixed(1);
  document.querySelector('.temperature .value').textContent = `${temp} °C`;

  chart.update();
}, 8000);