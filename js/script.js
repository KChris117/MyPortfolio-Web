window.addEventListener('load', () => {
    const colLeft = document.getElementById('col-left');
    const colRight = document.getElementById('col-right');

    // Fungsi menggandakan elemen agar bisa infinite loop
    function duplicateContent(column) {
        const track = column.querySelector('.col-track');
        const children = Array.from(track.children);
        for (let i = 0; i < 5; i++) { // Mengurangi clone dari 7 menjadi 5 (Total 6 set) untuk performa DOM
            children.forEach(child => {
                track.appendChild(child.cloneNode(true));
            });
        }
    }

    duplicateContent(colLeft);
    duplicateContent(colRight);

    let segmentLeft = { x: 0, y: 0 };
    let segmentRight = { x: 0, y: 0 };

    // Mengukur panjang/lebar 1 set (1 segment) secara akurat dari 4 set yang ada
    function updateSegments() {
        segmentLeft.x = colLeft.querySelector('.col-track').scrollWidth / 6;
        segmentLeft.y = colLeft.querySelector('.col-track').scrollHeight / 6;
        segmentRight.x = colRight.querySelector('.col-track').scrollWidth / 6;
        segmentRight.y = colRight.querySelector('.col-track').scrollHeight / 6;
    }

    updateSegments();

    let isMobile = window.innerWidth <= 1420;

    // Atur posisi awal di tengah (zona aman)
    colLeft.scrollTop = 2.5 * segmentLeft.y;
    colRight.scrollTop = 2.5 * segmentRight.y;
    colLeft.scrollLeft = 2.5 * segmentLeft.x;
    colRight.scrollLeft = 2.5 * segmentRight.x;

    let exactScrollLeft = isMobile ? colLeft.scrollLeft : colLeft.scrollTop;
    let exactScrollRight = isMobile ? colRight.scrollLeft : colRight.scrollTop;

    // Jika layar di-resize dari PC ke HP atau sebaliknya, kita reset dan sesuaikan ukurannya
    window.addEventListener('resize', () => {
        let wasMobile = isMobile;
        isMobile = window.innerWidth <= 1420;
        updateSegments();
        
        if (wasMobile !== isMobile) {
            exactScrollLeft = isMobile ? 2.5 * segmentLeft.x : 2.5 * segmentLeft.y;
            exactScrollRight = isMobile ? 2.5 * segmentRight.x : 2.5 * segmentRight.y;
            colLeft.scrollTop = 2.5 * segmentLeft.y;
            colLeft.scrollLeft = 2.5 * segmentLeft.x;
            colRight.scrollTop = 2.5 * segmentRight.y;
            colRight.scrollLeft = 2.5 * segmentRight.x;
        }
    });

    colLeft.isInteracting = false;
    colRight.isInteracting = false;

    let isModalOpen = false;

    // 1. FUNGSI SLIDESHOW OTOMATIS (Mendukung Vertikal PC & Horizontal HP)
    function autoScroll() {
        if (isModalOpen) {
            requestAnimationFrame(autoScroll);
            return;
        }

        if (isMobile) {
            // HP: HORIZONTAL SLIDESHOW
            // Baris 1: Kiri ke Kanan (scrollLeft berkurang)
            if (!colLeft.isInteracting) {
                exactScrollLeft -= 1.5;
                if (exactScrollLeft <= 1.5 * segmentLeft.x) exactScrollLeft += segmentLeft.x;
                colLeft.scrollLeft = exactScrollLeft;
            } else exactScrollLeft = colLeft.scrollLeft;

            // Baris 2: Kanan ke Kiri (scrollLeft bertambah)
            if (!colRight.isInteracting) {
                exactScrollRight += 1.5;
                if (exactScrollRight >= 3.5 * segmentRight.x) exactScrollRight -= segmentRight.x;
                colRight.scrollLeft = exactScrollRight;
            } else exactScrollRight = colRight.scrollLeft;
        } else {
            // PC: VERTIKAL SLIDESHOW
            // Kolom Kiri: Bawah ke Atas (scrollTop bertambah)
            if (!colLeft.isInteracting) {
                exactScrollLeft += 1.5; 
                if (exactScrollLeft >= 3.5 * segmentLeft.y) exactScrollLeft -= segmentLeft.y;
                colLeft.scrollTop = exactScrollLeft;
            } else exactScrollLeft = colLeft.scrollTop;
            
            // Kolom Kanan: Atas ke Bawah (scrollTop berkurang)
            if (!colRight.isInteracting) {
                exactScrollRight -= 1.5; 
                if (exactScrollRight <= 1.5 * segmentRight.y) exactScrollRight += segmentRight.y;
                colRight.scrollTop = exactScrollRight;
            } else exactScrollRight = colRight.scrollTop;
        }
        requestAnimationFrame(autoScroll);
    }
    autoScroll();

    // 2. FUNGSI SEAMLESS LOOP & MANUAL SCROLL
    function setupColumnScroll(element, getSegmentObj) {
        element.addEventListener('scroll', () => {
            if (element.isInteracting) {
                let seg = getSegmentObj();
                if (isMobile) {
                    if (element.scrollLeft >= 3.5 * seg.x) element.scrollLeft -= seg.x;
                    else if (element.scrollLeft <= 1.5 * seg.x) element.scrollLeft += seg.x;
                } else {
                    if (element.scrollTop >= 3.5 * seg.y) element.scrollTop -= seg.y;
                    else if (element.scrollTop <= 1.5 * seg.y) element.scrollTop += seg.y;
                }
            }
        });

        let scrollTimeout;
        const stopAutoScroll = () => {
            element.isInteracting = true; 
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                element.isInteracting = false;
            }, 1000);
        };

        element.addEventListener('wheel', stopAutoScroll, { passive: true });
        element.addEventListener('touchmove', stopAutoScroll, { passive: true });
    }

    setupColumnScroll(colLeft, () => segmentLeft);
    setupColumnScroll(colRight, () => segmentRight);

    // 3. FUNGSI MODAL DETAIL & LIGHTBOX
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalGallery = modal.querySelector('.modal-gallery');
    
    // Elemen Gallery Buttons
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');

    if (galleryPrev && galleryNext) {
        galleryPrev.addEventListener('click', () => {
            modalGallery.scrollBy({ left: -modalGallery.clientWidth, behavior: 'smooth' });
        });
        galleryNext.addEventListener('click', () => {
            modalGallery.scrollBy({ left: modalGallery.clientWidth, behavior: 'smooth' });
        });
    }

    // Elemen Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    // Variabel state untuk Pan & Zoom
    let lbScale = 1;
    let lbX = 0;
    let lbY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    function updateLightboxTransform() {
        lightboxImg.style.transform = `translate3d(${lbX}px, ${lbY}px, 0) scale(${lbScale})`;
    }

    // Tutup Lightbox saat diklik di area luar gambar
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            // Buat transisi penutupan lebih cepat agar tidak terasa berat
            lightboxImg.style.transition = 'transform 0.25s ease-out';
            lightbox.classList.remove('active');
            
            // Reset posisi untuk animasi zoom out ke posisi semula
            lbScale = 0.8;
            lbX = 0;
            lbY = 0;
            updateLightboxTransform();
            
            // Bersihkan sisa transform dan kembalikan blur modal setelah transisi selesai
            setTimeout(() => {
                lightboxImg.style.transition = '';
                lightboxImg.style.transform = '';
                modal.style.backdropFilter = ''; // Pindahkan ke sini agar tidak membebani GPU saat animasi berjalan
            }, 250);
        }
    });

    // Fitur Zoom dengan Scroll Mouse
    lightbox.addEventListener('wheel', (e) => {
        if (!lightbox.classList.contains('active')) return;
        e.preventDefault(); // Matikan scroll halaman bawaan
        
        lightboxImg.style.transition = 'none'; // Matikan transisi agar responsif dan ringan (0 lag)
        
        const zoomSpeed = 0.15;
        if (e.deltaY < 0) lbScale += zoomSpeed; // Scroll atas = membesar
        else lbScale -= zoomSpeed; // Scroll bawah = mengecil
        
        lbScale = Math.max(0.3, Math.min(lbScale, 5)); // Batas zoom 0.3x sampai 5x
        requestAnimationFrame(updateLightboxTransform);
    }, { passive: false });

    // Fitur Geser (Panning) dengan Klik Kanan
    lightbox.addEventListener('contextmenu', e => e.preventDefault()); // Matikan popup klik kanan browser
    
    lightbox.addEventListener('mousedown', (e) => {
        if (e.button === 2 && lightbox.classList.contains('active')) { // 2 = Klik Kanan
            isDragging = true;
            lightboxImg.style.transition = 'none'; // Instan tanpa transisi
            lightbox.style.cursor = 'grabbing';
            startX = e.clientX - lbX;
            startY = e.clientY - lbY;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        lbX = e.clientX - startX;
        lbY = e.clientY - startY;
        requestAnimationFrame(updateLightboxTransform);
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 2 && isDragging) {
            isDragging = false;
            lightbox.style.cursor = 'default';
        }
    });

    // WADAH DATA GAMBAR G-DRIVE (Nanti link-linknya akan dimasukkan ke sini)
    const projectGalleries = {
        "O'Cos (Online Cosmetic)": [
            "https://drive.google.com/file/d/1y1Uf0J0S6ufhTFN5hQq5v8ybBotOa-Lf/view?usp=sharing",
            "https://drive.google.com/file/d/1DL7QzXeGhDY4tZlpto6omLllppoAk_Ij/view?usp=sharing",
            "https://drive.google.com/file/d/1ubnKMkQKj6Heax3a4NR5w1JcZuIFi8x3/view?usp=sharing"
        ],
        "1st Symphony": [
            "https://drive.google.com/file/d/1rzcoSJRonyyX-H9tCE_EyI6LFRMRXary/view?usp=sharing",
            "https://drive.google.com/file/d/15gKWUoeyFCJWY5-N2DxJc_J56uw7DL7V/view?usp=sharing",
            "https://drive.google.com/file/d/1M9meDDdeCRFriRkphtxh-gflbbLegsk-/view?usp=sharing",
        ],
        "GuideME": [
            "https://drive.google.com/file/d/1WHpNzJl3P44aGsAZMUxiozwL8UVRNBwd/view?usp=sharing",
            "https://drive.google.com/file/d/16VpkeSc3AniF5QcnA2Pbx2o8TxxxP7cq/view?usp=sharing",
            "https://drive.google.com/file/d/1rurjwsQyDJekiQ4j16trxdHCrHDaA0PE/view?usp=sharing"
        ],
        "Stock Rising": [
            "https://drive.google.com/file/d/1RbFDCrTnoVidzuw_qooXX1U24IvNRcrh/view?usp=drive_link",
            "https://drive.google.com/file/d/1TdeCajLuiRkicxWqcOnQpfVOQdq1DibE/view?usp=drive_link",
            "https://drive.google.com/file/d/17s34rzSQzPtW293jXwVGUHcM1xc0_4zV/view?usp=drive_link"
        ],
        "Project 5": [],
        "Project 6": []
    };

    // WADAH DESKRIPSI PROJECT
    const projectDescriptions = {
        "O'Cos (Online Cosmetic)": "<strong>What is O’Cos?</strong><br>O’Cos is an exclusive e-commerce platform operating in the cosmetics sector. We provide all your premium beauty product needs from skincare, lipsticks, makeup, and much more. Discover the best version of yourself with O'Cos.",
        "1st Symphony": "<strong>Your Gateway to Unforgettable Concerts</strong><br>Welcome to 1st Symphony, your go-to destination for purchasing music concert tickets online! Browse our wide selection of concerts, from rock to pop to jazz, and secure your tickets with ease.",
        "GuideME": "<strong>Your Personal Tour Guide</strong><br>Guide Me is a Progressive Web App designed to provide complete tourist destination information in Batam, equipped with AI and Google Maps API for real-time navigation.",
        "Stock Rising": "<strong>Stock Rising</strong><br>A digital board game for stock investment simulation built on Android using Unity and Photon PUN 2 for multiplayer. Play with 2-5 players and learn how to invest!",
        "Project 5": "Deskripsi untuk Project 5 belum tersedia. Segera lengkapi data ini.",
        "Project 6": "Deskripsi untuk Project 6 belum tersedia. Segera lengkapi data ini."
    };

    // WADAH LINK PROJECT (File HTML Detail)
    const projectLinks = {
        "O'Cos (Online Cosmetic)": "o_cos.html",
        "1st Symphony": "1st_symphony.html",
        "GuideME": "guideme.html",
        "Stock Rising": "stock_rising.html",
        "Project 5": "#",
        "Project 6": "#"
    };

    // Fungsi helper untuk mengekstrak ID dari link GDrive dan merubahnya ke format lh3
    function formatDriveLink(url) {
        if (!url) return "";
        let fileId = "";
        
        // Cek format 1: ?id=...
        const match1 = url.match(/id=([^&]+)/);
        if (match1 && match1[1]) fileId = match1[1];
        
        // Cek format 2: /file/d/...
        if (!fileId) {
            const match2 = url.match(/\/file\/d\/([^\/]+)/);
            if (match2 && match2[1]) fileId = match2[1];
        }
        
        if (fileId) {
            // Kita gunakan =w1600 agar gambar di dalam gallery tidak pecah/blur saat ditampilkan di layar besar
            return "https://lh3.googleusercontent.com/d/" + fileId + "=w1600";
        }
        return url; // Jika formatnya berbeda, biarkan apa adanya
    }

    // Menambahkan event listener ke semua circle (termasuk yang di-clone)
    document.querySelectorAll('.circle').forEach((circle) => {
        circle.addEventListener('click', () => {
            const img = circle.querySelector('img');
            const projectName = img.alt; // Mengambil nama "O'Cos (Online Cosmetic)", dll dari alt

            modalImg.src = img.src;
            modalTitle.innerText = projectName;
            
            // Render Deskripsi
            const modalDesc = document.getElementById('modal-desc');
            modalDesc.innerHTML = projectDescriptions[projectName] || "Deskripsi belum tersedia.";

            // Render Link Button
            const btnView = modal.querySelector('.btn-view');
            btnView.href = projectLinks[projectName] || "#";
            
            // Render isi Gallery
            modalGallery.innerHTML = ''; // Kosongkan gallery sebelumnya
            const images = projectGalleries[projectName] || [];
            
            if (images.length === 0) {
                // Tampilan default jika belum ada gambar
                modalGallery.innerHTML = '<p style="padding: 20px; color: #666; font-family: sans-serif;">Gambar detail sedang disiapkan...</p>';
            } else {
                images.forEach(link => {
                    const imgEl = document.createElement('img');
                    imgEl.src = formatDriveLink(link);
                    imgEl.alt = projectName + " Detail";
                    imgEl.style.cursor = 'pointer'; // Ganti ke icon tangan sesuai permintaan
                    
                    // Fitur klik untuk preview
                    imgEl.addEventListener('click', () => {
                        // Trik UX: Gunakan versi ringan (yang sudah dimuat) agar animasi muncul seketika (0 lag)
                        lightboxImg.src = imgEl.src;
                        
                        // Muat versi HD asli di belakang layar tanpa mengganggu jalannya animasi CSS
                        let originalResLink = imgEl.src.replace('=w1600', '');
                        const tempImg = new Image();
                        tempImg.onload = () => {
                            if (lightbox.classList.contains('active')) lightboxImg.src = originalResLink;
                        };
                        tempImg.src = originalResLink;
                        
                        // Bersihkan sisa state dari sesi sebelumnya agar CSS awal mengambil alih (zoom in pop effect)
                        lbScale = 1; lbX = 0; lbY = 0;
                        lightboxImg.style.transition = '';
                        lightboxImg.style.transform = '';
                        
                        // FIX GPU LAG: Matikan blur modal selagi lightbox terbuka karena tumpukan 2 blur sangat berat
                        modal.style.backdropFilter = 'none';
                        lightbox.classList.add('active');
                    });
                    
                    modalGallery.appendChild(imgEl);
                });
            }
            
            // Jika project GuideME, sesuaikan mode gallery jadi portrait
            if (projectName === 'GuideME') {
                modalGallery.classList.add('portrait-gallery');
            } else {
                modalGallery.classList.remove('portrait-gallery');
            }
            
            // Tampilkan Modal
            modal.classList.add('active');
            isModalOpen = true;
        });
    });

    // Menutup modal dengan tombol X
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        isModalOpen = false;
    });

    // Menutup modal jika area di luar konten diklik
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            isModalOpen = false;
        }
    });
});