// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
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

    // Create and style the infinite coins button
    const coinsButton = document.createElement('button');
    coinsButton.textContent = 'Infinite Coins';
    coinsButton.style.padding = '8px 15px';
    coinsButton.style.backgroundColor = '#4CAF50';
    coinsButton.style.color = 'white';
    coinsButton.style.border = 'none';
    coinsButton.style.borderRadius = '3px';
    coinsButton.style.cursor = 'pointer';
    coinsButton.style.width = '100%';
    coinsButton.style.marginBottom = '10px';

    // Add hover effect
    coinsButton.onmouseover = () => coinsButton.style.backgroundColor = '#45a049';
    coinsButton.onmouseout = () => coinsButton.style.backgroundColor = '#4CAF50';

    // Add the infinite coins functionality
    coinsButton.onclick = () => {
        let storedData = localStorage.getItem('mjs-drift-boss-game-v1.0.1-dailyreward');
        if (storedData) {
            let parsedData = JSON.parse(storedData);  
            parsedData.collectedCoin = 10000000000;
            localStorage.setItem('mjs-drift-boss-game-v1.0.1-dailyreward', JSON.stringify(parsedData));
            alert('Coins added! Reload the page to see changes.');
        } else {
            alert('No saved data found. Play the game first!');
        }
    };

    contentPanel.appendChild(coinsButton);

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
            let storedData = localStorage.getItem('mjs-drift-boss-game-v1.0.1-dailyreward');
            if (storedData) {
                let parsedData = JSON.parse(storedData);
                parsedData.currentCar = parseInt(e.target.dataset.carId);
                localStorage.setItem('mjs-drift-boss-game-v1.0.1-dailyreward', JSON.stringify(parsedData));
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
});
