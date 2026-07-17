document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const galleryItems = document.querySelectorAll('.gallery-item');

    let lbScale = 1;
    let lbX = 0;
    let lbY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    function updateLightboxTransform() {
        lightboxImg.style.transform = `translate3d(${lbX}px, ${lbY}px, 0) scale(${lbScale})`;
    }

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            // Animasi penutupan dibuat lebih cepat dan ringan (0.25s ease-out)
            lightboxImg.style.transition = 'transform 0.25s ease-out';
            lightbox.classList.remove('active');
            lbScale = 0.8; lbX = 0; lbY = 0;
            updateLightboxTransform();
            
            setTimeout(() => {
                lightboxImg.style.transition = '';
                lightboxImg.style.transform = '';
            }, 250);
        }
    });

    lightbox.addEventListener('wheel', (e) => {
        if (!lightbox.classList.contains('active')) return;
        e.preventDefault();
        lightboxImg.style.transition = 'none';
        const zoomSpeed = 0.15;
        if (e.deltaY < 0) lbScale += zoomSpeed;
        else lbScale -= zoomSpeed;
        lbScale = Math.max(0.3, Math.min(lbScale, 5));
        requestAnimationFrame(updateLightboxTransform);
    }, { passive: false });

    lightbox.addEventListener('contextmenu', e => e.preventDefault());
    
    lightbox.addEventListener('mousedown', (e) => {
        if (e.button === 2 && lightbox.classList.contains('active')) {
            isDragging = true;
            lightboxImg.style.transition = 'none';
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

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            
            // Trik UX: Gunakan versi ringan (w1000) yang sudah ada di memori agar animasi instan
            lightboxImg.src = img.src;
            
            // Muat versi HD asli di belakang layar tanpa lag
            const highResLink = img.src.replace('=w1000', '');
            const tempImg = new Image();
            tempImg.onload = () => {
                if (lightbox.classList.contains('active')) lightboxImg.src = highResLink;
            };
            tempImg.src = highResLink;
            
            lbScale = 1; lbX = 0; lbY = 0;
            lightboxImg.style.transition = '';
            lightboxImg.style.transform = '';
            
            lightbox.classList.add('active');
        });
    });
});


// Transition Loader & Entrance Animation
        window.addEventListener('load', () => {
            const loader = document.getElementById('stagger-transition');
            const heroContent = document.querySelector('.hero-content');
            
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (loader) loader.classList.add('open');
                    setTimeout(() => {
                        if (heroContent) heroContent.classList.add('animate-in');
                    }, 400); 
                }, 300);
            });
        });

        // Page Links transition
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetUrl = this.getAttribute('href');
                const targetBlank = this.getAttribute('target');
                const hasOnclick = this.hasAttribute('onclick');
                if (targetUrl && !targetUrl.startsWith('#') && targetBlank !== '_blank' && !targetUrl.startsWith('http') && !hasOnclick) {
                    const isSamePageAnchor = targetUrl.includes('.html#') && targetUrl.split('#')[0] === window.location.pathname.split('/').pop();
                    if (!isSamePageAnchor) {
                        e.preventDefault(); 
                        const loader = document.getElementById('stagger-transition');
                        if (loader) loader.classList.remove('open');
                        // Wait slightly longer so the full staggered animation can play out
                        setTimeout(() => {
                            window.location.href = targetUrl;
                        }, 1000); 
                    }
                }
            });
        });

