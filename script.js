/* Unified dashboard JS
   - chart + slides (kept from original)
   - fetch pipeline: try local ESP32, fallback to Supabase
*/

const ESP32_IP = "http://192.168.0.197/"; // Replace with your ESP32's IP address
const SUPABASE_URL = "https://oemvxuvryyivxijczpli.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbXZ4dXZyeXlpdnhpamN6cGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA4OTQ2OCwiZXhwIjoyMDg5NjY1NDY4fQ.Toiniui2Wve0L8yzMigAbY91PkDrTGTYSLGHEzCMXVk"; // replace with your anon key
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ctx = document.getElementById("co2Chart").getContext("2d");

const labels = Array.from({ length: 13 }, (_, i) => `${i * 5} min ago`).reverse();

const data = {
  labels,
  datasets: [
    {
      label: "CO₂ (ppm)",
      data: [520, 528, 535, 549, 572, 595, 618, 636, 648, 655, 642, 628, 615],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.15)",
      tension: 0.25,
      fill: true,
      pointRadius: 0,
      borderWidth: 3,
    },
  ],
};

const config = {
  type: "line",
  data: data,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 450,
        max: 800,
        ticks: { stepSize: 50, font: { size: 13 } },
        grid: { color: "#e2e8f0" },
      },
      x: { ticks: { font: { size: 13 }, maxRotation: 0 }, grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    elements: {
      point: {
        radius: function(context) {
          // Make points larger on TV screens
          return window.innerWidth > 1920 ? 4 : 0;
        }
      }
    }
  },
};

const chart = new Chart(ctx, config);

// --- slideshow logic (kept from original file) ---
const slides = document.querySelectorAll(".slideshow .slide");
const dots = document.querySelectorAll(".slide-dots .dot");
let currentSlide = 0;
let interval;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
    if (dots[i]) dots[i].classList.toggle("active", i === index);
  });

  const activeBar = slides[index] && slides[index].querySelector(".bar");
  if (activeBar) {
    activeBar.style.width = "0%";
    setTimeout(() => {
      const targetWidth = activeBar.dataset.width || "50";
      activeBar.style.width = targetWidth + "%";
    }, 200);
  }
  currentSlide = index;
}

function startInterval() {
  interval = setInterval(() => showSlide((currentSlide + 1) % slides.length), 5000);
}

if (slides.length) startInterval();
const slideshowEl = document.querySelector(".slideshow");
if (slideshowEl) {
  slideshowEl.addEventListener("mouseenter", () => clearInterval(interval));
  slideshowEl.addEventListener("mouseleave", startInterval);
}
dots.forEach((dot, i) => dot.addEventListener("click", () => { clearInterval(interval); showSlide(i); startInterval(); }));

// Touch and keyboard navigation for TV/remote control support
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

