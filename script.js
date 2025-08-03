// چک می‌کنیم که Telegram Web App API آماده هست یا نه
if (window.Telegram && window.Telegram.WebApp) {
    const WebApp = window.Telegram.WebApp;

    // شروع لود شدن وب‌اپ
    WebApp.ready();
    
    // اطلاعات کاربر رو نمایش میدیم
    const userInfoElement = document.getElementById('user-info');
    if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
        const user = WebApp.initDataUnsafe.user;
        userInfoElement.innerText = `سلام، ${user.first_name || 'کاربر عزیز'}!`;
        if (user.username) {
            userInfoElement.innerText += ` (@${user.username})`;
        }
        userInfoElement.innerText += `\nآیدی شما: ${user.id}`;

        // می‌تونید اطلاعات کاربر رو به رباتتون بفرستید
        // مثلاً با استفاده از WebApp.sendData()
        // WebApp.sendData(JSON.stringify({
        //     command: 'start_mini_app',
        //     user_id: user.id,
        //     username: user.username,
        //     first_name: user.first_name
        // }));

    } else {
        userInfoElement.innerText = 'اطلاعات کاربر در دسترس نیست.';
    }

    // دکمه بستن مینی‌اپ
    document.getElementById('close-button').addEventListener('click', () => {
        WebApp.close();
    });

} else {
    // اگه WebApp API لود نشد (مثلاً داری تو مرورگر تست می‌کنی)
    document.getElementById('user-info').innerText = 'این مینی‌اپ باید از طریق تلگرام باز شود.';
    document.getElementById('close-button').style.display = 'none'; // دکمه رو مخفی میکنیم
}