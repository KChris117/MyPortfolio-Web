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

    // 1. FUNGSI SLIDESHOW OTOMATIS (Mendukung Vertikal PC & Horizontal HP)
    function autoScroll() {
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
});