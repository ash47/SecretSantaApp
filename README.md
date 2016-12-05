# SecretSantaApp
A single-page application for running a Secret Santa event.

###How do I use this?###
- Copy the `config_example.json` file and call it `config.json`
 - Fill in the newly created `config.json` file
    - Enter a list of questions to ask each user
    - Enter a list of rules
 - Run the `step1.bat` file
    - This will generate multiple files in the output directory:
       - website.htm
          - This is a one page application you should host somewhere
 - Users will click the link and then fill in their details, and create a password, this will generate a response:
    - Save the response as "payload.json", makes a new folder in the "output" folder called `output/responses`
    - Put all of the responses you receive into the `responses` folder of the app, creating a new directory for each response, ensure the directories are identifyable (e.g. make them the email address of the person you got the response from), the filename should be `payload.json`
 - Wait for the registration period to end
 - Run the `step2.bat` file
    - This will generate `matches.json`:
       - This file contains all the matches, you need to send these payloads out to people, the payload is encrypted with their original password
 - Users should return their gifts to you, and attach a label with the unique ID that has been given to them.
 - Once all gifts have been returned, you can proceed to step3
 - Run the `step3.bat` file
    - It will tell you which gift should be allocated to which person
    - Give the gift to the correct person
    - Open presents
