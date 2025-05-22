document.addEventListener('DOMContentLoaded', () => {
    let isScrolling = false;

    // 监听鼠标滚轮事件
    window.addEventListener('wheel', (event) => {
        if (isScrolling) return;
        
        // 检查是否在首屏
        const firstScreen = document.querySelector('.full-screen-header');
        const firstScreenRect = firstScreen.getBoundingClientRect();
        
        // 如果滚动发生在首屏范围内（顶部在视口内）
        if (firstScreenRect.top >= 0 && firstScreenRect.top <= window.innerHeight) {
            if (event.deltaY > 0) { // 向下滚动
                isScrolling = true;
                event.preventDefault(); // 阻止默认滚动行为
                document.getElementById('about').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                setTimeout(() => {
                    isScrolling = false;
                }, 1000);
            }
        }
    }, { passive: false });

    // 弹窗功能
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const resetZoomBtn = document.getElementById('reset-zoom');

    // 重置缩放功能
    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', () => {
            if (modalImage) {
                modalImage.style.transform = 'scale(1)';
            }
        });
    }

    // 点击弹窗外部关闭
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // 监听图片点击事件
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('post-image')) {
            if (modal && modalImage) {
                modalImage.src = event.target.src;
                modal.style.display = 'flex';
            }
        }
    });
});