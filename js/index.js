window.addEventListener('load', () => {
    const loader = document.getElementById('page-transition');
    
    // Fade out the loader ONLY AFTER everything has fully loaded
    requestAnimationFrame(() => {
        setTimeout(() => {
            if(loader) loader.classList.add('fade-out');
        }, 300);
    });

    // Handle link clicks for page transitions
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetUrl = this.getAttribute('href');
            const targetBlank = this.getAttribute('target');
            
            // Hanya tangani link yang pindah halaman (bukan anchor # atau tab baru)
            if (targetUrl && !targetUrl.startsWith('#') && targetBlank !== '_blank' && !targetUrl.startsWith('http')) {
                // Cek apakah link benar-benar menuju halaman berbeda, bukan anchor di halaman yang sama
                const isSamePageAnchor = targetUrl.includes('.html#') && targetUrl.split('#')[0] === window.location.pathname.split('/').pop();
                
                if (!isSamePageAnchor) {
                    e.preventDefault(); 
                    if(loader) loader.classList.remove('fade-out');
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 500);
                }
            }
        });
    });
});
