/**
 * Proteksyon: Canteen Atmospheric Monitoring System
 * Final Integrated Dashboard Logic
 */

const ctx = document.getElementById("co2Chart").getContext("2d");

// --- 1. Chart Configuration ---
const labels = Array.from(
  { length: 13 },
  (_, i) => `${i * 5} min ago`,
).reverse();

const chartData = {
  labels,
  datasets: [
    {
      label: "CO₂ (ppm)",
      // Start with flat data; fetchFromSupabase will update this
      data: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.15)",
      tension: 0.25,
      fill: true,
      pointRadius: 2,
      borderWidth: 3,
    },
  ],
};

const config = {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 300,
        max: 1500, // Adjusted max to accommodate higher readings during testing
        ticks: { stepSize: 200, font: { size: 13 } },
        grid: { color: "#e2e8f0" },
      },
      x: {
        ticks: { font: { size: 13 }, maxRotation: 0 },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
  },
};

const chart = new Chart(ctx, config);

// --- 2. Slideshow Logic ---
const slides = document.querySelectorAll(".slideshow .slide");
const dots = document.querySelectorAll(".slide-dots .dot");
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
    dots[i].classList.toggle("active", i === index);
  });

  const activeBar = slides[index].querySelector(".bar");
  if (activeBar) {
    activeBar.style.width = "0%";
    setTimeout(() => {
      const targetWidth = activeBar.dataset.width || "50";
      activeBar.style.width = targetWidth + "%";
    }, 200);
  }
  currentSlide = index;
}

function startSlideInterval() {
  slideInterval = setInterval(() => {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }, 5500);
}

// Initial start
startSlideInterval();

// Interaction listeners
const slideshowEl = document.querySelector(".slideshow");
slideshowEl.addEventListener("mouseenter", () => clearInterval(slideInterval));
slideshowEl.addEventListener("mouseleave", startSlideInterval);

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    clearInterval(slideInterval);
    showSlide(i);
    startSlideInterval();
  });
});

// --- 3. Live Clock Display ---
function updateLiveTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  document.getElementById("liveTime").textContent =
    `${hours}:${minutes}:${seconds}`;
}

setInterval(updateLiveTime, 1000);
updateLiveTime();

// --- 4. Air Quality Alert Logic ---
const THRESHOLDS = {
  co2: { moderate: 800, hazardous: 1200 },
  pm25: { moderate: 35, hazardous: 75 },
  voc: { moderate: 500, hazardous: 1000 },
  humidity: { modLow: 30, modHigh: 70, hazLow: 20, hazHigh: 80 },
};

