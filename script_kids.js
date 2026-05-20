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
    
    // Gunakan fungsi terpisah agar kode lebih bersih
    const handleCategoryClick = function() {
        // 1. Cari chip yang aktif saat ini
        const currentActive = document.querySelector('.chip.active');
        
        // 2. Hapus class active hanya jika ada yang aktif dan itu bukan yang sedang diklik
        if (currentActive && currentActive !== this) {
            currentActive.classList.remove('active');
        }

        // 3. Tambahkan class active ke yang diklik (jika belum ada)
        if (!this.classList.contains('active')) {
            this.classList.add('active');
            
            // 4. Jalankan filter (Gunakan .trim() agar spasi tidak merusak pencarian)
            const kategoriNama = this.innerText.trim();
            console.log("Mencari video untuk kategori:", kategoriNama);
            
            // Jika kamu punya fungsi filter, panggil di sini:
            // filterVideoByCategory(kategoriNama);
        }
    };

    // Pasang Event Listener
    categories.forEach(chip => {
        chip.addEventListener('click', handleCategoryClick);
    });
});





// === FUNGSI HEADER & NAV DINAMIS === //
document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const bottomNav = document.getElementById('bottomNav');
    const detailPage = document.getElementById('videoDetailPage');
    
    // Ganti bagian inisialisasi ini:
    const statusbarHeight = 30; // Sesuaikan dengan tinggi status bar Anda (px)
    const hHeight = (header?.offsetHeight || 105) + statusbarHeight; 
    const bHeight = bottomNav?.offsetHeight || 60;

    let lastPos = 0;
    let hTrans = 0;
    let bTrans = 0;

    const updateNav = (currentPos) => {
    const isDetail = detailPage?.classList.contains('active');
    const diff = currentPos - lastPos;

          // A. LOGIKA HEADER
          if (!isDetail) {
           // Kita kurangi hTrans lebih dalam
          hTrans = Math.max(-(hHeight + 35), Math.min(0, hTrans - diff));
          } else {
          // Saat di detail, paksa header hilang sepenuhnya
          hTrans = -hHeight; 
          }
        
          // B. LOGIKA BOTTOM NAV
          if (!isDetail) {
            bTrans = Math.max(0, Math.min(bHeight, bTrans + diff));
          } else {
            // JIKA DI DETAIL: Paksa nilai bTrans ke MAX (sembunyi) 
            // agar tidak terpengaruh hitungan diff
            bTrans = bHeight; 
          }

          requestAnimationFrame(() => {
            if (header) header.style.transform = `translateY(${hTrans}px)`;
            if (bottomNav) bottomNav.style.transform = `translateY(${bTrans}px)`;
          });

          lastPos = currentPos;
    };

    // Gabungkan Listener agar lebih rapi
    const scrollTarget = [
        { el: window, getPos: () => window.scrollY },
        { el: detailPage, getPos: () => detailPage.scrollTop }
    ];

    scrollTarget.forEach(target => {
        if (!target.el) return;
        target.el.addEventListener('scroll', () => {
            // Jalankan updateNav hanya pada konteks yang tepat
            const isDetail = detailPage?.classList.contains('active');
            const pos = target.getPos();
            
            if ((target.el === window && !isDetail) || (target.el === detailPage && isDetail)) {
                updateNav(pos);
            }
        }, { passive: true });
    });
});





// ==== FUNGSI KETERANGAN BAWAH VIDEO ==== //

// 1. Inisialisasi Kontainer
const videoFeed = document.getElementById('videoFeed');

/**
 * Mesin Pengacak Meta (Views, Waktu)
 * Menghasilkan data yang konsisten berdasarkan judul video
 */
function getMetaOtomatis(judul) {
    let hash = 0;
    for (let i = 0; i < judul.length; i++) {
        hash = judul.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);
    const daftarRentang = [
        { unit: "jam", min: 1, max: 6 },
        { unit: "minggu", min: 1, max: 3 },
        { unit: "bulan", min: 1, max: 11 },
        { unit: "tahun", min: 1, max: 8 }
    ];
    const kategori = daftarRentang[seed % daftarRentang.length];
    const angka = (seed % (kategori.max - kategori.min + 1)) + kategori.min;
    
    return { 
        waktu: `${angka} ${kategori.unit} yang lalu`, 
        channel: "Koleksi Ayah Bunda" 
    };
}

function getStatsOtomatis(judul, waktu) {
    // ... Pastikan fungsi stats juga menerima parameter 'waktu' ...
    // Gunakan parameter 'waktu' untuk membatasi jumlah views jika isinya "jam"
}





