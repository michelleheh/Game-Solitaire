$(document).ready(function(){
 //--------------------------------Setting New Game-------------------------------- 
  newGame();
  resetWaste();
  layOutTableau(game.tableau);
  doubleClick();
  //set draggable options for faceUp cards
  $(".card.faceUp").draggable(pileDrag);
  //set droppable options for faceUp cards
  $(".card.faceUp").droppable(pileDrop);

  //--------------------------------Play Control--------------------------------
  //reload to start a new game
  $("button").on("click", function () {
    window.location.reload(false); 
  });

  //flip card in waste pile
  $("div.top.waste.fd").on("click",function(){//when last card in the waste faceDown pile is clicked
    if ($(this).children().length > 0) {//if there is still cards left in the waste faceDown pile
      var $lastCard = $(this).children().last();
      
      $lastCard.removeClass("faceDown");
      $lastCard.addClass("faceUp");

      var cardTracker = $lastCard.attr("tracker"),
          cardSuit = game.deck[cardTracker].suit,
          cardVal = game.deck[cardTracker].value,
          $cardVal = $("<p/>", {"class": cardSuit + " value", "text": cardVal}),
          $cardSuit = $("<p/>", {"class": cardSuit +" suit", "text": cardSuit});
      
      $lastCard.append($cardVal).append($cardSuit);
      $(".top.waste.fu").append($lastCard);
      $(".waste.fu div:last").draggable(pileDrag);
      
      var zCount = $("div.card.faceUp").length + 1; //number of cards that are facing up + 1
      $(".top.waste.fu div:last").css("z-index", zCount); // put the last card in the waste face up pile on top

    } else {
      resetWaste();
    };
  });

  // reveal last card in each tableau pile
  game.each(game.tableauBoard,function(i, col){  
    $(".pile div").on("click",function(){
      if ($(this).is(".pile." + col +" div:last") && $(this).is(".faceDown")) {
        $(this).removeClass("faceDown");
        $(this).addClass("faceUp");
        $(this).draggable(pileDrag);
        $(this).droppable(pileDrop);

        var cardTracker = $(this).attr("tracker"),
            cardSuit = game.deck[cardTracker].suit,
            cardVal = game.deck[cardTracker].value,
            $cardVal = $("<p/>", {"class": cardSuit + " value", "text": cardVal}),
            $cardSuit = $("<p/>", {"class": cardSuit +" suit", "text": cardSuit});
        
        $(this).append($cardVal).append($cardSuit);
      }
    });
  });

  //making all foundation elements droppable when conditions are met
  game.each(game.suit, function (i, SuitName) {
    var $parent = $( ".top.foundation." + SuitName );
    $parent.droppable({
      accept: function (d) {
        var condition1 = d.find("div").length === 0,//single card
            condition2 = d.find("p.suit").text() === SuitName, //match suit
            condition3 = (($( ".top.foundation." + SuitName + " div").length + 1) === parseInt(d.find("p.value").text())); //match number
      
        return condition1 && condition2 && condition3;
      },
      hoverClass: "lightup",
      drop: function (event, ui) {
        if (ui.draggable.parent().is(".waste")) {
          var temp = ui.draggable.attr("tracker");
          removeByTracker(game.waste,temp);
        };
        $parent.append(ui.draggable);
        var $parentPosition = $parent.offset();
        
        ui.draggable.offset($parentPosition);

        youWin(0);
      }
    });
  });

  //make the game.each tableauBoard bases droppable
  game.each(game.tableauBoard,function (i, col) {
    $(".pile." + col +":first").droppable({
      accept: function (d) {
        var condition1 = $(this).find("div").length === 1,
            condition2 = d.find("p.value:first").text() === "13";
        
        return condition1 && condition2;
      },
      hoverClass: "lightup",      
      drop: function (event, ui) {
        if (ui.draggable.parent().is(".waste")) {
          var cardTracker = ui.draggable.attr("tracker");
          
          ui.draggable.droppable(pileDrop);
          removeByTracker(game.waste,cardTracker);
  		  };
        $(this).append(ui.draggable);
        ui.draggable.offset($(this).offset());

        youWin(0);
      }
    });
  });

//_______________________end of $(document).ready()_______________________
});