if (slideshowEl) {
  slideshowEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  });

  slideshowEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  });
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diffX = touchStartX - touchEndX;
  const diffY = Math.abs(touchStartY - touchEndY);

  // Only handle horizontal swipes (ignore vertical scrolling)
  if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY) {
    clearInterval(interval);
    if (diffX > 0) {
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

// Keyboard navigation for TV remote and mobile keyboard
document.addEventListener('keydown', (e) => {
  // Prevent default behavior for navigation keys
  if (['ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Tab'].includes(e.key)) {
    e.preventDefault();
  }

  switch(e.key) {
    case 'ArrowLeft':
      clearInterval(interval);
      const prev = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prev);
      startInterval();
      break;
    case 'ArrowRight':
      clearInterval(interval);
      const next = (currentSlide + 1) % slides.length;
      showSlide(next);
      startInterval();
      break;
    case 'Enter':
    case ' ':
      // Toggle slideshow pause/play
      if (interval) {
        clearInterval(interval);
        interval = null;
      } else {
        startInterval();
      }
      break;
    case 'Tab':
      // Allow tab navigation for accessibility
      break;
  }
});

// Make dots larger and more touch-friendly on TV screens and mobile
function updateDotSizes() {
  const dots = document.querySelectorAll('.slide-dots .dot');
  const isLargeScreen = window.innerWidth > 1200;
  const isMobile = window.innerWidth <= 768;

  dots.forEach(dot => {
    if (isLargeScreen) {
      dot.style.width = '12px';
      dot.style.height = '12px';
      dot.style.margin = '0 2px';
    } else if (isMobile) {
      dot.style.width = '10px';
      dot.style.height = '10px';
      dot.style.margin = '0 4px';
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

// Mobile-specific optimizations
function optimizeForMobile() {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Reduce animation times on mobile for better performance
    document.documentElement.style.setProperty('--animation-duration', '0.3s');

    // Add passive touch listeners for better scroll performance
    const touchElements = document.querySelectorAll('.slideshow, .card, .chart-panel');
    touchElements.forEach(el => {
      el.addEventListener('touchstart', () => {}, { passive: true });
    });
  }
}

// Initialize mobile optimizations
optimizeForMobile();
window.addEventListener('resize', optimizeForMobile);

// --- live time ---
const MONITORING_START = new Date();
MONITORING_START.setHours(0, 0, 0, 0);
function updateLiveTime() {
  const now = new Date();
  const diffMs = now - MONITORING_START;
  if (diffMs < 0) { document.getElementById("liveTime").textContent = "0 h 00 min"; return; }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const displayText = hours > 0 ? `${hours} h ${minutes.toString().padStart(2, "0")} min` : `${minutes} min`;
  const el = document.getElementById("liveTime"); if (el) el.textContent = displayText;
}
setInterval(updateLiveTime, 60000); updateLiveTime();

// Simulated chart updates (kept behavior)
setInterval(() => {
  const newValue = Math.round(580 + Math.random() * 90 - 45);
  chart.data.datasets[0].data.shift();
  chart.data.datasets[0].data.push(newValue);
  const tempEl = document.querySelector(".temperature .value");
  if (tempEl) tempEl.textContent = `${(23.8 + Math.random() * 1.4).toFixed(1)} °C`;
  chart.update();
}, 8000);

// --- DOM update helper (safe: updates both specific ids and cards) ---
function updateUI(reading) {
  if (!reading) return;
  const { co2, pm25, temp, hum } = reading;
  const trySet = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  trySet('co2', co2 ? `${co2} ppm` : '--');
  trySet('pm25', pm25 ? `${pm25} µg/m³` : '--');
  trySet('temp', temp ? `${temp} °C` : '--');
  trySet('hum', hum ? `${hum} %` : '--');

  trySet('co2-card', co2 ?? '--');
  trySet('pm25-card', pm25 ?? '--');
  trySet('temp-card', temp ? `${temp} °C` : '--');
  trySet('hum-card', hum ? `${hum} %` : '--');

  // update slide current values if present
  const tempCurr = document.getElementById('temp-current'); if (tempCurr) tempCurr.textContent = temp ? `${temp} °C` : '--';
  const humCurr = document.getElementById('hum-current'); if (humCurr) humCurr.textContent = hum ? `${hum} %` : '--';

  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.textContent = `Last update: ${new Date().toLocaleTimeString()}`;
}

// --- fetch helpers ---
async function fetchEsp32Latest() {
  const res = await fetch(ESP32_IP, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ESP32 HTTP ${res.status}`);
  return res.json();
}

async function fetchSupabaseLatest() {
  const { data, error } = await supabaseClient
    .from('sensor_readings')
    .select('device_id,temperature,humidity,co2,pm25,created_at')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No data from Supabase');
  const row = data[0];
  return {
    co2: row.co2,
    pm25: row.pm25,
    temp: row.temperature != null ? Number(row.temperature).toFixed(1) : null,
    hum: row.humidity != null ? Number(row.humidity).toFixed(1) : null,
  };
}

async function refreshSensors() {
  try {
    const local = await fetchEsp32Latest();
    updateUI({ co2: local.co2, pm25: local.pm25, temp: local.temp, hum: local.hum });
    const statusEl = document.getElementById('status'); if (statusEl) statusEl.textContent = `ESP32 live at ${new Date().toLocaleTimeString()}`;
  } catch (espErr) {
    try {
      const sup = await fetchSupabaseLatest();
      updateUI(sup);
      const statusEl = document.getElementById('status'); if (statusEl) statusEl.textContent = `Supabase fallback at ${new Date().toLocaleTimeString()}`;
    } catch (supErr) {
      console.error('ESP32 error:', espErr, 'Supabase error:', supErr);
      const statusEl = document.getElementById('status'); if (statusEl) statusEl.textContent = 'Fetch failed (ESP32 + Supabase)';
      updateUI({ co2: '--', pm25: '--', temp: '--', hum: '--' });
    }
  }
}

setInterval(refreshSensors, 5000);
window.addEventListener('load', refreshSensors);
