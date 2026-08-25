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
    // Affects the whole game loop (score rate, animations, spawn timing) since
    // everything reads ig.system.tick each frame. Custom multiplier supported.
    let speedPatched = false;
    let speedMultiplier = 1;
    const speedLabel = document.createElement('p');
    speedLabel.textContent = 'Game Speed: 1x';
    speedLabel.style.fontSize = '13px';
    speedLabel.style.margin = '10px 0 5px 0';
    speedLabel.style.fontWeight = 'bold';
    contentPanel.appendChild(speedLabel);

    // NOTE: this game runs two separate clocks - ig.system.clock (only
    // drives the score counter) and BabylonJS's own engine.getDeltaTime()
    // under a separate `wgl` global (drives actual physics/rendering).
    // We need to patch the real engine clock for gameplay to actually speed
    // up/slow down, not just the score number.
    function whenEngineReady(fn) {
        if (window.wgl && window.wgl.system && window.wgl.system.engine) {
            fn(window.wgl.system.engine);
        } else {
            const iv = setInterval(() => {
                if (window.wgl && window.wgl.system && window.wgl.system.engine) {
                    clearInterval(iv);
                    fn(window.wgl.system.engine);
                }
            }, 200);
        }
    }

    function patchClockOnce(engine) {
        if (speedPatched) return;
        speedPatched = true;
        const originalGetDeltaTime = engine.getDeltaTime.bind(engine);
        engine.getDeltaTime = function() {
            return originalGetDeltaTime() * speedMultiplier;
        };
        console.log('[SpeedHack] Patched wgl.system.engine.getDeltaTime');
    }

    function setSpeed(mult, label) {
        speedMultiplier = mult;
        speedLabel.textContent = 'Game Speed: ' + label;
        whenEngineReady(patchClockOnce);
    }

    const speedRow = document.createElement('div');
    speedRow.style.display = 'flex';
    speedRow.style.gap = '5px';
    speedRow.style.marginBottom = '8px';

    const slowBtn = makeButton('0.5x', '#ff9800', '#e68900', () => setSpeed(0.5, '0.5x (slow-mo)'));
    const normalBtn = makeButton('1x', '#9e9e9e', '#8a8a8a', () => setSpeed(1, '1x (normal)'));
    const fastBtn = makeButton('2x', '#ff9800', '#e68900', () => setSpeed(2, '2x (fast)'));
    [slowBtn, normalBtn, fastBtn].forEach(b => {
        b.style.marginBottom = '0';
        speedRow.appendChild(b);
    });
    contentPanel.appendChild(speedRow);

    // Custom speed input
    const customSpeedRow = document.createElement('div');
    customSpeedRow.style.display = 'flex';
    customSpeedRow.style.gap = '5px';
    customSpeedRow.style.marginBottom = '10px';

    const customSpeedInput = document.createElement('input');
    customSpeedInput.type = 'number';
    customSpeedInput.step = '0.1';
    customSpeedInput.min = '0.1';
    customSpeedInput.max = '10';
    customSpeedInput.value = '1';
    customSpeedInput.placeholder = 'e.g. 0.3';
    customSpeedInput.style.flex = '1';
    customSpeedInput.style.padding = '6px';
    customSpeedInput.style.border = '1px solid #ccc';
    customSpeedInput.style.borderRadius = '3px';
    customSpeedInput.style.width = '0'; // allows flex to shrink it properly

    const customSpeedBtn = makeButton('Set', '#3f51b5', '#32408f', () => {
        const val = parseFloat(customSpeedInput.value);
        if (!isNaN(val) && val > 0) {
            setSpeed(val, val + 'x (custom)');
        } else {
            alert('Enter a positive number, e.g. 0.3 or 1.5');
        }
    });
    customSpeedBtn.style.width = 'auto';
    customSpeedBtn.style.marginBottom = '0';
    customSpeedBtn.style.paddingLeft = '12px';
    customSpeedBtn.style.paddingRight = '12px';

    customSpeedRow.appendChild(customSpeedInput);
    customSpeedRow.appendChild(customSpeedBtn);
    contentPanel.appendChild(customSpeedRow);

    // ---------- Auto-Play Bot (heuristic) ----------
    // Reads the live platform pool (ig.gameScene.platforms) to find tiles
    // ahead of the car, detects when the upcoming platform's x/z axis differs
    // from the current lane (i.e. the track is about to turn), and holds/
    // releases a REAL simulated Space key based on distance to that turn.
    // This is reverse-engineered from the game's obfuscated logic, not
    // live-tested against actual gameplay - the REACTION_DISTANCE below is
    // the main knob to tune if it's turning too early/late. Debug Log prints
    // the values it's reacting to each cycle so you can tune it by watching
    // the console, or paste that output back to me and I'll help calibrate.
    let botOn = false;
    let botInterval = null;
    let botHolding = false;
    let debugOn = false;

    const botTitle = document.createElement('h4');
    botTitle.innerHTML = 'Auto-Play Bot (beta):';
    botTitle.style.margin = '10px 0 5px 0';
    contentPanel.appendChild(botTitle);

    const botConfigRow = document.createElement('div');
    botConfigRow.style.display = 'flex';
    botConfigRow.style.alignItems = 'center';
    botConfigRow.style.gap = '5px';
    botConfigRow.style.marginBottom = '8px';

    const reactionLabel = document.createElement('label');
    reactionLabel.textContent = 'Reaction dist:';
    reactionLabel.style.fontSize = '12px';
    reactionLabel.style.color = '#333';

    const reactionInput = document.createElement('input');
    reactionInput.type = 'number';
    reactionInput.value = '40';
    reactionInput.step = '5';
    reactionInput.style.width = '55px';
    reactionInput.style.padding = '4px';
    reactionInput.style.border = '1px solid #ccc';
    reactionInput.style.borderRadius = '3px';

    botConfigRow.appendChild(reactionLabel);
    botConfigRow.appendChild(reactionInput);
    contentPanel.appendChild(botConfigRow);

    // Simulates a real keyboard event so ig.input.state('space') picks it up
    // the same way it would from an actual key press.
    function sendSpaceKey(type) {
        const evt = new KeyboardEvent(type, {
            key: ' ',
            code: 'Space',
            keyCode: 32,
            which: 32,
            bubbles: true,
            cancelable: true
        });
        window.dispatchEvent(evt);
        document.dispatchEvent(evt);
    }

    function botTick(ig) {
        try {
            const scene = ig.gameScene;

            // Diagnostic dump FIRST, before any early exit, so we can see
            // exactly what's missing/wrong if this isn't working.
            if (debugOn) {
                console.log('[AutoBot] scene exists=' + !!scene,
                    'carSkeleton exists=' + !!(scene && scene.carSkeleton),
                    'chassis exists=' + !!(scene && scene.carSkeleton && scene.carSkeleton.chassis),
                    'platforms=' + (scene && scene.platforms ? scene.platforms.length : 'n/a'),
                    'blockDirection=' + (scene && scene.blockDirection));
            }

            const car = scene && scene.carSkeleton;
            if (!car || !car.chassis || !scene.platforms) {
                if (debugOn) console.log('[AutoBot] bailing - missing scene/car/platforms');
                return;
            }

            const carPos = car.chassis.position;
            const dir = scene.blockDirection; // 'left' or 'right' - current lane axis

            // Find platforms ahead of the car, closest first.
            const ahead = scene.platforms
                .filter(p => p && p.skeleton)
                .map(p => ({
                    p,
                    dx: p.skeleton.position.x - carPos.x,
                    dz: p.skeleton.position.z - carPos.z
                }))
                .sort((a, b) => (a.dx * a.dx + a.dz * a.dz) - (b.dx * b.dx + b.dz * b.dz));

            if (debugOn) {
                console.log('[AutoBot] carPos=', carPos.x.toFixed(1), carPos.y.toFixed(1), carPos.z.toFixed(1),
                    'candidateTiles=' + ahead.length,
                    ahead[0] ? ('nearest dx=' + ahead[0].dx.toFixed(1) + ' dz=' + ahead[0].dz.toFixed(1)) : '');
            }

            if (ahead.length === 0) return;

            const nearest = ahead[0];
            const dist = Math.sqrt(nearest.dx * nearest.dx + nearest.dz * nearest.dz);

            // Heuristic: when blockDirection is 'left', the track is currently
            // advancing along z; a meaningful x-offset on the nearest tile
            // means a turn is coming up. Mirror logic for 'right' (advancing
            // along x, watch for z-offset). Hold when close to that turn,
            // release once past it.
            const reactionDist = parseFloat(reactionInput.value) || 40;
            let shouldHold;
            if (dir === 'left') {
                shouldHold = Math.abs(nearest.dx) > 2 && dist < reactionDist;
            } else {
                shouldHold = Math.abs(nearest.dz) > 2 && dist < reactionDist;
            }

            if (shouldHold && !botHolding) {
                sendSpaceKey('keydown');
                botHolding = true;
            } else if (!shouldHold && botHolding) {
                sendSpaceKey('keyup');
                botHolding = false;
            }

            if (debugOn) {
                console.log('[AutoBot] decision', 'dir=' + dir, 'dist=' + dist.toFixed(1),
                    'dx=' + nearest.dx.toFixed(1), 'dz=' + nearest.dz.toFixed(1),
                    'holding=' + botHolding);
            }
        } catch (e) {
            console.warn('[AutoBot] tick error', e);
        }
    }

    const botButton = makeButton('Auto-Play: OFF', '#607d8b', '#546069', () => {
        botOn = !botOn;
        botButton.textContent = 'Auto-Play: ' + (botOn ? 'ON' : 'OFF');
        botButton.style.backgroundColor = botOn ? '#e91e63' : '#607d8b';

        if (botOn) {
            whenGameReady((ig) => {
                botInterval = setInterval(() => botTick(ig), 50);
            });
        } else {
            if (botInterval) {
                clearInterval(botInterval);
                botInterval = null;
            }
            if (botHolding) {
                sendSpaceKey('keyup');
                botHolding = false;
            }
        }
    });
    contentPanel.appendChild(botButton);

    const debugButton = makeButton('Debug Log: OFF', '#795548', '#6a4a3f', () => {
        debugOn = !debugOn;
        debugButton.textContent = 'Debug Log: ' + (debugOn ? 'ON' : 'OFF');
        debugButton.style.backgroundColor = debugOn ? '#5d4037' : '#795548';
    });
    contentPanel.appendChild(debugButton);

    const botNote = document.createElement('p');
    botNote.textContent = 'Beta: reverse-engineered, not live-tested. If it turns too early/late, adjust "Reaction dist" up/down. Works best paired with 0.3x-0.5x speed above.';
    botNote.style.fontSize = '11px';
    botNote.style.color = '#666';
    botNote.style.margin = '5px 0 10px 0';
    contentPanel.appendChild(botNote);

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
