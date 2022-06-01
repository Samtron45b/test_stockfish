const child_process = require(`child_process`);

var _settings = {
	debug: true
}

var _stockfish;
var _moveList = [];

var searchingDone = () => {};
var initDone = () => {};
var quitDone = () => {};

function getBestMove(data) {
	let result = data.toString().split(` `);

	for (let i = 0; i < result.length; ++i)
		if (result[i].includes(`bestmove`))
			return result[i + 1];
}

module.exports.init = (options) => {
	let result = new Promise((resolve) => initDone = resolve);

	if (options)
		_settings = options;

	_stockfish = child_process.spawn("stockfish/stockfish");
	
	_stockfish.stderr.on(`data`, (data) => console.log(`Error data: ${data}`))

	_stockfish.stdout.on(`data`, (data) => {
		if (_settings.debug)
			console.log(`data: ${data}`);

		if (data.includes("readyok"))
			initDone();
		
		if (data.includes("bestmove")) {
			let bestMove = getBestMove(data);
			searchingDone(bestMove);
		}
	});

	_stockfish.on(`close`, (exitCode) => {
		if (_settings.debug)
			console.log(`Exited with code ${exitCode}`);
		quitDone();
	});

	_stockfish.on(`error`, (error) => console.log(`Error: ${error}`));


	_stockfish.stdin.write("uci\n");
	_stockfish.stdin.write("isready\n");
	_stockfish.stdin.write("ucinewgame\n");
	
	_moveList = [];

	return result;
}

module.exports.quit = function() {
	let result = new Promise((resolve) => quitDone = resolve);

	_stockfish.stdin.write("quit\n");
	_stockfish.stdin.end();

	return result;
}

module.exports.moveAndSearch = function(move) {
	let result = new Promise((resolve) => searchingDone = resolve);

	_moveList.push(move);

	_stockfish.stdin.write(`position startpos moves ${_moveList.join(` `)}\n`);
	_stockfish.stdin.write("go movetime 3000\n");
	
	return result;
}

module.exports.move = function(move) {
	_moveList.push(move);
}

module.exports.undo = function() {
	_moveList.pop(move);
}