
var POP3Client = require("poplib");
var MailParser = require("mailparser").MailParser,
    mailparser = new MailParser();

var h2p = require('html2plaintext');
var google_speech = require('google-speech');


mailparser.on("end", function (mail_object) {
    console.log("From:", mail_object.from); //[{address:'sender@example.com',name:'Sender Name'}] 
    console.log("Subject:", mail_object.subject); // Hello world! 
    console.log("Text body:", mail_object.text); // How are you today? 
    console.log("Html body:", mail_object.html); // How are you today? 
    
    var text = h2p(mail_object.html);
    console.log("text", text);
    google_speech.TTS({
        text: text,
        file: 'data/hello.mp3'
      }, function () {
        console.log('done');
      }
  );

});



var config = {
  host: 'pop.yandex.ru',
  port:  '995',
  login: 'cb45679383759@yandex.ru',
  password: ''
};

var client = new POP3Client(config.port, config.host, {
 
    tlserrs: true,
    enabletls: true,
    debug: false

});



client.on("error", function(err) {
 
        if (err.errno === 111) console.log("Unable to connect to server");
        else console.log("Server error occurred");
 
        console.log(err);
 
});
 
client.on("connect", function() {
 
        console.log("CONNECT success");
        client.login(config.login, config.password);
 
});
 
client.on("invalid-state", function(cmd) {
        console.log("Invalid state. You tried calling " + cmd);
});
 
client.on("locked", function(cmd) {
        console.log("Current command has not finished yet. You tried calling " + cmd);
});


client.on("login", function(status, rawdata) {
 
    if (status) {
 
        console.log("LOGIN/PASS success");
        client.list();
 
    } else {
 
        console.log("LOGIN/PASS failed");
        client.quit();
 
    }
});
 
// Data is a 1-based index of messages, if there are any messages 
client.on("list", function(status, msgcount, msgnumber, data, rawdata) {
 
    if (status === false) {
 
        console.log("LIST failed");
        client.quit();
 
    } else {
 
        console.log("LIST success with " + msgcount + " element(s)");
 
        if (msgcount > 0)
            client.retr(1);
        else
            client.quit();
 
    }
});
 
client.on("retr", function(status, msgnumber, data, rawdata) {
 
    if (status === true) {
 
        console.log("RETR success for msgnumber " + msgnumber);
        //
        
        console.log(data);
        mailparser.write(data);
        mailparser.end();
        client.dele(msgnumber);

    } else {
 
        console.log("RETR failed for msgnumber " + msgnumber);
        
    }
});
 
client.on("dele", function(status, msgnumber, data, rawdata) {
 
    if (status === true) {
 
        console.log("DELE success for msgnumber " + msgnumber);
        client.quit();
 
    } else {
 
        console.log("DELE failed for msgnumber " + msgnumber);
        client.quit();
 
    }
});
 
client.on("quit", function(status, rawdata) {
 
    if (status === true) console.log("QUIT success");
    else console.log("QUIT failed");
 
});