var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var inputModule = require('./secret_input.js');

var outputDir = './output/';

var encryptedConfigFile = path.join(outputDir, 'encryptedConfig.txt');

var configFile = './config.json';

var algorithm = 'aes-256-ctr';
var thePassword = inputModule.requestPassword();

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, thePassword);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

var encryptedConfig = fs.readFileSync(encryptedConfigFile, 'utf8');
var theConfig;

try {
	theConfig = JSON.parse(decrypt(encryptedConfig));
} catch(e) {
	console.log('Failed to decrypt config. Incorrect password?');
	return;
}

// Output the mapping
console.dir(theConfig.idLookup);
