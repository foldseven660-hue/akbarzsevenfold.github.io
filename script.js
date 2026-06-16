// Daftar lagu. Pastikan nama file sesuai dengan yang ada di folder music/ dan lirik/
const playlist = [
    {
        title: "Lagu Pertama",
        artist: "Artis A",
        audioSrc: "music/Avenged Sevenfold - Dear God _ Lyrics.mp3",
        lyricSrc: "music/dear_god.txt.txt"
    },
    {
        title: "Lagu Kedua",
        artist: "Artis B",
        audioSrc: "music/nama2.mp3",
        lyricSrc: "lirik/nama2.txt"
    }
];

let songIndex = 0;
let isPlaying = false;
let wakeLock = null;

// Elemen DOM
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const title = document.getElementById("song-title");
const artist = document.getElementById("artist-name");
const progress = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("total-duration");
const vinyl = document.getElementById("vinyl");
const lyricsText = document.getElementById("lyrics-text");
const themeBtn = document.getElementById("theme-btn");
const wakeBtn = document.getElementById("wake-btn");
const toggleLyricsBtn = document.getElementById("toggle-lyrics");
const lyricsBox = document.getElementById("lyrics-box");

// 1. Fungsi Inisialisasi Lagu
function loadSong(song) {
    title.innerText = song.title;
    artist.innerText = song.artist;
    audio.src = song.audioSrc;
    loadLyrics(song.lyricSrc);
}

// 2. Fungsi Fetch Lirik dari File .txt
async function loadLyrics(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error("Lirik tidak ditemukan");
        const text = await response.text();
        lyricsText.innerText = text;
    } catch (error) {
        lyricsText.innerText = "Lirik belum tersedia untuk lagu ini.";
    }
}

// 3. Play & Pause
function playSong() {
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    vinyl.style.animationPlayState = 'running';
    audio.play();
}

function pauseSong() {
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    vinyl.style.animationPlayState = 'paused';
    audio.pause();
}

playBtn.addEventListener("click", () => {
    isPlaying ? pauseSong() : playSong();
});

// 4. Next & Prev
function prevSong() {
    songIndex--;
    if (songIndex < 0) songIndex = playlist.length - 1;
    loadSong(playlist[songIndex]);
    playSong();
}

function nextSong() {
    songIndex++;
    if (songIndex > playlist.length - 1) songIndex = 0;
    loadSong(playlist[songIndex]);
    playSong();
}

prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
audio.addEventListener("ended", nextSong); // Auto next saat lagu habis

// 5. Progress Bar
function formatTime(sec) {
    let min = Math.floor(sec / 60);
    let secRemain = Math.floor(sec % 60);
    if (secRemain < 10) secRemain = "0" + secRemain;
    return `${min}:${secRemain}`;
}

audio.addEventListener("timeupdate", (e) => {
    const { currentTime, duration } = e.srcElement;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progress.value = progressPercent;
        currentTimeEl.innerText = formatTime(currentTime);
        durationEl.innerText = formatTime(duration);
    }
});

progress.addEventListener("input", (e) => {
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

// 6. Toggle Light/Dark Mode
themeBtn.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    if (isDark) {
        document.body.removeAttribute("data-theme");
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.setAttribute("data-theme", "dark");
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// 7. Toggle Lirik
toggleLyricsBtn.addEventListener("click", () => {
    lyricsBox.classList.toggle("hidden");
    const isHidden = lyricsBox.classList.contains("hidden");
    toggleLyricsBtn.innerHTML = isHidden 
        ? 'Tampilkan Lirik <i class="fas fa-chevron-down"></i>' 
        : 'Sembunyikan Lirik <i class="fas fa-chevron-up"></i>';
});

// 8. Wake Lock API (Mode Layar Tetap Menyala)
wakeBtn.addEventListener("click", async () => {
    if ('wakeLock' in navigator) {
        if (!wakeLock) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                wakeBtn.classList.add("wake-active");
                wakeBtn.innerHTML = '<i class="fas fa-eye"></i>';
                
                // Jika tab diganti dan balik lagi, wake lock kadang lepas, ini untuk mencegahnya
                document.addEventListener('visibilitychange', async () => {
                    if (wakeLock !== null && document.visibilityState === 'visible') {
                        wakeLock = await navigator.wakeLock.request('screen');
                    }
                });
            } catch (err) {
                alert("Gagal mengaktifkan mode layar menyala.");
            }
        } else {
            wakeLock.release().then(() => {
                wakeLock = null;
                wakeBtn.classList.remove("wake-active");
                wakeBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            });
        }
    } else {
        alert("Browser kamu tidak mendukung fitur Layar Tetap Menyala.");
    }
});

// Jalankan lagu pertama saat halaman dimuat
loadSong(playlist[songIndex]);
