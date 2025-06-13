let solution=[];
let puzzle=[];
let startTime, timerInterval;
let puzzlesSolved =parseInt(localStorage.getItem("puzzlesSolved")) || 0;
document.getElementById("solvedCount").textContent = puzzlesSolved;
let bestTime = parseInt(localStorage.getItem("bestTime")) || null;

updateBestTimeDisplay();

function updateBestTimeDisplay() {
  if (bestTime !== null) {
    const mins = String(Math.floor(bestTime / 60)).padStart(2, '0');
    const secs = String(bestTime % 60).padStart(2, '0');
    document.getElementById("bestTime").textContent = `${mins}:${secs}`;
  } else {
    document.getElementById("bestTime").textContent = "--:--";
  }
}

function startTimer() {
  clearInterval(timerInterval); // Reset if already running
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    document.getElementById("timer").textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetStats() {
  if (confirm("Are you sure you want to reset all stats?")) {
    localStorage.removeItem("puzzlesSolved");
    localStorage.removeItem("bestTime");
    puzzlesSolved = 0;
    bestTime = null;
    document.getElementById("solvedCount").textContent = "0";
    document.getElementById("bestTime").textContent = "--:--";
  }
}

// Generating an empty board
function generateEmptyBoard(){
    let board = [];
    for(let r=0;r<9;r++){
        board[r]=[];
        for(let c=0;c<9;c++){
            board[r][c]=0;
        }
    }
    return board;
}

// Checking if the entered number is valid
function isSafe(board,row,col,num){
    for(let i=0;i<9;i++){
        if(board[row][i]==num||board[i][col]==num||board[Math.floor(row/3)*3+Math.floor(i/3)][Math.floor(col/3)*3+i%3]==num){
            return false;
        }
    }
    return true;
}

// Solving the Sudoku board
function solveSudoku(board){
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            if(board[i][j]==0){
                for(let num=1;num<=9;num++){
                    if(isSafe(board,i,j,num)){
                        board[i][j]=num;
                        if(solveSudoku(board)){
                            return true;
                        }
                        board[i][j]=0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Filling the diagonal boxes
function fillDiagonalBoxes(board){
    for(let i=0;i<9;i+=3){
        let nums = shuffle([...Array(9).keys()].map(n => n + 1));
        for(let r=0;r<3;r++){
            for(let c=0;c<3;c++){
                board[i+r][i+c]=nums[r*3+c];
            }
        }
    }
}

//Shuffling the number array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//Removing number to create the puzzle
function removeNumbers(board,count){
    let removed=0;
    while (removed<count){
        let r=Math.floor(Math.random() * 9);
        let c=Math.floor(Math.random() * 9);
        if(board[r][c]!=0){
            board[r][c]=0;
            removed++;
        }
    }
}

//Generating the Sudoku puzzle
function generatePuzzle(){
    puzzle = generateEmptyBoard();
    fillDiagonalBoxes(puzzle);
    solveSudoku(puzzle);
    solution = JSON.parse(JSON.stringify(puzzle)); // Copy the solved board
    removeNumbers(puzzle, 40); // Remove numbers to create the puzzle
}

// rendering the Sudoku board into DOM
function renderBoard(){
    const container = document.getElementById('sudoku-board');
    container.innerHTML = '';
    for(let r=0;r<9;r++){
        for(let c=0;c<9;c++){
            const cell = document.createElement('input');
            cell.type = 'number';
            cell.min = 1;
            cell.max = 9;
            if(puzzle[r][c] !== 0) {
                cell.value = puzzle[r][c];
                cell.disabled = true;
                cell.classList.add('prefilled');
            }
            else {
                cell.value = '';
            }
            cell.dataset.row = r;
            cell.dataset.col = c;
            container.appendChild(cell);
        }
    }
}

 // Get current board state from inputs
function getCurrentBoard() {
  const inputs = document.querySelectorAll("#sudoku-board input");
  const current = generateEmptyBoard();
  inputs.forEach(input => {
    const row = +input.dataset.row;
    const col = +input.dataset.col;
    current[row][col] = +input.value || 0;
  });
  return current;
}

  function checkSolution() {
      const inputs = document.querySelectorAll("#sudoku-board input");
      const current = getCurrentBoard();
      let allCorrect = true;

      inputs.forEach(input => {
        const row = +input.dataset.row;
        const col = +input.dataset.col;

        if (!input.disabled) {
          if (+input.value === solution[row][col]) {
            input.style.backgroundColor = "#d4edda"; // Correct input
          } else {
            input.style.backgroundColor = "#f8d7da";
            allCorrect = false;
            
          }
        }
        
      });
         if(allCorrect){// && input.disabled && +input.value !== solution[row][col]) {
            stopTimer();
            puzzlesSolved= parseInt(puzzlesSolved) + 1;
            console.log("Puzzles solved: " + puzzlesSolved);
            localStorage.setItem("puzzlesSolved", puzzlesSolved);
            document.getElementById("solvedCount").textContent = puzzlesSolved;
            // Save best time if better
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            if (bestTime === null || elapsed < bestTime) {
            bestTime = elapsed;
            localStorage.setItem("bestTime", bestTime);
            }
            
            updateBestTimeDisplay();
            document.getElementById("message").textContent = "Congratulations! You solved the Sudoku!";
        }
        else{
            document.getElementById("message").textContent = "Incorrect! Please try again.";
        }
    }
// Clear only user-entered values
    function resetBoard() {
        let sure=confirm("Are you sure you want to reset the board? This will clear all your inputs.");
        if (!sure) return;
      const inputs = document.querySelectorAll("#sudoku-board input:not(.prefilled)");
      inputs.forEach(input =>{
         input.value = "";
          input.style.backgroundColor = "#fff"; // Reset background color
      });
      document.getElementById("message").textContent = "";
    }

    // Starts a new game
    function generateSudoku() {
      generatePuzzle();
      renderBoard();
      document.getElementById("message").textContent = "";
        startTimer();
    }

    function hint(){
       const inputs = document.querySelectorAll("#sudoku-board input:not(.prefilled)");
  const emptyInputs = [];

  inputs.forEach(input => {
    if (input.value === "") {
      emptyInputs.push(input);
    }
  });

  if (emptyInputs.length === 0) {
    alert("No more hints available!");
    return;
  }

  // Choose a random empty input
  const randomInput = emptyInputs[Math.floor(Math.random() * emptyInputs.length)];

  // Get the row and column from data attributes
  const row = parseInt(randomInput.dataset.row);
  const col = parseInt(randomInput.dataset.col);

  // Fill with correct value from solution array
  randomInput.value = solution[row][col];
  randomInput.disabled = true; // Disable the input after hint
  randomInput.style.backgroundColor = "#d4edda"; // Change background color to indicate it's filled
  randomInput.style.color = "#000"; // Ensure text is visible
}
      // Generate puzzle on initial load
    window.onload = generateSudoku;
