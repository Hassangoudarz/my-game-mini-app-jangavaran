// چک می‌کنیم که Telegram Web App API آماده هست یا نه
if (window.Telegram && window.Telegram.WebApp) {
    const WebApp = window.Telegram.WebApp;

    // شروع لود شدن وب‌اپ
    WebApp.ready();
    WebApp.expand(); // مینی‌اپ رو به حداکثر اندازه گسترش میده
    WebApp.setBackgroundColor('#1e1e2e'); // تنظیم رنگ پس‌زمینه تلگرام
    WebApp.setHeaderColor('#282a36'); // تنظیم رنگ هدر تلگرام

    // MainButton تلگرام رو فعال می‌کنیم
    WebApp.MainButton.text = "به بازی خوش آمدید!";
    WebApp.MainButton.textColor = "#f8f8f2";
    WebApp.MainButton.color = "#bd93f9"; // رنگ بنفش برای MainButton
    WebApp.MainButton.show();

    WebApp.MainButton.onClick(() => {
        // فعلاً برای تست، یک هشدار ساده نشون میدیم
        WebApp.showAlert("به جنگاوران پارس خوش آمدید!");
        // در آینده اینجا میتونه برای عملیات تایید یا بازگشت به منوی اصلی استفاده بشه
    });

    // عناصر HTML برای نمایش اطلاعات
    const userInfoElement = document.getElementById('user-info');
    const goldAmountElement = document.getElementById('gold-amount');
    const diamondAmountElement = document.getElementById('diamond-amount');
    const foodAmountElement = document.getElementById('food-amount');
    const blockAmountElement = document.getElementById('block-amount');
    const soldierAmountElement = document.getElementById('soldier-amount');
    const wallAmountElement = document.getElementById('wall-amount');
    const realmLevelElement = document.getElementById('realm-level');
    const adminPanelBtn = document.getElementById('admin-panel-btn'); // دکمه ادمین
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    let currentUserId = null; // برای ذخیره آیدی کاربر
    let isUserAdmin = false; // برای وضعیت ادمین

    // دکمه‌های اقدامات و نگاشت آنها به دستورات ربات
    const actionButtonsMap = {
        'extract-gold-btn': 'extract_gold',
        'battle-btn': 'battle',
        'my-realm-btn': 'my_realm',
        'market-btn': 'market',
        'sepah-btn': 'sepah',
        'leaderboard-btn': 'leaderboard',
        'extract-resources-btn': 'extract_resources',
        'daily-reward-btn': 'daily_reward',
        'direct-attack-btn': 'direct_attack',
        'special-defense-btn': 'special_defense',
        'sepah-war-btn': 'sepah_war',
        'black-market-btn': 'black_market',
        'game-group-btn': 'game_group',
        'support-btn': 'support',
        'arsenal-btn': 'arsenal',
        'defense-equipment-btn': 'defense_equipment',
        'battle-list-btn': 'battle_list',
        'attack-bot-btn': 'attack_bot',
        'invite-friends-btn': 'invite_friends',
        'game-guide-btn': 'game_guide',
        'statement-btn': 'statement',
        'cyber-warfare-btn': 'cyber_warfare',
        'transfer-resources-btn': 'transfer_resources',
        'telegram-transfer-btn': 'telegram_transfer',
        'admin-panel-btn': 'admin_panel'
    };

    // افزودن Event Listener به تمام دکمه‌ها و افکت Ripple
    for (const btnId in actionButtonsMap) {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', (e) => {
                // Ripple Effect
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - (size / 2);
                const y = e.clientY - rect.top - (size / 2);

                const ripple = document.createElement('span');
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.classList.add('ripple');
                button.appendChild(ripple);

                // Remove ripple after animation
                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });

                handleActionButtonClick(actionButtonsMap[btnId], button.innerText);
            });
        }
    }

    // دکمه بستن مینی‌اپ
    document.getElementById('close-button').addEventListener('click', () => {
        WebApp.close();
    });

    // تابعی برای به‌روزرسانی آمارهای بازیکن در UI
    function updatePlayerStats(stats) {
        goldAmountElement.innerText = stats.gold.toLocaleString('fa-IR');
        diamondAmountElement.innerText = stats.diamonds.toLocaleString('fa-IR');
        foodAmountElement.innerText = stats.food.toLocaleString('fa-IR');
        blockAmountElement.innerText = stats.blocks.toLocaleString('fa-IR');
        soldierAmountElement.innerText = stats.soldiers.toLocaleString('fa-IR');
        wallAmountElement.innerText = stats.walls.toLocaleString('fa-IR');
        realmLevelElement.innerText = stats.level.toLocaleString('fa-IR');
    }

    // تابعی برای ارسال دستورات به ربات
    // این تابع از WebApp.sendData() استفاده خواهد کرد.
    function sendCommandToBot(command, actionText, payload = {}) {
        const dataToSend = {
            command: command,
            user_id: currentUserId,
            payload: payload
        };

        // **اینجا نقطه اتصال به ربات پایتونی شماست!**
        // WebApp.sendData() اطلاعات رو به ربات میفرسته.
        WebApp.sendData(JSON.stringify(dataToSend));

        console.log(`[Mini-App] ارسال دستور: "${command}" با داده:`, dataToSend);
        
        WebApp.MainButton.text = `در حال انجام: ${actionText}...`;
        WebApp.MainButton.showProgress(); // نمایش لودینگ روی MainButton
        WebApp.MainButton.disable(); // غیرفعال کردن دکمه اصلی

        // **شبیه‌سازی دریافت پاسخ از ربات**
        // این قسمت باید در آینده توسط ربات واقعی شما مدیریت شود که پاسخ را به مینی‌اپ برگرداند.
        // تا آن زمان، ما پاسخ را شبیه‌سازی می‌کنیم.
        setTimeout(() => {
            const simulatedResponse = {
                command: `${command}_response`,
                status: 'success', // یا 'error'
                message: `✅ دستور "${actionText}" با موفقیت انجام شد!`,
                player_stats: { // اطلاعات بازیکن بعد از انجام عملیات (مثلاً بعد از جمع‌آوری)
                    gold: Math.floor(Math.random() * 1000) + 1000,
                    diamonds: Math.floor(Math.random() * 50) + 100,
                    food: Math.floor(Math.random() * 5000) + 2000,
                    blocks: Math.floor(Math.random() * 5000) + 2000,
                    soldiers: Math.floor(Math.random() * 1000) + 500,
                    walls: Math.floor(Math.random() * 500) + 200,
                    level: Math.floor(Math.random() * 10) + 1
                }
            };
            handleBotResponse(simulatedResponse);
        }, 2000); // شبیه‌سازی 2 ثانیه تأخیر
    }

    // تابعی برای پردازش پاسخ‌های دریافتی از ربات
    // این تابع در حالت واقعی، توسط WebApp.onEvent('messageFromBot', ...) فراخوانی می‌شود
    function handleBotResponse(response) {
        console.log("[Mini-App] دریافت پاسخ از ربات:", response);
        WebApp.MainButton.hideProgress(); // لودینگ رو مخفی می‌کنیم
        WebApp.MainButton.enable(); // دکمه اصلی رو فعال می‌کنیم

        if (response.status === 'success' && response.player_stats) {
            updatePlayerStats(response.player_stats);
            WebApp.showNotification({
                message: response.message,
                type: 'success'
            });
        } else if (response.status === 'error') {
            WebApp.showNotification({
                message: `❌ خطا: ${response.message}`,
                type: 'error'
            });
        }
        // بازگرداندن متن دکمه اصلی به حالت پیش فرض
        WebApp.MainButton.text = "به جنگاوران پارس خوش آمدید!";
        WebApp.MainButton.color = isUserAdmin ? "#e83e8c" : "#007bff"; // رنگ ادمین یا پیش فرض
    }

    // هندلر کلیک دکمه‌های اقدامات
    function handleActionButtonClick(command, actionText) {
        sendCommandToBot(command, actionText);
    }

    // **مهم: دریافت اطلاعات اولیه بازیکن در زمان لود شدن مینی‌اپ**
    // این یک شبیه‌سازی است. در آینده باید ربات واقعی اطلاعات رو بفرسته.
    if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
        currentUserId = WebApp.initDataUnsafe.user.id;
        userInfoElement.innerText = `سلام، ${WebApp.initDataUnsafe.user.first_name || 'کاربر عزیز'}!`;
        if (WebApp.initDataUnsafe.user.username) {
            userInfoElement.innerText += ` (@${WebApp.initDataUnsafe.user.username})`;
        }
        userInfoElement.innerText += `\nآیدی شما: ${WebApp.initDataUnsafe.user.id}`;

        // شبیه‌سازی نقش ادمین (این باید توسط ربات تأیید شود)
        const ADMIN_IDS_SIMULATED = ["8126836242", "1755368060"]; // آیدی‌های ادمین
        if (ADMIN_IDS_SIMULATED.includes(String(currentUserId))) {
            isUserAdmin = true;
            adminPanelBtn.classList.remove('hidden'); // نمایش دکمه ادمین
            WebApp.MainButton.text = "شما ادمین هستید!";
            WebApp.MainButton.color = "#e83e8c"; // رنگ ادمین
        } else {
            adminPanelBtn.classList.add('hidden'); // اطمینان از مخفی بودن دکمه ادمین
            WebApp.MainButton.text = "به جنگاوران پارس خوش آمدید!";
            WebApp.MainButton.color = "#007bff";
        }
        WebApp.MainButton.show();

        // شبیه‌سازی اطلاعات اولیه بازیکن
        const initialPlayerStats = {
            gold: 5000,
            diamonds: 1500,
            food: 10000,
            blocks: 8000,
            soldiers: 2500,
            walls: 1500,
            level: 15
        };
        updatePlayerStats(initialPlayerStats);

        // مخفی کردن صفحه لودینگ و نمایش محتوای اصلی
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.style.display = 'none';
                mainContent.style.opacity = '1'; // شروع انیمیشن fadeIn برای محتوا
                mainContent.style.transform = 'translateY(0)';
            }, { once: true });
        }, 2000); // 2 ثانیه نمایش لودینگ

    } else {
        // اگر WebApp API لود نشد (مثلاً داری تو مرورگر تست می‌کنی)
        document.body.innerHTML = `
            <div class="container" style="text-align: center; margin-top: 50px;">
                <h1>خطا در بارگذاری مینی‌اپ</h1>
                <p>این مینی‌اپ باید از طریق <strong>تلگرام</strong> باز شود.</p>
                <p>لطفاً ربات را در تلگرام باز کرده و سپس از طریق آن اقدام کنید.</p>
            </div>
        `;
        document.body.style.backgroundColor = 'var(--background-dark)';
        document.body.style.color = 'var(--text-light)';
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        WebApp.MainButton.hide();
    }

} else {
    // برای حالتی که WebApp API اصلاً وجود نداره (نه فقط لود نشده)
    document.body.innerHTML = `
        <div class="container" style="text-align: center; margin-top: 50px;">
            <h1>خطا در بارگذاری مینی‌اپ</h1>
            <p>این مینی‌اپ باید از طریق <strong>تلگرام</strong> باز شود.</p>
            <p>لطفاً ربات را در تلگرام باز کرده و سپس از طریق آن اقدام کنید.</p>
        </div>
    `;
    document.body.style.backgroundColor = 'var(--background-dark)';
    document.body.style.color = 'var(--text-light)';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
}