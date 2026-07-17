window.addEventListener('load', () => {
            const loader = document.getElementById('page-transition');
            requestAnimationFrame(() => {
                setTimeout(() => {
                    loader.classList.add('fade-out');
                }, 300);
            });

            const links = document.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    const targetUrl = this.getAttribute('href');
                    const targetBlank = this.getAttribute('target');
                    if (targetUrl && !targetUrl.startsWith('#') && targetBlank !== '_blank' && !targetUrl.startsWith('http')) {
                        const isSamePageAnchor = targetUrl.includes('.html#') && targetUrl.split('#')[0] === window.location.pathname.split('/').pop();
                        if (!isSamePageAnchor) {
                            e.preventDefault(); 
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
        });

