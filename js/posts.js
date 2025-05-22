async function loadPosts() {
    try {
        console.log('开始加载 posts.json 文件');
        const response = await fetch('../posts.json');
        if (!response.ok) {
            throw new Error(`HTTP 错误！状态码：${response.status}`);
        }
        const posts = await response.json();
        console.log('成功加载 posts.json 数据：', posts);

        // 按年份分组帖子
        const postsByYear = {
            '2023': [],
            '2024': [],
            '2025': []
        };

        // 将帖子按年份分组
        posts.forEach(post => {
            const year = post.date.substring(0, 4); // 从日期中提取年份
            if (postsByYear[year]) {
                postsByYear[year].push(post);
            }
        });

        // 初始化显示2024年的帖子
        displayPosts(postsByYear['2024']);

        // 添加标签页切换事件
        const tabs = document.querySelectorAll('.year-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 更新活动标签
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // 显示对应年份的帖子
                const year = tab.dataset.year;
                displayPosts(postsByYear[year] || []);
            });
        });

        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('加载内容失败：', error);
        document.getElementById('loading').innerText = '加载失败，请检查网络或刷新页面';
    }
}

function displayPosts(posts) {
    const container = document.getElementById('post-container');
    container.innerHTML = ''; // 清空容器

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const postContent = document.createElement('div');
        postContent.classList.add('post-content');

        const postHeader = document.createElement('div');
        postHeader.classList.add('post-header');
        
        // 添加日期显示
        const postDate = document.createElement('div');
        postDate.classList.add('post-date');
        postDate.textContent = post.displayDate || '';
        postHeader.appendChild(postDate);

        const mediaContainer = document.createElement('div');
        mediaContainer.classList.add('post-media');

        if (post.type === 'image') {
            const img = document.createElement('img');
            img.src = post.src;
            img.alt = post.alt;
            img.classList.add('post-image');
            mediaContainer.appendChild(img);

            // 添加点击事件
            img.addEventListener('click', () => {
                const modal = document.getElementById('modal');
                const modalImage = document.getElementById('modal-image');
                modalImage.src = post.src;
                modal.style.display = 'flex';
            });
        } else if (post.type === 'video') {
            const video = document.createElement('video');
            video.controls = true;
            video.loop = true;
            const source = document.createElement('source');
            source.src = post.src;
            source.type = 'video/mp4';
            video.appendChild(source);
            mediaContainer.appendChild(video);
        }

        const description = document.createElement('p');
        description.textContent = post.description;

        postContent.appendChild(postHeader);
        postContent.appendChild(mediaContainer);
        postContent.appendChild(description);

        postElement.appendChild(postContent);
        container.appendChild(postElement);
    });
}

window.onload = loadPosts;