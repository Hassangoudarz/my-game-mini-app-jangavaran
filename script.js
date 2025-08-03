if (window.Telegram && window.Telegram.WebApp) {
    const WebApp = window.Telegram.WebApp;

    WebApp.ready();
    WebApp.expand(); // مینی‌اپ رو کامل باز می‌کنه

    const userInfoElement = document.getElementById('user-info');
    const playerStatsElement = document.createElement('div');
    playerStatsElement.id = 'player-stats';
    document.querySelector('.container').insertBefore(playerStatsElement, document.getElementById('close-button'));

    const actionsContainer = document.createElement('div');
    actionsContainer.id = 'actions-container';
    document.querySelector('.container').insertBefore(actionsContainer, document.getElementById('close-button'));


    // تابع برای نمایش پیام‌ها در مینی‌اپ
    function showMessage(msg) {
        const messageDiv = document.createElement('p');
        messageDiv.innerText = msg;
        messageDiv.style.color = '#ffcc00';
        messageDiv.style.fontWeight = 'bold';
        document.querySelector('.container').insertBefore(messageDiv, userInfoElement.nextSibling); // قبل از user-info نمایش بده
        setTimeout(() => messageDiv.remove(), 5000); // بعد از 5 ثانیه پاک میشه
    }

    // درخواست اطلاعات اولیه کاربر
    if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
        const user = WebApp.initDataUnsafe.user;
        userInfoElement.innerText = `سلام، ${user.first_name || 'کاربر عزیز'}!`;
        if (user.username) {
            userInfoElement.innerText += ` (@${user.username})`;
        }
        userInfoElement.innerText += `\nآیدی شما: ${user.id}`;
        
        // ارسال درخواست برای دریافت اطلاعات بازیکن
        WebApp.sendData(JSON.stringify({
            command: 'get_player_stats',
            user_id: user.id
        }));

    } else {
        userInfoElement.innerText = 'اطلاعات کاربر در دسترس نیست.';
    }

    // تابع برای به‌روزرسانی وضعیت بازیکن
    function updatePlayerStats(stats) {
        if (!stats) {
            playerStatsElement.innerHTML = '<p>اطلاعات بازیکن بارگذاری نشد.</p>';
            return;
        }
        playerStatsElement.innerHTML = `
            <h2>وضعیت قلمرو شما:</h2>
            <p><strong>سربازان:</strong> ${stats.soldiers || 0} 💂‍♂️</p>
            <p><strong>دیوارها:</strong> ${stats.walls || 0} 🛡️</p>
            <p><strong>غذا:</strong> ${stats.food || 0} 🍖</p>
            <p><strong>بلوک:</strong> ${stats.blocks || 0} 🧱</p>
            <p><strong>طلا:</strong> ${stats.gold || 0} 💰</p>
            <p><strong>الماس:</strong> ${stats.diamonds || 0} 💎</p>
            <p><strong>سطح:</strong> ${stats.level || 1} 🌟</p>
        `;
    }

    // اضافه کردن دکمه‌ها برای اقدامات بازی
    function createActionButton(text, command, value = null) {
        const button = document.createElement('button');
        button.innerText = text;
        button.addEventListener('click', () => {
            WebApp.sendData(JSON.stringify({
                command: command,
                value: value,
                user_id: WebApp.initDataUnsafe.user.id
            }));
            // WebApp.HapticFeedback.impactOccurred('light'); // بازخورد لمسی (اختیاری)
        });
        actionsContainer.appendChild(button);
    }
    
    // دکمه‌ها برای تست (میتونیم بعدا گسترششون بدیم)
    createActionButton('ساخت 100 سرباز', 'build_soldiers', 100);
    createActionButton('ساخت 50 دیوار', 'build_walls', 50);
    createActionButton('برداشت منابع', 'collect_resources');
    createActionButton('جمع آوری طلا', 'collect_gold');

    // دریافت داده از ربات
    // این Listener وقتی ربات با WebApp.send_message یا WebApp.answerWebAppQuery به مینی‌اپ پاسخ میده، فعال میشه
    WebApp.onEvent('rawData', (data) => {
        try {
            const response = JSON.parse(data);
            if (response.type === 'player_stats') {
                updatePlayerStats(response.stats);
                showMessage('وضعیت قلمرو به‌روز شد!');
            } else if (response.type === 'action_result') {
                showMessage(response.message);
                // بعد از انجام هر کار، دوباره اطلاعات بازیکن رو درخواست می‌کنیم تا به‌روز بشه
                WebApp.sendData(JSON.stringify({
                    command: 'get_player_stats',
                    user_id: WebApp.initDataUnsafe.user.id
                }));
            } else if (response.type === 'error') {
                showMessage(`خطا: ${response.message}`);
            }
        } catch (e) {
            console.error('Failed to parse WebApp rawData:', e);
        }
    });


    // دکمه بستن مینی‌اپ
    document.getElementById('close-button').addEventListener('click', () => {
        WebApp.close();
    });

} else {
    // اگه WebApp API لود نشد (مثلاً داری تو مرورگر تست می‌کنی)
    document.getElementById('user-info').innerText = 'این مینی‌اپ باید از طریق تلگرام باز شود.';
    document.getElementById('close-button').style.display = 'none'; // دکمه رو مخفی میکنیم
}