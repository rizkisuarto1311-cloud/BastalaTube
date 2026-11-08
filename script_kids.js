if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker terdaftar!', reg))
      .catch(err => console.error('Gagal daftar Service Worker', err));

    updateStatusBar('home');
    updateContentLayout('home');
  });
}

// === FUNGSI KLIK DI CATEGORY === //
document.addEventListener('DOMContentLoaded', () => {
  const categories = document.querySelectorAll('.chip');
  const handleCategoryClick = function() {
    const currentActive = document.querySelector('.chip.active');
    if (currentActive && currentActive !== this) {
      currentActive.classList.remove('active');
    }
    if (!this.classList.contains('active')) {
      this.classList.add('active');
      const kategoriNama = this.innerText.trim();
      console.log("Mencari video untuk kategori:", kategoriNama);
    }
  };
  categories.forEach(chip => {
    chip.addEventListener('click', handleCategoryClick);
  });
});

// === FUNGSI HEADER & NAV DINAMIS === //
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const bottomNav = document.getElementById('bottomNav');
  const detailPage = document.getElementById('videoDetailPage');
  const statusbarHeight = 30;
  const hHeight = (header?.offsetHeight || 105) + statusbarHeight;
  const bHeight = bottomNav?.offsetHeight || 60;

  let lastPos = 0;
  let hTrans = 0;
  let bTrans = 0;

  const updateNav = (currentPos) => {
    const isDetail = detailPage?.classList.contains('active');
    const diff = currentPos - lastPos;

    if (!isDetail) {
      hTrans = Math.max(-(hHeight + 35), Math.min(0, hTrans - diff));
    } else {
      hTrans = -hHeight;
    }

    if (!isDetail) {
      bTrans = Math.max(0, Math.min(bHeight, bTrans + diff));
    } else {
      bTrans = bHeight;
    }

    requestAnimationFrame(() => {
      if (header) header.style.transform = `translateY(${hTrans}px)`;
      if (bottomNav) bottomNav.style.transform = `translateY(${bTrans}px)`;
    });

    lastPos = currentPos;
  };

  const scrollTarget = [
    { el: window, getPos: () => window.scrollY },
    { el: detailPage, getPos: () => detailPage.scrollTop }
  ];

  scrollTarget.forEach(target => {
    if (!target.el) return;
    target.el.addEventListener('scroll', () => {
      const isDetail = detailPage?.classList.contains('active');
      const pos = target.getPos();
      if ((target.el === window && !isDetail) || (target.el === detailPage && isDetail)) {
        updateNav(pos);
      }
    }, { passive: true });
  });
});

// ==== FUNGSI KETERANGAN BAWAH VIDEO ==== //
const videoFeed = document.getElementById('videoFeed');

function getMetaOtomatis(judul) {
  let hash = 0;
  for (let i = 0; i < judul.length; i++) {
    hash = judul.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);
  
  // Ambil angka 0-99 sebagai "bola undian"
  const peluang = seed % 100; 
  let kategori;

  // --- ATUR PERSENTASE (TOTAL 100%) ---
  // 30% Tahun (0-29)
  if (peluang < 30) {
    kategori = { unit: "tahun", min: 1, max: 8 };
  } 
  // 25% Bulan (30-54)
  else if (peluang < 55) {
    kategori = { unit: "bulan", min: 1, max: 11 };
  } 
  // 20% Minggu (55-74)
  else if (peluang < 75) {
    kategori = { unit: "minggu", min: 1, max: 3 };
  } 
  // 15% Jam (75-89)
  else if (peluang < 90) {
    kategori = { unit: "jam", min: 1, max: 23 };
  } 
  // 5% Menit (90-99)
  else {
    kategori = { unit: "menit", min: 1, max: 59 };
  }

  // Hitung angka acak di dalam rentang kategori yang terpilih
  const angka = (seed % (kategori.max - kategori.min + 1)) + kategori.min;

  return {
    waktu: `${angka} ${kategori.unit} yang lalu`,
    channel: "Koleksi Ayah Bunda"
  };
}

