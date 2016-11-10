var readlineSync = require('readline-sync');
var resetConsoleText = '\u001b[2J\u001b[0;0H';

// Resets the console
function resetConsole() {
	console.log(resetConsoleText);
}

function fixInput(str) {
	if(str == null) return '';

	return str.trim();
}

function requestPassword(confirm) {
	while(true) {
		var password1 = fixInput(readlineSync.question('Please enter a password [It will appear on the screen]: '));
		if(password1 && password1.length > 0) {
			if(confirm) {
				var password2 = fixInput(readlineSync.question('Please confirm your password: '));

				if(password1 == password2) {
					// Log it
					console.log('The password is: "' + password1 + '".');
					requestInput('Press enter to continue...');

					// Clear the console
					resetConsole();
					return password1;
				}
			} else {
				resetConsole();
				return password1;
			}
		}
	}
}

function requestInput(question) {
	return fixInput(readlineSync.question(question));
}

exports.requestInput = requestInput;
exports.requestPassword = requestPassword;
exports.resetConsole = resetConsole;
