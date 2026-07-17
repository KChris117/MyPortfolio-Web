



// Canvas Dissolve Transition Logic
        const canvas = document.getElementById('dissolve-canvas');
        const ctx = canvas.getContext('2d', { alpha: true });
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const blockSize = 30; // 10x10 pixel chunks (cukup optimal untuk performa tapi tetap terlihat efek pixelated)
        let blocks = [];

        function initBlocks() {
            blocks = [];
            const cols = Math.ceil(canvas.width / blockSize);
            const rows = Math.ceil(canvas.height / blockSize);
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    blocks.push({ x: i * blockSize, y: j * blockSize });
                }
            }
            // Acak urutan pixel (Fisher-Yates)
            for (let i = blocks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
            }
        }

        window.addEventListener('load', () => {
            const heroContent = document.querySelector('.hero-content');
            const logoOverlay = document.getElementById('canvas-logo-overlay');
            canvas.style.pointerEvents = 'all';
            
            // Isi penuh layar dengan warna hitam di awal
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            initBlocks();
            
            const totalFrames = 60; // 1 detik pada 60 FPS
            const blocksPerFrame = Math.ceil(blocks.length / totalFrames);
            
            function dissolveIn() {
                for (let i = 0; i < blocksPerFrame; i++) {
                    if (blocks.length === 0) break;
                    const b = blocks.pop();
                    ctx.clearRect(b.x, b.y, blockSize, blockSize);
                }
                if (blocks.length > 0) {
                    requestAnimationFrame(dissolveIn);
                } else {
                    canvas.style.pointerEvents = 'none'; // Izinkan interaksi
                }
            }
            
            // Jeda sejenak sebelum efek dissolve dimulai
            setTimeout(() => {
                if (logoOverlay) logoOverlay.style.opacity = '0';
                requestAnimationFrame(dissolveIn);
                setTimeout(() => {
                    if (heroContent) heroContent.classList.add('animate-in');
                }, 300);
            }, 300); // Tahan logo lebih lama sedikit biar terlihat
        });

        // Page Links transition (Dissolve Out)
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetUrl = this.getAttribute('href');
                const targetBlank = this.getAttribute('target');
                if (targetUrl && !targetUrl.startsWith('#') && targetBlank !== '_blank' && !targetUrl.startsWith('http')) {
                    e.preventDefault(); 
                    const logoOverlay = document.getElementById('canvas-logo-overlay');
                    if (logoOverlay) logoOverlay.style.opacity = '0'; // Pastikan hilang di awal transisi keluar
                    
                    canvas.style.pointerEvents = 'all';
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    initBlocks();
                    ctx.fillStyle = '#1e3a8a';
                    
                    const totalFrames = 45; // Lebih cepat saat keluar
                    const blocksPerFrame = Math.ceil(blocks.length / totalFrames);
                    
                    function dissolveOut() {
                        for (let i = 0; i < blocksPerFrame; i++) {
                            if (blocks.length === 0) break;
                            const b = blocks.pop();
                            ctx.fillRect(b.x, b.y, blockSize, blockSize);
                        }
                        if (blocks.length > 0) {
                            requestAnimationFrame(dissolveOut);
                        } else {
                            if (logoOverlay) logoOverlay.style.opacity = '1';
                            setTimeout(() => { window.location.href = targetUrl; }, 300);
                        }
                    }
                    requestAnimationFrame(dissolveOut);
                }
            });
        });

