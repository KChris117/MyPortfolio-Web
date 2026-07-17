// Transition Loader & Entrance Animation
        window.addEventListener('load', () => {
            const loader = document.getElementById('page-transition');
            const heroContent = document.querySelector('.hero-content');
            
            requestAnimationFrame(() => {
                setTimeout(() => {
                    // 1. Hilangkan loader
                    loader.classList.add('fade-out');
                    
                    // 2. Mainkan animasi masuk konten setelah loader mulai menghilang
                    setTimeout(() => {
                        if (heroContent) {
                            heroContent.classList.add('animate-in');
                        }
                    }, 300); // delay 300ms agar pas dengan timing transisi
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

