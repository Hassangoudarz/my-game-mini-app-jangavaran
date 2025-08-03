// چک می‌کنیم که Bale Web App API آماده هست یا نه
if (window.Bale && window.Bale.WebApp) {
    const WebApp = window.Bale.WebApp;

    WebApp.ready();
    WebApp.expand();

    // تنظیم رنگ‌های هدر و پس‌زمینه در بله بر اساس تم مینی‌اپ
    // این متدها در نسخه 1.1 Bale Mini App API موجود هستند.
    WebApp.setHeaderColor('#1a222f'); // card-surface
    WebApp.setBackgroundColor('#121820'); // background-deep-dark

    const userInfoElement = document.getElementById('user-info');
    const goldAmountElement = document.getElementById('gold-amount');
    const diamondAmountElement = document.getElementById('diamond-amount');
    const foodAmountElement = document.getElementById('food-amount');
    const blockAmountElement = document.getElementById('block-amount');
    const soldierAmountElement = document.getElementById('soldier-amount');
    const wallAmountElement = document.getElementById('wall-amount');
    const realmLevelElement = document.getElementById('realm-level');
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    let currentUserId = null;
    let isUserAdmin = false;

    // Mapping of button IDs to bot commands and display texts
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

    // Add Event Listeners to all action buttons with Ripple Effect
    for (const btnId in actionButtonsMap) {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', (e) => {
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

                const buttonData = actionButtonsMap[btnId];
                handleActionButtonClick(buttonData.command, buttonData.text);
            });
        }
    }

    // Close Mini App Button
    document.getElementById('close-button').addEventListener('click', () => {
        WebApp.close();
    });

    // Function to update player stats in UI
    function updatePlayerStats(stats) {
        if (!stats) return;
        goldAmountElement.innerText = stats.gold.toLocaleString('fa-IR');
        diamondAmountElement.innerText = stats.diamonds.toLocaleString('fa-IR');
        foodAmountElement.innerText = stats.food.toLocaleString('fa-IR');
        blockAmountElement.innerText = stats.blocks.toLocaleString('fa-IR');
        soldierAmountElement.innerText = stats.soldiers.toLocaleString('fa-IR');
        wallAmountElement.innerText = stats.walls.toLocaleString('fa-IR');
        realmLevelElement.innerText = stats.level.toLocaleString('fa-IR');
    }

    // Function to send commands to the bot
    // IMPORTANT: WebApp.sendData() closes the mini-app in Bale.
    function sendCommandToBot(command, actionText, payload = {}) {
        const dataToSend = {
            command: command,
            user_id: currentUserId,
            payload: payload
        };
        
        WebApp.sendData(JSON.stringify(dataToSend));
        console.log(`[Mini-App] Sent command: "${command}" with data:`, dataToSend);

        // Show a temporary alert as the mini-app will close.
        WebApp.showAlert(`دستور "${actionText}" به ربات ارسال شد. منتظر پاسخ در چت باشید.`);
    }

    // Function to handle bot's response (simulated for now)
    // In a real scenario, the bot would send back a message or an event.
    // For Bale, direct response to an open mini-app is not as straightforward as Telegram's WebApp.postEvent.
    // The bot sends a message to the chat.
    function handleBotResponse(response) {
        console.log("[Mini-App] Received simulated response from bot:", response);
        // We only update stats if the response is successful and contains player_stats
        if (response.status === 'success' && response.player_stats) {
            updatePlayerStats(response.player_stats);
            // Show alert in the mini-app if it remains open (unlikely with sendData)
            WebApp.showAlert(response.message);
        } else if (response.status === 'error') {
            WebApp.showAlert(`❌ خطا: ${response.message}`);
        }
    }

    // Main handler for action button clicks
    function handleActionButtonClick(command, actionText) {
        // Here, we simulate the bot's response immediately for demonstration.
        // In actual deployment, this part depends on the bot processing the `sendData` and sending a response.
        simulateBotResponse(command, actionText);
    }

    // Initial load logic and simulated data
    if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
        const user = WebApp.initDataUnsafe.user;
        currentUserId = user.id;
        userInfoElement.innerText = `سلام، ${user.first_name || 'کاربر عزیز'}!`;
        if (user.username) {
            userInfoElement.innerText += ` (@${user.username})`;
        }
        userInfoElement.innerText += `\nآیدی شما: ${user.id}`;

        // Simulate admin status
        const ADMIN_IDS_SIMULATED = ["8126836242", "1755368060"]; // Replace with actual admin IDs
        if (ADMIN_IDS_SIMULATED.includes(String(currentUserId))) {
            isUserAdmin = true;
            adminPanelBtn.classList.remove('hidden');
        } else {
            adminPanelBtn.classList.add('hidden');
        }

        // Simulate initial player stats
        const initialPlayerStats = {
            gold: 5000, diamonds: 1500, food: 10000, blocks: 8000,
            soldiers: 2500, walls: 1500, level: 15
        };
        updatePlayerStats(initialPlayerStats);

        // Hide loading screen and show main content after a delay
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.style.display = 'none';
                mainContent.classList.add('container-loaded');
            }, { once: true });
        }, 2000);

    } else {
        // Fallback if WebApp API initDataUnsafe is not available
        document.body.innerHTML = `
            <div class="container">
                <h1>خطا در بارگذاری مینی‌اپ</h1>
                <p>این مینی‌اپ باید از طریق <strong>بله</strong> باز شود.</p>
                <p>لطفاً ربات را در بله باز کرده و سپس از طریق آن اقدام کنید.</p>
            </div>
        `;
        document.getElementById('loading-screen').style.display = 'none';
    }
} else {
    // Fallback if Bale WebApp API is not loaded at all
    document.body.innerHTML = `
        <div class="container">
            <h1>خطا در بارگذاری مینی‌اپ</h1>
            <p>این مینی‌اپ باید از طریق <strong>بله</strong> باز شود.</p>
            <p>لطفاً اپلیکیشن بله خود را به‌روزرسانی کنید یا از طریق ربات در بله اقدام کنید.</p>
        </div>
    `;
    document.getElementById('loading-screen').style.display = 'none';
}