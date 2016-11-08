var fs = require('fs');
var path = require('path');
var NodeRSA = require('node-rsa');
var crypto = require('crypto');
var CryptoJS = require('crypto-js');
var AES = require("crypto-js/aes");

var outputDir = './output/';

var encryptedConfigFile = path.join(outputDir, 'encryptedConfig.txt');

var configFile = './config.json';

var algorithm = 'aes-256-ctr';
var thePassword = 'samplePassword123';

// Load the config
var config;
try {
	config = require(configFile);
} catch(e) {
	console.log('Please create a config.json file, see config_example.json for a sample.');
	return;
}

var questions = config.questions;

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, thePassword);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

var encryptedConfig = fs.readFileSync(encryptedConfigFile, 'utf8');
var theConfig = JSON.parse(decrypt(encryptedConfig));

var privateKey = theConfig.privateKey;
var publicKey = theConfig.publicKey;

var fileList = fs.readdirSync(path.join(outputDir, 'responses'));

var decKey = new NodeRSA();
decKey.importKey(privateKey, 'pkcs8-private-pem');
decKey.setOptions({
	encryptionScheme: 'pkcs1'
});

var matchPools = {};

for(var i=0; i<fileList.length; ++i) {
	var fileName = fileList[i];

	var fileContents = fs.readFileSync(path.join(outputDir, 'responses', fileName, 'payload.json'));
	var theirPayload = JSON.parse(fileContents);

	try {
		var theirMessage = theirPayload.payload;
		var theirKey = theirPayload.key;

		// Decrypt their key
		var theirPassword = decKey.decrypt(theirKey, 'utf8');

		// Decrypt the their response
		var bytes = AES.decrypt(theirMessage, theirPassword);
		var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

		if(!decryptedData.info) {
			console.log('Payload for ' + fileName + ' is missing payload info :/');
			continue;
		}

		console.log(fileName + ' seems ok!');

		// Grab the info of this person
		var theInfo = decryptedData.info;

		for(var j=0; j<questions.length; ++j) {
			var question = questions[j];
			var theVal = question.value;
			var theirAnswer = theInfo[theVal];

			if(question.reveal) {
				console.log(theVal + ' - ' + theirAnswer);
			}

			if(question.match) {
				matchPools[theirAnswer] = matchPools[theirAnswer] || [];
				matchPools[theirAnswer].push({
					name: fileName,
					answers: theInfo,
					password: theirPassword
				});
			}
		}

		/*var outaaa = {
			answers: decryptedData.info
		};

		var pl = AES.encrypt(JSON.stringify(outaaa), 'asddsa').toString();
		console.log(pl);*/
	} catch(e) {
		console.log(e);
		console.log(fileName + ' has provided an invalid entry.')
	}

	// Perform the matching

	console.dir(matchPools);
}
