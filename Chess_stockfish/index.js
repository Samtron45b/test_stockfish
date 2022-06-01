const readline = require(`readline`);
const stockfish = require(`./stockfish`);

reader = readline.createInterface({
	input: process.stdin,
	output: process.stdout
})

async function getInput(prompt) {
	let input = await new Promise(resolve => {
		reader.question(prompt, resolve);
	});
	return input;
}

async function loop() {
	await stockfish.init({ debug: true });

	let input = ``;
	while (input != "quit") {
		input = await getInput("Move white: ");
		if (input == `undo`) {
			stockfish.undo();
			stockfish.undo();
		}
		else {
			let bestMove = await stockfish.moveAndSearch(input);
			stockfish.move(bestMove);
		}
	}
	
	process.exit();
}

loop();