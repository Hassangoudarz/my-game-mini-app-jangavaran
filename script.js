// چک می‌کنیم که Bale Web App API آماده هست یا نه
// API بله از window.Bale.WebApp استفاده می‌کند.
if (window.Bale && window.Bale.WebApp) {
    const WebApp = window.Bale.WebApp;

    // شروع لود شدن وب‌اپ
    WebApp.ready();
    WebApp.expand(); // مینی‌اپ رو به حداکثر اندازه گسترش میده

    // تنظیم رنگ‌های هدر و پس‌زمینه تلگرام (اختیاری، اگر بله پشتیبانی کنه)
    // بر اساس مستندات بله، این متدها در نسخه 1.1 موجودند
    // WebApp.setHeaderColor('#2d3748'); // secondary_bg_color from :root
    // WebApp.setBackgroundColor('#1a202c'); // background_deep_dark from :root

    // MainButton بله رو فعال می‌کنیم (اختیاری، اما برای UX خوبه)
    // در بله، MainButton مستقیماً در API جاوااسکریپت وجود ندارد،
    // اما می‌توانید از backButton یا sendData استفاده کنید.
    // اگر MainButton تلگرام را می‌خواستید، در بله باید دکمه خودتان را طراحی کنید.
    // فعلاً این بخش برای بله از WebApp.MainButton تلگرام برداشته شده.

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
    // این Mapping برای ارسال دستورات به ربات استفاده می‌شود.
    const actionButtonsMap = {
        'extract-gold-btn': { command: 'extract_gold', text: 'استخراج طلا' },
        'battle-btn': { command: 'battle', text: 'نبرد' },
        'my-realm-btn': { command: 'my_realm', text: 'قلمرو من' },
        'market-btn': { command: 'market', text: 'بازار' },
        'sepah-btn': { command: 'sepah', text: 'سپاه' },
        'leaderboard-btn': { command: 'leaderboard', text: 'رتبه‌بندی' },
        'extract-resources-btn': { command: 'extract_resources', text: 'استخراج منابع' },
        'daily-reward-btn': { command: 'daily_reward', text: 'جایزه روزانه' },
        'direct-attack-btn': { command: 'direct_attack', text: 'حمله مستقیم' },
        'special-defense-btn': { command: 'special_defense', text: 'دفاع ویژه' },
        'sepah-war-btn': { command: 'sepah_war', text: 'نبرد بین سپاهی' },
        'black-market-btn': { command: 'black_market', text: 'بازار سیاه' },
        'game-group-btn': { command: 'game_group', text: 'گروه بازی' },
        'support-btn': { command: 'support', text: 'پشتیبانی' },
        'arsenal-btn': { command: 'arsenal', text: 'زرادخانه' },
        'defense-equipment-btn': { command: 'defense_equipment', text: 'تجهیزات دفاعی' },
        'battle-list-btn': { command: 'battle_list', text: 'لیست نبردها' },
        'attack-bot-btn': { command: 'attack_bot', text: 'حمله به بات' },
        'invite-friends-btn': { command: 'invite_friends', text: 'دعوت دوستان' },
        'game-guide-btn': { command: 'game_guide', text: 'راهنمای بازی' },
        'statement-btn': { command: 'statement', text: 'بیانیه' },
        'cyber-warfare-btn': { command: 'cyber_warfare', text: 'جنگ سایبری' },
        'transfer-resources-btn': { command: 'transfer_resources', text: 'انتقال منابع' },
        'telegram-transfer-btn': { command: 'telegram_transfer', text: 'انتقال به تلگرام' },
        'admin-panel-btn': { command: 'admin_panel', text: 'پنل ادمین' }
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
                ripple.classList.add('ripple');
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                button.appendChild(ripple);

                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });

                handleActionButtonClick(actionButtonsMap[btnId].command, actionButtonsMap[btnId].text);
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
    function sendCommandToBot(command, actionText, payload = {}) {
        const dataToSend = {
            command: command,
            user_id: currentUserId,
            payload: payload
        };

        // **اینجا نقطه اتصال به ربات پایتونی شماست!**
        // WebApp.sendData() اطلاعات رو به ربات بله میفرسته.
        // طبق مستندات بله، بعد از sendData مینی‌اپ بسته می‌شود.
        // پس اگر می‌خواهید مینی‌اپ باز بماند، باید از روش‌های دیگر (مثل WebSockets یا APIهای HTTP) استفاده کنید.
        // اما برای سادگی و طبق مستندات فعلی، sendData را استفاده می‌کنیم.
        WebApp.sendData(JSON.stringify(dataToSend));

        console.log(`[Mini-App] ارسال دستور: "${command}" با داده:`, dataToSend);
        
        // **در اینجا به جای MainButton تلگرام، از یک نوتیفیکیشن موقت استفاده می‌کنیم.**
        // و برای شبیه‌سازی وضعیت، پیام نوتیفیکیشن را نمایش می‌دهیم.
        // در حالت واقعی، پاسخ از ربات می‌آید.
        WebApp.showNotification({
            message: `دستور "${actionText}" ارسال شد. منتظر پاسخ ربات باشید...`,
            type: 'info' // 'info', 'success', 'error'
        });

        // **شبیه‌سازی دریافت پاسخ از ربات**
        // این قسمت باید در آینده توسط ربات واقعی شما مدیریت شود که پاسخ را به مینی‌اپ برگرداند.
        // فعلاً برای نمایش تغییرات، بعد از 2 ثانیه یک پاسخ شبیه‌سازی شده دریافت می‌کنیم.
        setTimeout(() => {
            const simulatedResponse = {
                command: `${command}_response`,
                status: 'success', // یا 'error'
                message: `✅ دستور "${actionText}" با موفقیت انجام شد!`,
                player_stats: { // اطلاعات بازیکن بعد از انجام عملیات (مثلا بعد از جمع‌آوری)
                    gold: Math.floor(Math.random() * 1000) + 1000 + (command === 'extract_gold' ? 500 : 0),
                    diamonds: Math.floor(Math.random() * 50) + 100,
                    food: Math.floor(Math.random() * 5000) + 2000 + (command === 'extract_resources' ? 1000 : 0),
                    blocks: Math.floor(Math.random() * 5000) + 2000 + (command === 'extract_resources' ? 1000 : 0),
                    soldiers: Math.floor(Math.random() * 1000) + 500 + (command === 'build_soldier' ? 100 : 0),
                    walls: Math.floor(Math.random() * 500) + 200 + (command === 'build_wall' ? 50 : 0),
                    level: Math.floor(Math.random() * 10) + 1
                }
            };
            handleBotResponse(simulatedResponse);
        }, 2000); // شبیه‌سازی 2 ثانیه تأخیر
    }

    // تابعی برای پردازش پاسخ‌های دریافتی از ربات
    // این تابع در حالت واقعی، توسط WebApp.onEvent('customEvent', ...) فراخوانی می‌شود
    function handleBotResponse(response) {
        console.log("[Mini-App] دریافت پاسخ از ربات:", response);
        
        if (response.status === 'success' && response.player_stats) {
            updatePlayerStats(response.player_stats);
            WebApp.showAlert(response.message); // از showAlert برای پیام‌های موفقیت‌آمیز استفاده می‌کنیم
        } else if (response.status === 'error') {
            WebApp.showAlert(`❌ خطا: ${response.message}`); // از showAlert برای پیام‌های خطا استفاده می‌کنیم
        }
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
        } else {
            adminPanelBtn.classList.add('hidden'); // اطمینان از مخفی بودن دکمه ادمین
        }

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
            loadingScreen.classList.add('fade-out'); // شروع انیمیشن fade-out
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.style.display = 'none';
                mainContent.classList.add('container-loaded'); // شروع انیمیشن fadeIn برای محتوا
            }, { once: true });
        }, 2000); // 2 ثانیه نمایش لودینگ

    } else {
        // اگر WebApp API لود نشد (مثلاً داری تو مرورگر تست می‌کنی)
        // یا اطلاعات کاربر در دسترس نبود
        document.body.innerHTML = `
            <div class="container" style="text-align: center; margin-top: 50px;">
                <h1>خطا در بارگذاری مینی‌اپ</h1>
                <p>این مینی‌اپ باید از طریق <strong>بله</strong> باز شود.</p>
                <p>لطفاً ربات را در بله باز کرده و سپس از طریق آن اقدام کنید.</p>
            </div>
        `;
        document.body.style.backgroundColor = 'var(--background-deep-dark)';
        document.body.style.color = 'var(--text-main-light)';
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        loadingScreen.style.display = 'none'; // مطمئن شو لودینگ هم مخفی میشه
    }

} else {
    // برای حالتی که Bale WebApp API اصلاً وجود نداره
    document.body.innerHTML = `
        <div class="container" style="text-align: center; margin-top: 50px;">
            <h1>خطا در بارگذاری مینی‌اپ</h1>
            <p>این مینی‌اپ باید از طریق <strong>بله</strong> باز شود.</p>
            <p>لطفاً اپلیکیشن بله خود را به‌روزرسانی کنید یا از طریق ربات در بله اقدام کنید.</p>
        </div>
    `;
    document.body.style.backgroundColor = 'var(--background-deep-dark)';
    document.body.style.color = 'var(--text-main-light)';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
}