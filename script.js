document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 启动 3D 水波特效 ---
    init3DWater();

    // --- 2. 动态加载画廊内容 ---
    const galleryRoot = document.getElementById('gallery-root');
    const navList = document.getElementById('nav-list');

    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            renderGallery(data);
            initInteractions();
        })
        .catch(error => {
            console.error('无法加载 data.json。请确保已运行 python scan.py 并在本地服务器环境下打开。', error);
            galleryRoot.innerHTML = '<p style="text-align:center; padding: 2rem;">请运行 scan.py 并刷新页面</p>';
        });

    function renderGallery(items) {
        galleryRoot.innerHTML = ''; 
        navList.innerHTML = '';

        // 按年份分组
        const grouped = items.reduce((acc, item) => {
            (acc[item.year] = acc[item.year] || []).push(item);
            return acc;
        }, {});

        // 年份倒序
        const years = Object.keys(grouped).sort((a, b) => b - a);

        years.forEach(year => {
            // A. 导航
            const li = document.createElement('li');
            li.innerHTML = `<a href="#year-${year}">${year}</a>`;
            navList.appendChild(li);

            // B. 区块
            const section = document.createElement('section');
            section.id = `year-${year}`;
            section.className = 'year-section';

            // C. 卡片 HTML (不含日期)
            let cardsHTML = grouped[year].map(item => {
                const media = item.type === 'video' 
                    ? `<video src="${item.src}" muted loop preload="metadata"></video><div class="play-icon">▶</div>`
                    : `<img src="${item.src}" alt="${item.title}" loading="lazy">`;
                const overlay = item.type === 'video' ? '播放' : '放大';

                return `
                    <div class="masonry-item card" data-type="${item.type}" data-src="${item.src}">
                        <div class="media-wrapper">
                            ${media}
                            <div class="card-overlay"><span>${overlay}</span></div>
                        </div>
                        <div class="card-meta">
                            <h3 class="file-name">${item.title}</h3>
                        </div>
                    </div>`;
            }).join('');

            section.innerHTML = `<h2 class="year-title">${year}</h2><div class="masonry-grid">${cardsHTML}</div>`;
            galleryRoot.appendChild(section);
        });

        if(navList.firstElementChild) navList.firstElementChild.querySelector('a').classList.add('active');
    }

    // --- 3. 交互逻辑 (滚动、灯箱) ---
    function initInteractions() {
        // Scroll Reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.year-section').forEach(sec => observer.observe(sec));

        // 视频悬停预览
        document.querySelectorAll('.card[data-type="video"]').forEach(card => {
            const v = card.querySelector('video');
            if(v) {
                card.addEventListener('mouseenter', () => v.play().catch(()=>{}));
                card.addEventListener('mouseleave', () => { v.pause(); v.currentTime=0; });
            }
        });

        // Lightbox
        const lightbox = document.getElementById('lightbox');
        const boxContent = document.getElementById('lightbox-media-container');
        
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                const src = card.dataset.src;
                boxContent.innerHTML = '';

                if(type === 'video') {
                    const vid = document.createElement('video');
                    vid.src = src; vid.controls = true; vid.autoplay = true;
                    vid.style.maxWidth='100%'; vid.style.maxHeight='85vh';
                    boxContent.appendChild(vid);
                } else {
                    const img = document.createElement('img');
                    img.src = src;
                    boxContent.appendChild(img);
                    enableZoom(img);
                }
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeBox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            const v = boxContent.querySelector('video');
            if(v) v.pause();
            setTimeout(()=> boxContent.innerHTML='', 300);
        };
        
        document.querySelector('.close-btn').addEventListener('click', closeBox);
        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox || e.target.classList.contains('lightbox-content')) closeBox();
        });

        // 导航联动
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section');
            let current = '';
            sections.forEach(sec => {
                if(pageYOffset >= (sec.offsetTop - 300)) current = sec.id;
            });
            document.querySelectorAll('.sticky-nav a').forEach(a => {
                a.classList.remove('active');
                if(a.getAttribute('href') === `#${current}`) a.classList.add('active');
            });
        });
    }

    function enableZoom(el) {
        let scale = 1;
        el.style.transition = 'transform 0.3s'; el.style.cursor = 'zoom-in';
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            scale = scale === 1 ? 1.8 : 1;
            el.style.transform = `scale(${scale})`;
            el.style.cursor = scale===1 ? 'zoom-in' : 'zoom-out';
        });
        el.addEventListener('wheel', (e) => {
            e.preventDefault();
            scale += Math.sign(e.deltaY) * -0.1;
            scale = Math.min(Math.max(1, scale), 3);
            el.style.transform = `scale(${scale})`;
        });
    }
});

// --- 4. Three.js 3D 水波核心代码 ---
function init3DWater() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.FogExp2(0xffffff, 0.0012);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 40, 180); 
    camera.lookAt(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 平面几何体 (细分越多越平滑)
    const geometry = new THREE.PlaneGeometry(2000, 2000, 128, 128);
    
    // 材质：关键在于 specular (高光) 为亮蓝
    const material = new THREE.MeshPhongMaterial({
        color: 0xf3f2f8,     // 液体基色 (淡蓝)
        emissive: 0xf3f2f8,
        emissiveIntensity: 0.6,
        specular: 0xebedff,  // 高光反光 (亮蓝)
        shininess: 5,
        side: THREE.DoubleSide,
        flatShading: false
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xf3f2f8, 0.3); 
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x3354ff, 0.2);
    dirLight.position.set(100, 100, 50);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0xebedff, 2, 400);
    blueLight.position.set(0, 50, 50);
    scene.add(blueLight);

    // 动画
    let count = 0;
    function animate() {
        requestAnimationFrame(animate);
        count += 0.008;

        const positionAttribute = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            // 波浪算法
            const z = Math.sin(vertex.x / 45 + count) * 15 + 
                      Math.sin(vertex.y / 45 + count) * 15;
            positionAttribute.setZ(i, z);
        }
        positionAttribute.needsUpdate = true;
        
        blueLight.position.x = Math.sin(count * 0.5) * 150;
        blueLight.position.z = Math.cos(count * 0.3) * 150;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
