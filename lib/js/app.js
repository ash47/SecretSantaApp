// Wait for JQuery to be fully loaded
$(document).ready(function() {
	// Create the main container
	var mainCon = $('<div>', {
		class: 'containEverything'
	}).appendTo('body');

	// Shows the main entry page
	function showEntryPage() {
		// Cleanup any old pages
		mainCon.empty();

		var ourCon = $('<div>', {
			class: 'formMainEntryContainer'
		}).appendTo(mainCon);

		$('<div>', {
			class: 'textMainHeader',
			text: 'Secret Santa'
		}).appendTo(ourCon);

		// Add the "sign up" button
		$('<div>', {
			class: 'formMainEntry',
			style: 'margin-right: 8px;',
			click: function() {
				// Show signup page
				showSignup();
			}
		}).append(
			$('<h1>', {
				text: 'Sign Up'
			})
		).append(
			$('<p>', {
				text: 'Click this button if you are signing up for the Secret Santa exchange.'
			})
		).appendTo(ourCon);

		// Add the "receive match" button
		$('<div>', {
			class: 'formMainEntry',
			click: function() {
				showMatchPage();
			}
		}).append(
			$('<h1>', {
				text: 'Receive Match'
			})
		).append(
			$('<p>', {
				text: 'Click this button if you have been instructed to receive your match.'
			})
		).appendTo(ourCon);

		var daRules = $('<div>', {
			class: 'daRules'
		}).appendTo(ourCon);

		$('<h1>', {
			text: 'Da Rules:'
		}).appendTo(daRules);

		var ul = $('<ul>').appendTo(daRules);

		var rules = sharedVars.rules;
		for(var i=0; i<rules.length; ++i) {
			$('<li>', {
				text: rules[i]
			}).appendTo(ul);
		}
	}

	// Shows the signup page
	function showSignup() {
		// Cleanup any old pages
		mainCon.empty();

		// Add header
		$('<div>', {
			class: 'textMainHeader',
			text: 'Secret Santa - Sign Up'
		}).appendTo(mainCon);

		var ourCon = $('<div>', {
			class: 'signupCon'
		}).appendTo(mainCon);

		// The storage we will output
		var storageOutput = {
			info: {}
		};

		// Grab the list of questions
		var questions = sharedVars.questions;

		for(var i=0; i<questions.length; ++i) {
			(function(question) {
				var idName = 'elementName' + i;

				switch(question.sort) {
					case 'dropdown':
						var theCon = $('<div>', {
							class: 'form-group'
						}).appendTo(ourCon);

						$('<label>', {
							for: idName,
							text: question.value
						}).appendTo(theCon);

						var theSelect = $('<select>', {
							id: idName,
							class: 'form-control',
							change: function() {
								storageOutput.info[question.value] = $(this).val();
							}
						}).append(
							$('<option>', {
								text: '<select>',
								value: '<select>'
							})
						).appendTo(theCon);

						for(var j=0; j<question.values.length; ++j) {
							var theValue = question.values[j];

							$('<option>', {
								text: theValue,
								value: theValue
							}).appendTo(theSelect);
						}
					break;

					case 'text':
						$('<div>', {
							class: 'form-group'
						}).append(
							$('<label>', {
								for: idName,
								text: question.value
							})
						).append(
							$('<textarea>', {
								class: 'form-control',
								rows: 3,
								id: idName,
								change: function() {
									storageOutput.info[question.value] = $(this).val();
								}
							})
						).appendTo(ourCon);
					break;

					default:
						console.log('Unknown type: ' + question.sort);
					break;
				}
			})(questions[i]);
		}

		var passwordCon1 = $('<input>', {
			class: 'form-control',
			type: 'password',
			id: 'password1',
			maxlength: 64
		}).appendTo(
			$('<div>', {
				class: 'form-group'
			}).append(
				$('<label>', {
					for: 'password1',
					text: 'Password:'
				})
			).appendTo(ourCon)
		);

		var passwordCon2 = $('<input>', {
			class: 'form-control',
			type: 'password',
			id: 'password2',
			maxlength: 64
		}).appendTo(
			$('<div>', {
				class: 'form-group'
			}).append(
				$('<label>', {
					for: 'password2',
					text: 'Repeat Password:'
				})
			).appendTo(ourCon)
		);

		$('<button>', {
			class: 'btn btn-primary',
			text: 'Generate Entry',
			click: function() {
				var pwd1 = passwordCon1.val();
				var pwd2 = passwordCon2.val();

				if(pwd1 != pwd2) {
					alert('You have entered two DIFFERENT passwords.');
					return;
				}

				if(pwd1.length == 0) {
					alert('Please enter a strong password.');
					return;
				}

				if(pwd1.length > 64) {
					alert('I wouldnt recommend bypassing a password max length, it can break the crypto, then it is GG for you.');
					return;
				}

				// Load in the public key for encrypting
				var cryptEnc = new JSEncrypt();
				cryptEnc.setPublicKey(sharedVars.publicKey);

				// Generate the unencrypted payload
				var storageString = JSON.stringify(storageOutput);

				// Encrypt the payload with the password that was entered
				var encrypted = CryptoJS.AES.encrypt(storageString, pwd1).toString();
				var encryptedPwd = cryptEnc.encrypt(pwd1);

				var output = {
					payload: encrypted,
					key: encryptedPwd
				}

				// Generate the final output
				var outputFinal = JSON.stringify(output);

				// Disable all inputs
				$('textarea').prop('disabled', true);
				$('select').prop('disabled', true);
				$('input').prop('disabled', true);

				// Hide this button
				$(this).hide();

				// Add the output
				$('<textarea>', {
					id: 'theirResult',
					class: 'form-control',
					text: outputFinal,
					rows: 10
				}).appendTo(
					$('<div>', {
						class: 'form-group'
					}).append(
						$('<label>', {
							for: 'theirResult',
							text: 'Your entry:'
						})
					).appendTo(ourCon)
				);

				$('<a>', {
					class: 'btn btn-primary',
					text: 'Download',
					href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(outputFinal),
					download: 'payload.json'
				}).appendTo(ourCon);
			}
		}).appendTo(ourCon);
	}

	// Shows the match page
	function showMatchPage() {
		// Cleanup any old pages
		mainCon.empty();

		// Add header
		$('<div>', {
			class: 'textMainHeader',
			text: 'Secret Santa - Sign Up'
		}).appendTo(mainCon);

		var ourCon = $('<div>', {
			class: 'signupCon'
		}).appendTo(mainCon);

		var topPart = $('<div>').appendTo(ourCon);

		var theirPayload = $('<textarea>', {
			id: 'theirResult',
			class: 'form-control',
			rows: 10,
		}).appendTo(
			$('<div>', {
				class: 'form-group'
			}).append(
				$('<label>', {
					for: 'theirResult',
					text: 'Your payload:'
				})
			).appendTo(topPart)
		);

		var passwordCon = $('<input>', {
			class: 'form-control',
			type: 'password',
			id: 'password1',
			maxlength: 64
		}).appendTo(
			$('<div>', {
				class: 'form-group'
			}).append(
				$('<label>', {
					for: 'password1',
					text: 'Your Original Password:'
				})
			).appendTo(topPart)
		);

		var loadInfoButton = $('<button>', {
			class: 'btn btn-primary',
			text: 'Receive Match',
			click: function() {
				var thePayload = theirPayload.val();
				var thePassword = passwordCon.val();

				var failMessage = 'Failed to decrpyt the payload! Are you sure you entered the correct password?';

				// Perform the decrpytion
				var decryptedData;
				try {
					var bytes  = CryptoJS.AES.decrypt(thePayload, thePassword);
					decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
				} catch(e) {
					alert(failMessage);
					return;
				}

				if(!decryptedData.answers) {
					alert(failMessage);
					return;
				}

				// Hide stuff
				topPart.hide();

				// Add their matchID
				$('<h3>', {
					text: 'Your giftee\'s ID:'
				}).appendTo(ourCon);

				$('<p>', {
					text: decryptedData.match
				}).appendTo(ourCon);

				$('<p>', {
					text: 'Note: Your present should be be addressed to the ID above, and not to a specific person.'
				}).appendTo(ourCon);

				var answers = decryptedData.answers;
				for(var key in answers) {
					var answer = answers[key];

					$('<h3>', {
						text: key
					}).appendTo(ourCon);

					$('<p>', {
						text: answer
					}).appendTo(ourCon);
				}
			}
		}).appendTo(topPart);
	}

	// Show the main entry page:
	showEntryPage();	

	

	//$('body').append(privateKey);
});