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

        // Tabs Logic for Experience Page
        document.addEventListener('DOMContentLoaded', () => {
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active from all buttons and contents
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));

                    // Add active to clicked button
                    btn.classList.add('active');

                    // Show target content
                    const targetId = btn.getAttribute('data-target');
                    const targetContent = document.getElementById(targetId);
                    if(targetContent) {
                        targetContent.classList.add('active');
                        
                        // 1. Reset all animations in the target tab
                        const allBlocks = targetContent.querySelectorAll('.timeline-block');
                        allBlocks.forEach(b => {
                            b.classList.remove('is-visible');
                            // We must re-observe them so they trigger again
                            observer.observe(b);
                        });

                        const mainLine = targetContent.querySelector('.timeline-main-line');
                        if(mainLine) {
                            // Turn off transition temporarily for instant reset
                            mainLine.style.transition = 'none';
                            mainLine.style.height = '0px';
                            // Force reflow
                            void mainLine.offsetWidth;
                            mainLine.style.transition = 'height 0.3s linear';
                        }

                        // 2. Clear the animation queue
                        animationQueue = [];

                        // 3. Auto scroll to the top of the timeline section
                        const header = document.querySelector('.experience-header');
                        if(header) {
                            window.scrollTo({
                                top: header.offsetTop - 20, 
                                behavior: 'smooth'
                            });
                        }
                    }
                });
            });

            // --- Scroll Animation Queue Logic ---
            let isAnimating = false;
            let animationQueue = [];

            const processQueue = () => {
                if (isAnimating || animationQueue.length === 0) return;
                
                isAnimating = true;
                const block = animationQueue.shift();
                
                // Find the main line in this block's container
                const container = block.closest('.timeline-container');
                const mainLine = container.querySelector('.timeline-main-line');
                
                // Calculate target height for the main line
                // It should reach 25px into the block (where the branch line starts)
                const targetHeight = block.offsetTop + 25;
                
                // Ensure main line is at least this tall (don't shrink if scrolling up)
                const currentHeight = parseInt(mainLine.style.height || 0);
                if (targetHeight > currentHeight) {
                    mainLine.style.height = targetHeight + 'px';
                }
                
                // Wait for main line to draw (0.3s transition), then start block animation
                setTimeout(() => {
                    block.classList.add('is-visible');
                    
                    // Total CSS sequence duration is roughly 1300ms
                    // 0s: horizontal, 0.3s: vertical, 0.6s: dot, 0.8s: card (takes 0.5s = 1.3s total)
                    setTimeout(() => {
                        isAnimating = false;
                        processQueue(); // Process next in queue
                    }, 1300);
                    
                }, 300);
            };

            // Intersection Observer to detect blocks entering viewport
            const observerOptions = {
                root: null,
                rootMargin: '0px 0px -15% 0px', // Trigger slightly before the bottom of the screen
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('is-visible')) {
                        // Add to queue and unobserve
                        animationQueue.push(entry.target);
                        observer.unobserve(entry.target);
                        processQueue();
                    }
                });
            }, observerOptions);

            // Observe all blocks initially
            document.querySelectorAll('.timeline-block').forEach(block => {
                observer.observe(block);
            });
        });

        // Lightbox Logic for Experience Images
        document.addEventListener('DOMContentLoaded', () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            const timelineImages = document.querySelectorAll('.timeline-img-wrapper img');

            if (lightbox && lightboxImg) {
                // Open Lightbox
                timelineImages.forEach(img => {
                    img.style.cursor = 'pointer'; // Make images appear clickable
                    img.addEventListener('click', () => {
                        lightboxImg.src = img.src;
                        lightbox.classList.add('active');
                    });
                });

                // Close Lightbox
                lightbox.addEventListener('click', (e) => {
                    if (e.target !== lightboxImg) {
                        lightbox.classList.remove('active');
                    }
                });
            }
        });
