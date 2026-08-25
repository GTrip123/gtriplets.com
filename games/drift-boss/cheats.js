// Wait for DOM to be fully loaded
(function() {
    // Create and style the tab container
    const tabContainer = document.createElement('div');
    tabContainer.style.position = 'fixed';
    tabContainer.style.top = '50%';
    tabContainer.style.right = '0';
    tabContainer.style.transform = 'translateY(-50%)';
    tabContainer.style.zIndex = '9999';

    // Create and style the tab
    const tab = document.createElement('div');
    tab.style.backgroundColor = '#135dd4';
    tab.style.padding = '10px';
    tab.style.cursor = 'pointer';
    tab.style.borderRadius = '5px 0 0 5px';
    tab.style.marginBottom = '5px';
    tab.style.boxShadow = '-2px 2px 5px rgba(0,0,0,0.2)';

    // Add the lock image
    const lockImg = document.createElement('img');
    lockImg.src = 'lock.png';
    lockImg.style.width = '30px';
    lockImg.style.height = '30px';
    tab.appendChild(lockImg);

    // Create and style the content panel
    const contentPanel = document.createElement('div');
    contentPanel.style.display = 'none';
    contentPanel.style.backgroundColor = '#f0f0f0';
    contentPanel.style.padding = '15px';
    contentPanel.style.borderRadius = '5px 0 0 5px';
    contentPanel.style.boxShadow = '-2px 2px 5px rgba(0,0,0,0.2)';
    contentPanel.style.maxHeight = '85vh';
    contentPanel.style.overflowY = 'auto';
    contentPanel.style.width = '220px';

    // Add the title
    const title = document.createElement('h3');
    title.innerHTML = '<strong>Cheats</strong>';
    title.style.margin = '0 0 5px 0';
    contentPanel.appendChild(title);

    // Add the subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = '(Reload for changes to take effect)';
    subtitle.style.fontSize = '12px';
    subtitle.style.margin = '0 0 10px 0';
    subtitle.style.color = '#666';
    contentPanel.appendChild(subtitle);

    const SAVE_KEY = 'mjs-drift-boss-game-v1.0.1-dailyreward';

    // Helper: read/write the save file safely
    function readSave() {
        let stored = localStorage.getItem(SAVE_KEY);
        return stored ? JSON.parse(stored) : null;
    }
    function writeSave(data) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }

    // Helper: build a standard action button (reused for every cheat below)
    function makeButton(label, color, hoverColor, onClick) {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.padding = '8px 15px';
        btn.style.backgroundColor = color;
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '3px';
        btn.style.cursor = 'pointer';
        btn.style.width = '100%';
        btn.style.marginBottom = '8px';
        btn.onmouseover = () => btn.style.backgroundColor = hoverColor;
        btn.onmouseout = () => btn.style.backgroundColor = color;
        btn.onclick = onClick;
        return btn;
    }

    // Helper: waits for the game's global `ig` object to exist before running fn.
    // Needed for any "live" cheat (not just save-file edits), since cheats.js
    // can finish loading before the game engine has initialized `window.ig`.
    function whenGameReady(fn) {
        if (window.ig && window.ig.game) {
            fn(window.ig);
        } else {
            const iv = setInterval(() => {
                if (window.ig && window.ig.game) {
                    clearInterval(iv);
                    fn(window.ig);
                }
            }, 200);
        }
    }

    // ---------- Infinite Coins ----------
    const coinsButton = makeButton('Infinite Coins', '#4CAF50', '#45a049', () => {
        let data = readSave();
        if (data) {
            data.collectedCoin = 10000000000;
            writeSave(data);
            alert('Coins added! Reload the page to see changes.');
        } else {
            alert('No saved data found. Play the game first!');
        }
    });
    contentPanel.appendChild(coinsButton);

    // ---------- Max Boosters (unlimited purchased booster charges) ----------
    const boostersButton = makeButton('Max Boosters (x999)', '#4CAF50', '#45a049', () => {
        let data = readSave();
        if (data) {
            data.booster1 = 999;
            data.booster2 = 999;
            data.booster3 = 999;
            writeSave(data);
            alert('Boosters maxed! Reload, then select boosters before starting a run as usual.');
        } else {
            alert('No saved data found. Play the game first!');
        }
    });
    contentPanel.appendChild(boostersButton);

    // ---------- God Mode: forces all 3 boosters active for the whole run ----------
    // booster1Active = 2x score, booster2Active = auto-revive on fall,
    // booster3Active = guaranteed coin every platform.
    // This sets the LIVE flags directly, so it doesn't consume your booster
    // inventory the way picking them from the menu does.
    let godModeOn = false;
    let godModeInterval = null;
    const godModeButton = makeButton('God Mode: OFF', '#607d8b', '#546069', () => {
        godModeOn = !godModeOn;
        godModeButton.textContent = 'God Mode: ' + (godModeOn ? 'ON' : 'OFF');
        godModeButton.style.backgroundColor = godModeOn ? '#e91e63' : '#607d8b';

        if (godModeOn) {
            whenGameReady((ig) => {
                godModeInterval = setInterval(() => {
                    ig.booster1Active = true; // 2x score
                    ig.booster2Active = true; // auto-revive on fall
                    ig.booster3Active = true; // coin on every platform
                }, 300);
            });
        } else if (godModeInterval) {
            clearInterval(godModeInterval);
            godModeInterval = null;
        }
    });
    contentPanel.appendChild(godModeButton);

    // ---------- Speed Hack: scales the game's internal frame-time (clock.tick) ----------
    // 1x = normal, 0.5x = slow motion, 2x = double speed. Affects the whole
    // game loop (score rate, animations, spawn timing) since everything reads
    // ig.system.tick each frame.
    let speedPatched = false;
    let speedMultiplier = 1;
    const speedLabel = document.createElement('p');
    speedLabel.textContent = 'Game Speed: 1x';
    speedLabel.style.fontSize = '13px';
    speedLabel.style.margin = '10px 0 5px 0';
    speedLabel.style.fontWeight = 'bold';
    contentPanel.appendChild(speedLabel);

    function patchClockOnce(ig) {
        if (speedPatched) return;
        speedPatched = true;
        const originalTick = ig.system.clock.tick.bind(ig.system.clock);
        ig.system.clock.tick = function() {
            return originalTick() * speedMultiplier;
        };
    }

    function setSpeed(mult, label) {
        speedMultiplier = mult;
        speedLabel.textContent = 'Game Speed: ' + label;
        whenGameReady(patchClockOnce);
    }

    const speedRow = document.createElement('div');
    speedRow.style.display = 'flex';
    speedRow.style.gap = '5px';
    speedRow.style.marginBottom = '10px';

    const slowBtn = makeButton('0.5x', '#ff9800', '#e68900', () => setSpeed(0.5, '0.5x (slow-mo)'));
    const normalBtn = makeButton('1x', '#9e9e9e', '#8a8a8a', () => setSpeed(1, '1x (normal)'));
    const fastBtn = makeButton('2x', '#ff9800', '#e68900', () => setSpeed(2, '2x (fast)'));
    [slowBtn, normalBtn, fastBtn].forEach(b => {
        b.style.marginBottom = '0';
        speedRow.appendChild(b);
    });
    contentPanel.appendChild(speedRow);

    const cartitle = document.createElement('h4');
    cartitle.innerHTML = 'Change Car:';
    cartitle.style.margin = '0 0 5px 0';
    contentPanel.appendChild(cartitle);
    const carsubtitle = document.createElement('p');
    carsubtitle.textContent = '(Will say not unlocked, but works)';
    carsubtitle.style.fontSize = '12px';
    carsubtitle.style.margin = '0 0 10px 0';
    carsubtitle.style.color = '#666';
    contentPanel.appendChild(carsubtitle);

    // Create car wheel selector
    const wheelContainer = document.createElement('div');
    wheelContainer.style.width = '200px';
    wheelContainer.style.height = '200px';
    wheelContainer.style.position = 'relative';
    wheelContainer.style.margin = '10px auto';
    wheelContainer.style.cursor = 'grab';


    // Create car images and position them in a circle
    for (let i = 8; i <= 27; i++) {
        const carContainer = document.createElement('div');
        carContainer.style.position = 'absolute';
        carContainer.style.width = '40px';
        carContainer.style.height = '40px';
        carContainer.style.left = '80px';
        carContainer.style.top = '80px';
        carContainer.style.transformOrigin = '20px 20px';

        const angle = ((i - 8) * (360 / 20)) * (Math.PI / 180);
        const radius = 100;
        carContainer.style.transform = `rotate(${(i - 8) * (360 / 20)}deg) translate(${radius}px) rotate(-${(i - 8) * (360 / 20)}deg)`;

        const carImg = document.createElement('img');
        carImg.src = `media/graphics/cars/${i}.png`;
        carImg.style.width = '100%';
        carImg.style.height = '100%';
        carImg.style.cursor = 'pointer';
        carImg.dataset.carId = i;

        carImg.onclick = (e) => {
            e.stopPropagation();
            let data = readSave();
            if (data) {
                data.currentCar = parseInt(e.target.dataset.carId);
                writeSave(data);
                alert('Car changed! Reload the page to see changes.');
            } else {
                alert('No saved data found. Play the game first!');
            }
        };

        carContainer.appendChild(carImg);
        wheelContainer.appendChild(carContainer);
    }

    contentPanel.appendChild(wheelContainer);

    // Add toggle functionality
    let isOpen = false;
    tab.onclick = () => {
        isOpen = !isOpen;
        contentPanel.style.display = isOpen ? 'block' : 'none';
    };

    // Add elements to the container
    tabContainer.appendChild(tab);
    tabContainer.appendChild(contentPanel);

    // Add the container to the document
    document.body.appendChild(tabContainer);
})();