function checkAirQuality(latest) {
  let alertLevel = null;
  let alertType = null;
  let alertMessage = null;
  let solution = null;

  // Check CO2
  if (latest.co2 > THRESHOLDS.co2.hazardous) {
    alertLevel = "HAZARDOUS";
    alertType = "Carbon Dioxide (CO₂)";
    alertMessage = `CO₂ level is critically high at ${Math.round(latest.co2)} ppm. This causes drowsiness, headaches, and reduced cognitive function.`;
    solution =
      "Immediately open windows for fresh air, activate ventilation systems, and consider evacuating the area if levels don't drop.";
  } else if (latest.co2 > THRESHOLDS.co2.moderate) {
    alertLevel = "MODERATE";
    alertType = "Carbon Dioxide (CO₂)";
    alertMessage = `CO₂ level is elevated at ${Math.round(latest.co2)} ppm. Poor ventilation may cause discomfort and reduced focus.`;
    solution =
      "Increase fresh air supply by opening windows or improving ventilation. Use CO₂ monitors in crowded spaces.";
  }

  // Check PM2.5
  if (latest.pm25 > THRESHOLDS.pm25.hazardous) {
    alertLevel = "HAZARDOUS";
    alertType = "Particulate Matter (PM2.5)";
    alertMessage = `PM2.5 is critically high at ${Math.round(latest.pm25)} µg/m³. Prolonged exposure causes serious respiratory and cardiovascular issues.`;
    solution =
      "Evacuate the area immediately. Use HEPA air purifiers and N95 masks. Avoid strenuous activities until levels improve.";
  } else if (latest.pm25 > THRESHOLDS.pm25.moderate) {
    alertLevel = "MODERATE";
    alertType = "Particulate Matter (PM2.5)";
    alertMessage = `PM2.5 is elevated at ${Math.round(latest.pm25)} µg/m³. Sensitive groups may experience breathing difficulties.`;
    solution =
      "Use HEPA air purifiers, keep windows closed during high outdoor pollution, and monitor vulnerable individuals.";
  }

  // Check Humidity
  if (
    latest.humidity < THRESHOLDS.humidity.hazLow ||
    latest.humidity > THRESHOLDS.humidity.hazHigh
  ) {
    alertLevel = "HAZARDOUS";
    alertType = "Humidity Level";
    alertMessage = `Humidity is at dangerous levels (${latest.humidity.toFixed(1)}% RH). This promotes mold growth or causes severe dryness.`;
    solution =
      "Use dehumidifiers for high humidity or humidifiers for low humidity. Improve ventilation and check for water damage or leaks.";
  } else if (
    latest.humidity < THRESHOLDS.humidity.modLow ||
    latest.humidity > THRESHOLDS.humidity.modHigh
  ) {
    alertLevel = "MODERATE";
    alertType = "Humidity Level";
    alertMessage = `Humidity is outside comfortable range (${latest.humidity.toFixed(1)}% RH). May promote dust mites or cause dry skin.`;
    solution =
      "Adjust humidity levels to 40-60% using humidifiers or dehumidifiers. Improve air circulation and ventilation.";
  }

  // Check VOC (MQ-135)
  if (latest.mq135 > THRESHOLDS.voc.hazardous) {
    alertLevel = "HAZARDOUS";
    alertType = "Volatile Organic Compounds (VOC)";
    alertMessage = `VOC level is critically high at ${Math.round(latest.mq135)} ppm. Exposure to high VOC causes severe respiratory irritation and headaches.`;
    solution =
      "Immediately increase ventilation, evacuate if symptoms occur. Identify and remove VOC sources (paints, cleaners, solvents). Use activated carbon filters.";
  } else if (latest.mq135 > THRESHOLDS.voc.moderate) {
    alertLevel = "MODERATE";
    alertType = "Volatile Organic Compounds (VOC)";
    alertMessage = `VOC level is elevated at ${Math.round(latest.mq135)} ppm. Common sources include paints, perfumes, and cleaning products.`;
    solution =
      "Open windows for ventilation, remove VOC sources, use low-VOC products, and ventilate well after painting or cleaning.";
  }

  if (alertLevel) {
    showAlert(alertLevel, alertType, alertMessage, solution, latest);
  } else {
    hideAlert();
  }
}

function showAlert(level, type, message, solution, latest) {
  const overlay = document.getElementById("alertModalOverlay");
  const title = document.getElementById("alertModalTitle");
  const messageEl = document.getElementById("alertModalMessage");
  const co2El = document.getElementById("alertCo2");
  const pm25El = document.getElementById("alertPm25");
  const humEl = document.getElementById("alertHum");
  const tipEl = document.querySelector(".alert-tip");

  title.textContent = `${level} - ${type}`;
  messageEl.textContent = message;
  co2El.textContent = Math.round(latest.co2) + " ppm";
  pm25El.textContent = Math.round(latest.pm25) + " µg/m³";
  humEl.textContent = latest.humidity.toFixed(1) + " %";
  tipEl.textContent = solution;

  // Adjust styling based on alert level
  if (level === "HAZARDOUS") {
    overlay.style.backgroundColor = "rgba(239, 68, 68, 0.3)"; // Red overlay
  } else if (level === "MODERATE") {
    overlay.style.backgroundColor = "rgba(245, 158, 11, 0.3)"; // Orange overlay
  }

  overlay.classList.remove("hidden");
  overlay.classList.add("visible");

  // Play alarm sound
  playAlarmSound(level);
}

function hideAlert() {
  const overlay = document.getElementById("alertModalOverlay");
  overlay.classList.remove("visible");
  overlay.classList.add("hidden");

  // Stop alarm sound
  stopAlarmSound();
}

