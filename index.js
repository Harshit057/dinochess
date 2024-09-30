// Dinosaur faces for the pieces (these can be custom image paths or emoji faces)
const dinoFaces = {
    pawn: '🦖',
    Rook: '🦕',
    knight: '🦤',
    bishop: '🦖',
    queen: '🦕',
    King: '🦖'
};

// Initial board setup using dinosaur pieces
const initialBoard = [
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
    ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
];

// Create the chess board grid
function createBoard() {
    const boardElement = document.getElementById('board');
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = (row + col) % 2 === 0 ? 'light' : 'dark';
            if (initialBoard[row][col]) {
                square.innerHTML = `<span class="dino">${dinoFaces[initialBoard[row][col]]}</span>`;
            }
            boardElement.appendChild(square);
        }
    }
}

createBoard();
