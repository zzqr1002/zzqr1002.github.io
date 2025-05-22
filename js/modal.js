// 弹窗关闭逻辑
const modal = document.getElementById('modal');
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'; // 点击弹窗外部时关闭弹窗
    }
});