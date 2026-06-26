window.addEventListener('load', () => {
    const colLeft = document.getElementById('col-left');
    const colRight = document.getElementById('col-right');

    // Fungsi menggandakan elemen agar bisa infinite loop
    function duplicateContent(column) {
        const track = column.querySelector('.col-track');
        const children = Array.from(track.children);
        for (let i = 0; i < 7; i++) {
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
        segmentLeft.x = colLeft.querySelector('.col-track').scrollWidth / 8;
        segmentLeft.y = colLeft.querySelector('.col-track').scrollHeight / 8;
        segmentRight.x = colRight.querySelector('.col-track').scrollWidth / 8;
        segmentRight.y = colRight.querySelector('.col-track').scrollHeight / 8;
    }

    updateSegments();

    let isMobile = window.innerWidth <= 1420;

    // Atur posisi awal di tengah (zona aman)
    colLeft.scrollTop = 3.5 * segmentLeft.y;
    colRight.scrollTop = 3.5 * segmentRight.y;
    colLeft.scrollLeft = 3.5 * segmentLeft.x;
    colRight.scrollLeft = 3.5 * segmentRight.x;

    let exactScrollLeft = isMobile ? colLeft.scrollLeft : colLeft.scrollTop;
    let exactScrollRight = isMobile ? colRight.scrollLeft : colRight.scrollTop;

    // Jika layar di-resize dari PC ke HP atau sebaliknya, kita reset dan sesuaikan ukurannya
    window.addEventListener('resize', () => {
        let wasMobile = isMobile;
        isMobile = window.innerWidth <= 1420;
        updateSegments();
        
        if (wasMobile !== isMobile) {
            exactScrollLeft = isMobile ? 3.5 * segmentLeft.x : 3.5 * segmentLeft.y;
            exactScrollRight = isMobile ? 3.5 * segmentRight.x : 3.5 * segmentRight.y;
            colLeft.scrollTop = 3.5 * segmentLeft.y;
            colLeft.scrollLeft = 3.5 * segmentLeft.x;
            colRight.scrollTop = 3.5 * segmentRight.y;
            colRight.scrollLeft = 3.5 * segmentRight.x;
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
                if (exactScrollLeft <= 2.5 * segmentLeft.x) exactScrollLeft += segmentLeft.x;
                colLeft.scrollLeft = exactScrollLeft;
            } else exactScrollLeft = colLeft.scrollLeft;

            // Baris 2: Kanan ke Kiri (scrollLeft bertambah)
            if (!colRight.isInteracting) {
                exactScrollRight += 1.5;
                if (exactScrollRight >= 4.5 * segmentRight.x) exactScrollRight -= segmentRight.x;
                colRight.scrollLeft = exactScrollRight;
            } else exactScrollRight = colRight.scrollLeft;
        } else {
            // PC: VERTIKAL SLIDESHOW
            // Kolom Kiri: Bawah ke Atas (scrollTop bertambah)
            if (!colLeft.isInteracting) {
                exactScrollLeft += 1.5; 
                if (exactScrollLeft >= 4.5 * segmentLeft.y) exactScrollLeft -= segmentLeft.y;
                colLeft.scrollTop = exactScrollLeft;
            } else exactScrollLeft = colLeft.scrollTop;
            
            // Kolom Kanan: Atas ke Bawah (scrollTop berkurang)
            if (!colRight.isInteracting) {
                exactScrollRight -= 1.5; 
                if (exactScrollRight <= 2.5 * segmentRight.y) exactScrollRight += segmentRight.y;
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
                    if (element.scrollLeft >= 4.5 * seg.x) element.scrollLeft -= seg.x;
                    else if (element.scrollLeft <= 2.5 * seg.x) element.scrollLeft += seg.x;
                } else {
                    if (element.scrollTop >= 4.5 * seg.y) element.scrollTop -= seg.y;
                    else if (element.scrollTop <= 2.5 * seg.y) element.scrollTop += seg.y;
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

    // 3. FUNGSI MODAL DETAIL
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalGallery = modal.querySelector('.modal-gallery');

    // WADAH DATA GAMBAR G-DRIVE (Nanti link-linknya akan dimasukkan ke sini)
    const projectGalleries = {
        "Project 1": [
            // "https://lh3.googleusercontent.com/d/ID_GAMBAR_1",
        ],
        "Project 2": [],
        "Project 3": [],
        "Project 4": [],
        "Project 5": [],
        "Project 6": []
    };

    // Fungsi helper untuk mengekstrak ID dari link GDrive dan merubahnya ke format lh3
    function formatDriveLink(url) {
        if (!url) return "";
        const match = url.match(/id=([^&]+)/);
        if (match && match[1]) {
            return "https://lh3.googleusercontent.com/d/" + match[1];
        }
        return url; // Jika formatnya berbeda, biarkan apa adanya
    }

    // Menambahkan event listener ke semua circle (termasuk yang di-clone)
    document.querySelectorAll('.circle').forEach((circle) => {
        circle.addEventListener('click', () => {
            const img = circle.querySelector('img');
            const projectName = img.alt; // Mengambil nama "Project 1", dll dari alt

            modalImg.src = img.src;
            modalTitle.innerText = projectName;
            
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
                    modalGallery.appendChild(imgEl);
                });
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