//**********************************************************************************
// Global Variables
//**********************************************************************************

//define global variable
var game = {
	tableauBoard: ["col1","col2","col3","col4","col5","col6","col7"],
	tableau: [],
	deck: [],
	suit: ["heart", "spade", "diamond", "club"],
	foundations: {heart: [], spade: [], diamond: [], club:[]},
	waste: [],
	vertOff: 20
}

//**********************************************************************************
// Helper Functions
//**********************************************************************************
game.each = function (list, iteratee) {
  if (Array.isArray(list)) {
    for (var i = 0; i < list.length; i++){
      iteratee(i, list[i], list);
    };
  } else {
    for (var key in list) {
      iteratee(list[key]);
    };
  };
};

function shuffle (arr) {
  for (var i = arr.length; i > 0; i--) {
    var randomIndex = Math.floor(Math.random() * i);
    var temp = arr[randomIndex];
    arr[randomIndex] = arr[i-1];
    arr[i-1] = temp;
  };
  return arr;
};

//take a card object and convert to a dom element that is "faceDown"
function lay(card){
  var $cardDiv = $("<div/>", {"class": "card faceDown", "tracker": card.tracker});
  return $cardDiv;
};

//take a card object and convert to a dom element that is "faceUp" using lay function
function flip(card){
  var $cardDiv = $("<div/>", {"class": "card faceUp", "tracker": card.tracker}),
      $cardVal = $("<p/>", {"class": card.suit + " value", "text": card.value}),
      $cardSuit = $("<p/>", {"class": card.suit +" suit", "text": card.suit});
  $cardDiv.append($cardVal).append($cardSuit);
  return $cardDiv;
};


function resetWaste(){
  $(".top.waste.fu").empty();
  game.each(game.waste,function(i, x){
    $(".top.waste.fd").append(lay(x));
      // double click to send card to foundation
    doubleClick();
  });
};

function getIndexByTracker (list, tracker) {
  var index = -1;
  
  game.each(list, function (i, item){
    if ( tracker == item.tracker) {
      index = i;
    };
  });

  return index;
}

function removeByTracker (list, tracker) {
  var index = getIndexByTracker(list, tracker);
  list.splice(index,1);
}

//var tableauBoard = ["col1","col2","col3","col4","col5","col6","col7"];
function layOutTableau(tableau){
  game.each(game.tableauBoard,function(i, col){
    game.each(game.tableau[i], function(j, row){
      var $lastCard = $(".pile." + col + " div:last");

      if (j === i) {
        $(".pile." + col + " div:last").append(flip(row));
        if ($(".pile." + col + " div").length > 2) {
          var t = $(".pile." + col + " div:last").parent().offset().top,
              l = $(".pile." + col + " div:last").parent().offset().left;
          $(".pile." + col + " div:last").offset({top:t + game.vertOff, left: l});
        };

      } else {
        $(".pile." + col + " div:last").append(lay(row));

        if ($(".pile." + col + " div").length > 2) {
          var t = $(".pile." + col + " div:last").parent().offset().top
              l = $(".pile." + col + " div:last").parent().offset().left;
          $(".pile." + col + " div:last").offset({top:t + game.vertOff, left: l});
        };      
      };
    });
  });
};


//double click to send card to foundnation
function doubleClick () {
  $(".card").dblclick(function() {
    //test when the card is faceup and is the last card of the pile
    if ( !$(this).children().is("div") && $(this).is(".faceUp")) {
      var cardSuit = $(this).find("p.suit").text(),
          cardValue = parseInt($(this).find("p.value").text()),
          foundationCount = $(".foundation." + cardSuit).children().length,
          zCount = $("div.card.faceUp").length + 1;
      //test the corresponding foundation has the card before $(this) card
      if ( foundationCount + 1 === cardValue ) {
        if ($(this).parent().is(".waste")) {
          var cardTracker = $(this).attr("tracker");
          removeByTracker(game.waste,cardTracker);
        };
        //append card and bring card to the front
        $(".foundation." + cardSuit).append($(this));
        $(this).offset($(".foundation." + cardSuit).offset());
        $(this).css("z-index", zCount);
        //test whether the user has won
        youWin(0);
      };
    };
  });
};

