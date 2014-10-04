var idGen = function() {
	return 'board' + new Date().getTime();
};

$(document).ready(function() {
	var savedBoards = JSON.parse(localStorage.getItem('savedBoards')) || [];
	var main = $('#main');

	var boardIndex = savedBoards.length-1;

	var lastSaved = null;
	if(savedBoards.length>0) {
		lastSaved = JSON.parse(localStorage.getItem(savedBoards[boardIndex]));
	}

	var board = new ColorBoard(lastSaved);
	main.append(board.el);


	//Saving in local storage for easy demo purposes
	$('#save').click(function() {
		var data = board.state();
		var saveName = prompt("Save as: ", data.name);
		if(data.name !== saveName) {
			data.id = idGen();
			data.name = saveName;
			board.setName(saveName);
			board.setID(data.id);
		}

		localStorage.setItem(data.id, JSON.stringify(data));
		if(!_.contains(savedBoards, data.id)) {
			savedBoards.push(data.id);
			boardIndex++;
			localStorage.setItem('savedBoards',  JSON.stringify(savedBoards));
		}
	});

	$('#clear').click(function() {
		board.clear();
	});

	var updateBoard = function() {
		var data = JSON.parse(localStorage.getItem(savedBoards[boardIndex]));
		if(data) {
			board.el.remove();
			board = new ColorBoard(data);
			main.append(board.el);
		}
	};

	var updateNavButtonClasses = function() {
		$('#prev').toggleClass('controlDisabled', boardIndex===0);
		$('#next').toggleClass('controlDisabled', boardIndex===savedBoards.length-1);
	};

	$('#prev').click(function() {
		if(boardIndex>0) {
			boardIndex--;
			updateBoard();
			updateNavButtonClasses();
		}
	});

	$('#next').click(function() {
		if(boardIndex<savedBoards.length-1) {
			boardIndex++;
			updateBoard();
			updateNavButtonClasses();
		}
	});

	$('#help').click(function() {
		var instructions = "Click a box to change it's color from white to a random color and back. ";
		instructions += "Click 'Save' to save your creation for future perusal and give it a name. ";
		instructions += "Click 'Clear' to start over. Click the left and right arrows to review your Color Boards.";
		alert(instructions);
	});


});

function ColorBoard(data) {
	var width = 8;
	var height = 5;
	var rows = [];
	var name = 'Board ' + new Date();
	var id = idGen();

	var updateName = function() {
		document.title = name;
		$('#title').html(name);
	};

	if(data) {
		width = data.width;
		height = data.height;
		name = data.name;
		id = data.id;
	}
	updateName();

	this.el = $("<div id='board'/>");
	for(var i=0; i<height; i++) {
		var row = new Row(width);
		rows.push(row);
		this.el.append(row.el);
	}

	if(data) {
		for(var j=0; j<data.rows.length; j++) {
			rows[j].setState(data.rows[j]);
		}
	}
	this.setName = function(newName) {
		name = newName;
		updateName();
	};
	this.setID = function(id) {
		this.is = id;
	};

	this.clear = function() {
		_.each(rows, function(row) {
			row.clear();
		});
		name = 'Board ' + new Date();
		id = idGen();
		updateName();
	};

	this.state = function() {
		var rowData = [];
		_.each(rows, function(row) {
			rowData.push(row.state());
		});
		return {
			rows: rowData,
			width: width,
			height: height,
			name: name,
			id: id
		};
	};
}

function Row(length, rowData) {
	this.el = $("<div class='row'/>");
	var tiles = [];

	for(var i=0; i<length; i++) {
		var tile = new Tile();
		tiles.push(tile);
		this.el.append(tile.el);
	}

	this.state = function() {
		var data = [];
		_.each(tiles, function(tile) {
			data.push(tile.state);
		});
		return data;
	};

	this.setState = function(data) {
		for(var j=0; j<data.length; j++) {
			tiles[j].setState(data[j]);
		}
	};

	this.clear = function() {
		_.each(tiles, function(tile) {
			tile.clear();
		});
	};

}

function Tile() {
	this.el = $("<div class='tile'/>");

	this.state = {
		val : true,
		color: 'white'
	};

	this.clear = function() {
		this.setState({val : true, color: 'white'});
	};

	this.setState = function(data) {
		this.state = data;
		this.el.css('background-color', this.state.color);
	};

	var that = this;
	this.el.click(function() {
		that.state.val = !that.state.val;
		if(that.state.val) {
			that.state.color = 'white';
		} else {
			that.state.color = '#'+Math.floor(Math.random()*16777215).toString(16);
		}
		that.el.css('background-color', that.state.color);
	});

}
