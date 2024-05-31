class Card {
    constructor(s, n) {
        this.suit = s;
        this.number = n;
    }

    getNumber() {
        return this.number;
    }

    getSuit() {
        return this.suit;
    }

    getValue() {
        if (this.number > 10) return 10;
        else if (this.number === 1) return 11;
        else return this.number;
    }

    getImageName() {
        let suitChar;
        let numberChar;

        switch (this.suit) {
            case 1: suitChar = 'S'; break; // Spades
            case 2: suitChar = 'H'; break; // Hearts
            case 3: suitChar = 'D'; break; // Diamonds
            case 4: suitChar = 'C'; break; // Clubs
        }

        switch (this.number) {
            case 1: numberChar = 'A'; break;
            case 11: numberChar = 'J'; break;
            case 12: numberChar = 'Q'; break;
            case 13: numberChar = 'K'; break;
            default: numberChar = this.number;
        }

        return `${numberChar}${suitChar}.jpg`;
    }
}

function createDeck() {
    const deck = [];
    for (let suit = 1; suit <= 4; suit++) {
        for (let number = 1; number <= 13; number++) {
            deck.push(new Card(suit, number));
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

class Hand {
    constructor(deck) {
        this.cards = [deck.pop(), deck.pop()];
    }

    getHand() {
        return this.cards;
    }

    score() {
        let myScore = 0;
        let acesCount = 0;

        for (let i = 0; i < this.cards.length; i++) {
            myScore += this.cards[i].getValue();
            if (this.cards[i].getValue() === 11) acesCount++;
        }

        while (acesCount > 0 && myScore > 21) {
            myScore -= 10;
            acesCount--;
        }

        return myScore;
    }

    addCard(card) {
        this.cards.push(card);
    }

    printHand(containerId, totalId, hideFirstCard = false) {
        const container = document.getElementById(containerId);
        const totalContainer = document.getElementById(totalId);
        container.innerHTML = "";

        let visibleScore = 0;

        this.cards.forEach((card, index) => {
            const img = document.createElement("img");
            img.src = hideFirstCard && index === 0 ? 'CardIMGS/back.jpg' : `CardIMGS/${card.getImageName()}`;
            container.appendChild(img);

            if (!hideFirstCard || index !== 0) {
                visibleScore += card.getValue();
            }
        });

        // If hiding the first card, show only the value of the visible card(s)
        if (hideFirstCard) {
            totalContainer.textContent = visibleScore;
        } else {
            totalContainer.textContent = this.score();
        }
    }
}


let betAmount = 0;
let userHand, dealerHand;
let deck;

function updateBalance() {
    document.getElementById('balance').textContent = balance;
    document.getElementById('lobbyBalance').textContent = balance;
}

function declareWinner() {
    const userScore = userHand.score();
    const dealerScore = dealerHand.score();

    if (userScore === 21 && userHand.getHand().length === 2) { // Player has a blackjack
        if (dealerScore === 21 && dealerHand.getHand().length === 2) { // Dealer also has a blackjack
            return "It's a tie!";
        } else { // Dealer doesn't have a blackjack
            const blackjackWinAmount = Math.floor(betAmount * 2.5);
            balance += blackjackWinAmount;
            return `You win with a blackjack! +$${blackjackWinAmount}`;
        }
    } else if (userScore > 21) { // Player busts
        return "You went over 21! Better luck next time!";
    } else if (dealerScore > 21) { // Dealer busts
        const winAmount = betAmount;
        balance += winAmount;
        return "Dealer went over 21! You win!";
    } else if (userScore > dealerScore) { // Player's score is higher
        const winAmount = betAmount;
        balance += winAmount;
        return "You win!";
    } else if (userScore < dealerScore) { // Dealer's score is higher
        return "You lose! Better luck next time!";
    } else { // Scores are tied
        return "It's a tie!";
    }
}

document.getElementById('stand').addEventListener('click', () => {
    if (userHand.score() === 21 && userHand.getHand().length === 2) {
        // Player has a blackjack, dealer needs to reveal their facedown card
        dealerHand.printHand("dealerCards", "dealerTotal");
        
        if (dealerHand.score() === 21 && dealerHand.getHand().length === 2) {
            // Dealer also has a blackjack, it's a tie
            endGame();
            return;
        }
        
        // Player wins with a blackjack
        document.getElementById('message').textContent = `You win with a blackjack! +$${winAmount}`;
        updateBalance();
        document.getElementById('placeBet').disabled = false;
        document.getElementById('betAmount').disabled = false;
        document.getElementById('hit').disabled = true;
        document.getElementById('stand').disabled = true;
    } else {
        // Player stands, dealer takes their turn
        dealerHand.printHand("dealerCards", "dealerTotal");

        while (dealerHand.score() < 17) {
            dealerHand.addCard(deck.pop());
            dealerHand.printHand("dealerCards", "dealerTotal");
        }

        endGame();
    }
});


function endGame() {
    const message = document.getElementById('message');
    const result = declareWinner();
    let winAmount = 0;

    if (result === "You win!" || result === "Dealer went over 21! You win!") {
        winAmount = betAmount * 2;
        message.innerHTML = `${result}<br>+$${winAmount}`;
    } else if (result === "It's a tie!") {
        winAmount = betAmount;
        balance += (winAmount/2);
        message.innerHTML = `${result}<br>+$${winAmount}`;
    } else {
        message.innerHTML = `${result}`;
    }

    updateBalance();
    document.getElementById('placeBet').disabled = false;
    document.getElementById('betAmount').disabled = false;
    document.getElementById('hit').disabled = true;
    document.getElementById('stand').disabled = true;
}

document.getElementById('placeBet').addEventListener('click', () => {


    betAmount = parseInt(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert("Invalid bet amount");
        return;
    }

    balance -= betAmount;
    updateBalance();

    document.getElementById('message').textContent = ""; //Clears message

    deck = shuffleDeck(createDeck());
    userHand = new Hand(deck);
    dealerHand = new Hand(deck);

    userHand.printHand("userCards", "userTotal");
    dealerHand.printHand("dealerCards", "dealerTotal", true);

    // Disable betting and enable gameplay
    document.getElementById('hit').disabled = false;
    document.getElementById('stand').disabled = false;
    document.getElementById('placeBet').disabled = true;
    document.getElementById('betAmount').disabled = true;

    


    if (userHand.score() === 21 && userHand.getHand().length === 2) {
        // Automatically stand if the player has a blackjack
        document.getElementById('stand').click();
    } else {
        document.getElementById('hit').disabled = false;
        document.getElementById('stand').disabled = false;
    }

    document.getElementById('message').textContent = `You win with a blackjack! +$${winAmount}`;

});

document.getElementById('hit').addEventListener('click', () => {
    userHand.addCard(deck.pop());
    userHand.printHand("userCards", "userTotal");

    if (userHand.score() === 21) {
        document.getElementById('stand').click();
    } else if (userHand.score() > 21) {
        document.getElementById('message').textContent = "You went over 21! Better luck next time!";

        document.getElementById('hit').disabled = true;
        document.getElementById('stand').disabled = true;
        document.getElementById('placeBet').disabled = false;
        document.getElementById('betAmount').disabled = false;
    }
});

document.getElementById('stand').addEventListener('click', () => {
    dealerHand.printHand("dealerCards", "dealerTotal");

    while (dealerHand.score() < 17) {
        dealerHand.addCard(deck.pop());
        dealerHand.printHand("dealerCards", "dealerTotal");
    }

    endGame();
});

updateBalance();