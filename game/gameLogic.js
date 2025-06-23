//game logic
console.log("gameLogic.js loaded");

import { updateCreditsDisplay } from './init.js';
import { updateCharts } from './charts.js';

let credits = 100;
let numberOfDecks;
let blackjackPayout;
let playerWins = 0;
let totalGames = 0;

const calculateWinPercentage = () => {
    return totalGames === 0 ? 0 : (playerWins / totalGames) * 100;
};

export function initializeGame(initialCredits, decks, payout) {
    credits = initialCredits;
    numberOfDecks = decks;
    blackjackPayout = payout;

    const dealButton = document.getElementById('deal-button');
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const doubleButton = document.getElementById('double-button');
    const splitButton = document.getElementById('split-button');

    const dealerHand = document.getElementById('dealer-hand');
    const playerHand = document.getElementById('player-hand');
    const playerHand2 = document.getElementById('player-hand-2');
    const dealerScore = document.getElementById('dealer-score');
    const playerScore = document.getElementById('player-score');
    const playerScore2 = document.getElementById('player-score-2');
    const betInput = document.getElementById('bet');

    let deck = [];
    let dealerCards = [];
    let playerHands = [[]];
    let handBets = []; // array tracking the bet for each hand
    let currentHandIndex = 0;
    let dealerHiddenCard;
    let currentBet = 0;
    let gameFinished = false;
    let doubleUsed = [];

    const createDeck = () => {
        const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
        deck = [];
        for (let d = 0; d < numberOfDecks; d++) {
            for (let suit of suits) {
                for (let value of values) {
                    deck.push({ value, suit });
                }
            }
        }
    };

    const shuffleDeck = () => {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    };

    const calculateScore = (cards) => {
        let score = 0;
        let aces = 0;
        cards.forEach(card => {
            if (['Jack', 'Queen', 'King'].includes(card.value)) {
                score += 10;
            } else if (card.value === 'Ace') {
                aces += 1;
                score += 11;
            } else {
                score += parseInt(card.value);
            }
        });
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    };

    const updateHands = (showDealerCard) => {
        dealerHand.innerHTML = '';
        playerHand.innerHTML = '';
        playerHand2.innerHTML = '';

        const hand1 = playerHands[0];
        const hand2 = playerHands[1] || [];

        // Show dealer cards
        dealerCards.forEach(card => {
            const img = document.createElement('img');
            img.src = `images/${card.value}_of_${card.suit}.svg`;
            img.alt = `${card.value} of ${card.suit}`;
            dealerHand.appendChild(img);
        });

        if (showDealerCard && dealerHiddenCard) {
            const img = document.createElement('img');
            img.src = `images/${dealerHiddenCard.value}_of_${dealerHiddenCard.suit}.svg`;
            img.alt = `${dealerHiddenCard.value} of ${dealerHiddenCard.suit}`;
            dealerHand.appendChild(img);
        } else if (dealerHiddenCard) {
            const img = document.createElement('img');
            img.src = 'images/Back_of_card.svg';
            img.alt = 'Hidden Card';
            dealerHand.appendChild(img);
        }

        // Show player hand 1
        hand1.forEach(card => {
            const img = document.createElement('img');
            img.src = `images/${card.value}_of_${card.suit}.svg`;
            img.alt = `${card.value} of ${card.suit}`;
            playerHand.appendChild(img);
        });

        // Show player hand 2 if it exists
        hand2.forEach(card => {
            const img = document.createElement('img');
            img.src = `images/${card.value}_of_${card.suit}.svg`;
            img.alt = `${card.value} of ${card.suit}`;
            playerHand2.appendChild(img);
        });

        dealerScore.textContent = `Dealer Score: ${
            calculateScore(dealerCards) + (showDealerCard && dealerHiddenCard ? calculateScore([dealerHiddenCard]) : 0)
        }`;

        playerScore.textContent = `Hand 1: ${calculateScore(hand1)}`;
        playerScore2.textContent = hand2.length ? `Hand 2: ${calculateScore(hand2)}` : '';
    };


    const dealCards = () => {
        doubleUsed = [false];
        playerHands = [[]];
        handBets = [currentBet];
        currentHandIndex = 0;
        dealerCards = [deck.pop()];
        dealerHiddenCard = deck.pop();
        playerHands[0] = [deck.pop(), deck.pop()];
        updateHands(false);
        hitButton.style.display = 'inline';
        standButton.style.display = 'inline';
        doubleButton.style.display = 'inline';
        splitButton.style.display = canSplit(playerHands[0]) ? 'inline' : 'none';
    };

    const handleEndGame = (winCount) => {
        playerHands.forEach((hand, index) => {
            const score = calculateScore(hand);
            const dealerTotal = calculateScore(dealerCards);
            const bet = handBets[index];
            const isBlackjack = hand.length === 2 && score === 21;

            if (score > 21) return; // Loss

            if (isBlackjack && dealerTotal !== 21) {
                // Blackjack payout
                credits += bet + bet * blackjackPayout;
                playerWins++;
            } else if (dealerTotal > 21 || score > dealerTotal) {
                // Regular win
                credits += bet * 2;
                playerWins++;
            } else if (score === dealerTotal) {
                // Push
                credits += bet;
            }
            // Loss: bet already deducted
        });

        totalGames += playerHands.length;
        updateCreditsDisplay(credits);
        updateCharts(credits, calculateWinPercentage());

        // 👇 Show final result and wait for user to click "Deal"
        dealButton.style.display = 'inline';
        hitButton.style.display = 'none';
        standButton.style.display = 'none';
        doubleButton.style.display = 'none';
        splitButton.style.display = 'none';
    };


    const resetGame = () => {
        dealerCards = [];
        dealerHiddenCard = null;
        playerHands = [[]];
        currentHandIndex = 0;
        currentBet = 0;
        doubleUsed = [];
        gameFinished = false;
        playerHand.innerHTML = '';
        playerHand2.innerHTML = '';
        dealerHand.innerHTML = '';
        playerScore.textContent = '';
        playerScore2.textContent = '';
        dealerScore.textContent = '';
        dealButton.style.display = 'inline';
        hitButton.style.display = 'none';
        standButton.style.display = 'none';
        doubleButton.style.display = 'none';
        splitButton.style.display = 'none';
    };

    const canSplit = (hand) => {
        return hand.length === 2 && hand[0].value === hand[1].value && credits >= currentBet;
    };

    const playDealerTurn = () => {
        dealerCards.push(dealerHiddenCard);
        dealerHiddenCard = null;
        updateHands(true);
        while (calculateScore(dealerCards) < 17) {
            dealerCards.push(deck.pop());
        }
        updateHands(true);
    };

    const evaluateHands = () => {
        playDealerTurn();
        let winCount = 0;
        playerHands.forEach((hand, i) => {
            const score = calculateScore(hand);
            const dealerScore = calculateScore(dealerCards);
            if (score > 21) return;
            if (dealerScore > 21 || score > dealerScore) winCount++;
        });
        handleEndGame(winCount);
    };

    dealButton.addEventListener('click', () => {
        currentBet = parseInt(betInput.value, 10);
        if (isNaN(currentBet) || currentBet <= 0 || currentBet > credits) {
            alert('Invalid bet');
            return;
        }

        credits -= currentBet;
        updateCreditsDisplay(credits);
        createDeck();
        shuffleDeck();
        dealCards();

        // ✅ Hides the deal button after starting
        dealButton.style.display = 'none';
    });


    hitButton.addEventListener('click', () => {
        playerHands[currentHandIndex].push(deck.pop());
        updateHands(false);
        if (calculateScore(playerHands[currentHandIndex]) > 21) {
            if (currentHandIndex < playerHands.length - 1) {
                currentHandIndex++;
                updateHands(false);
            } else {
                evaluateHands();
            }
        }
    });

    standButton.addEventListener('click', () => {
        if (currentHandIndex < playerHands.length - 1) {
            currentHandIndex++;
            updateHands(false);
        } else {
            evaluateHands();
        }
    });

    doubleButton.addEventListener('click', () => {
        if (doubleUsed[currentHandIndex] || credits < currentBet) return;
        credits -= currentBet;
        updateCreditsDisplay(credits);
        handBets[currentHandIndex] *= 2;
        doubleUsed[currentHandIndex] = true;
        playerHands[currentHandIndex].push(deck.pop());
        updateHands(false);
        if (
            calculateScore(playerHands[currentHandIndex]) > 21 ||
            currentHandIndex >= playerHands.length - 1
        ) {
            evaluateHands();
        } else {
            currentHandIndex++;
            updateHands(false);
        }
    });

    splitButton.addEventListener('click', () => {
        doubleUsed = [false, false];
        if (!canSplit(playerHands[0])) return;
        credits -= currentBet;
        updateCreditsDisplay(credits);

        const original = playerHands[0];
        const hand1 = [original[0], deck.pop()];
        const hand2 = [original[1], deck.pop()];
        playerHands = [hand1, hand2];
        handBets = [currentBet, currentBet]; // Assign bets AFTER hands are created

        currentHandIndex = 0;
        updateHands(false);
        splitButton.style.display = 'none';
    });
}
