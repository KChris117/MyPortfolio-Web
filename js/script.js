window.addEventListener('load', () => {
    const colLeft = document.getElementById('col-left');
    const colRight = document.getElementById('col-right');

    // Helper function untuk menggandakan elemen 2 kali (Total 3 Copy)
    function duplicateContent(column) {
        const track = column.querySelector('.col-track');
        const children = Array.from(track.children);
        
        const height1 = track.scrollHeight;
        
        // Tambahkan Copy ke-2
        children.forEach(child => {
            track.appendChild(child.cloneNode(true));
        });
        
        const height2 = track.scrollHeight;
        
        // Tambahkan Copy ke-3
        children.forEach(child => {
            track.appendChild(child.cloneNode(true));
        });
        
        // Mengembalikan tinggi pasti dari 1 set elemen (termasuk gap)
        return height2 - height1;
    }

    const segmentHeightLeft = duplicateContent(colLeft);
    const segmentHeightRight = duplicateContent(colRight);

    // Atur posisi awal scroll kedua kolom tepat di awal Copy ke-2 (area tengah)
    // Ini membuat user bisa langsung scroll bebas ke atas maupun ke bawah tanpa mentok
    colLeft.scrollTop = segmentHeightLeft;
    colRight.scrollTop = segmentHeightRight;

    // Buat status interaksi independen untuk masing-masing kolom
    colLeft.isInteracting = false;
    colRight.isInteracting = false;

    // 1. FUNGSI SLIDESHOW OTOMATIS
    function autoScroll() {
        // Kolom Kiri: Jalan ke Atas jika tidak sedang di-scroll manual
        if (!colLeft.isInteracting) colLeft.scrollTop += 1.5; 
        
        // Kolom Kanan: Jalan ke Bawah jika tidak sedang di-scroll manual
        if (!colRight.isInteracting) colRight.scrollTop -= 1.5; 
        
        requestAnimationFrame(autoScroll);
    }
    autoScroll();

    // 2. FUNGSI SEAMLESS LOOP & MANUAL SCROLL
    function setupColumnScroll(element, segmentHeight) {
        element.addEventListener('scroll', () => {
            // Jika scroll ke bawah sudah masuk setengah ke Copy 3, tarik mundur 1 set ke Copy 2
            if (element.scrollTop >= 1.5 * segmentHeight) {
                element.scrollTop -= segmentHeight; 
            } 
            // Jika scroll ke atas mentok di Copy 1, dorong maju 1 set ke Copy 2
            else if (element.scrollTop <= 0) {
                element.scrollTop += segmentHeight; 
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