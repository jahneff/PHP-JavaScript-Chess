var board;
var game;
var emptyPiece = new Piece("none");

function Piece(color) {
    this.color = color;
    this.king = "false";
    Piece.prototype.red = function () {
        this.color = "red";
    };
    Piece.prototype.black = function () {
        this.color = "black";
    };
}

function Player(color, first) {
    this.color = color;
    this.takeFirstTurn = first;
}

function createNewGameObject(){
    var game = {red: {pieceslost: 0}, black: {pieceslost: 0}, board:[], turn: 1, jumpsonly: 0};
    for (i = 0; i < 99; i++) {
        game['board'][i] = new Piece("none");
    }
    for(i = 10; i < 36; i+=2){
        game['board'][i].red();
    }
    game['board'][18].color = "none"; //would be placed off the board, in the hidden column
    for(i = 56; i < 82; i+=2){
        game['board'][i].black();
    }
    game['board'][72].color = "none"; //would be placed off the board, in the hidden column

    sessionStorage.setItem('gameObj', JSON.stringify(game));
    alert("New board object stored in sessionStorage");
}

window.onload = function(){
    if(sessionStorage.getItem('gameObj') === null) {
        createNewGameObject();
    }
    updateBoardHTML();
    /*
    -----------------------------------------
    Only spaces 10-89, excluding multiples of 9, are in play.
     0      1  2  3  4  5  6  7  8

     9      10 11 12 13 14 15 16 17
    18      19 20 21 22 23 24 25 26
    27      28 29 30 31 32 33 34 35
    36      37 38 39 40 41 42 43 44
    45      46 47 48 49 50 51 52 53
    54      55 56 57 58 59 60 61 62
    63      64 65 66 67 68 69 70 71
    72      73 74 75 76 77 78 79 80
    81      82 83 84 85 86 87 88 89

    90      91 92 93 94 95 96 97 98
    -----------------------------------------
     */
};

function newGame(){
    sessionStorage.removeItem('gameObj');
    window.location.href = ("checkers.php");
}

function cpuAttemptMove(from, to){

}

function deselect() {
    var moveFrom = document.getElementById("moveFromCoords").value;
    if(moveFrom !== "null") {
        document.getElementById("sq-" + moveFrom).style.backgroundColor = "white";
        document.getElementById("moveFromCoords").value = "null";
    }
    var moveTo= document.getElementById("moveToCoords").value;
    if(moveTo !== "null") {
        document.getElementById("sq-" + moveTo).style.backgroundColor = "white";
        document.getElementById("moveFromCoords").value = "null";
    }
}



function select(coords){
    coords = arrayifyCoords(coords);
    var moveTo = document.getElementById("moveToCoords");
    var moveFrom = document.getElementById("moveFromCoords");
    if(moveFrom.value === "null") {//MoveFrom has not been selected
        moveFrom.value = coords;                    //Update moveFrom form value
        document.getElementById("sq-" + coords).style.backgroundColor = "orange";    //Select clicked square
    }

    else {//MoveFrom already has a value. The user has now clicked on a square to move to.
        moveTo.value = coords;                      //update moveTo form value
        if(attemptMove(moveFrom.value, moveTo.value)) {
            document.getElementById("sq-" + moveFrom.value).style.backgroundColor = "white";    //Deselect from square
            if (game['jumpsonly'] === 1) {  //More jumps are available for moved piece
                select(moveFrom.value); //Select clicked square
            }
            moveTo.value = "null";
            moveFrom.value = "null";
        }
        else {
            if (coords == moveFrom.value && game['jumpsonly'] == 0) {
                document.getElementById("sq-" + moveFrom.value).style.backgroundColor = "white";    //Deselect from square
                moveFrom.value = "null";
                moveTo.value = "null";
            }
        }
    }
}

