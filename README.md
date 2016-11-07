# SecretSantaApp
A single-page application for running a Secret Santa event.

###How do I use this?###
- Copy the `config_example.json` file and call it `config.json`
 - Fill in the newly created `config.json` file
    - Enter a list of questions to ask each user
 - Run the `step1.bat` file
    - This will generate multiple files:
       - website.htm
          - This is a one page application you should host somewhere
       - server_keys.json
          - This contains the private key used to keep this event private
 - Users will click the link and then fill in their details, this will generate two files:
    - response.txt
       - This should be returned to the person who is running the event
    - private.txt
       - This is a private file which is used later to read information about the person you are buying for
 - Put all of the responses you receive into the `responses` folder of the app, creating a new directory for each response, ensure the directories are identifyable (e.g. make them the email address of the person you got the response from)
 - Wait for the registration period to end
 - Run the `step2.bat` file
    - This will generate multiple files:
       - links.txt
          - This is one large file that contains the payload for every user.
          - This file can be sent to everyone, since the payloads are encrypted
          - Users can use their private.txt file decrypt their personal payload
 - Users should return their gifts to you, and attach a label with the unique ID that has been given to them.
 - Once all gifts have been returned, mark off which unique IDs have gifts assigned to them
 - Run the `step3.bat` file
    - This will firstly check to see if everyone has actually brought a gift for someone else
    - If someone didn't buy a gift for someone else, the present meant for someone who didn't buy a gift will be remapped to another user
    - It will tell you the location where each gift needs to be sent to
 - Gather everyone in a room together (or shared video chat)
 - Run the `step4.bat` file, it will ask for a uniqueID
 - Enter the unique ID for a given gift, it will spit out a name
 - Give the gift to the correct person
 - Open presents