// ==== FUNGSI RENDER VIDEO (UI LOGIC) ==== //

/**
 * Menampilkan daftar video ke layar
 * @param {Array} videos - Data dari videoLibrary
 * @param {boolean} append - Jika true, tidak menghapus video yang sudah ada (untuk fitur load more)
 */
function displayVideos(videos, append = false) {
    if (!videoFeed) return;
    
    // Jika tidak sedang menambah (append), bersihkan layar dulu
    if (!append) videoFeed.innerHTML = ""; 

    videos.forEach((video, index) => {
        // Ambil meta dulu
        const meta = getMetaOtomatis(video.title); 
        // Baru ambil stats (jangan lupa kirim meta.waktu ke dalamnya)
        const stats = getStatsOtomatis(video.title, meta.waktu);    
        
        const card = document.createElement('div');
        card.className = 'video-card'; 
        
        // Template HTML yang lebih bersih
        card.innerHTML = `
            <div class="thumb-container">
              <img src="${video.thumbnail}" loading="lazy" alt="thumb">
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
        
        // Event klik untuk pindah ke halaman detail
        card.onclick = () => bukaDetailVideo(video);

        videoFeed.appendChild(card);

        // Efek transisi muncul satu per satu (Stagger animation)
        requestAnimationFrame(() => {
            setTimeout(() => {
              card.classList.add('muncul');
            }, index * 10);
        });
    });
}






// ==== LOGIKA FILTER & INFINITE SCROLL ==== //

document.addEventListener('DOMContentLoaded', () => {
    const detailPage = document.getElementById('videoDetailPage');
    const rekomendasiSection = document.getElementById('rekomendasiSection');
    const categories = document.querySelectorAll('.chip');
    
    let sedangMemuat = false; // Flag agar loading tidak tumpang tindih

    // --- A. LOGIKA INFINITE SCROLL (DI HALAMAN DETAIL) ---
    if (detailPage) {
      detailPage.addEventListener('scroll', () => {
        // Hitung sisa jarak ke bawah di dalam modal/halaman detail
        const sisaScroll = detailPage.scrollHeight - detailPage.scrollTop - detailPage.clientHeight;

        // Jika sisa scroll kurang dari 1000px, muat video rekomendasi tambahan
          if (sisaScroll < 1000 && !sedangMemuat) {
            sedangMemuat = true;

            // Simulasi loading sebentar agar halus
            setTimeout(() => {
                if (typeof videoLibrary !== 'undefined') {
                    // Ambil 6 video acak untuk rekomendasi
                    const videoBaru = kocokVideo(videoLibrary).slice(0, 6);
                    
                    // Panggil fungsi rekomendasi yang sudah kita rapikan tadi
                    tambahRekomendasi(videoBaru, rekomendasiSection);
                }
                   sedangMemuat = false;
            }, 200);
          }
      }, { passive: true });
    }


    // --- B. LOGIKA FILTER KATEGORI (DI BERANDA) ---
    categories.forEach(chip => {
        chip.addEventListener('click', function() {
            // 1. Update UI (Class Active)
            const currentActive = document.querySelector('.chip.active');
            if (currentActive) currentActive.classList.remove('active');
            this.classList.add('active');
            
            // 2. Jalankan Filter
            const kategoriNama = this.innerText.trim(); // Gunakan trim agar spasi hilang
            
            if (typeof videoLibrary !== 'undefined') {
                if (kategoriNama === "Semua") {
                    displayVideos(videoLibrary);
                } else {
                    const filtered = videoLibrary.filter(v => v.category === kategoriNama);
                    displayVideos(filtered);
                }
            }
            
            // Auto scroll ke atas setelah ganti kategori
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // --- C. INISIALISASI PERTAMA KALI ---
    if (typeof videoLibrary !== 'undefined') {
        displayVideos(videoLibrary);
    }
});






// ==== FUNGSI INFINITE SCROLL BERANDA ==== //

// 1. Teknik Mengacak Array (Fisher-Yates Shuffle) - Sangat Efisien
function kocokVideo(array) {
    let copy = [...array]; 
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// 2. Variabel status (Letakkan di atas agar bisa diakses fungsi)
let sedangMemuat = false; 

// 3. Fungsi Utama Memuat Video
function muatVideoLagi() {
    if (sedangMemuat) return;
    sedangMemuat = true;

    if (typeof videoLibrary !== 'undefined') {
        // Ambil 6 video (tambah sedikit jumlahnya dari 4 ke 6 agar antrean lebih panjang)
        const videoAcak = kocokVideo(videoLibrary).slice(0, 6);
        
        requestAnimationFrame(() => {
            displayVideos(videoAcak, true);
            
            // Buka kunci LEBIH CEPAT (100ms saja)
            // agar gerakan jari kedua bisa langsung memicu loading lagi
            setTimeout(() => {
                sedangMemuat = false;
            }, 100); 
        });
    }
}

// 4. Pantau Scroll User (Cukup SATU Listener saja)
window.addEventListener('scroll', () => {
    const tinggiKonten = document.body.offsetHeight;
    const posisiSekarang = window.innerHeight + window.scrollY;
    
    // Hitung sisa jarak dalam pixel
    const sisaPixel = tinggiKonten - posisiSekarang;
    
    // Hitung sisa dalam persentase (biar lebih akurat di berbagai panjang halaman)
    const sisaPersen = (sisaPixel / tinggiKonten) * 100;

    // TRIGGER: Jika sisa kurang dari 2000px ATAU sisa konten tinggal 30% lagi
    if ((sisaPixel < 2500 || sisaPersen < 30) && !sedangMemuat) {
        muatVideoLagi();
    }
}, { passive: true });




// ==== FUNGSI BUKA DETAIL VIDEO ==== //

let isPortrait = false; // Status apakah video sedang di tengah/portrait

function bukaDetailVideo(video) {
    const detailPage = document.getElementById('videoDetailPage');
    const playerArea = document.getElementById('playerContent');
    const targetRekomendasi = document.getElementById('rekomendasiSection');
    const bNav = document.getElementById('bottomNav');
    
    updateStatusBar('normal_video');
    updateContentLayout('normal_video');

    // --- TAMBAHKAN INI ---
    if (bottomNav) {
        bottomNav.style.transform = 'translateY(100%)'; // Buang ke bawah layar
        bottomNav.style.transition = 'transform 0.3s ease';
    }
    lastPos = 0; // Reset tracking scroll


    // 1. Reset Awal
    if (targetRekomendasi) targetRekomendasi.innerHTML = "";
    playerArea.innerHTML = "";

    // 2. Update Informasi Video (Title, Views, Date, Likes, Comment Count)
    const stats = getStatsOtomatis(video.title);
    const meta = getMetaOtomatis(video.title);
    const jmlKomentar = getKomentarOtomatis(video.title);

    document.getElementById('detailTitle').innerText = video.title;
    document.getElementById('detailViews').innerText = stats.views + " x ditonton";
    document.getElementById('detailDate').innerText = meta.waktu;

    const likeLabel = document.querySelector('.btn-group button span');
    if (likeLabel) likeLabel.innerText = stats.likes;

    const commentCountElement = document.getElementById('commentCount');
    if (commentCountElement) commentCountElement.innerText = jmlKomentar;

    // 3. Masukkan Struktur Video Player & Overlay
    playerArea.innerHTML = `
    <div class="video-container" id="vContainer">
      <div id="videoLoading" class="video-loading">
        <div class="spinner"></div>
      </div>
      
      <video id="mainVideoPlayer" playsinline style="width:100%; display:block;">
        <source src="${video.videoUrl}" type="video/mp4">
      </video>

      <div id="videoOverlay" class="video-overlay">
        <div class="overlay-top">
          <div class="top-right">
            <i class="ri-toggle-line"></i>
            <i class="ri-macbook-line"></i>
            <i class="ri-closed-captioning-line"></i>
            <i class="ri-settings-3-line"></i>
          </div>
        </div>

          <div class="overlay-mid">
             <div class="icon-skip-container" id="rewindBtn">
               <i class="bi bi-arrow-counterclockwise"></i>
               <span class="skip-number">10</span>
             </div>
             <i id="playIcon" class="bi bi-pause-fill main-play"></i>
             <div class="icon-skip-container" id="fastForwardBtn">
               <i class="bi bi-arrow-clockwise"></i>
               <span class="skip-number">10</span>
             </div>
          </div>

          <div class="overlay-bot">
            <div class="time-wrapper">
              <span id="currentTime">0:00</span> / <span id="durationTime">0:00</span>
            </div>
            <i id="btnFullscreen" class="ri-expand-diagonal-2-line icon-fullscreen"></i>
          </div>
      </div>
      
       <div class="progress-container">
        <div id="merahJalan" class="progress-fill"></div>
      </div>
      
      <div class="judul-portrait-khusus" id="judulLuar">
        <div class="v-title-luar">${video.title}</div>
        <div class="v-channel-luar">@${meta.channel}</div>
      </div>
      
      <div class="ikon-tambahan-portrait">
        <div class="item-ikon"><i class="bi bi-hand-thumbs-up"></i></div>
        <div class="item-ikon"><i class="bi bi-hand-thumbs-down"></i></div>
        <div class="item-ikon"><i class="bi bi-chat-left-text"></i></div>
        <div class="item-ikon"><i class="bi bi-bookmark"></i></div>
        <div class="item-ikon"><i class="bi-three-dots"></i></div>
      </div>
    </div>`;
  
  
    // 4. Inisialisasi Elemen Kontrol
    const vElement = document.getElementById('mainVideoPlayer');
    const loadingEfek = document.getElementById('videoLoading');
    const vContainer = document.getElementById('vContainer');
    const overlay = document.getElementById('videoOverlay');
    const playIcon = document.getElementById('playIcon');
    const garisMerah = document.getElementById('merahJalan');
    const tSekarang = document.getElementById('currentTime');
    const tTotal = document.getElementById('durationTime');
    const btnFullscreen = document.getElementById('btnFullscreen');

    let overlayTimeout;

    // --- FUNGSI OVERLAY ---
    const handleOverlayToggle = (e) => {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }

    // Gunakan classList, jangan set .style.opacity secara manual lagi
    const isShowing = overlay.classList.contains('active');

    if (isShowing) {
        // SEMBUNYIKAN
        overlay.classList.remove('active');
        vContainer.classList.remove('show-controls');
        clearTimeout(overlayTimeout);
    } else {
        // MUNCULKAN
        overlay.classList.add('active');
        vContainer.classList.add('show-controls');
        
        clearTimeout(overlayTimeout);
        overlayTimeout = setTimeout(() => {
            // Sembunyikan otomatis dengan menghapus class
            overlay.classList.remove('active');
            vContainer.classList.remove('show-controls');
        }, 3000);
    }
};



    vElement.onclick = handleOverlayToggle;
    overlay.onclick = (e) => { if (e.target === overlay) handleOverlayToggle(e); };

        // --- KONTROL TOMBOL ---
    playIcon.onclick = (e) => {
        e.stopPropagation();
        if (vElement.paused) {
            vElement.play();
            playIcon.className = "bi bi-pause-fill main-play";
        } else {
            vElement.pause();
            playIcon.className = "bi bi-play-fill main-play";
        }
    };

    // Tombol Mundur 10 Detik
    const btnRewind = document.getElementById('rewindBtn');
    if (btnRewind) {
        btnRewind.onclick = (e) => { 
            e.stopPropagation(); 
            vElement.currentTime = Math.max(0, vElement.currentTime - 10); 
        };
    }

    // Tombol Maju 10 Detik
    const btnForward = document.getElementById('fastForwardBtn');
    if (btnForward) {
        btnForward.onclick = (e) => { 
            e.stopPropagation(); 
            vElement.currentTime = Math.min(vElement.duration, vElement.currentTime + 10); 
        };
    }

    // --- FULLSCREEN LOGIC ---
    // --- LOGIKA TOMBOL TOGGLE: NORMAL <-> FULLSCREEN VERTIKAL ---    
btnFullscreen.onclick = (e) => {
    e.stopPropagation();

    const vContainer = document.getElementById('vContainer');
    const scrollContent = detailPage.querySelector('.detail-scroll-content');
    const playerWrapper = detailPage.querySelector('.player-wrapper');
    
    // Cek apakah browser sedang dalam mode Fullscreen Landscape (16:9)
    const isFS = document.fullscreenElement || document.webkitFullscreenElement;

    // 1. JIKA SEDANG LANDSCAPE (16:9) -> KELUAR KE NORMAL
    if (isFS) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        // Ikon akan otomatis berubah lewat listener 'fullscreenchange' yang kita buat di bawah
        return;
    }

    // 2. JIKA SEDANG MODE PORTRAIT (VERTIKAL) -> BALIK KE NORMAL
    if (isPortrait) {
        isPortrait = false;
        if (vContainer) vContainer.classList.remove('mode-portrait');

        // Ganti Ikon Balik ke Expand
        btnFullscreen.classList.replace('ri-collapse-diagonal-2-line', 'ri-expand-diagonal-2-line');

        // Animasi kembali ke posisi semula
        playerWrapper.style.transition = 'all 0.3s cubic-bezier(0.2, 0, 0, 1)';
        scrollContent.style.transition = 'all 0.3s cubic-bezier(0.2, 0, 0, 1)';

        requestAnimationFrame(() => {
            playerWrapper.style.transform = 'translateY(0)';
            scrollContent.style.transform = 'translateY(0)';
            scrollContent.style.opacity = '1';
        });
    } 
    // 3. JIKA SEDANG NORMAL -> MASUK KE LANDSCAPE (16:9)
    else {
        if (vContainer.requestFullscreen) {
            vContainer.requestFullscreen();
        } else if (vContainer.webkitRequestFullscreen) {
            vContainer.webkitRequestFullscreen();
        }

        // Putar layar otomatis (Opsional)
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(err => console.log(err));
        }
        
        // Ikon berubah jadi "Perkecil"
        btnFullscreen.classList.replace('ri-expand-diagonal-2-line', 'ri-collapse-diagonal-2-line');
    }
};

// --- TAMBAHKAN LISTENER INI DI LUAR ONCLICK (PENTING) ---
// Supaya saat user tekan tombol "Back" HP, ikonnya tidak nyangkut
document.addEventListener('fullscreenchange', () => {
    const isFS = document.fullscreenElement || document.webkitFullscreenElement;
    const btnFs = document.getElementById('btnFullscreen');
    if (!isFS && btnFs && !isPortrait) {
        btnFs.classList.replace('ri-collapse-diagonal-2-line', 'ri-expand-diagonal-2-line');
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }
});


  
    // --- UPDATE PROGRESS & TIME (Real-time) ---
vElement.addEventListener('timeupdate', () => {
    // KUNCINYA: Cari elemen 'merahJalan' DI DALAM event ini
    const garisUpdate = document.getElementById('merahJalan'); 
    
    if (garisUpdate && vElement.duration) {
        let p = (vElement.currentTime / vElement.duration) * 100;
        garisUpdate.style.width = p + "%";
    }

    // Update angka waktu (0:00 / 0:00)
    if (tSekarang) tSekarang.innerText = formatWaktu(vElement.currentTime);
});

// Pastikan Durasi Total muncul saat video dimuat
vElement.onloadedmetadata = () => {
    if (tTotal) {
        tTotal.innerText = formatWaktu(vElement.duration);
    }
};

    vElement.onloadedmetadata = () => {
        if (tTotal) tTotal.innerText = formatWaktu(vElement.duration);
    };

    // --- LOGIKA LOADING & PLAY OTOMATIS ---

    // 1. Jika video sedang memuat data (buffering), munculkan loading
    vElement.onloadstart = () => {
        loadingEfek.style.display = 'flex';
    };
    
    vElement.onwaiting = () => {
        loadingEfek.style.display = 'flex';
    };

    // 2. Jika video sudah siap/mulai berjalan, sembunyikan loading
    vElement.onplaying = () => {
        loadingEfek.style.display = 'none';
    };

     // 3. Perintah Play Utama
    vElement.muted = false; 
    
    vElement.play().then(() => {
        console.log("Video berhasil diputar bersuara");
        if (playIcon) playIcon.className = "bi bi-pause-fill main-play";
    }).catch((err) => {
        // Jika gagal (biasanya karena mode normal dianggap autoplay tanpa klik), 
        // kita coba putar demi visual, namun biarkan fungsi putarVideoOtomatis mengambil alih suaranya
        vElement.muted = true;
        vElement.play();
        if (playIcon) playIcon.className = "bi bi-pause-fill main-play";
    });
    
    // 4. fitur autonext 
    vElement.onended = () => {
        console.log("Video selesai, memutar video berikutnya...");
        putarVideoOtomatis();
    };

    // --- LOGIKA KOMENTAR DINAMIS ---
    const elementTeksKomentar = document.getElementById('commentText');
    const elementFotoKomentar = document.getElementById('commentUserImg');
    const elementNamaKomentar = document.getElementById('commentUserName');

    if (elementTeksKomentar && typeof daftarKomentar !== 'undefined') {
        let hash = 0;
        for (let i = 0; i < video.title.length; i++) {
            hash = video.title.charCodeAt(i) + ((hash << 5) - hash);
        }
        const indexKomentar = Math.abs(hash) % daftarKomentar.length;
        
        // Update Teks
        elementTeksKomentar.innerText = daftarKomentar[indexKomentar];
        
        // Update Foto & Nama (Satu untuk semua sesuai permintaanmu)
        if (elementFotoKomentar) elementFotoKomentar.src = "MAMA.JPG";
        if (elementNamaKomentar) elementNamaKomentar.innerText = "Koleksi Ayah Bunda";
    }

    // 5. ISI DAFTAR REKOMENDASI
    if (targetRekomendasi && typeof videoLibrary !== 'undefined') {
        const videoLainnya = videoLibrary
            .filter(v => v.title !== video.title)
            .sort(() => 0.5 - Math.random())
            .slice(0, 15);
        tambahRekomendasi(videoLainnya, targetRekomendasi);
    }

    // 6. TAMPILKAN HALAMAN DETAIL
    detailPage.style.display = 'block';
    requestAnimationFrame(() => { detailPage.scrollTop = 0; });
    setTimeout(() => { detailPage.classList.add('active'); }, 40);
    document.body.style.overflow = 'hidden';
    
    
    // --- FITUR SWIPE TO PORTRAIT (DENGAN DETEKSI KECEPATAN) ---
    const scrollContent = detailPage.querySelector('.detail-scroll-content');
    const playerWrapper = detailPage.querySelector('.player-wrapper');
    let startY = 0;
    let distY = 0;
    let startTime = 0; // Untuk menghitung kecepatan

        detailPage.addEventListener('touchstart', (e) => {
        const playerWrapper = detailPage.querySelector('.player-wrapper');
        const videoHeight = playerWrapper ? playerWrapper.offsetHeight : 250; // default 250 jika tidak terbaca
        const touchY = e.touches[0].clientY;
        
        if (detailPage.scrollTop <= 0 && touchY > videoHeight) {
            startY = touchY;
            startTime = Date.now();
            detailPage.classList.add('dragging');
            
            // Matikan transisi agar gerakannya menempel di jari
            scrollContent.style.transition = 'none';
            playerWrapper.style.transition = 'none';
        }
    }, { passive: true });

        detailPage.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        distY = currentY - startY;

// A. LOGIKA TARIK KE BAWAH (Ke Portrait)
// Tambahkan syarat !isPortrait (artinya: HANYA jalan jika TIDAK sedang mode portrait)
if (detailPage.classList.contains('dragging') && distY > 0 && !isPortrait) {
    e.preventDefault(); 
    detailPage.style.backgroundColor = `rgba(0, 0, 0, ${Math.min(distY / 300, 1)})`;
    scrollContent.style.transform = `translateY(${distY}px)`;
    scrollContent.style.opacity = Math.max(0, 1 - (distY / 200));
    playerWrapper.style.transform = `translateY(${Math.min(distY * 0.4, window.innerHeight * 0.3)}px)`;
}


         if (bottomNav) {
                // bHeight biasanya 60px. Kita dorong ke bawah sesuai tarikan jari
                const navHide = Math.min(60, distY / 2); 
                bottomNav.style.transform = `translateY(100%)`; 
            }

        // B. LOGIKA TARIK KE ATAS (Balik dari Portrait ke Normal)
          if (isPortrait && distY < 0) {
             if (e.cancelable) e.preventDefault(); 
    
             // 1. Ambil tinggi layar
               const viewHeight = window.innerHeight;
               const posisiTengah = viewHeight * 0.3;

            // 2. Batasi tarikan agar tidak melampaui batas atas (0)
             // Kita hitung seberapa jauh jarak dari posisi portrait ke posisi normal (0)
              const jarakMaksimal = posisiTengah; 
              const currentDist = Math.abs(distY);
    
            // 3. Hitung Progres (0 sampai 1)
              const progress = Math.min(currentDist / jarakMaksimal, 1);

           // 4. VIDEO: Bergerak dari posisiTengah ke 0
              const moveVideo = posisiTengah - (posisiTengah * progress);
              playerWrapper.style.transform = `translateY(${moveVideo}px)`;

          // 5. KONTEN (Judul & List): Benar-benar mengikuti koordinat jari
            // Kita buat dia mulai dari dasar layar dan naik ke atas
              const moveContent = viewHeight - (viewHeight * progress);
              scrollContent.style.transform = `translateY(${moveContent}px)`;

          // 6. OPACITY: Mengikuti progres tarikan
              scrollContent.style.opacity = progress;
    
         // Opsional: Background semakin gelap/solid saat naik
              detailPage.style.backgroundColor = `rgba(0, 0, 0, ${0.5 + (progress * 0.5)})`;
          }
        }, { passive: false });

        detailPage.addEventListener('touchend', (e) => {
    if (Math.abs(distY) < 5) return; 
    if (!detailPage.classList.contains('dragging')) return;
    detailPage.classList.remove('dragging');

    const duration = Date.now() - startTime;
    const velocity = distY / duration;
    
    // Ambil container video untuk ganti mode ikon
    const vContainer = document.getElementById('vContainer');

    // 1. JIKA SWIPE UP (BALIK KE NORMAL)
    if (isPortrait && distY < -50) {
        isPortrait = false; 
        
        updateStatusBar('normal_video');
    updateContentLayout('normal_video');
        
        // KONDISI IKON: Balik ke Normal
        if (vContainer) vContainer.classList.remove('mode-portrait');
        
         if (btnFullscreen) {
        btnFullscreen.classList.replace('ri-collapse-diagonal-2-line', 'ri-expand-diagonal-2-line');
         }

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

    // 2. JIKA SWIPE DOWN (MASUK KE PORTRAIT)
    if (velocity > 0.5 || distY > 100) {
        isPortrait = true; 
        
        updateStatusBar('portrait_video');
    updateContentLayout('portrait_video');
        
        // KONDISI IKON: Aktifkan Mode Portrait
        if (vContainer) vContainer.classList.add('mode-portrait');
        
        if (btnFullscreen) {
        btnFullscreen.classList.replace('ri-expand-diagonal-2-line', 'ri-collapse-diagonal-2-line');
        }

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
        // 3. LOGIKA SNAP BACK (Video "Nggantung")
        // Jika tidak jadi portrait, pastikan class mode-portrait dihapus
        if (vContainer) vContainer.classList.remove('mode-portrait');

        const styleBalik = 'all 0.25s ease-out';
        playerWrapper.style.transition = styleBalik;
        scrollContent.style.transition = styleBalik;

        requestAnimationFrame(() => {
            playerWrapper.style.transform = 'translateY(0)';
            scrollContent.style.transform = 'translateY(0)';
            scrollContent.style.opacity = '1';
            detailPage.style.backgroundColor = '#000';
            
            if (bottomNav) {
                bottomNav.style.transform = 'translateY(100%)';
            }
        });

        setTimeout(() => {
            playerWrapper.style.transition = '';
            scrollContent.style.transition = '';
        }, 250);
    }
    
    distY = 0; 
});
    
    history.pushState({ page: "detail" }, "Detail Video", "#detail");
    
        // --- KODE BARU UNTUK MENGATUR POSISI & IKON DI MODE PORTRAIT ---
    if (isPortrait) {
        const vContainer = document.getElementById('vContainer');
        const scrollContent = detailPage.querySelector('.detail-scroll-content');
        const playerWrapper = detailPage.querySelector('.player-wrapper');
        const btnFs = document.getElementById('btnFullscreen'); // Ambil tombolnya

        if (vContainer) vContainer.classList.add('mode-portrait');
        
        // 1. GANTI IKON: Jadi ikon "Perkecil" (Collapse)
        if (btnFs) {
            btnFs.classList.replace('ri-expand-diagonal-2-line', 'ri-collapse-diagonal-2-line');
        }

        // 2. KONTEN: Dibuang ke bawah layar
        if (scrollContent) {
            scrollContent.style.transform = `translateY(${window.innerHeight}px)`;
            scrollContent.style.opacity = '0';
        }

        // 3. VIDEO: Pindah ke posisi tengah (Portrait)
        if (playerWrapper) {
            const midPoint = window.innerHeight * 0.3;
            playerWrapper.style.transform = `translateY(${midPoint}px)`;
        }
    }
}

// Fungsi pembantu format waktu (di luar agar rapi)
function formatWaktu(detik) {
    if (isNaN(detik)) return "0:00";
    let m = Math.floor(detik / 60);
    let s = Math.floor(detik % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
}





// ==== FUNGSI PEMBUAT KARTU VIDEO (REUSABLE) ==== //
function buatElemenVideo(v) {
    const stats = getStatsOtomatis(v.title);
    const meta = getMetaOtomatis(v.title);
    
    const card = document.createElement('div');
    card.className = 'video-card';
    
    card.innerHTML = `
        <div class="thumb-container">
            <img src="${v.thumbnail}" alt="${v.title}" loading="lazy">
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

    // Jika append = false, kita bersihkan dulu (misal saat baru buka video baru)
    if (!append) target.innerHTML = "";

    videos.forEach((v, index) => {
        const card = buatElemenVideo(v);
        
        card.onclick = () => {
            const detailPage = document.getElementById('videoDetailPage');
            if (detailPage) {
                // 'instant' agar user langsung melihat video yang baru diklik
                detailPage.scrollTo({ top: 0, behavior: 'instant' }); 
            }
            bukaDetailVideo(v);
        };

        target.appendChild(card);

        requestAnimationFrame(() => {
            // index * 15 agar sedikit lebih cepat dari 20ms
            setTimeout(() => card.classList.add('muncul'), index * 15);
        });
    });
}




// Memisahkan logika pembuatan angka unik dari teks judul //
function generateSeed(judul) {
    let hash = 0;
    for (let i = 0; i < judul.length; i++) {
        hash = judul.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

// Memisahkan logika pemformatan angka (rb/jt) //
function formatAngkaYoutube(angka) {
    if (angka >= 1000000) {
        return (angka / 1000000).toFixed(1).replace('.', ',') + " jt";
    } else if (angka >= 1000) {
        return Math.floor(angka / 1000) + " rb";
    }
    return angka.toString();
}

// rem view dan komentar otomatis //
function getStatsOtomatis(judul, waktu) {
    const seed = generateSeed(judul);
    let rawViews = (seed % 1990000) + 10000;
    
    // Logika Rem Views
    if (waktu) {
        if (waktu.includes("menit")) {
            rawViews = (seed % 500) + 2;
        } else if (waktu.includes("jam")) {
            const angkaJam = parseInt(waktu) || 1;
            rawViews = Math.floor((rawViews / 100) * (angkaJam / 2)); 
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








// ==== MONITORING TOMBOL BACK HP ==== //
window.addEventListener('popstate', function(event) {
    const detailPage = document.getElementById('videoDetailPage');
    
    if (detailPage && detailPage.classList.contains('active')) {
        // Halaman detail terbuka, tutup videonya
        tutupDetailVideoManual();
        
        // Opsional: Jika ingin tetap di halaman yang sama, 
        // kita masukkan lagi state baru agar tidak keluar aplikasi
        history.pushState(null, null, window.location.pathname);
    }
});





// ==== FUNGSI TUTUP VIDEO MANUAL ==== //
function tutupDetailVideoManual() {
    const detailPage = document.getElementById('videoDetailPage');
    const header = document.getElementById('header');
    const bottomNav = document.getElementById('bottomNav');
    const player = document.getElementById('playerContent');
    
    isPortrait = false;
    
    updateStatusBar('home');
    updateContentLayout('home');
    
    // Ambil elemen yang dimanipulasi saat swipe
    const scrollContent = detailPage.querySelector('.detail-scroll-content');
    const playerWrapper = detailPage.querySelector('.player-wrapper');

    // 1. Hentikan Video segera agar tidak ada suara bocor
    if (player) player.innerHTML = ""; 

    // 2. Hilangkan class active
    detailPage.classList.remove('active');

    // 3. === RESET TOTAL SEMUA INLINE STYLE ===
    // Ini menghapus "bekas" tarikan jari kamu agar posisi kembali normal
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

    // 4. Reset Posisi Navigasi & Body Scroll
    requestAnimationFrame(() => {
        if (header) header.style.transform = 'translateY(0)';
        if (bottomNav) bottomNav.style.transform = 'translateY(0)';
        document.body.style.overflow = 'auto';
    });

    // 5. Bersihkan sisa elemen setelah animasi selesai (400ms sesuai durasi CSS)
    setTimeout(() => {
        detailPage.style.display = 'none';
        detailPage.scrollTop = 0;
    }, 400); 
}


function putarVideoOtomatis() {
    if (typeof videoLibrary !== 'undefined' && videoLibrary.length > 0) {
        const judulSekarang = document.getElementById('detailTitle').innerText;
        const daftarPilihan = videoLibrary.filter(v => v.title !== judulSekarang);
        const videoBerikutnya = daftarPilihan[Math.floor(Math.random() * daftarPilihan.length)];

        const detailPage = document.getElementById('videoDetailPage');
        if (detailPage) {
            detailPage.scrollTo({ top: 0, behavior: 'instant' }); 
        }

        // Buka detail video terlebih dahulu
        bukaDetailVideo(videoBerikutnya);

        // KUNCI UTAMA: Beri jeda sedikit agar DOM selesai terbentuk, 
        // lalu paksa suara aktif di mode apapun
        setTimeout(() => {
            const vElement = document.getElementById('mainVideoPlayer');
            const playIcon = document.getElementById('playIcon');
            
            if (vElement) {
                vElement.muted = false; // Buka suara secara paksa
                
                vElement.play().then(() => {
                    if (playIcon) playIcon.className = "bi bi-pause-fill main-play";
                }).catch((err) => {
                    console.log("Browser memblokir suara otomatis di mode ini, terpaksa mute");
                    vElement.muted = true;
                    vElement.play();
                });
            }
        }, 300); 
    }
}


// 1. Fungsi khusus untuk Bridge Android
function updateStatusBar(state) {
    if (typeof Android !== "undefined") {
        Android.setStatusBarStyle(state);
    }
}

// 2. Fungsi khusus untuk Layout Content
function updateContentLayout(state) {
    // Hapus semua class mode agar bersih
    document.body.classList.remove('mode-home', 'mode-normal-video', 'mode-portrait-video');
    
    // Tambahkan class yang sesuai
    if (state !== 'none') {
        document.body.classList.add('mode-' + state);
    }
}
