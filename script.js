// Time Display
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  document.getElementById('clock').textContent = 
    `${String(hours).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  document.getElementById('day').textContent = 
    now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  document.getElementById('date').textContent = now.getDate();
}
updateClock();
setInterval(updateClock, 1000);

// Battery Status
function showBatteryStatus() {
  if (!navigator.getBattery) {
    document.getElementById("batteryStatus").textContent = "Battery API not supported";
    return;
  }

  navigator.getBattery().then(battery => {
    const updateStatus = () => {
      const charging = battery.charging ? "⚡" : "🔋";
      document.getElementById("batteryStatus").textContent = 
        `${charging}${Math.round(battery.level * 100)}%`;
    };
    updateStatus();
    battery.addEventListener('levelchange', updateStatus);
    battery.addEventListener('chargingchange', updateStatus);
  });
}
showBatteryStatus();

// Battery Rings
function applyBatteryRings(selector = '.battery-ring') {
  document.querySelectorAll(selector).forEach(ring => {
    const percent = parseInt(ring.getAttribute('data-percent'), 10) || 0;
    const progressCircle = ring.querySelector('.progress');
    const circumference = 2 * Math.PI * 26;
    progressCircle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
  });
}
applyBatteryRings();

// Screen Management
function disableScreen() {
  document.getElementById("screen").style.display = "none";
}

function home() {
  const screenDiv = document.getElementById("screen");
  const appDiv = document.querySelector(".app");
  const video = appDiv.querySelector("video");
  
  if (video?.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  
  screenDiv.style.display = "block";
  appDiv.style.display = "none";
  appDiv.innerHTML = "";
}

// App Openers
const appOpeners = {
  weather() {
    openIframeApp("https://weather-quiz-website.vercel.app/");
  },
  joke() {
    openIframeApp("https://aaa-joke-generator.vercel.app/");
  },
  spotify() {
    const appDiv = prepareAppDiv();
    const iframe = createIframe("https://open.spotify.com/embed/playlist/37i9dQZF1DX1i3hvzHpcQV");
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    appDiv.appendChild(iframe);
  },
  map() {
    const appDiv = prepareAppDiv();
    const mapDiv = document.createElement("div");
    mapDiv.id = "map";
    mapDiv.style.width = mapDiv.style.height = "100%";
    appDiv.appendChild(mapDiv);
    
    const map = L.map("map").setView([13.0827, 80.2707], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    
    L.Control.geocoder({ defaultMarkGeocode: true })
      .on('markgeocode', e => {
        const { center, name } = e.geocode;
        map.setView(center, 15);
        L.marker(center).addTo(map).bindPopup(name).openPopup();
      })
      .addTo(map);
  },
  clock() {
    const appDiv = prepareAppDiv();
    const clock = document.createElement("div");
    clock.className = "live-clock";
    appDiv.appendChild(clock);
    
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      clock.textContent = 
        `${String(hours).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}:${ampm}`;
    };
    
    update();
    appDiv.dataset.intervalId = setInterval(update, 1000);
  },
  camera() {
    const appDiv = prepareAppDiv();
    const video = document.createElement("video");
    video.style = "width:100%;height:auto;transform:scaleX(-1)";
    video.autoplay = video.playsInline = true;
    appDiv.appendChild(video);
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => video.srcObject = stream)
      .catch(() => alert("Failed to open the Camera"));
  },
  photo() {
    const appDiv = prepareAppDiv();
    const gallery = document.createElement("div");
    gallery.className = "photo-gallery";
    appDiv.appendChild(gallery);
    
    const images = [
      "puppy", "kitten", "doggo", "catto", "pet1",
      "bunny", "hamster", "goldenretriever", "siamese", "husky"
    ].map(seed => `https://picsum.photos/seed/${seed}/800/600`);
    
    let currentIndex = 0;
    const img = document.createElement("img");
    img.className = "gallery-img";
    gallery.appendChild(img);
    
    const createNavBtn = (dir, clickHandler) => {
      const btn = document.createElement("button");
      btn.className = `nav-btn nav-${dir}`;
      btn.innerHTML = dir === 'left' ? "⟨" : "⟩";
      btn.onclick = clickHandler;
      gallery.appendChild(btn);
    };
    
    createNavBtn('left', () => showImage(currentIndex - 1));
    createNavBtn('right', () => showImage(currentIndex + 1));
    
    const showImage = index => {
      currentIndex = (index + images.length) % images.length;
      img.src = images[currentIndex];
    };
    
    showImage(0);
  },
  note() {
    const appDiv = prepareAppDiv();
    const container = document.createElement("div");
    container.className = "note-container";
    
    container.innerHTML = `
      <h2>📝 My Note</h2>
      <textarea class="note-text" placeholder="Type your thoughts here...">${localStorage.getItem("userNote") || ""}</textarea>
      <button class="note-save-btn">💾 Save Note</button>
    `;
    
    const saveBtn = container.querySelector(".note-save-btn");
    saveBtn.onclick = () => {
      localStorage.setItem("userNote", container.querySelector("textarea").value);
      saveBtn.textContent = "✅ Saved!";
      setTimeout(() => saveBtn.textContent = "💾 Save Note", 1500);
    };
    
    appDiv.appendChild(container);
  },
  setting() {
    const appDiv = prepareAppDiv();
    const container = document.createElement("div");
    container.className = "settings-container";
    
    container.innerHTML = `
      <h2>🖥️ System Information</h2>
      <p><strong>Platform:</strong> ${navigator.platform}</p>
      <p><strong>Browser:</strong> ${navigator.appName}</p>
      <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
      <p><strong>Screen Size:</strong> ${screen.width} x ${screen.height}</p>
      <p><strong>Language:</strong> ${navigator.language}</p>
      <p><strong>Status:</strong> ${navigator.onLine ? "Online ✅" : "Offline ❌"}</p>
      <hr />
      <h2>📱 About This App</h2>
      <p><strong>Version:</strong> 1.0.0</p>
      <p><strong>Developer:</strong> Asmath Akbar Ali 😎</p>
    `;
    
    appDiv.appendChild(container);
  },
  mail() {
    const appDiv = prepareAppDiv();
    
    appDiv.innerHTML = `
      <div class="mail-container">
        <h2>📧 Inbox</h2>
        <div class="mail-list">
          ${Array(3).fill().map((_, i) => `
            <div class="mail-item">
              <h3>${["Welcome to DevOS", "Update Available", "Your Subscription"][i]}</h3>
              <p>${[
                "Hi there! Thanks for trying our system. We're thrilled to have you 😄",
                "Your system is now faster than a cat on energy drinks 🐈💨",
                "You're on the free tier, which is totally awesome and 100% chill 😎"
              ][i]}</p>
              <span class="mail-date">Jul ${29 - i}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
  cal() {
    const appDiv = prepareAppDiv();
    
    appDiv.innerHTML = `
      <div class="calculator">
        <input type="text" class="calc-display" readonly />
        <div class="calc-buttons">
          ${["7", "8", "9", "/", "4", "5", "6", "*", 
             "1", "2", "3", "-", "0", ".", "=", "+"]
            .map(val => `<button class="btn">${val}</button>`).join('')}
          <button class="btn clear">C</button>
        </div>
      </div>
    `;
    
    const display = appDiv.querySelector(".calc-display");
    appDiv.querySelectorAll(".btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.textContent === "C") {
          display.value = "";
        } else if (btn.textContent === "=") {
          try { display.value = eval(display.value); } 
          catch { display.value = "Error"; }
        } else {
          display.value += btn.textContent;
        }
      });
    });
  }
};

// Helper functions
function openIframeApp(url) {
  const appDiv = prepareAppDiv();
  const iframe = createIframe(url);
  appDiv.appendChild(iframe);
}

function createIframe(url) {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.border = "none";
  iframe.width = iframe.height = "100%";
  iframe.allowFullscreen = true;
  return iframe;
}

function prepareAppDiv() {
  disableScreen();
  const appDiv = document.querySelector(".app");
  appDiv.style.display = "block";
  appDiv.innerHTML = "";
  return appDiv;
}

// Expose app openers to global scope
Object.entries(appOpeners).forEach(([name, fn]) => {
  window[`open${name.charAt(0).toUpperCase() + name.slice(1)}`] = fn;
});