//helper function that defines the event following a drop action at the piles
// used with droppable()
var pileDrop = {
  accept: function (d) {
    var condition1 = (game.suit.indexOf($(this).find("p.suit").text()) + game.suit.indexOf(d.find("p.suit").first().text())) % 2 !== 0, //match suit
        condition2 = ($(this).find("p.value").text() - d.find("p.value").first().text()) === 1//match value
    
    return condition1 && condition2;
  },
  hoverClass: "lightup",
  drop: function (event, ui) {
    if (ui.draggable.parent().is(".waste")) {
      var cardTracker = ui.draggable.attr("tracker");
      
      ui.draggable.droppable(pileDrop);
      removeByTracker(game.waste,cardTracker);
    };
    
    if (ui.draggable.parent().is(".foundation")) {
      ui.draggable.droppable(pileDrop);
    };

    $(this).append(ui.draggable);
    ui.draggable.offset({top:$(this).offset().top + game.vertOff, left:$(this).offset().left});

    youWin(0);
  }
};

//helper function that defines the event following a drag action at the piles
// used with draggable()
var pileDrag = {
  revert: "invalid", //sends the card back if not accepted by droppable
  revertDuration: 100,
  opacity: 0.75,
  stack: ".card.faceUp",
};

//automatically take cards up to the foundation - recursive function
function upload (i) {
  function reload () { //recursive funtion
    if ( i === 6 ) {
      i = 0;
    } else {
      i += 1;
    }
    return upload(i);
  };

  if ( $(".pile div").length === 7 ) { 
    fireworks();
  } else {
    var colNum = game.tableauBoard[i];
    if ($(".pile." + colNum + " div").length > 1) {
      var $current = $(".pile." + colNum + " div:last"),
          cardSuit = $current.find("p.suit").text(),
          cardValue = parseInt($current.find("p.value").text()),
          foundationCount = $(".foundation." + cardSuit).children().length;
      
      if ( foundationCount + 1 === cardValue ) {
        var xDist = $(".foundation." + cardSuit).offset().left - $current.parent().offset().left,
            yDist = $(".foundation." + cardSuit).offset().top - $current.parent().offset().top;
      
        $current.animate({
          top: yDist,
          left: xDist
        }, 100, function() {
        // Animation complete.
          $(".foundation." + cardSuit).append($current);
          $(".foundation." + cardSuit).children().last().offset($(".foundation." + cardSuit).offset());
          
          var zCount = $("div.card.faceUp").length + 1;
          
          $(this).css("z-index", zCount);
          reload();
        });
      } else {
        reload()
      };
    } else {
      reload();
    }    
  };
};

function youWin (i) {
  if ($(".card.faceDown").length + game.waste.length === 0 ) {
    upload(i);
  };
};

//--------------------------------Game Setup--------------------------------

//card constructor
function card (value, suit) {
  this.value = value;
  this.suit = suit;
  this.tracker = 0;
};

//generate a full deck of cards (52 total) in order
function deckGen () {
  for (var key in game.foundations) {
    for (var i = 13; i >= 1; i--) {
      game.deck.push(new card(i, key));
    };
  };
  
  return game.deck;
};

function newGame () {
  game.deck = shuffle(deckGen());
  game.each(game.deck,function (i, card) {
    card.tracker = i;
  });
  //genterate full tableau piles
  var count = 0;

  for (var i = 0; i < 7; i++) {
    game.tableau[i] = [];
    for ( var j = 0; j < 7; j++ ) {
      if ( j <= i) {
        game.tableau[i][j] = game.deck[count];
        count ++;
      };
    };
  };

  var deckRemain = game.deck.slice(28);
  // the rest of the deck goes to the waste pile
  game.waste = deckRemain;
};
