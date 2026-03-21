const ctx = document.getElementById("co2Chart").getContext("2d");

const labels = Array.from(
  { length: 13 },
  (_, i) => `${i * 5} min ago`,
).reverse();

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
        ticks: {
          stepSize: 50,
          font: { size: 13 },
        },
        grid: { color: "#e2e8f0" },
      },
      x: {
        ticks: {
          font: { size: 13 },
          maxRotation: 0,
        },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  },
};

const slides = document.querySelectorAll(".slideshow .slide");
const dots = document.querySelectorAll(".slide-dots .dot");

let currentSlide = 0;
let interval;

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

function startInterval() {
  interval = setInterval(() => {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }, 5500);
}

startInterval();

const slideshowEl = document.querySelector(".slideshow");

slideshowEl.addEventListener("mouseenter", () => clearInterval(interval));
slideshowEl.addEventListener("mouseleave", startInterval);

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    clearInterval(interval);
    showSlide(i);
    startInterval();
  });
});

const MONITORING_START = new Date();
MONITORING_START.setHours(0, 0, 0, 0);

function updateLiveTime() {
  const now = new Date();
  const diffMs = now - MONITORING_START;

  if (diffMs < 0) {
    document.getElementById("liveTime").textContent = "0 h 00 min";
    return;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const displayText =
    hours > 0
      ? `${hours} h ${minutes.toString().padStart(2, "0")} min`
      : `${minutes} min`;

  document.getElementById("liveTime").textContent = displayText;
}

setInterval(updateLiveTime, 60000);

updateLiveTime();

const chart = new Chart(ctx, config);

setInterval(() => {
  const newValue = Math.round(580 + Math.random() * 90 - 45);

  chart.data.datasets[0].data.shift();
  chart.data.datasets[0].data.push(newValue);

  const temp = (23.8 + Math.random() * 1.4).toFixed(1);
  document.querySelector(".temperature .value").textContent = `${temp} °C`;

  chart.update();
}, 8000);

const ESP32_IP = "http://192.168.0.198/"; // Replace with your ESP32's IP address

async function fetchData() {
  try {
    const response = await fetch(ESP32_IP);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    // Update sensor-data section
    document.getElementById("co2").textContent = data.co2 + " ppm";
    document.getElementById("pm25").textContent = data.pm25 + " ug/m3";
    document.getElementById("temp").textContent = data.temp + " °C";
    document.getElementById("hum").textContent = data.hum + " %";
    document.getElementById("status").textContent =
      "Last updated: " + new Date().toLocaleTimeString();
    // Update summary cards
    document.getElementById("co2-card").textContent = data.co2;
    document.getElementById("pm25-card").textContent = data.pm25;
    document.getElementById("temp-card").textContent = data.temp + " °C";
    // If you want to update VOC or Gas cards, add logic here
  } catch (e) {
    document.getElementById("status").textContent =
      "Failed to fetch data. Check ESP32 connection.";
    document.getElementById("co2").textContent = "--";
    document.getElementById("pm25").textContent = "--";
    document.getElementById("temp").textContent = "--";
    document.getElementById("hum").textContent = "--";
    // Set summary cards to -- on error
    document.getElementById("co2-card").textContent = "--";
    document.getElementById("pm25-card").textContent = "--";
    document.getElementById("temp-card").textContent = "--";
  }
}

setInterval(fetchData, 2000);
window.onload = fetchData;
