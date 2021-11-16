var roomCode = document.getElementById("game_board").getAttribute("room_code");
var char_choice = document.getElementById("game_board").getAttribute("char_choice");

var connectionString = 'ws://' + window.location.host + '/ws/play/' + roomCode + '/';
var gameSocket = new WebSocket(connectionString);
var gameBoard = [
    -1, -2, -2,-2, -2, -2,-1,
    -1, -2, -2,-2, -2, -2,-1,
    -1, -2, -2,-2, -2, -2,-1,
    -1, -2, -2,-2, -2, -2,-1,
    -1, -2, -2,-2, -2, -2,-1,
    -1, -2, -2,-2, -2, -2,-1,
    -1, -2, -2,-2, -2, -2,-1
];

let moveCount = 0;
let myturn = true;

let elementArray = document.getElementsByClassName('square');
for (var i = 0; i < elementArray.length; i++){
    elementArray[i].addEventListener("click", event=>{
        const index = event.path[0].getAttribute('data-index');
        if(gameBoard[index] == -1){
            if(!myturn){
                alert("Wait for other to place the move")
            }
            else{
                myturn = false;
                document.getElementById("alert_move").style.display = 'none'; // Hide          
                make_move(index, char_choice);
            }
        }
    })
}

function make_move(index, player){
    

    index = parseInt(index);

    let data = {
        "event": "MOVE",
        "message": {
            "index": index,
            "player": player
        }
    }
    
 
    if(gameBoard[index] == -1){
        moveCount++;
    
        if(player == 'X'){
            
            gameBoard[index] = 1;
            if (index>0){if( gameBoard[index-1] == -2){gameBoard[index-1] = -1}}
            if (index<48){if( gameBoard[index+1] == -2){gameBoard[index+1] = -1}}

        }  
        else if(player == 'O'){
            
            gameBoard[index] = 0;
            if (index>0){if( gameBoard[index-1] == -2){gameBoard[index-1] = -1}}
            if (index<48){if( gameBoard[index+1] == -2){gameBoard[index+1] = -1}}

        }
        else{
            alert("Invalid character choice");
            return false;
        }
        gameSocket.send(JSON.stringify(data))
    }

    elementArray[index].innerHTML = player;
    const win = checkWinner(makeWinnerVectors(index),player);
    if(myturn){
        if(win){
            if (player=="X"){var player2="O"}else{var player2="X"}
            data = {
                "event": "END",
                "message": `Player ${player} won. Player ${player2} lost.  Play again?`
            }
            gameSocket.send(JSON.stringify(data))
        }
        else if(!win && moveCount == 49){
            data = {
                "event": "END",
                "message": "It's a draw. Play again?"
            }
            gameSocket.send(JSON.stringify(data))
        }
    }
}

function reset(){
    gameBoard = [
        -1, -2, -2,-2, -2, -2,-1,
        -1, -2, -2,-2, -2, -2,-1,
        -1, -2, -2,-2, -2, -2,-1,
        -1, -2, -2,-2, -2, -2,-1,
        -1, -2, -2,-2, -2, -2,-1,
        -1, -2, -2,-2, -2, -2,-1,
        -1, -2, -2,-2, -2, -2,-1
    ]; 
    moveCount = 0;
    myturn = true;
    document.getElementById("alert_move").style.display = 'inline';        
    for (var i = 0; i < elementArray.length; i++){
        elementArray[i].innerHTML = "";
    }
}


function makeWinnerVectors(index){
    var indexCol=parseInt(index)
    var auxVectorCol=[] 
    var indexRow=parseInt(index)
    var auxVectorRow=[] 
    var indexDia=parseInt(index)
    var auxVectorDia=[] 
    var indexDia2=parseInt(index)
    var auxVectorDia2=[] 
    //colums
    while(indexCol>6){indexCol-=7}
    auxVectorCol.push(indexCol)
    while(indexCol<42){indexCol+=7;auxVectorCol.push(indexCol)}
    //rows
    while(indexRow%7!=0){indexRow-=1}
    auxVectorRow.push(indexRow)
    while(indexRow%7!=6){indexRow+=1;auxVectorRow.push(indexRow)}
    
    //diagonal /
    while(indexDia>6 && indexDia%7!=6){indexDia-=6}
    auxVectorDia.push(indexDia)
    while(indexDia%7!=0 && indexDia<43){indexDia+=6;auxVectorDia.push(indexDia)}

    //diagonal \
    while((indexDia2>7 || indexDia2%7==0)&& index!=0){indexDia2-=8}
    auxVectorDia2.push(indexDia2)
    
    while(indexDia2%7 != 6 && indexDia2<41){indexDia2+=8;auxVectorDia2.push(indexDia2)}
    var winArray =[]
    if (auxVectorCol.length>=4){winArray.push(auxVectorCol)}
    if (auxVectorRow.length>=4){winArray.push(auxVectorRow)}
    if (auxVectorDia.length>=4){winArray.push(auxVectorDia)}
    if (auxVectorDia2.length>=4){winArray.push(auxVectorDia2)}
    return (winArray)

}
function checkWinner(winArray,player){
    let win = false;
    
    if (player == "X"){var currentplayer=1}else{var currentplayer=0}
    if (moveCount >= 0) {
       
        for (var arrays of winArray) {
            var inRowCounter=0
            for (var token of arrays) {
                if(gameBoard[token]==currentplayer){inRowCounter+=1}else{inRowCounter=0}
                
                if(inRowCounter==4){win=true;return(win)}
            }
        }

    }
    return(win)
}



function connect() {
    gameSocket.onopen = function open() {
        console.log('WebSockets connection created.');
        gameSocket.send(JSON.stringify({
            "event": "START",
            "message": ""
        }));
    };

    gameSocket.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function () {
            connect();
        }, 1000);
    };
    // Sending the info about the room
    gameSocket.onmessage = function (e) {
        let data = JSON.parse(e.data);
        data = data["payload"];
        let message = data['message'];
        let event = data["event"];
        switch (event) {
            case "START":
                reset();
                break;
            case "END":
                alert(message);
                reset();
                break;
            case "MOVE":
                if(message["player"] != char_choice){
                    make_move(message["index"], message["player"])
                    myturn = true;
                    document.getElementById("alert_move").style.display = 'inline';        
                }
                break;
            default:
                console.log("No event")
        }
    };

    if (gameSocket.readyState == WebSocket.OPEN) {
        gameSocket.onopen();
    }
}

connect();