function generateSeed(judul) {
  let hash = 0;
  for (let i = 0; i < judul.length; i++) {
    hash = judul.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function formatAngkaYoutube(angka) {
  if (angka >= 1000000) {
    return (angka / 1000000).toFixed(1).replace('.', ',') + " jt";
  } else if (angka >= 1000) {
    return Math.floor(angka / 1000) + " rb";
  }
  return angka.toString();
}

function getStatsOtomatis(judul, waktu) {
  const seed = generateSeed(judul);
  let rawViews = (seed % 1990000) + 10000; // Default views untuk video lama

  if (waktu) {
    if (waktu.includes("menit")) {  
      // Video baru (menit): Minimal 1.000, maksimal 5.000 views
      rawViews = (seed % 4000) + 1000;  
    } 
    else if (waktu.includes("jam")) {  
      // Video beberapa jam lalu: Mulai dari 5.000 hingga puluhan ribu
      const angkaJam = parseInt(waktu) || 1;  
      rawViews = Math.floor((seed % 20000) * (angkaJam / 2)) + 5000;   
    } 
    else if (waktu.includes("minggu")) {  
      // Video beberapa minggu lalu: Ratusan ribu
      const angkaMinggu = parseInt(waktu) || 1;
      rawViews = Math.floor((seed % 500000) * (angkaMinggu / 4)) + 50000;
    } 
    else if (waktu.includes("bulan")) {  
      // Video berbulan-bulan lalu: Jutaan
      const angkaBulan = parseInt(waktu) || 1;
      rawViews = Math.floor((seed % 1000000) * (angkaBulan / 12)) + 100000;
    }
    // Jika "tahun", biarkan rawViews tetap besar (default)
  }

  const persentaseLike = (seed % 6) + 2; 
  const rawLikes = Math.floor(rawViews * (persentaseLike / 100));

  return {
    views: formatAngkaYoutube(rawViews),
    likes: formatAngkaYoutube(rawLikes)
  };
}


function getKomentarOtomatis(judul) {
  const seed = generateSeed(judul);
  const jumlah = (seed % 900) + 50;
  if (jumlah > 850 && seed % 2 === 0) {
    return (jumlah / 100).toFixed(1).replace('.', ',') + " rb";
  }
  return jumlah.toLocaleString('id-ID');
}

// ==== FUNGSI RENDER VIDEO (UI LOGIC) ==== //
function displayVideos(videos, append = false) {
  if (!videoFeed) return;
  if (!append) videoFeed.innerHTML = "";

  videos.forEach((video, index) => {
    const meta = getMetaOtomatis(video.title);
    const stats = getStatsOtomatis(video.title, meta.waktu);

    const card = document.createElement('div');
    card.className = 'video-card';

    card.innerHTML = `
      <div class="thumb-container">
        <img src="https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg" loading="lazy" alt="${video.title}" onerror="this.src='fallback.jpg'">
        <span class="duration">${video.duration || "0:00"}</span>
      </div>
      <div class="v-details">
        <div class="v-avatar-container">
          <img src="ayah.jpg" alt="Channel Avatar" class="v-avatar-img">
        </div>
        <div class="v-text">
          <div class="title-row">
            <h3 class="video-title">${video.title}</h3>
            <i class="bi bi-three-dots-vertical menu-btn"></i>
          </div>
          <p>
            <b>${meta.channel}</b> • ${stats.views} ditonton • ${meta.waktu}
          </p>
        </div>
      </div>
    `;

    card.onclick = () => bukaDetailVideo(video);
    videoFeed.appendChild(card);

    requestAnimationFrame(() => {
      setTimeout(() => { card.classList.add('muncul'); }, index * 10);
    });
  });
}

// ==== LOGIKA FILTER & INFINITE SCROLL ==== //
document.addEventListener('DOMContentLoaded', () => {
  const detailPage = document.getElementById('videoDetailPage');
  const rekomendasiSection = document.getElementById('rekomendasiSection');
  const categories = document.querySelectorAll('.chip');

  if (detailPage) {
    detailPage.addEventListener('scroll', () => {
      const sisaScroll = detailPage.scrollHeight - detailPage.scrollTop - detailPage.clientHeight;
      if (sisaScroll < 1000 && !sedangMemuat) {
        sedangMemuat = true;
        setTimeout(() => {
          if (typeof videoLibrary !== 'undefined') {
            const videoBaru = kocokVideo(videoLibrary).slice(0, 6);
            tambahRekomendasi(videoBaru, rekomendasiSection);
          }
          sedangMemuat = false;
        }, 200);
      }
    }, { passive: true });
  }

  categories.forEach(chip => {
    chip.addEventListener('click', function() {
      const currentActive = document.querySelector('.chip.active');
      if (currentActive) currentActive.classList.remove('active');
      this.classList.add('active');

      const kategoriNama = this.innerText.trim();
      if (typeof videoLibrary !== 'undefined') {
        if (kategoriNama === "Semua") {
          displayVideos(videoLibrary);
        } else {
          const filtered = videoLibrary.filter(v => v.category === kategoriNama);
          displayVideos(filtered);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  if (typeof videoLibrary !== 'undefined') {
    displayVideos(videoLibrary);
  }
});

// ==== FUNGSI INFINITE SCROLL BERANDA ==== //
function kocokVideo(array) {
  let copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

let sedangMemuat = false;

function muatVideoLagi() {
  if (sedangMemuat) return;
  sedangMemuat = true;

  if (typeof videoLibrary !== 'undefined') {
    const videoAcak = kocokVideo(videoLibrary).slice(0, 6);
    requestAnimationFrame(() => {
      displayVideos(videoAcak, true);
      setTimeout(() => { sedangMemuat = false; }, 100);
    });
  }
}

window.addEventListener('scroll', () => {
  const tinggiKonten = document.body.offsetHeight;
  const posisiSekarang = window.innerHeight + window.scrollY;
  const sisaPixel = tinggiKonten - posisiSekarang;
  const sisaPersen = (sisaPixel / tinggiKonten) * 100;

  if ((sisaPixel < 2500 || sisaPersen < 30) && !sedangMemuat) {
    muatVideoLagi();
  }
}, { passive: true });

let isPortrait = false; 
let currentYouTubePlayer = null; // <--- TAMBAHKAN BARIS INI

// ==== FUNGSI BUKA DETAIL VIDEO ==== //
function bukaDetailVideo(video, isAutomatic = false, suaraDariVideoLama = true) {
  const detailPage = document.getElementById('videoDetailPage');
  const playerArea = document.getElementById('playerContent');
  const targetRekomendasi = document.getElementById('rekomendasiSection');
  const bottomNav = document.getElementById('bottomNav');

  updateStatusBar('normal_video');
  updateContentLayout('normal_video');

  if (bottomNav) {
    bottomNav.style.transform = 'translateY(100%)';
    bottomNav.style.transition = 'transform 0.3s ease';
  }
  lastPos = 0;

  if (targetRekomendasi) targetRekomendasi.innerHTML = "";
  const ytId = video.youtubeId || "";

  playerArea.innerHTML = `
  <div class="video-container" id="vContainer" style="background:#000;">
    <div id="ytPlayerApi" style="position:absolute; top:0; left:0; width:100%; height:100%;"></div>
    
    <!-- PROGRESS BAR MERAH -->
    <div id="progressContainer" style="position:absolute; bottom:0; left:0; width:100%; height:2px; background:rgba(255,255,255,0.2); z-index:99; pointer-events:none;">
      <div id="progressBar" style="height:100%; width:0%; background:#ff0000; transition: width 0.1s linear;"></div>
    </div>
  </div>`;

  setTimeout(() => {
  if (typeof YT !== 'undefined' && YT.Player) {
    currentYouTubePlayer = new YT.Player('ytPlayerApi', { // <--- Simpan ke variabel global
      videoId: ytId,
      playerVars: {
        'autoplay': 1,
        'rel': 0,
        'modestbranding': 1,
        'iv_load_policy': 3
      },
      events: {
        'onReady': function(event) {
          event.target.playVideo();
          mulaiProgressBar(event.target);
        },
        'onStateChange': function(event) {
          // Kode 0 berarti video YouTube telah SELESAI diputar
          if (event.data === 0) {
            console.log("Video selesai, memutar video acak berikutnya...");
            putarVideoOtomatis(); // <--- Panggil fungsi ini saat selesai
          }
        }
      }
    });
  } else {
    console.error("YouTube API belum termuat!");
  }
}, 100);

  const meta = getMetaOtomatis(video.title);
  const stats = getStatsOtomatis(video.title, meta.waktu);
  const jmlKomentar = getKomentarOtomatis(video.title);

  document.getElementById('detailTitle').innerText = video.title;
  document.getElementById('detailViews').innerText = stats.views + " x ditonton";
  document.getElementById('detailDate').innerText = meta.waktu;
  
// Mengisi data untuk panel "Selengkapnya"
document.getElementById('fullDescTitle').innerText = video.title;
document.getElementById('fullDescViews').innerText = stats.views;
document.getElementById('fullDescLikes').innerText = stats.likes;

// Format tanggal
// Membuat format tanggal palsu yang realistis (Tahun di atas, Tanggal Bulan di bawah)
const bulanIndo = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const sekarang = new Date();
let tahunKurang = 0;
let bulanAcak, tanggalAcak;

// Hitung mundur tahun berdasarkan teks "X tahun/bulan/minggu/jam yang lalu"
if (meta.waktu.includes("tahun")) {
  tahunKurang = parseInt(meta.waktu);
} else if (meta.waktu.includes("bulan")) {
  tahunKurang = 0; // Tetap di tahun ini
} else {
  tahunKurang = 0; // Tetap di tahun ini
if (!history.state || history.state.page !== "detail") {
    history.pushState({ page: "detail" }, "Detail Video", "#detail");
}
      playerWrapper.style.transform = `translateY(${moveVideo}px)`;
      const moveContent = viewHeight - (viewHeight * progress);
      scrollContent.style.transform = `translateY(${moveContent}px)`;
      scrollContent.style.opacity = progress;
      detailPage.style.backgroundColor = `rgba(0, 0, 0, ${0.5 + (progress * 0.5)})`;
    }
  }, { passive: false });

  detailPage.addEventListener('touchend', (e) => {
    if (Math.abs(distY) < 5) return;
    if (!detailPage.classList.contains('dragging')) return;
    detailPage.classList.remove('dragging');

    const duration = Date.now() - startTime;
    const velocity = distY / duration;
    const vContainer = document.getElementById('vContainer');

    if (isPortrait && distY < -50) {
      isPortrait = false;
      updateStatusBar('normal_video');
      updateContentLayout('normal_video');

      if (vContainer) vContainer.classList.remove('mode-portrait');

      const styleBalik = 'all 0.3s cubic-bezier(0.2, 0, 0, 1)';
      playerWrapper.style.transition = styleBalik;
      scrollContent.style.transition = styleBalik;

      requestAnimationFrame(() => {
        playerWrapper.style.transform = 'translateY(0)';
        scrollContent.style.transform = 'translateY(0)';
        scrollContent.style.opacity = '1';
        detailPage.style.backgroundColor = '#000';
        if (bottomNav) {
          bottomNav.style.transition = 'transform 0.3s ease';
          bottomNav.style.transform = 'translateY(100%)';
        }
      });
      setTimeout(() => {
        playerWrapper.style.transition = '';
        scrollContent.style.transition = '';
      }, 300);
      return;
    }

    if (velocity > 0.5 || distY > 100) {
      isPortrait = true;
      updateStatusBar('portrait_video');
      updateContentLayout('portrait_video');

      if (vContainer) vContainer.classList.add('mode-portrait');

      if (bottomNav) {
        bottomNav.style.transition = 'transform 0.3s ease';
        bottomNav.style.transform = 'translateY(100%)';
      }

      const midPoint = window.innerHeight * 0.3;
      playerWrapper.style.transition = 'all 0.3s cubic-bezier(0.2, 0, 0, 1)';
      scrollContent.style.transition = 'all 0.3s ease';
      playerWrapper.style.transform = `translateY(${midPoint}px)`;
      scrollContent.style.transform = `translateY(${window.innerHeight}px)`;
      scrollContent.style.opacity = '0';
      detailPage.style.backgroundColor = '#000';
    } else {
      if (vContainer) vContainer.classList.remove('mode-portrait');
      const styleBalik = 'all 0.25s ease-out';
      playerWrapper.style.transition = styleBalik;
      scrollContent.style.transition = styleBalik;

      requestAnimationFrame(() => {
        playerWrapper.style.transform = 'translateY(0)';
        scrollContent.style.transform = 'translateY(0)';
        scrollContent.style.opacity = '1';
        detailPage.style.backgroundColor = '#000';
        if (bottomNav) bottomNav.style.transform = 'translateY(100%)';
      });
      setTimeout(() => {
        playerWrapper.style.transition = '';
        scrollContent.style.transition = '';
      }, 250);
    }
    distY = 0;
  });

  // Hanya tambahkan history jika kita baru masuk dari beranda
if (!history.state || history.state.page !== "detail") {
  history.pushState({ page: "detail" }, "Detail Video", "#detail");
}

  if (isPortrait) {
    const vContainer = document.getElementById('vContainer');

    if (vContainer) vContainer.classList.add('mode-portrait');
    if (scrollContent) {
      scrollContent.style.transform = `translateY(${window.innerHeight}px)`;
      scrollContent.style.opacity = '0';
    }
    if (playerWrapper) {
      const midPoint = window.innerHeight * 0.3;
      playerWrapper.style.transform = `translateY(${midPoint}px)`;
    }
  }
}

function formatWaktu(detik) {
  if (isNaN(detik)) return "0:00";
  let m = Math.floor(detik / 60);
  let s = Math.floor(detik % 60);
  return m + ":" + (s < 10 ? "0" + s : s);
}

let progressInterval = null;

function mulaiProgressBar(player) {
  // Hentikan interval lama jika ada
  if (progressInterval) clearInterval(progressInterval);

  progressInterval = setInterval(() => {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar || !player || typeof player.getCurrentTime !== 'function') return;

    // Cek apakah video sedang diputar atau di-pause
    const state = player.getPlayerState();
    if (state === 1 || state === 2) { // 1 = playing, 2 = paused
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      
      if (duration > 0) {
        const persentase = (currentTime / duration) * 100;
        progressBar.style.width = persentase + '%';
      }
    }
  }, 250); // Update setiap 250ms
}

// ==== FUNGSI PEMBUAT KARTU VIDEO (REUSABLE) ==== //
function buatElemenVideo(v) {
  const stats = getStatsOtomatis(v.title);
  const meta = getMetaOtomatis(v.title);

  const card = document.createElement('div');
  card.className = 'video-card';

  card.innerHTML = `
    <div class="thumb-container">
      <img src="https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg" loading="lazy" alt="${v.title}" onerror="this.src='fallback.jpg'">
      <span class="duration">${v.duration || "0:00"}</span>
    </div>
    <div class="v-details">
      <div class="v-avatar-container">
        <img src="ayah.jpg" alt="Avatar" class="v-avatar-img">
      </div>
      <div class="v-text">
        <div class="title-row">
          <h3 class="video-title">${v.title}</h3>
          <i class="bi bi-three-dots-vertical menu-btn"></i>
        </div>
        <p><b>${meta.channel}</b> • ${stats.views} ditonton • ${meta.waktu}</p>
      </div>
    </div>
  `;
  return card;
}

// ==== FUNGSI TAMBAH REKOMENDASI ==== //
function tambahRekomendasi(videos, target, append = true) {
  if (!target) return;
  if (!append) target.innerHTML = "";

  videos.forEach((v, index) => {
    const card = buatElemenVideo(v);
    card.onclick = () => {
      const detailPage = document.getElementById('videoDetailPage');
      if (detailPage) {
        detailPage.scrollTo({ top: 0, behavior: 'instant' });
      }
      bukaDetailVideo(v);
    };
    target.appendChild(card);
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add('muncul'), index * 15);
    });
  });
}

// ==== MONITORING TOMBOL BACK HP ==== //
window.addEventListener('popstate', function(event) {
  const detailPage = document.getElementById('videoDetailPage');
  const descOverlay = document.getElementById('descriptionOverlay');
  const descBottomSheet = document.querySelector('.desc-bottom-sheet');
  const detailScrollContent = document.querySelector('.detail-scroll-content');

  // 1. JIKA PANEL SELENGKAPNYA SEDANG TERBUKA
  if (descOverlay && descOverlay.classList.contains('active')) {
    // Turunkan panel selengkapnya
    descBottomSheet.style.transform = 'translateY(100%)';
    setTimeout(() => {
      descOverlay.classList.remove('active');
      if (detailScrollContent) detailScrollContent.classList.remove('hidden-content');
      setTimeout(() => { descBottomSheet.style.transform = ''; }, 50); 
    }, 300);
    
    // KUNCI 1: Isi ulang history dengan state detail
    // Agar saat user back lagi dari video, browser tidak bingung
    history.pushState({ page: "detail" }, "Detail Video", "#detail");
    return; 
  }

  // 2. JIKA VIDEO TERBUKA (TAPI PANEL TERTUTUP)
  if (detailPage && detailPage.classList.contains('active')) {
    tutupDetailVideoManual();
    
    // KUNCI 2: Set state beranda
    history.pushState({ page: "home" }, "Beranda", window.location.pathname);
  }
});

// ==== FUNGSI TUTUP VIDEO MANUAL ==== //
function tutupDetailVideoManual() {
  if (progressInterval) clearInterval(progressInterval); 
  progressInterval = null;

  const detailPage = document.getElementById('videoDetailPage');
  const header = document.getElementById('header');
  const bottomNav = document.getElementById('bottomNav');
  const player = document.getElementById('playerContent');

  isPortrait = false;

  updateStatusBar('home');
  updateContentLayout('home');

  const scrollContent = detailPage.querySelector('.detail-scroll-content');
  const playerWrapper = detailPage.querySelector('.player-wrapper');

  if (player) player.innerHTML = "";
  detailPage.classList.remove('active');

  detailPage.style.backgroundColor = "";
  detailPage.style.transition = "";

  if (scrollContent) {
    scrollContent.style.transform = "";
    scrollContent.style.opacity = "";
    scrollContent.style.transition = "";
  }
  if (playerWrapper) {
    playerWrapper.style.transform = "";
    playerWrapper.style.transition = "";
    playerWrapper.style.backgroundColor = "";
  }

  requestAnimationFrame(() => {
    if (header) header.style.transform = 'translateY(0)';
    if (bottomNav) bottomNav.style.transform = 'translateY(0)';
    document.body.style.overflow = 'auto';
  });

  setTimeout(() => {
    detailPage.style.display = 'none';
    detailPage.scrollTop = 0;
  }, 400);
}

function putarVideoOtomatis() {
  if (typeof videoLibrary !== 'undefined' && videoLibrary.length > 0) {
    const judulSekarang = document.getElementById('detailTitle').innerText;
    const daftarPilihan = videoLibrary.filter(v => v.title !== judulSekarang);

    if (daftarPilihan.length === 0) return;

    // Ambil video acak
    const videoBerikutnya = daftarPilihan[Math.floor(Math.random() * daftarPilihan.length)];

    // Hancurkan player YouTube lama agar tidak ada suara dobel
    if (currentYouTubePlayer && typeof currentYouTubePlayer.destroy === 'function') {
      currentYouTubePlayer.destroy();
      currentYouTubePlayer = null;
    }

    const detailPage = document.getElementById('videoDetailPage');
    if (detailPage) {
      detailPage.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Panggil fungsi buka video (secara manual, bukan otomatis, karena YouTube akan diputar baru)
    bukaDetailVideo(videoBerikutnya, false, false);
  }
}

function updateStatusBar(state) {
  if (typeof Android !== "undefined") {
    Android.setStatusBarStyle(state);
  }
}

function updateContentLayout(state) {
  document.body.classList.remove('mode-home', 'mode-normal-video', 'mode-portrait-video');
  if (state !== 'none') {
    document.body.classList.add('mode-' + state);
  }
}

// ==== FITUR PENCARIAN ==== //
document.addEventListener('DOMContentLoaded', () => {
  const openSearchBtn = document.getElementById('openSearch');
  const closeSearchBtn = document.getElementById('closeSearch');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchForm = document.getElementById('searchForm');

  // Buka Overlay Pencarian
  if (openSearchBtn) {
    openSearchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('active');
      setTimeout(() => searchInput.focus(), 300); // Fokus otomatis ke input
    });
  }

  // Tutup Overlay Pencarian
  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', () => {
      searchOverlay.classList.remove('active');
      searchInput.value = ""; // Bersihkan input
      searchResults.innerHTML = ""; // Bersihkan hasil
    });
  }

  // Mencegah form reload halaman saat enter ditekan
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault(); 
    });
  }

  // Logika Pencarian Real-time saat mengetik
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const keyword = this.value.toLowerCase().trim();
      
      // Jika input kosong, bersihkan hasil
      if (keyword === "") {
        searchResults.innerHTML = "";
        return;
      }

      // Cari video berdasarkan judul ATAU kategori
      const filtered = videoLibrary.filter(video => 
        video.title.toLowerCase().includes(keyword) || 
        video.category.toLowerCase().includes(keyword)
      );

      // Tampilkan hasil
      renderSearchResults(filtered);
    });
  }

  // Fungsi untuk merender hasil pencarian
  function renderSearchResults(videos) {
    searchResults.innerHTML = "";

    if (videos.length === 0) {
      searchResults.innerHTML = `<p style="text-align:center; padding: 20px; color:#606060;">Video tidak ditemukan.</p>`;
      return;
    }

    videos.forEach(video => {
      const meta = getMetaOtomatis(video.title);
      const stats = getStatsOtomatis(video.title, meta.waktu);

      const card = document.createElement('div');
      card.className = 'video-card';

      // Template kartu untuk hasil pencarian
      card.innerHTML = `
        <div class="v-details">
          <div class="v-avatar-container">
            <img src="https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg" alt="Thumb" style="width: 60px; height: 40px; border-radius: 8px; object-fit: cover;">
          </div>
          <div class="v-text">
            <div class="title-row">
              <h3 class="video-title">${video.title}</h3>
            </div>
            <p>
              <b>${meta.channel}</b> • ${stats.views} ditonton • ${meta.waktu}
            </p>
          </div>
        </div>
      `;

      // Jika diklik, buka video dan tutup overlay pencarian
      card.onclick = () => {
        searchOverlay.classList.remove('active');
        searchInput.value = "";
        searchResults.innerHTML = "";
        bukaDetailVideo(video);
      };

      searchResults.appendChild(card);
    });
  }
});

