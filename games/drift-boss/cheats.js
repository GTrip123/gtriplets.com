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
    let lastTurnTargetCross = null;
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
    reactionInput.value = '60';
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
                    'platformSkeletons=' + (scene && scene.platformSkeletons ? scene.platformSkeletons.length : 'n/a'),
                    'blockDirection=' + (scene && scene.blockDirection));
            }

            const car = scene && scene.carSkeleton;
            if (!car || !car.chassis || !scene.platformSkeletons) {
                if (debugOn) console.log('[AutoBot] bailing - missing scene/car/platformSkeletons');
                return;
            }

            const carPos = car.chassis.position;
            const dir = scene.blockDirection; // kept for logging only - does NOT determine travel axis
            // Confirmed from live data: the car's forward travel axis is
            // ALWAYS z (it steadily decreases every tick regardless of
            // blockDirection), and the lateral/turn axis is ALWAYS x. The
            // previous version swapped these based on blockDirection, which
            // was wrong and caused false "turn ahead" detections on ordinary
            // straight tiles - that's what caused the immediate swerve at
            // the start of every run.
            const primaryAxis = 'z';
            const crossAxis = 'x';

            // Reconstruct the TRUE path order using platformId (a global
            // counter assigned at spawn time - reliable regardless of pool
            // reuse/recycling), instead of guessing order from raw distance
            // to the car (which was picking up off-path/decorative tiles).
            const active = scene.platformSkeletons.filter(p => p && p.active && typeof p.platformId === 'number');
            if (active.length === 0) return;

            const orderedPath = active.slice().sort((a, b) => a.platformId - b.platformId);

            // Anchor = the tile closest to the car right now (smallest
            // absolute distance on the travel axis) - this represents
            // "where we are" in the path sequence.
            let anchorIdx = 0;
            let anchorBestDist = Infinity;
            for (let i = 0; i < orderedPath.length; i++) {
                const d = Math.abs(orderedPath[i][primaryAxis] - carPos[primaryAxis]);
                if (d < anchorBestDist) {
                    anchorBestDist = d;
                    anchorIdx = i;
                }
            }
            const anchorCross = orderedPath[anchorIdx][crossAxis];

            // Walk forward from the anchor through the real path order and
            // find the first tile whose cross-axis position meaningfully
            // differs from the current lane - that's the actual corner,
            // found structurally instead of by nearest-distance guessing.
            let turnTile = null;
            const lookahead = [];
            for (let i = anchorIdx + 1; i < orderedPath.length && i <= anchorIdx + 8; i++) {
                const t = orderedPath[i];
                lookahead.push({ id: t.platformId, primary: t[primaryAxis].toFixed(1), cross: t[crossAxis].toFixed(1) });
                if (!turnTile && Math.abs(t[crossAxis] - anchorCross) > 8) {
                    turnTile = t;
                }
            }

            if (debugOn) {
                console.log('[AutoBot] carPos=', carPos.x.toFixed(1), carPos.y.toFixed(1), carPos.z.toFixed(1),
                    'active=' + active.length, 'anchorCross=' + anchorCross.toFixed(1),
                    'lookahead=', JSON.stringify(lookahead));
            }

            // Find the full contiguous turn CLUSTER ahead - from the first
            // tile whose cross differs from the current lane, through every
            // subsequent tile that keeps changing cross (a multi-tile sweep
            // counts as one cluster), stopping at the tile where cross
            // stabilizes again (back to a straight stretch). Using the LAST
            // tile of the cluster as the hold target - instead of tracking
            // "have we arrived" turn-by-turn - avoids the release/re-trigger
            // oscillation near a turn's midpoint that caused overshoot.
            let clusterStart = null;
            let clusterEnd = null;
            let prevCross = anchorCross;
            for (let i = 0; i < lookahead.length; i++) {
                const t = orderedPath[anchorIdx + 1 + i];
                if (!t) break;
                const c = t[crossAxis];
                if (Math.abs(c - prevCross) > 0.5) {
                    if (clusterStart === null) clusterStart = t;
                    clusterEnd = t;
                    prevCross = c;
                } else if (clusterStart !== null) {
                    break; // cross stabilized again - cluster is done
                }
            }

            if (debugOn) {
                console.log('[AutoBot] carPos=', carPos.x.toFixed(1), carPos.y.toFixed(1), carPos.z.toFixed(1),
                    'active=' + active.length, 'anchorCross=' + anchorCross.toFixed(1),
                    'clusterStart=' + (clusterStart ? clusterStart.platformId : 'none'),
                    'clusterEnd=' + (clusterEnd ? clusterEnd.platformId : 'none'));
            }

            if (!clusterStart) {
                if (botHolding) {
                    sendSpaceKey('keyup');
                    botHolding = false;
                }
                return;
            }

            const distToStart = Math.abs(clusterStart[primaryAxis] - carPos[primaryAxis]);
            const distToEnd = clusterEnd[primaryAxis] - carPos[primaryAxis]; // sign matters here
            const reactionDist = parseFloat(reactionInput.value) || 60;

            // Hold once within reactionDist of the cluster start, keep
            // holding until we've actually passed the cluster end (car's
            // primary position has gone beyond it in the travel direction).
            const passedEnd = (carPos[primaryAxis] - clusterEnd[primaryAxis]) * Math.sign(carPos[primaryAxis] - (orderedPath[anchorIdx][primaryAxis] || carPos[primaryAxis]) + 0.0001) >= 0
                ? Math.abs(distToEnd) < 1 || (clusterEnd[primaryAxis] < carPos[primaryAxis]) === (clusterEnd[primaryAxis] < clusterStart[primaryAxis])
                : false;
            const carPastClusterEnd = Math.sign(clusterEnd[primaryAxis] - clusterStart[primaryAxis] || -1) < 0
                ? carPos[primaryAxis] <= clusterEnd[primaryAxis]
                : carPos[primaryAxis] >= clusterEnd[primaryAxis];

            const shouldHold = distToStart < reactionDist && !carPastClusterEnd;

            if (shouldHold && !botHolding) {
                sendSpaceKey('keydown');
                botHolding = true;
            } else if (!shouldHold && botHolding) {
                sendSpaceKey('keyup');
                botHolding = false;
            }

            if (debugOn) {
                console.log('[AutoBot] decision', 'dir=' + dir, 'distToStart=' + distToStart.toFixed(1),
                    'clusterEndId=' + clusterEnd.platformId, 'carPastClusterEnd=' + carPastClusterEnd,
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
            lastTurnTargetCross = null;
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

    // ---------- Custom Score / Score Multiplier ----------
    const scoreTitle = document.createElement('h4');
    scoreTitle.innerHTML = 'Score:';
    scoreTitle.style.margin = '10px 0 5px 0';
    contentPanel.appendChild(scoreTitle);

    const scoreSetRow = document.createElement('div');
    scoreSetRow.style.display = 'flex';
    scoreSetRow.style.gap = '5px';
    scoreSetRow.style.marginBottom = '8px';

    const scoreInput = document.createElement('input');
    scoreInput.type = 'number';
    scoreInput.placeholder = 'e.g. 5000';
    scoreInput.style.flex = '1';
    scoreInput.style.padding = '6px';
    scoreInput.style.border = '1px solid #ccc';
    scoreInput.style.borderRadius = '3px';
    scoreInput.style.width = '0';

    const scoreSetBtn = makeButton('Set Score', '#3f51b5', '#32408f', () => {
        const val = parseFloat(scoreInput.value);
        if (isNaN(val)) {
            alert('Enter a number, e.g. 5000');
            return;
        }
        whenGameReady((ig) => {
            // ig.game.lastScore is the live in-run score. If not mid-run yet,
            // this still sets it so it applies as soon as a run starts.
            if (ig.game) ig.game.lastScore = val;
            if (ig.currentGame) ig.currentGame.lastScore = val;
        });
    });
    scoreSetBtn.style.width = 'auto';
    scoreSetBtn.style.marginBottom = '0';
    scoreSetBtn.style.paddingLeft = '10px';
    scoreSetBtn.style.paddingRight = '10px';

    scoreSetRow.appendChild(scoreInput);
    scoreSetRow.appendChild(scoreSetBtn);
    contentPanel.appendChild(scoreSetRow);

    // Score multiplier: rather than guessing the internal increment formula,
    // watch lastScore each tick and add extra on top of whatever it just
    // gained, scaled to the requested multiplier. Works regardless of how
    // the game itself computes the base increment.
    let scoreMultOn = false;
    let scoreMultInterval = null;
    let lastKnownScore = null;

    const scoreMultRow = document.createElement('div');
    scoreMultRow.style.display = 'flex';
    scoreMultRow.style.gap = '5px';
    scoreMultRow.style.marginBottom = '8px';

    const scoreMultInput = document.createElement('input');
    scoreMultInput.type = 'number';
    scoreMultInput.value = '20';
    scoreMultInput.style.width = '55px';
    scoreMultInput.style.padding = '6px';
    scoreMultInput.style.border = '1px solid #ccc';
    scoreMultInput.style.borderRadius = '3px';

    const scoreMultBtn = makeButton('Multiplier: OFF', '#607d8b', '#546069', () => {
        scoreMultOn = !scoreMultOn;
        scoreMultBtn.textContent = 'Multiplier: ' + (scoreMultOn ? 'ON (' + scoreMultInput.value + 'x)' : 'OFF');
        scoreMultBtn.style.backgroundColor = scoreMultOn ? '#e91e63' : '#607d8b';

        if (scoreMultOn) {
            lastKnownScore = null;
            whenGameReady((ig) => {
                scoreMultInterval = setInterval(() => {
                    const g = ig.game || ig.currentGame;
                    if (!g || typeof g.lastScore !== 'number') return;
                    if (lastKnownScore === null) {
                        lastKnownScore = g.lastScore;
                        return;
                    }
                    const delta = g.lastScore - lastKnownScore;
                    if (delta > 0) {
                        const mult = parseFloat(scoreMultInput.value) || 1;
                        g.lastScore += delta * (mult - 1);
                    }
                    lastKnownScore = g.lastScore;
                }, 100);
            });
        } else if (scoreMultInterval) {
            clearInterval(scoreMultInterval);
            scoreMultInterval = null;
        }
    });
    scoreMultBtn.style.marginBottom = '0';
    scoreMultBtn.style.flex = '1';

    scoreMultRow.appendChild(scoreMultInput);
    scoreMultRow.appendChild(scoreMultBtn);
    contentPanel.appendChild(scoreMultRow);

    // ---------- Course Editing ----------
    const courseTitle = document.createElement('h4');
    courseTitle.innerHTML = 'Course Patterns:';
    courseTitle.style.margin = '10px 0 5px 0';
    contentPanel.appendChild(courseTitle);

    const courseNote2 = document.createElement('p');
    courseNote2.textContent = 'Check the pattern types allowed to generate. None checked = normal (all patterns).';
    courseNote2.style.fontSize = '11px';
    courseNote2.style.color = '#666';
    courseNote2.style.margin = '0 0 8px 0';
    contentPanel.appendChild(courseNote2);

    // The 10 pattern types the game's own generatePlatformPattern() picks
    // between at random. Rather than blocking turns entirely (blunt), this
    // hooks the ONE random call that selects which pattern comes next and
    // constrains it to only the checked types - so "ramps only", "no
    // zig-zags", "flat + ramp mix", etc. are all possible.
    const PATTERN_TYPES = [
        { id: 0, label: 'Flat (straight)' },
        { id: 1, label: 'Zig Zag' },
        { id: 2, label: 'Small Bump' },
        { id: 3, label: 'Small Valley' },
        { id: 4, label: 'Half Line' },
        { id: 5, label: 'Valley Bump' },
        { id: 6, label: 'Split Bump' },
        { id: 7, label: 'Ramp' },
        { id: 8, label: 'Split Line' },
        { id: 9, label: 'Half Zig Zag' }
    ];

    const patternCheckboxes = {};
    const patternGrid = document.createElement('div');
    patternGrid.style.display = 'grid';
    patternGrid.style.gridTemplateColumns = '1fr 1fr';
    patternGrid.style.gap = '3px';
    patternGrid.style.marginBottom = '8px';
    patternGrid.style.fontSize = '12px';

    PATTERN_TYPES.forEach(p => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '4px';
        label.style.cursor = 'pointer';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        patternCheckboxes[p.id] = cb;

        label.appendChild(cb);
        label.appendChild(document.createTextNode(p.label));
        patternGrid.appendChild(label);
    });
    contentPanel.appendChild(patternGrid);

    // Patch state - applied once and reused; only the allowed-list itself
    // changes on Apply, so the underlying hook stays lightweight.
    let originalGeneratePattern = null;
    let originalRandomInt = null;
    let allowedPatterns = null; // null/[] = no filter, normal random behavior
    let interceptNextPatternRandom = false;

    function installPatternHook(ig) {
        const scene = ig.gameScene;
        if (!scene || typeof scene.generatePlatformPattern !== 'function' || !ig.random || typeof ig.random.int !== 'function') {
            if (debugOn) console.warn('[Course] generatePlatformPattern or ig.random.int not found');
            return false;
        }
        if (!originalGeneratePattern) {
            originalGeneratePattern = scene.generatePlatformPattern.bind(scene);
        }
        if (!originalRandomInt) {
            originalRandomInt = ig.random.int.bind(ig.random);
        }
        if (!ig.random.__cheatsPatched) {
            ig.random.__cheatsPatched = true;
            // The pattern-index selection is the very FIRST ig.random.int()
            // call inside generatePlatformPattern's body, before any nested
            // generate* function runs its own random calls (tile counts,
            // etc.) - so a one-shot intercept flag targets exactly that call
            // and leaves everything downstream genuinely random.
            ig.random.int = function (min, max) {
                if (interceptNextPatternRandom) {
                    interceptNextPatternRandom = false;
                    if (allowedPatterns && allowedPatterns.length > 0) {
                        return allowedPatterns[Math.floor(Math.random() * allowedPatterns.length)];
                    }
                }
                return originalRandomInt(min, max);
            };
        }
        if (!scene.__cheatsPatched) {
            scene.__cheatsPatched = true;
            scene.generatePlatformPattern = function () {
                interceptNextPatternRandom = true;
                return originalGeneratePattern();
            };
        }
        return true;
    }

    const applyPatternsBtn = makeButton('Apply Course Filter', '#3f51b5', '#32408f', () => {
        const chosen = PATTERN_TYPES.filter(p => patternCheckboxes[p.id].checked).map(p => p.id);
        allowedPatterns = chosen;
        whenGameReady((ig) => {
            const ok = installPatternHook(ig);
            if (ok) {
                alert(chosen.length > 0
                    ? 'Course filter applied: only ' + chosen.length + ' pattern type(s) will generate from now on.'
                    : 'Course filter cleared - back to normal random patterns.');
            }
        });
    });
    contentPanel.appendChild(applyPatternsBtn);

    const courseNote = document.createElement('p');
    courseNote.textContent = 'Applies to new patterns generated from now on - track already placed ahead of you keeps whatever was already generated.';
    courseNote.style.fontSize = '11px';
    courseNote.style.color = '#666';
    courseNote.style.margin = '5px 0 10px 0';
    contentPanel.appendChild(courseNote);

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
