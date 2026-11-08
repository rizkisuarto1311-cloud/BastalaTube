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
  const peluang = seed % 100; 
  let kategori;

  if (peluang < 30) {
    kategori = { unit: "tahun", min: 1, max: 8 };
  } else if (peluang < 55) {
    kategori = { unit: "bulan", min: 1, max: 11 };
  } else if (peluang < 75) {
    kategori = { unit: "minggu", min: 1, max: 3 };
  } else if (peluang < 90) {
    kategori = { unit: "jam", min: 1, max: 23 };
  } else {
    kategori = { unit: "menit", min: 1, max: 59 };
  }

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
  let rawViews = (seed % 1990000) + 10000; 

  if (waktu) {
    if (waktu.includes("menit")) {  
      rawViews = (seed % 4000) + 1000;  
    } 
    else if (waktu.includes("jam")) {  
      const angkaJam = parseInt(waktu) || 1;  
      rawViews = Math.floor((seed % 20000) * (angkaJam / 2)) + 5000;   
    } 
    else if (waktu.includes("minggu")) {  
      const angkaMinggu = parseInt(waktu) || 1;
      rawViews = Math.floor((seed % 500000) * (angkaMinggu / 4)) + 50000;
    } 
    else if (waktu.includes("bulan")) {  
      const angkaBulan = parseInt(waktu) || 1;
      rawViews = Math.floor((seed % 1000000) * (angkaBulan / 12)) + 100000;
    }
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
let currentYouTubePlayer = null;

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
    <div id="progressContainer" style="position:absolute; bottom:0; left:0; width:100%; height:2px; background:rgba(255,255,255,0.2); z-index:99; pointer-events:none;">
      <div id="progressBar" style="height:100%; width:0%; background:#ff0000; transition: width 0.1s linear;"></div>
    </div>
  </div>`;

  setTimeout(() => {
    if (typeof YT !== 'undefined' && YT.Player) {
      currentYouTubePlayer = new YT.Player('ytPlayerApi', {
        videoId: ytId,
        playerVars: { 'autoplay': 1, 'rel': 0, 'modestbranding': 1, 'iv_load_policy': 3 },
        events: {
          'onReady': function(event) {
            event.target.playVideo();
            mulaiProgressBar(event.target);
          },
          'onStateChange': function(event) {
            if (event.data === 0) {
              putarVideoOtomatis(); 
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
  
  document.getElementById('fullDescTitle').innerText = video.title;
  document.getElementById('fullDescViews').innerText = stats.views;
  document.getElementById('fullDescLikes').innerText = stats.likes;

  const bulanIndo = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const sekarang = new Date();
  let tahunKurang = 0;

  if (meta.waktu.includes("tahun")) {
    tahunKurang = parseInt(meta.waktu);
  } else if (meta.waktu.includes("bulan")) {
    tahunKurang = 0; 
  } else {
    tahunKurang = 0; 
  }

  const tahunTampil = sekarang.getFullYear() - tahunKurang;
  const indexBulan = Math.floor(Math.random() * 12);
  const tanggalTampil = Math.floor(Math.random() * 28) + 1;
  const bulanTampil = bulanIndo[indexBulan];

  document.getElementById('fullDescDate').innerHTML = `
    ${tahunTampil}<br><span style="font-size: 11px; font-weight: normal; color: #606060;">${tanggalTampil} ${bulanTampil}</span>
  `;

  document.getElementById('fullDescText').innerText = `Koleksi Ayah Bunda akan menemani bayi dan balita Anda belajar sambil bernyanyi! Lewat lagu-lagu anak dengan lirik sederhana serta melodi yang ceria, video ini dirancang untuk membantu perkembangan bahasa, motorik, dan kognitif si kecil.\n\nDalam video ini, si kecil diajak untuk aktif bergerak, menyanyi, dan belajar hal-hal baru dengan cara yang menyenangkan.`;

  const likeLabel = document.querySelector('.btn-group button span');
  if (likeLabel) likeLabel.innerText = stats.likes;

  const commentCountElement = document.getElementById('commentCount');
  if (commentCountElement) commentCountElement.innerText = jmlKomentar;

  const elementTeksKomentar = document.getElementById('commentText');
  const elementFotoKomentar = document.getElementById('commentUserImg');

  if (elementTeksKomentar && typeof daftarKomentar !== 'undefined') {
    let hash = 0;
    for (let i = 0; i < video.title.length; i++) {
      hash = video.title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const indexKomentar = Math.abs(hash) % daftarKomentar.length;
    elementTeksKomentar.innerText = daftarKomentar[indexKomentar];
    if (elementFotoKomentar) elementFotoKomentar.src = "MAMA.JPG";
  }

  if (targetRekomendasi && typeof videoLibrary !== 'undefined') {
    const videoLainnya = videoLibrary
      .filter(v => v.title !== video.title)
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);
    tambahRekomendasi(videoLainnya, targetRekomendasi);
  }

  detailPage.style.display = 'block';
  requestAnimationFrame(() => { detailPage.scrollTop = 0; });
  setTimeout(() => { detailPage.classList.add('active'); }, 40);
  document.body.style.overflow = 'hidden';

  const scrollContent = detailPage.querySelector('.detail-scroll-content');
  const playerWrapper = detailPage.querySelector('.player-wrapper');
  let startY = 0;
  let distY = 0;
  let startTime = 0;

  detailPage.addEventListener('touchstart', (e) => {
    const videoHeight = playerWrapper ? playerWrapper.offsetHeight : 250;
    const touchY = e.touches[0].clientY;

    if (detailPage.scrollTop <= 0 && touchY > videoHeight) {
      startY = touchY;
      startTime = Date.now();
      detailPage.classList.add('dragging');
      scrollContent.style.transition = 'none';
      playerWrapper.style.transition = 'none';
    }
  }, { passive: true });

  detailPage.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].clientY;
    distY = currentY - startY;

    if (detailPage.classList.contains('dragging') && distY > 0 && !isPortrait) {
      e.preventDefault();
      detailPage.style.backgroundColor = `rgba(0, 0, 0, ${Math.min(distY / 300, 1)})`;
      scrollContent.style.transform = `translateY(${distY}px)`;
      scrollContent.style.opacity = Math.max(0, 1 - (distY / 200));
      playerWrapper.style.transform = `translateY(${Math.min(distY * 0.4, window.innerHeight * 0.3)}px)`;
    }

    if (bottomNav) {
      bottomNav.style.transform = `translateY(100%)`;
    }

    if (isPortrait && distY < 0) {
      if (e.cancelable) e.preventDefault();
      const viewHeight = window.innerHeight;
      const posisiTengah = viewHeight * 0.3;
      const jarakMaksimal = posisiTengah;
      const currentDist = Math.abs(distY);
      const progress = Math.min(currentDist / jarakMaksimal, 1);

      const moveVideo = posisiTengah - (posisiTengah * progress);
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

  // Penempatan history.pushState yang sudah benar
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
  if (progressInterval) clearInterval(progressInterval);

  progressInterval = setInterval(() => {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar || !player || typeof player.getCurrentTime !== 'function') return;

    const state = player.getPlayerState();
    if (state === 1 || state === 2) {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      
      if (duration > 0) {
        const persentase = (currentTime / duration) * 100;
        progressBar.style.width = persentase + '%';
      }
    }
  }, 250);
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

  if (descOverlay && descOverlay.classList.contains('active')) {
    descBottomSheet.style.transform = 'translateY(100%)';
    setTimeout(() => {
      descOverlay.classList.remove('active');
      if (detailScrollContent) detailScrollContent.classList.remove('hidden-content');
      setTimeout(() => { descBottomSheet.style.transform = ''; }, 50); 
    }, 300);
    
    history.pushState({ page: "detail" }, "Detail Video", "#detail");
    return; 
  }

  if (detailPage && detailPage.classList.contains('active')) {
    tutupDetailVideoManual();
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

    const videoBerikutnya = daftarPilihan[Math.floor(Math.random() * daftarPilihan.length)];

    if (currentYouTubePlayer && typeof currentYouTubePlayer.destroy === 'function') {
      currentYouTubePlayer.destroy();
      currentYouTubePlayer = null;
    }

    const detailPage = document.getElementById('videoDetailPage');
    if (detailPage) {
      detailPage.scrollTo({ top: 0, behavior: 'instant' });
    }

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

  if (openSearchBtn) {
    openSearchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('active');
      setTimeout(() => searchInput.focus(), 300);
    });
  }

  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', () => {
      searchOverlay.classList.remove('active');
      searchInput.value = "";
      searchResults.innerHTML = "";
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => { e.preventDefault(); });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const keyword = this.value.toLowerCase().trim();
      
      if (keyword === "") {
        searchResults.innerHTML = "";
        return;
      }

      const filtered = videoLibrary.filter(video => 
        video.title.toLowerCase().includes(keyword) || 
        video.category.toLowerCase().includes(keyword)
      );

      renderSearchResults(filtered);
    });
  }

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
  setTimeout(() => { intro.remove(); }, 450);
}

// ==== FITUR SELENGKAPNYA (BOTTOM SHEET) ==== //
document.addEventListener('DOMContentLoaded', () => {
    const selengkapnyaBtn = document.querySelector('.selengkapnya');
    const descOverlay = document.getElementById('descriptionOverlay');
    const descBottomSheet = document.querySelector('.desc-bottom-sheet');
    const closeDescBtn = document.getElementById('closeDescBtn');

    if (selengkapnyaBtn) {
        selengkapnyaBtn.addEventListener('click', () => {
            descOverlay.classList.add('active');
            descBottomSheet.style.transform = '';
        });
    }

    if (closeDescBtn) {
        closeDescBtn.addEventListener('click', () => {
            descBottomSheet.style.transform = 'translateY(100%)';
            setTimeout(() => {
                descOverlay.classList.remove('active');
                setTimeout(() => { descBottomSheet.style.transform = ''; }, 50); 
            }, 300);
        });
    }

    if (descOverlay) {
        descOverlay.addEventListener('click', (e) => {
            if (e.target === descOverlay) {
                descBottomSheet.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    descOverlay.classList.remove('active');
                    setTimeout(() => { descBottomSheet.style.transform = ''; }, 50); 
                }, 300);
            }
        });
    }

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    if (descBottomSheet) {
        descBottomSheet.addEventListener('touchstart', (e) => {
            if (descBottomSheet.scrollTop <= 0) {
                startY = e.touches[0].clientY;
                isDragging = true;
                descBottomSheet.style.transition = 'none'; 
            }
        }, { passive: true });

        descBottomSheet.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const diffY = currentY - startY;

            if (diffY > 0) {
                descBottomSheet.style.transform = `translateY(${diffY}px)`;
            }
        }, { passive: true });

        descBottomSheet.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            descBottomSheet.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';

            const diffY = currentY - startY;

            if (diffY > 100) {
                descOverlay.classList.remove('active');
                setTimeout(() => { descBottomSheet.style.transform = ''; }, 300);
            } else {
                descBottomSheet.style.transform = 'translateY(0)';
            }

            startY = 0;
            currentY = 0;
        });
    }
});