function showHomeAfterReady() {
  const intro = document.getElementById('introAnimation');
  if (!intro) return;
  intro.classList.add('intro-hide');
  setTimeout(() => {
    intro.remove();
  }, 450);
}

// ==== FITUR SELENGKAPNYA (BOTTOM SHEET) ==== //
document.addEventListener('DOMContentLoaded', () => {
    const selengkapnyaBtn = document.querySelector('.selengkapnya');
    const descOverlay = document.getElementById('descriptionOverlay');
    const descBottomSheet = document.querySelector('.desc-bottom-sheet');
    const closeDescBtn = document.getElementById('closeDescBtn');

    // Buka Panel
    if (selengkapnyaBtn) {
        selengkapnyaBtn.addEventListener('click', () => {
            descOverlay.classList.add('active');
            descBottomSheet.style.transform = ''; // Reset posisi
        });
    }

// Tutup Panel (via tombol X) dengan efek meluncur
if (closeDescBtn) {
    closeDescBtn.addEventListener('click', () => {
        // 1. Geser panel ke bawah dulu
        descBottomSheet.style.transform = 'translateY(100%)';
        
        // 2. Tunggu animasi selesai (0.3 detik), baru hilangkan overlay
        setTimeout(() => {
            descOverlay.classList.remove('active');
            // 3. Reset posisi setelah benar-benar tertutup
            setTimeout(() => {
                descBottomSheet.style.transform = '';
            }, 50); 
        }, 300); // Sesuaikan dengan durasi transisi di CSS (0.3s)
    });
}

    // Tutup Panel jika klik di luar area putih
    if (descOverlay) {
        descOverlay.addEventListener('click', (e) => {
            if (e.target === descOverlay) {
                descOverlay.classList.remove('active');
            }
        });
    }

    // --- FITUR SWIPE TO CLOSE (TARIK KE BAWAH) ---
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    if (descBottomSheet) {
        // Saat jari menyentuh layar
        descBottomSheet.addEventListener('touchstart', (e) => {
            // Hanya izinkan swipe jika panel sedang scroll paling atas
            if (descBottomSheet.scrollTop <= 0) {
                startY = e.touches[0].clientY;
                isDragging = true;
                // Matikan transisi CSS saat jari menempel agar gerakannya instan
                descBottomSheet.style.transition = 'none'; 
            }
        }, { passive: true });

        // Saat jari digeser
        descBottomSheet.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            currentY = e.touches[0].clientY;
            const diffY = currentY - startY;

            // Jika ditarik ke bawah (nilai positif)
            if (diffY > 0) {
                // Geser panelnya mengikuti jari
                descBottomSheet.style.transform = `translateY(${diffY}px)`;
            }
        }, { passive: true });

        // Saat jari dilepas
        descBottomSheet.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            // Kembalikan transisi CSS
            descBottomSheet.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';

            const diffY = currentY - startY;

            // Jika ditarik cukup jauh (lebih dari 100px), tutup panelnya
            if (diffY > 100) {
                descOverlay.classList.remove('active');
                // Reset posisi setelah animasi selesai
                setTimeout(() => {
                    descBottomSheet.style.transform = '';
                }, 300);
            } else {
                // Jika tarikan sedikit, kembalikan ke posisi semula (snap back)
                descBottomSheet.style.transform = 'translateY(0)';
            }

            // Reset variabel
            startY = 0;
            currentY = 0;
        });
    }
});
