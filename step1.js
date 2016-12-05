var fs = require('fs');
var path = require('path');
var NodeRSA = require('node-rsa');
var crypto = require('crypto');
var inputModule = require('./secret_input.js');

var outputDir = './output/';
var webappFileName = 'webapp.htm';
var webappFileNameJS = 'webapp_loader.js';

var encryptedConfigFile = path.join(outputDir, 'encryptedConfig.txt');

var configFile = './config.json';

var algorithm = 'aes-256-ctr';
var thePassword = inputModule.requestPassword(true);

var embedScripts = [
	'lib/js/jquery-3.1.1.min.js',
	'lib/js/jsencrypt.min.js',
	'lib/js/bootstrap.min.js',
	'lib/js/aes.js',
	'lib/js/app.js'
];

var embedCSS = [
	'lib/css/bootstrap.min.css',
	'lib/css/app.css'
];

// Load the config
var config;
try {
	config = require(configFile);
} catch(e) {
	console.log('Please create a config.json file, see config_example.json for a sample.');
	return;
}

function ensureDirectoryExists(dir) {
	try {
		fs.mkdirSync(dir);
	} catch(e) {
		// Do nothing
	}
}

function base64Encode(str) {
	str = '' + str;

	return new Buffer(str).toString('base64');
}

function base64Decode(str) {
	return new Buffer(str, 'base64').toString('ascii');
}

function generateEmbedScript(path, contents) {
	// Read in the file, if the contents wasnt passed
	if(!contents) contents = '' + fs.readFileSync(path);
	var encodedContents = base64Encode(contents);

	return '<script>eval(atob("' + encodedContents + '"));</script>';
}

function generateEmbedCSS(path) {
	var contents = '' + fs.readFileSync(path);
	var encodedContents = base64Encode(contents);

	var theScript = '$("<style>").append(atob("' + encodedContents + '")).appendTo($("head"));'

	return generateEmbedScript(null, theScript);
}

function encrypt(text){
  var cipher = crypto.createCipher(algorithm, thePassword);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm, thePassword);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

// Ensure the output dir exists
ensureDirectoryExists(outputDir);
ensureDirectoryExists(path.join(outputDir, 'responses'));

// Generate the RSA keypair
var crypt = new NodeRSA({b: 2048});;
var privateKey = crypt.exportKey('pkcs8-private-pem');
var publicKey = crypt.exportKey('pkcs8-public-pem');

// Write out the private key
var privateConfig = {
	privateKey: privateKey,
	publicKey: publicKey
};

var privateConfigString = JSON.stringify(privateConfig);

fs.writeFileSync(
	encryptedConfigFile,
	encrypt(privateConfigString)
);

var headers = '';

// Add shared data
var shared = config;
config.publicKey = publicKey;

var loader = 'var sharedVars = JSON.parse(atob("' + base64Encode(JSON.stringify(shared)) + '"))';
headers += generateEmbedScript(null, loader);

// Compiler the scripts we need
for(var i=0; i<embedScripts.length; ++i) {
	var fileName = embedScripts[i];

	headers += generateEmbedScript(fileName);
}

for(var i=0; i<embedCSS.length; ++i) {
	var fileName = embedCSS[i];

	headers += generateEmbedCSS(fileName);
}

fs.writeFileSync(path.join(outputDir, webappFileName), headers);

var jsOutput = 'document.write(atob("' + base64Encode(headers) + '"));';
fs.writeFileSync(path.join(outputDir, webappFileNameJS), jsOutput);
