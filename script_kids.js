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

    // 1. Reset Awal
    if (targetRekomendasi) targetRekomendasi.innerHTML = "";
    
    // Ambil YouTube ID dari data.js
    const ytId = video.youtubeId || ""; 

    // 2. Masukkan Iframe YouTube
    playerArea.innerHTML = `
    <div class="video-container" id="vContainer" style="background:#000;">
      <iframe 
        id="mainVideoPlayer"
        width="100%" 
        height="100%" 
        src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        style="position:absolute; top:0; left:0; width:100%; height:100%;">
      </iframe>
    </div>`;

    // 3. Update Informasi Video (Title, Views, Date, Likes, Comment Count)
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

    // 4. Tombol Fullscreen (Mode Browser)
    const btnFullscreen = document.getElementById('btnFullscreen');
    if (btnFullscreen) {
        btnFullscreen.onclick = (e) => {
            e.stopPropagation();
            const vContainer = document.getElementById('vContainer');
            const isFS = document.fullscreenElement || document.webkitFullscreenElement;

            if (isFS) {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            } else {
                if (vContainer.requestFullscreen) vContainer.requestFullscreen();
                else if (vContainer.webkitRequestFullscreen) vContainer.webkitRequestFullscreen();
            }
        };
    }

    // --- LOGIKA KOMENTAR DINAMIS ---
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
    
    // --- FITUR SWIPE TO PORTRAIT ---
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
            if (btnFullscreen) btnFullscreen.classList.replace('ri-collapse-diagonal-2-line', 'ri-expand-diagonal-2-line');

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
            if (btnFullscreen) btnFullscreen.classList.replace('ri-expand-diagonal-2-line', 'ri-collapse-diagonal-2-line');

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
    
    history.pushState({ page: "detail" }, "Detail Video", "#detail");
    
    if (isPortrait) {
        const vContainer = document.getElementById('vContainer');
        const btnFs = document.getElementById('btnFullscreen');

        if (vContainer) vContainer.classList.add('mode-portrait');
        if (btnFs) btnFs.classList.replace('ri-expand-diagonal-2-line', 'ri-collapse-diagonal-2-line');
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
        
        if (daftarPilihan.length === 0) return;
        
        const videoBerikutnya = daftarPilihan[Math.floor(Math.random() * daftarPilihan.length)];

        // 1. Scroll otomatis ke atas halaman detail
        const detailPage = document.getElementById('videoDetailPage');
        if (detailPage) {
            detailPage.scrollTo({ top: 0, behavior: 'instant' }); 
        }

        // 2. Ambil status suara dari pemutar yang sedang aktif SEBELUM dihancurkan
        const playerLama = document.getElementById('mainVideoPlayer');
        const apakahBersuaraSebelumnya = playerLama ? !playerLama.muted : true;

        // 3. Panggil langsung bukaDetailVideo dengan status otomatis (true)
        bukaDetailVideo(videoBerikutnya, true, apakahBersuaraSebelumnya);
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

// =========================================================
// INTRO ANIMATION — HOME READY
// =========================================================

function showHomeAfterReady() {
    const intro = document.getElementById('introAnimation');

    if (!intro) return;

    intro.classList.add('intro-hide');

    setTimeout(() => {
        intro.remove();
    }, 450);
}
