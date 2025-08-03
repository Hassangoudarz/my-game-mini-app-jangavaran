// چک می‌کنیم که Telegram Web App API آماده هست یا نه
if (window.Telegram && window.Telegram.WebApp) {
    const WebApp = window.Telegram.WebApp;

    // شروع لود شدن وب‌اپ
    WebApp.ready();
    WebApp.expand(); // مینی‌اپ رو به حداکثر اندازه گسترش میده

    // MainButton تلگرام رو فعال می‌کنیم (اختیاری، ولی برای UX بهتره)
    WebApp.MainButton.text = "به بازی خوش آمدید!";
    WebApp.MainButton.textColor = "#FFFFFF";
    WebApp.MainButton.color = "#007bff";
    WebApp.MainButton.show();

    WebApp.MainButton.onClick(() => {
        WebApp.showAlert("به جنگاوران پارس خوش آمدید!");
        // اینجا میتونی یک عملیات خاص رو با کلیک روی MainButton انجام بدی
        // مثلاً بازگشت به صفحه اصلی یا ارسال یک دستور خاص به ربات
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

    let currentUserId = null; // برای ذخیره آیدی کاربر
    let isUserAdmin = false; // برای وضعیت ادمین

    // دکمه‌های اقدامات
    const actionButtons = {
        'extract-gold-btn': 'استخراج طلا',
        'battle-btn': 'نبرد',
        'my-realm-btn': 'قلمرو من',
        'market-btn': 'بازار',
        'sepah-btn': 'سپاه',
        'leaderboard-btn': 'رتبه‌بندی',
        'extract-resources-btn': 'استخراج منابع',
        'daily-reward-btn': 'جایزه روزانه',
        'direct-attack-btn': 'حمله مستقیم',
        'special-defense-btn': 'دفاع ویژه',
        'sepah-war-btn': 'نبرد بین سپاهی ⚔️',
        'black-market-btn': 'بازار سیاه',
        'game-group-btn': 'گروه بازی',
        'support-btn': 'پشتیبانی',
        'arsenal-btn': 'زرادخانه',
        'defense-equipment-btn': 'تجهیزات دفاعی',
        'battle-list-btn': 'لیست نبردها',
        'attack-bot-btn': 'حمله به بات',
        'invite-friends-btn': 'دعوت دوستان',
        'game-guide-btn': 'راهنمای بازی',
        'statement-btn': 'بیانیه',
        'cyber-warfare-btn': 'جنگ سایبری',
        'transfer-resources-btn': 'انتقال منابع',
        'telegram-transfer-btn': 'انتقال به تلگرام',
        'admin-panel-btn': 'پنل ادمین ⚙️' // این دکمه رو هم اضافه کردیم
    };

    // افزودن Event Listener به تمام دکمه‌ها
    for (const btnId in actionButtons) {
        const button = document.getElementById(btnId);
        if (button) { // مطمئن میشیم که دکمه وجود داره
            button.addEventListener('click', () => {
                handleActionButtonClick(btnId);
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
    // این تابع در آینده از WebApp.sendData() استفاده خواهد کرد.
    // فعلاً فقط پیام رو در کنسول نمایش میده و یک پیام تست به کاربر برمی‌گردونه.
    function sendCommandToBot(command, payload = {}) {
        const dataToSend = {
            command: command,
            user_id: currentUserId,
            // سایر اطلاعاتی که ربات نیاز داره
            payload: payload
        };

        // **اینجا نقطه اتصال به ربات پایتونی شماست!**
        // وقتی Webhook در سمت ربات فعال بشه، WebApp.sendData() اطلاعات رو به ربات میفرسته.
        WebApp.sendData(JSON.stringify(dataToSend)); // ارسال واقعی داده به ربات

        console.log(`[Mini-App] ارسال دستور: ${command} با داده:`, dataToSend);
        // نمایش یک پیام موقت برای کاربر تا زمانی که ربات واقعی جواب بده
        WebApp.showNotification({
            message: `دستور "${command}" ارسال شد. منتظر پاسخ ربات باشید...`,
            type: 'info'
        });

        // **شبیه‌سازی دریافت پاسخ از ربات**
        // در حالت واقعی، پاسخ از طریق WebApp.onEvent('invoiceClosed', ...) یا
        // WebApp.onEvent('the custom event from bot', ...) دریافت میشه.
        // فعلاً بعد از 2 ثانیه یک پاسخ شبیه‌سازی شده دریافت می‌کنیم.
        setTimeout(() => {
            const simulatedResponse = {
                command: `${command}_response`,
                status: 'success',
                message: `✅ دستور "${actionButtons[command]}" با موفقیت انجام شد!`,
                // اطلاعات جدید بازیکن (مثلا بعد از جمع‌آوری منابع)
                player_stats: {
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
        }, 2000);
    }

    // تابعی برای پردازش پاسخ‌های دریافتی از ربات
    function handleBotResponse(response) {
        console.log("[Mini-App] دریافت پاسخ از ربات:", response);
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
        // اگر لازم باشه MainButton رو بعد از عملیات تغییر میدیم
        WebApp.MainButton.text = "عملیات انجام شد!";
        WebApp.MainButton.show();
    }

    // هندلر کلیک دکمه‌های اقدامات
    function handleActionButtonClick(buttonId) {
        const command = buttonId.replace('-btn', ''); // مثلا 'extract-gold'
        const actionText = actionButtons[buttonId]; // متن دکمه، مثلا 'استخراج طلا'
        
        WebApp.MainButton.text = `در حال انجام: ${actionText}...`;
        WebApp.MainButton.showProgress(); // نمایش لودینگ روی MainButton

        // اینجا دستور واقعی به ربات ارسال میشه
        // در آینده، payload میتونه شامل مقادیر خاصی باشه (مثلا تعداد سرباز برای ساخت)
        sendCommandToBot(command, { button_text: actionText });
    }

    // **مهم: دریافت اطلاعات اولیه بازیکن در زمان لود شدن مینی‌اپ**
    // وقتی مینی‌اپ لود میشه، نیاز داره اطلاعات فعلی بازیکن رو از ربات بگیره.
    // این یک شبیه‌سازی است، در آینده باید ربات واقعی اطلاعات رو بفرسته.
    if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
        // فرض می‌کنیم در شروع، ربات اطلاعات اولیه رو به مینی‌اپ میفرسته
        // در حالت واقعی، ربات باید از طریق API تلگرام (مثل sendWebAppMessage) این دیتا رو بفرسته.
        // یا مینی‌اپ درخواستی به وب‌هوک ربات بفرسته و ربات جواب بده.
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

        // چک می‌کنیم که کاربر ادمین هست یا نه (فعلاً شبیه‌سازی)
        // در آینده باید ربات این اطلاعات رو بفرسته
        const ADMIN_IDS_SIMULATED = ["8126836242", "1755368060"]; // مثال: آیدی ادمین‌ها
        if (ADMIN_IDS_SIMULATED.includes(String(WebApp.initDataUnsafe.user.id))) {
            isUserAdmin = true;
            adminPanelBtn.classList.remove('hidden'); // نمایش دکمه ادمین
            WebApp.MainButton.text = "شما ادمین هستید!";
            WebApp.MainButton.color = "#e83e8c"; // رنگ صورتی برای ادمین
            WebApp.MainButton.show();
        } else {
            adminPanelBtn.classList.add('hidden'); // اطمینان از مخفی بودن دکمه ادمین
            WebApp.MainButton.text = "به جنگاوران پارس خوش آمدید!";
            WebApp.MainButton.color = "#007bff";
            WebApp.MainButton.show();
        }

    } else {
        userInfoElement.innerText = 'اطلاعات کاربر در دسترس نیست. لطفاً از طریق تلگرام باز کنید.';
        closeButton.style.display = 'none';
        // دکمه‌های اکشن رو مخفی می‌کنیم اگه اطلاعات کاربر نیست
        document.querySelectorAll('.action-button').forEach(btn => btn.style.display = 'none');
        WebApp.MainButton.hide();
    }

    // اگر ربات پاسخی از طریق WebApp.onEvent('messageFromBot') دریافت کند (برای ارتباط دوطرفه)
    // این قسمت نیاز به پیاده‌سازی در سمت ربات هم دارد تا با متد WebApp.postEvent پیام بفرستد.
    WebApp.onEvent('messageFromBot', (event) => {
        const response = event.data; // داده‌های ارسالی از ربات
        if (response) {
            handleBotResponse(response);
            WebApp.MainButton.hideProgress(); // لودینگ رو مخفی می‌کنیم
        }
    });

} else {
    // اگه WebApp API لود نشد (مثلاً داری تو مرورگر تست می‌کنی)
    document.body.innerHTML = `
        <div class="container" style="text-align: center;">
            <h1>خطا در بارگذاری مینی‌اپ</h1>
            <p>این مینی‌اپ باید از طریق **تلگرام** باز شود.</p>
            <p>لطفاً ربات را در تلگرام باز کرده و سپس از طریق آن اقدام کنید.</p>
        </div>
    `;
    document.body.style.display = 'flex'; // برای نمایش در وسط صفحه
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
}