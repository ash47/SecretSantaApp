var fs = require('fs');
var path = require('path');
var NodeRSA = require('node-rsa');
var crypto = require('crypto');
var CryptoJS = require('crypto-js');
var AES = require("crypto-js/aes");
var inputModule = require('./secret_input.js');

var fileName = inputModule.requestInput('Please enter the user you want to recover the password for:');

var outputDir = './output/';

var encryptedConfigFile = path.join(outputDir, 'encryptedConfig.txt');
var matchOutputConfig = path.join(outputDir, 'matches.json');

var configFile = './config.json';

var algorithm = 'aes-256-ctr';
var thePassword = inputModule.requestPassword();

// Load the config
var config;
try {
	config = require(configFile);
} catch(e) {
	console.log('Please create a config.json file, see config_example.json for a sample.');
	return;
}

var questions = config.questions;

function encrypt(text){
  var cipher = crypto.createCipher(algorithm, thePassword);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, thePassword);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var usedIDs = {};
function makeID() {
	while(true) {
		var text = '';
	    var possible = 'ABCEFGHJKMNPQRSTUXYZ23456789';

	    for( var i=0; i < 4; i++ ) {
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }

	    // Ensure each ID is unique
	    if(usedIDs[text] == null) {
	    	usedIDs[text] = true;

	    	return text;
	    }
	}

    return text;
}

var encryptedConfig = fs.readFileSync(encryptedConfigFile, 'utf8');
var theConfig;

try {
	theConfig = JSON.parse(decrypt(encryptedConfig));
} catch(e) {
	console.log('Failed to decrypt config. Incorrect password?');
	return;
}

var privateKey = theConfig.privateKey;
var publicKey = theConfig.publicKey;

//var fileList = fs.readdirSync(path.join(outputDir, 'responses'));

var decKey = new NodeRSA();
decKey.importKey(privateKey, 'pkcs8-private-pem');
decKey.setOptions({
	encryptionScheme: 'pkcs1'
});

var fileContents = fs.readFileSync(path.join(outputDir, 'responses', fileName, 'payload.json'));
var theirPayload = JSON.parse(fileContents);

try {
	var theirMessage = theirPayload.payload;
	var theirKey = theirPayload.key;

	// Decrypt their key
	var theirPassword = decKey.decrypt(theirKey, 'utf8');

	console.log('The password is: ' + theirPassword);
} catch(e) {
	// Doh
	console.log('sad panda :(');
}
