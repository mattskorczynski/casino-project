let balance = 1000;

function showBlackjack() {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('blackjackGame').style.display = 'block';
    document.getElementById('balance').textContent = balance;
}

function backToLobby() {
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('blackjackGame').style.display = 'none';
    document.getElementById('lobbyBalance').textContent = balance;
}

// Make sure the balance is updated correctly after each game
document.getElementById('balance').textContent = balance;
document.getElementById('lobbyBalance').textContent = balance;
