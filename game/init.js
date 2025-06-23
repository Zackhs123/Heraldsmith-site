//inititialize

console.log("init.js loaded");

import { initializeGame } from './gameLogic.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event triggered");

    const startGameButton = document.getElementById('start-game-button');
    const menuContainer = document.getElementById('menu-container');
    const gameContainer = document.getElementById('game-container');

    startGameButton.addEventListener('click', () => {
        const credits = parseInt(document.getElementById('credits').value, 10);
        const decks = parseInt(document.getElementById('decks').value, 10);
        const payout = parseFloat(document.getElementById('payout').value);

        if (isNaN(credits) || credits <= 0 || isNaN(decks) || decks <= 0 || isNaN(payout)) {
            alert('Please enter valid settings.');
            return;
        }

        console.log(`Starting game with ${credits} credits, ${decks} decks, and a blackjack payout of ${payout}`);
        menuContainer.style.display = 'none';
        gameContainer.style.display = 'block';

        initializeGame(credits, decks, payout);
    });
});

export function updateCreditsDisplay(credits) {
    document.getElementById('credits-display').textContent = `Credits: ${credits}`;
}