function arrayifyCoords(coords){ //Takes sq-# as an argument and returns only #
    coords = coords.split("-", 2).reverse();
    return coords[0];
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function attemptMove(from, to){
    game = JSON.parse(sessionStorage.getItem('gameObj'));
    if(isLegalMove(from, to)){
        myMove(from, to);
        Move(from, to);

        return true;
    }
    else {
        return false;
    }
}

function pieceHasJump(from){
    if (isLegalMove(from, parseFloat(from) - 16) ||
        isLegalMove(from, parseFloat(from) - 20) ||
        isLegalMove(from, parseFloat(from) + 16) ||
        isLegalMove(from, parseFloat(from) + 20)){
        return true;
    }
    return false;
}

function pieceHasJump2(from){
    if (isLegalMove2(from, parseFloat(from) - 16) ||
        isLegalMove2(from, parseFloat(from) - 20) ||
        isLegalMove2(from, parseFloat(from) + 16) ||
        isLegalMove2(from, parseFloat(from) + 20)){
        return true;
    }
    return false;
}


function myMove(from, to) {
    var elem = document.getElementById("sq-" + from);
    var piece = document.getElementById("p-" + from);
    var pos = 0;
    var dist = from - to;
    var vert = 0;
    var hor = 0;
    if(dist < 0){
        vert = 1;
        if((dist % 10) === 0){
            hor = 1
        }
        else {
            hor = -1
        }
    }
    else {
        vert = -1;
        if((dist % 10) === 0){
            hor = -1
        }
        else {
            hor = 1
        }
    }


    if(Math.abs(dist) > 10){
        hor = hor * 2;
        vert = vert * 2;
    }
    //alert("from: " + from + " to : " + to);
    //alert("vert: " + vert + " hor : " + hor);
    var id = setInterval(frame, 5);
    function frame() {
        if (pos == 50) {
            clearInterval(id);
            updateBoardHTML();
        } else {
            pos++;
            piece.style.color = "green";
            piece.style.left = 15 + (pos * hor) + "px";
            piece.style.top = 15 + (pos * vert) + "px";

            //elem.style.backgroundColor = '#' + pos;
        }
    }
}

function Move(from, to){
    game['board'][to] = game['board'][from];
    game['board'][from] = emptyPiece;
    var dist = from - to;


    if((to >= 10 && to <= 17) && game['board'][to].color === "black"){
        game['board'][to].king = "True";
    }
    else if((to >= 73 && to <= 80) && game['board'][to].color === "red") {
        game['board'][to].king = "True";
    }

    if(Math.abs(dist) > 10){
        game['board'][(from - Math.floor(dist/2))] = emptyPiece;  //remove jumped piece from board
        if(pieceHasJump(to)){
            game['jumpsonly'] = 1;
            sessionStorage.setItem('gameObj', JSON.stringify(game));
            if(game['board'][to].color === "red"){ //was it the cpus turn?
                cpuTurn();
            }
        }
        else {
            endTurn();
        }
    }
    else {
        endTurn();
    }
}


function isLegalMove(from, to){
    if (to < 10 || to > 80 || ((to % 9) === 0)){ //is the space being moved to off the board?
        return false;
    }
    if(game['board'][to]['color'] !== "none") { //is the space being moved to already occupied?
        return false;
    }

    var phase = game['jumpsonly'];
    var dist = from - to;
    var movingPiece = game['board'][from];
    var jumpedPiece = game['board'][(from - Math.floor(dist / 2))];
    var redMoves = [-8, -10];
    var redJumps = [-16, -20];
    var blackMoves = [8, 10];
    var blackJumps = [16, 20];
    var kingMoves = redMoves.concat(blackMoves);
    var kingJumps= redJumps.concat(blackJumps);
    switch(movingPiece.color){
        case "red":
            if(game['turn'] % 2 !== 0){
                alert("wrong color, it is black's move");
                return false;
            }
            var moves;
            if (movingPiece.king === "True") {
                moves = kingMoves;
                jumps = kingJumps;
            }
            else {
                moves = redMoves;
                jumps = redJumps;
            }

            if (inArray(dist, moves) && phase == 0){
                return true;
            }
            else if (inArray(dist, jumps) && jumpedPiece.color === "black") {
                    game['black']['pieceslost']++;
                    return true;
            }
            return false;
        case "black":
            if(game['turn'] % 2 !== 1){
                alert("wrong color, it is red's move");
                return false;
            }
            var moves;
            if (movingPiece.king === "True") {
                moves = kingMoves;
                jumps = kingJumps;
            }
            else {
                moves = blackMoves;
                jumps = blackJumps;
            }

            if (inArray(dist, moves) && phase == 0){
                return true;
            }
            else if (inArray(dist, jumps) && jumpedPiece.color === "red") {
                game['red']['pieceslost']++;
                return true;
            }
            return false;
        default: //clicked square has no piece
            return false;
    }
}

function isLegalMove2(from, to){
    if (to < 10 || to > 80 || ((to % 9) === 0)){ //is the space being moved to off the board?
        return false;
    }
    if(game['board'][to]['color'] !== "none") { //is the space being moved to already occupied?
        return false;
    }

    var phase = game['jumpsonly'];
    var dist = from - to;
    var movingPiece = game['board'][from];
    var jumpedPiece = game['board'][(from - Math.floor(dist / 2))];
    var redMoves = [-8, -10];
    var redJumps = [-16, -20];
    var blackMoves = [8, 10];
    var blackJumps = [16, 20];
    var kingMoves = redMoves.concat(blackMoves);
    var kingJumps= redJumps.concat(blackJumps);
    switch(movingPiece.color){
        case "red":

            var moves;
            if (movingPiece.king === "True") {
                moves = kingMoves;
                jumps = kingJumps;
            }
            else {
                moves = redMoves;
                jumps = redJumps;
            }

            if (inArray(dist, moves) && phase == 0){
                return true;
            }
            else if (inArray(dist, jumps) && jumpedPiece.color === "black") {
                game['black']['pieceslost']++;
                return true;
            }
            return false;
        case "black":

            var moves;
            if (movingPiece.king === "True") {
                moves = kingMoves;
                jumps = kingJumps;
            }
            else {
                moves = blackMoves;
                jumps = blackJumps;
            }

            if (inArray(dist, moves) && phase == 0){
                return true;
            }
            else if (inArray(dist, jumps) && jumpedPiece.color === "red") {
                game['red']['pieceslost']++;
                return true;
            }
            return false;
        default: //clicked square has no piece
            return false;
    }
}

function updateSquareHTML(square, i){
    if(square['color'] !== "none") {
        if(square['king'] === "True"){
            document.getElementById("sq-" + i).innerHTML = "<i class='fas fa-chess-king' id='p-" + i + "' style='color: " + square['color'] + "; position: absolute;'></i>";
        }
        else {
            document.getElementById("sq-" + i).innerHTML = "<i class='fas fa-hockey-puck' id='p-" + i + "' style='color: " + square['color'] + "; position: absolute; left: 15px; top: 15px;'></i>";
        }
    }
    else {
        document.getElementById("sq-" + i).innerHTML = " ";
    }
}

function endTurn(){
    game['turn']++;
    game['jumpsonly'] = 0;
    sessionStorage.setItem('gameObj', JSON.stringify(game));
    if ((game['turn'] % 2 != 1)) {
        setTimeout(cpuTurn, 3000);
    }
}

function leavePhase() {
    endTurn();
    deselect();
    updateBoardHTML();
}

function runMiniMax() {
    endTurn();
    var board = game['board'];
    miniMax(board, 0, 0);
}

function getScore(board) {
    var score = 0;
    for (i = 10; i < 81; i++) {
        if(board[i].color === "red") {
            score++;
        }
        else if (board[i].color === "black") {
            score--;
        }
    }
    return score;
}

function miniMax(board, depth, score){
    var originalBoard = board;
    score = getScore(board);
    if(depth === 4){
        alert("depth == 4, returning score: " + score);
        return score;
    }
    if(depth % 2 === 0){
        var colorToMove = "red";
        var flip = 1;   //changes movement direction based on team moving
    }
    else {
        var colorToMove = "black";
        var flip = -1;
    }
    for (var i = 10; i < 81; i++) {
        if(board[i].color === colorToMove) {
            var num1 = 16 * flip;
            var num2 = 20 * flip;
            var num3 = 8 * flip;
            var num4 = 10 * flip;

            if (isLegalMove2(i, (parseFloat(i) + num1)) && (i < 63)) {
                    alert(colorToMove + " moves from: " + i + ", to: " + (parseFloat(i) + num1) + ", depth: " + depth);
                    board = miniMaxMove(board, i, parseFloat(i) + num1);
                    myMove(i, parseFloat(i) + num1);

                    updateBoardHTML2(board);
                    score = miniMax(board, depth+1, score);
                alert(colorToMove + " moves back from: " + (parseFloat(i) + num1) + ", to: " + i + ", depth: " + depth);
                board = miniMaxMove(board, parseFloat(i) + num1, i);
                /*if(colorToMove === "red") {
                    board[(i - Math.floor(num1 / 2))].black();  //re add jumped piece from board
                }
                else {
                    board[(i - Math.floor(num1 / 2))].red();  //re add jumped piece from board
                }*/
                updateBoardHTML2(board);

            }

            if (isLegalMove2(i, (parseFloat(i) + num2)) && (i < 63)){
                    alert(colorToMove + " moves from: " + i + ", to: " + (parseFloat(i) + num2) + ", depth: " + depth);
                    board = miniMaxMove(board, i, parseFloat(i) + num2);
                    myMove(i, parseFloat(i) + num2);

                    updateBoardHTML2(board);
                    score = miniMax(board, depth+1, score);
                alert(colorToMove + " moves back from: " + (parseFloat(i) + num2) + ", to: " + i + ", depth: " + depth);
                board = miniMaxMove(board, parseFloat(i) + num2, i);
                /*if(colorToMove === "red") {
                    board[(i - Math.floor(num2 / 2))].black();  //re add jumped piece from board
                }
                else {
                    board[(i - Math.floor(num2 / 2))].red();  //re add jumped piece from board
                }*/
                updateBoardHTML2(board);

            }


            if (isLegalMove2(i, (parseFloat(i) + num3))) {
                    alert(colorToMove + " moves from: " + i + ", to: " + (parseFloat(i) + num3) + ", depth: " + depth);
                    board = miniMaxMove(board, i, parseFloat(i) + num3);
                myMove(i, parseFloat(i) + num3);
                updateBoardHTML2(board);
                    score = miniMax(board, depth+1, score);
                alert(colorToMove + " moves back from: " + (parseFloat(i) + num3) + ", to: " + i + ", depth: " + depth);
                board = miniMaxMove(board, parseFloat(i) + num3, i);
                updateBoardHTML2(board);

            }

            if (isLegalMove2(i, (parseFloat(i) + num4))) {
                    alert(colorToMove + " moves from: " + i + ", to: " + (parseFloat(i) + num4) + ", depth: " + depth);
                    board = miniMaxMove(board, i, parseFloat(i) + num4);
                    myMove(i, parseFloat(i) + num4);
                    updateBoardHTML2(board);
                    score = miniMax(board, depth+1, score);
                alert(colorToMove + " moves back from: " + (parseFloat(i) + num4) + ", to: " + i + ", depth: " + depth);

                board = miniMaxMove(board, parseFloat(i) + num4, i);
                updateBoardHTML2(board);
            }
        }
    }
    alert("depth: " + depth + "score: " + score);
    return score;
}

function miniMaxMove(board, from, to){
        board[to] = board[from];
        board[from] = emptyPiece;
        var dist = from - to;

        if((to >= 10 && to <= 17) && game['board'][to].color === "black"){
            board[to].king = "True";
        }
        else if((to >= 73 && to <= 80) && game['board'][to].color === "red") {
            board[to].king = "True";
        }

        if(Math.abs(dist) > 10){
            board[(from - Math.floor(dist/2))] = emptyPiece;  //remove jumped piece from board
            if(pieceHasJump2(to)){
                var jumpsonly = 1; //will need to work with this to allow multiple jumps
            }
        }
        return board;
}

function merciless(){

    for (i = 10; i < 81; i++) {
        if(game['board'][i].color === "red") {
            if(i < 63) { //prevents off-board jump attempt for cpu pieces on the first rank
                if (attemptMove(i, (parseFloat(i) + 16))) {
                    return true;
                }
                else if (attemptMove(i, (parseFloat(i) + 20))) {
                    return true;
                }
            }
            if(game['board'][i].king === "True") {
                if (attemptMove(i, (parseFloat(i) - 16))) {
                    return true;
                }
                else if (attemptMove(i, (parseFloat(i) - 20))) {
                    return true;
                }
            }
        }
    }
    for (j = 10; j < 81; j++) {
        if(game['board'][j].color === "red") {
            if (attemptMove(j, (parseFloat(j) + 8))){
                return true;
            }
            else if (attemptMove(j, (parseFloat(j) + 10))){
                return true;
            }
        }
        if(game['board'][i].king === "True") {
            if (attemptMove(i, (parseFloat(i) - 8))) {
                return true;
            }
            else if (attemptMove(i, (parseFloat(i) - 10))) {
                return true;
            }
        }
    }
    return false;
}

function cpuTurn(){
    //"Merciless" AI jumps as many times as it can. If no jumps are available, it plays a regular move.
    if(merciless()){
        return true;
    }
    return false;
}

function updateBoardHTML2(board) {
    //Instantiate pieces on board
    for (var i = 10; i < 81; i++) {
        if((i % 9) !== 0){
            updateSquareHTML(board[i], i);
        }
    }
}

function updateBoardHTML(){
    //board = JSON.parse(sessionStorage.getItem('boardObj'));
    game = JSON.parse(sessionStorage.getItem('gameObj'));
    //Instantiate pieces on board
    var i = 0;
    for (i = 10; i < 81; i++) {
        if((i % 9) !== 0){
            updateSquareHTML(game['board'][i], i);
        }
    }
    //debug board in top corner
    for (i = 10; i < 81; i++) {
        if((i % 9) !== 0) {
            document.getElementById("tile" + i).innerHTML = i;
            //document.getElementById("tile" + i).innerHTML = "<i class='fas fa-hockey-puck' style='color: " + game['board'][i]['color'] + ";'></i>";
        }
        document.getElementById("tile" + 18).innerHTML = 18;
        document.getElementById("tile" + 72).innerHTML = 72;

    }

    //update pieces lost display

    document.getElementById("red-pieces-lost").innerHTML = "Red pieces lost: " + game['red']['pieceslost'];
    document.getElementById("black-pieces-lost").innerHTML = "Black pieces lost: " + game['black']['pieceslost'];
    document.getElementById("current-turn").innerHTML = "Turn " + game['turn'];
    if(game['turn'] % 2 == 1){
        document.getElementById("team-to-move").innerHTML = "black";
        //no function is calles, but this is the player's turn.
    }
    else {
        document.getElementById("team-to-move").innerHTML = "red";
        //if(cpuTurn() === "False"){ //cpuTurn will recursively call updateboardHTML
        //   alert("No move available for CPU!");
        //}
    }
    document.getElementById("jumps-only").innerHTML = "Turnphase " + game['jumpsonly'];
    console.log(game);
}

$( document ).ready(function() {
    console.log(JSON.parse(sessionStorage.getItem('gameObj')));
});
