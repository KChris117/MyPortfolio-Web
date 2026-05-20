window.addEventListener('load', () => {
    const colLeft = document.getElementById('col-left');
    const colRight = document.getElementById('col-right');

    // FIX: Kita gandakan jadi 3 kali saja (Total 4 Copy)
    function duplicateContent(column) {
        const track = column.querySelector('.col-track');
        const children = Array.from(track.children);
        
        const height1 = track.scrollHeight;
        
        for (let i = 0; i < 3; i++) {
            children.forEach(child => {
                track.appendChild(child.cloneNode(true));
            });
        }
        
        const height2 = track.scrollHeight;
        
        // (Tinggi 4 copy - Tinggi 1 copy) dibagi 3 = Tinggi tepat 1 segment
        return (height2 - height1) / 3;
    }

    const segmentHeightLeft = duplicateContent(colLeft);
    const segmentHeightRight = duplicateContent(colRight);

    // Atur posisi awal persis di area tengah (zona aman) dari 4 copy
    colLeft.scrollTop = 1.5 * segmentHeightLeft;
    colRight.scrollTop = 1.5 * segmentHeightRight;

    // Buat status interaksi independen untuk masing-masing kolom
    colLeft.isInteracting = false;
    colRight.isInteracting = false;

    // Variabel presisi tingkat tinggi (mencegah animasi patah dan speed yang beda)
    let exactScrollLeft = 1.5 * segmentHeightLeft;
    let exactScrollRight = 1.5 * segmentHeightRight;

    // 1. FUNGSI SLIDESHOW OTOMATIS
    function autoScroll() {
        if (!colLeft.isInteracting) {
            exactScrollLeft += 1.5; 
            if (exactScrollLeft >= 2.5 * segmentHeightLeft) exactScrollLeft -= segmentHeightLeft;
            colLeft.scrollTop = exactScrollLeft;
        } else {
            exactScrollLeft = colLeft.scrollTop; // Sinkronisasi saat manual scroll
        }
        
        if (!colRight.isInteracting) {
            exactScrollRight -= 1.5; 
            if (exactScrollRight <= 0.5 * segmentHeightRight) exactScrollRight += segmentHeightRight;
            colRight.scrollTop = exactScrollRight;
        } else {
            exactScrollRight = colRight.scrollTop; // Sinkronisasi saat manual scroll
        }
        
        requestAnimationFrame(autoScroll);
    }
    autoScroll();

    // 2. FUNGSI SEAMLESS LOOP & MANUAL SCROLL
    function setupColumnScroll(element, segmentHeight) {
        element.addEventListener('scroll', () => {
            if (element.isInteracting) {
                // Hysteresis yang aman: memberikan toleransi area sangat luas agar tak menabrak 0 atau akhir batas scroll
                if (element.scrollTop >= 2.5 * segmentHeight) {
                    element.scrollTop -= segmentHeight; 
                } 
                else if (element.scrollTop <= 0.5 * segmentHeight) {
                    element.scrollTop += segmentHeight; 
                }
            }
        });

        let scrollTimeout; // Timer dipindah ke sini agar independen per kolom

        // Deteksi interaksi mouse (wheel) & usapan HP (touchmove) supaya auto-scroll berhenti sesaat
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

    setupColumnScroll(colLeft, segmentHeightLeft);
    setupColumnScroll(colRight, segmentHeightRight);
});