// Alarm Sound Generation
let audioContext = null;
let oscillators = [];

function playAlarmSound(level) {
  try {
    // Create audio context if not exists
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Stop any existing alarms
    stopAlarmSound();

    if (level === "HAZARDOUS") {
      // High-pitched repeated beep for hazardous
      playBeep(900, 200, 0.3); // frequency, duration, volume
      setTimeout(() => playBeep(900, 200, 0.3), 250);
      setTimeout(() => playBeep(900, 200, 0.3), 500);
    } else if (level === "MODERATE") {
      // Lower pitch for moderate
      playBeep(600, 150, 0.2);
      setTimeout(() => playBeep(600, 150, 0.2), 200);
    }
  } catch (e) {
    console.warn("Audio playback not available:", e);
  }
}

function playBeep(frequency, duration, volume) {
  try {
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);

    oscillators.push(oscillator);
  } catch (e) {
    console.warn("Beep sound failed:", e);
  }
}

function stopAlarmSound() {
  try {
    oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    oscillators = [];
  } catch (e) {
    console.warn("Stop alarm failed:", e);
  }
}

// --- 5. Supabase Real-Time Data Sync ---
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbXZ4dXZyeXlpdnhpamN6cGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk0NjgsImV4cCI6MjA4OTY2NTQ2OH0.5kdLNRVMGFUi_tUplOV2ipSYaw48FAbMTVUALfHbeKg";

async function fetchFromSupabase() {
  try {
    const response = await fetch(
      "https://oemvxuvryyivxijczpli.supabase.co/rest/v1/sensor_readings?device_id=eq.1&order=created_at.desc&limit=1",
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );

    const data = await response.json();
    if (data.length > 0) {
      const latest = data[0];

      // Update Summary Cards
      document.getElementById("co2-card").textContent = Math.round(latest.co2);
      document.getElementById("pm25-card").textContent = Math.round(
        latest.pm25,
      );

      // Map MQ-135 data to VOC card
      const mqValue = Math.round(latest.mq135);
      document.getElementById("voc-card").textContent = mqValue;

      // Update the active slide current value text
      const activeSlideLabel = document.querySelector(".slide.active .current");
      if (activeSlideLabel) {
        activeSlideLabel.textContent = `Current: ${mqValue} ppm`;
      }

      // --- Update Temperature & Humidity ---
      // Update Temperature Card
      const tempCard = document.getElementById("temp-card");
      if (tempCard) {
        tempCard.textContent = latest.temperature.toFixed(1) + " °C";
      }

      // Update Temperature Slide label
      const tempSlideLabel = document.querySelector(".slide.temp .current");
      if (tempSlideLabel) {
        tempSlideLabel.textContent = `Current: ${latest.temperature.toFixed(1)} °C`;
      }

      // Update Humidity Card
      const humiCard = document.getElementById("hum-card");
      if (humiCard) {
        humiCard.textContent = latest.humidity.toFixed(1) + " %";
      }

      // Update the Humidity Slide labels
      const humSlideLabel = document.querySelector(".slide.hum .current");
      if (humSlideLabel) {
        humSlideLabel.textContent = `Current: ${latest.humidity.toFixed(1)}% RH`;
      }

      // Update Chart History
      chart.data.datasets[0].data.shift();
      chart.data.datasets[0].data.push(latest.co2);
      chart.update();

      // Check Air Quality and Show Alerts if Needed
      checkAirQuality(latest);

      // Update Sync Status
      const statusEl = document.getElementById("status");
      if (statusEl) {
        statusEl.textContent =
          "Last sync: " + new Date(latest.created_at).toLocaleTimeString();
        statusEl.style.color = "#10b981"; // Healthy green
      }
    }
  } catch (e) {
    console.error("Supabase Fetch Error:", e);
    const statusEl = document.getElementById("status");
    if (statusEl) {
      statusEl.textContent = "Cloud Connection Error";
      statusEl.style.color = "#ef4444"; // Error red
    }
  }
}

// Initial fetch and start interval (5 seconds matches the ESP32 upload rate)
fetchFromSupabase();
setInterval(fetchFromSupabase, 5000);
