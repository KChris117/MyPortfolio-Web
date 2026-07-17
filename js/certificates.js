// Transition loader
        window.addEventListener('load', () => {
            const loader = document.getElementById('page-transition');
            requestAnimationFrame(() => {
                setTimeout(() => {
                    loader.classList.add('fade-out');
                }, 300);
            });
        });

        // Page Links transition
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetUrl = this.getAttribute('href');
                const targetBlank = this.getAttribute('target');
                if (targetUrl && !targetUrl.startsWith('#') && targetBlank !== '_blank' && !targetUrl.startsWith('http')) {
                    const isSamePageAnchor = targetUrl.includes('.html#') && targetUrl.split('#')[0] === window.location.pathname.split('/').pop();
                    if (!isSamePageAnchor) {
                        e.preventDefault(); 
                        const loader = document.getElementById('page-transition');
                        loader.classList.remove('fade-out');
                        setTimeout(() => {
                            window.location.href = targetUrl;
                        }, 500);
                    }
                }
            });
        });

        // Mobile Menu Toggle
        const mobileMenu = document.getElementById('mobile-menu');
        const navLinksMenu = document.querySelector('.nav-links');
        if(mobileMenu) {
            mobileMenu.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                navLinksMenu.classList.toggle('active');
            });
            
            // Close menu when a link is clicked
            const navItems = document.querySelectorAll('.nav-links a');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    navLinksMenu.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !navLinksMenu.contains(e.target) && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    navLinksMenu.classList.remove('active');
                }
            });
        }

        // Lightbox Logic & Watermark Logic
        const lightbox = document.getElementById('lightbox-cert');
        const lightboxImg = document.getElementById('lightbox-cert-img');
        
        function applyWatermark(url, imgElement, isHD) {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Sangat penting untuk melewati batas CORS Google
            
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Gambar sertifikat asli
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                           // Set transparansi (opacity) ke 0.1 (Sangat tipis)
                ctx.globalAlpha = 0.1;
                
                // Kalkulasi ukuran font responsif
                const textFontSize = isHD ? Math.max(canvas.width * 0.05, 60) : Math.max(canvas.width * 0.07, 40);
                ctx.font = `bold ${textFontSize}px 'Circular Std', sans-serif`;
                
                // Menentukan titik tengah persis di gambar
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                
                // === Teks "Chris Aristo" ===
                ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Tambahkan sedikit outline putih agar teks tetap terlihat walaupun tipis
                ctx.shadowColor = "white";
                ctx.shadowBlur = 10;
                ctx.lineWidth = 3;
                ctx.strokeText('Chris Aristo', centerX, centerY);
                
                ctx.shadowBlur = 0; // Matikan shadow untuk isi teks asli
                ctx.fillText('Chris Aristo', centerX, centerY);
                
                // Kembalikan globalAlpha ke 1.0 (opsional, praktik yang baik)
                ctx.globalAlpha = 1.0;

                try {
                    // Export hasil gabungan jadi satu gambar permanen
                    imgElement.src = canvas.toDataURL("image/jpeg", 0.95);
                    // Tambahkan transisi masuk
                    imgElement.style.opacity = '1';
                } catch (e) {
                    console.error("CORS Error memblokir Canvas:", e);
                    // Fallback: Jika GDrive menolak CORS, tampilkan gambar asli (tanpa watermark)
                    imgElement.src = url;
                    imgElement.style.opacity = '1';
                }
            };
            
            img.onerror = () => {
                // Fallback error
                imgElement.src = url;
                imgElement.style.opacity = '1';
            };
            
            img.src = url;
        }

        // Proses semua gambar di grid saat halaman dimuat
        document.querySelectorAll('.cert-img').forEach(img => {
            // Sembunyikan gambar sebelum di-watermark
            img.style.opacity = '0';
            const url = img.getAttribute('data-src');
            
            // Terapkan watermark untuk versi thumbnail
            applyWatermark(url, img, false);

            img.addEventListener('click', () => {
                // Untuk versi Fullscreen (Lightbox), kita proses versi resolusi tinggi (=w1600)
                const hdUrl = url.replace('=w800', '=w1600');
                lightboxImg.style.opacity = '0';
                applyWatermark(hdUrl, lightboxImg, true);
                lightbox.classList.add('active');
            });
        });

        lightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
            setTimeout(() => {
                lightboxImg.src = '';
            }, 400); 
        });

