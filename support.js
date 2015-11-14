$(document).ready(function(){
 //--------------------------------Setting New Game-------------------------------- 
  newGame();
  resetWaste();
  layOutTableau(game.tableau);
  //set draggable options for faceUp cards
  $(".card.faceUp").draggable(pileDrag);
  //set droppable options for faceUp cards
  $(".card.faceUp").droppable(pileDrop);

  //--------------------------------Play Control--------------------------------
  //flip card in waste pile
 $("div.top.waste.fd").on("click",function(){//when last card in the waste faceDown pile is clicked
    if ($(this).children().length > 0) {//if there is still cards left in the waste faceDown pile
      var $lastCard = $(this).children().last();
      
      $lastCard.removeClass("faceDown");
      $lastCard.addClass("faceUp");

      var cardTracker = $lastCard.attr("tracker"),
          cardSuite = game.deck[cardTracker].suite,
          cardVal = game.deck[cardTracker].value,
          $cardVal = $("<p/>", {"class": cardSuite + " value", "text": cardVal}),
          $cardSuite = $("<p/>", {"class": cardSuite +" suite", "text": cardSuite});
      
      $lastCard.append($cardVal).append($cardSuite);
      $(".top.waste.fu").append($lastCard);
      $(".waste.fu div:last").draggable(pileDrag);
      
      var zCount = $("div.card.faceUp").length + 1;
      
      $(".top.waste.fu div:last").css("z-index", zCount);
    } else {
      resetWaste();
    };
  });

  // reveal last card in each tableau pile
  each(game.tableauBoard,function(i, col){  
    $(".pile div").on("click",function(){
      if ($(this).is(".pile." + col +" div:last") && $(this).is(".faceDown")) {
        $(this).removeClass("faceDown");
        $(this).addClass("faceUp");
        $(this).draggable(pileDrag);
        $(this).droppable(pileDrop);

        var cardTracker = $(this).attr("tracker"),
            cardSuite = game.deck[cardTracker].suite,
            cardVal = game.deck[cardTracker].value,
            $cardVal = $("<p/>", {"class": cardSuite + " value", "text": cardVal}),
            $cardSuite = $("<p/>", {"class": cardSuite +" suite", "text": cardSuite});
        
        $(this).append($cardVal).append($cardSuite);
      }
    });
  });

  //making all foundation elements droppable when conditions are met
  each(game.suite, function (i, item) {
    var $parent = $( ".top.foundation." + item );
    $parent.droppable({
      accept: function (d) {
        var condition1 = d.find("div").length === 0,//single card
            condition2 = d.find("p.suite").text() === item, //match suite
            condition3 = (($( ".top.foundation." + item + " div").length + 1) == d.find("p.value").text()); //match number
      
        return condition1 && condition2 && condition3;
      },
      drop: function (event, ui) {
        if (ui.draggable.parent().is(".waste")) {
          var temp = ui.draggable.attr("tracker");
          removeByTracker(game.waste,temp);
        };
        $parent.append(ui.draggable);
        var $parentPosition = $parent.offset();
        
        ui.draggable.offset($parentPosition);

        youWin();

      }
    });
  });

  //make the each tableauBoard bases droppable
  each(game.tableauBoard,function (i, col) {
    $(".pile." + col +":first").droppable({
      accept: function (d) {
        var condition1 = $(this).find("div").length === 1,
            condition2 = d.find("p.value:first").text() === "13";
        
        return condition1 && condition2;
      },
      drop: function (event, ui) {
        if (ui.draggable.parent().is(".waste")) {
          var cardTracker = ui.draggable.attr("tracker");
          
          ui.draggable.droppable(pileDrop);
          removeByTracker(game.waste,cardTracker);
  		  };
        $(this).append(ui.draggable);
        ui.draggable.offset($(this).offset());

        youWin();
      }
    });
  });

//double click to send card to foundnation
  $(".card").dblclick(function() {
    if ( !$(this).children().is("div") && $(this).is(".faceUp")) {
      debugger;
      var cardSuite = $(this).find("p.suite").text(),
          cardValue = $(this).find("p.value").text(),
          foundationCount = $(".foundation." + cardSuite).children().length,
          zCount = $("div.card.faceUp").length + 1;
      
      if ( foundationCount + 1 == cardValue ) {
        if ($(this).parent().is(".waste")) {
          var cardTracker = $(this).attr("tracker");
          removeByTracker(game.waste,cardTracker);
        };

        $(".foundation." + cardSuite).append($(this));
        $(this).offset($(".foundation." + cardSuite).offset());
        $(this).css("z-index", zCount);
      };
    };
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
	suite: ["heart", "spade", "diamond", "club"],
	foundations: {heart: [], spade: [], diamond: [], club:[]},
	waste: [],
	vertOff: 20
}

//**********************************************************************************
// Helper Functions
//**********************************************************************************
function each (list, iteratee) {
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
  // var $cardDiv = $("<div/>", {"class": "card faceUp", "tracker": card.tracker}),
  //   $cardVal = $("<p/>", {"class": card.suite + " value", "text": card.value}),
  //   $cardSuite = $("<p/>", {"class": card.suite +" suite", "text": card.suite});
  // $cardDiv.append($cardVal).append($cardSuite);
  return $cardDiv;
};

//take a card object and convert to a dom element that is "faceUp" using lay function
function flip(card){
  var $cardDiv = $("<div/>", {"class": "card faceUp", "tracker": card.tracker}),
      $cardVal = $("<p/>", {"class": card.suite + " value", "text": card.value}),
      $cardSuite = $("<p/>", {"class": card.suite +" suite", "text": card.suite});
  $cardDiv.append($cardVal).append($cardSuite);
  return $cardDiv;
};


function resetWaste(){
  // $(".top.waste.faceDown").empty();
  $(".top.waste.fu").empty();
  each(game.waste,function(i, x){
    $(".top.waste.fd").append(lay(x));
      // double click to send card to foundation
    $(".card").dblclick(function() {
      if ( !$(this).children().is("div") && $(this).is(".faceUp")) {
        debugger;
        var cardSuite = $(this).find("p.suite").text();
        var cardValue = $(this).find("p.value").text();
        var foundationCount = $(".foundation." + cardSuite).children().length;
        
        if ( foundationCount + 1 == cardValue ) {
          if ($(this).parent().is(".waste")) {
            var cardTracker = $(this).attr("tracker");
            removeByTracker(game.waste,cardTracker);
          };
        
          $(".foundation." + cardSuite).append($(this));
          $(this).offset($(".foundation." + cardSuite).offset());
        
          var zCount = $("div.card.faceUp").length + 1;
        
          $(this).css("z-index", zCount);
        };
      };
    });
  });
};

function getIndexByTracker (list, tracker) {
  var index = -1;
  
  each(list, function (i, item){
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
  each(game.tableauBoard,function(i, col){
    each(game.tableau[i], function(j, row){
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

//helper function that defines the event following a drop action at the piles
// used with droppable()
var pileDrop = {
  accept: function (d) {
    var condition1 = (game.suite.indexOf($(this).find("p.suite").text()) + game.suite.indexOf(d.find("p.suite").first().text())) % 2 !== 0, //match suite
        condition2 = ($(this).find("p.value").text() - d.find("p.value").first().text()) === 1//match value
    
    return condition1 && condition2;
  },
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

    youWin();
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

//automatically take the last card in the pile to the foundation
function upload () {
  if ( $(".pile div").length === 7 ) { 
    return alert("You Won!");
  } else {
    each(game.tableauBoard, function (index, colNum) {
      if ($(".pile." + colNum + " div").length > 1) {
        var $current = $(".pile." + colNum + " div:last"),
            cardSuite = $current.find("p.suite").text(),
            cardValue = $current.find("p.value").text(),
            foundationCount = $(".foundation." + cardSuite).children().length;
        
        if ( foundationCount + 1 == cardValue ) {
          var xDist = $(".foundation." + cardSuite).offset().left - $current.parent().offset().left,
              yDist = $(".foundation." + cardSuite).offset().top - $current.parent().offset().top;
        
          $(".foundation." + cardSuite).append($current);
          $(".foundation." + cardSuite).children().last().offset($(".foundation." + cardSuite).offset());
          
          var zCount = $("div.card.faceUp").length + 1;
          
          $(this).css("z-index", zCount);

          return upload();
        };
      };
    });
  };
};

function youWin () {
  if ($(".card.faceDown").length + game.waste.length == 0 ) {
    upload()
  };
};
//--------------------------------Game Setup--------------------------------

//card constructor
function card (value, suite) {
  this.value = value;
  this.suite = suite;
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
  each(game.deck,function (i, card) {
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
