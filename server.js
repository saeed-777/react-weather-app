
/*
* Author: Saeed Alam
* Date Created: 05/05/2018
* Description: A simple node/express server to get the Weather-React-App up and running.
*/

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const opn = require('opn');

//Set up the port number. 
//The Port number can be changed on command line by entering 'PORT=xxxx node server' where 'PORT' is an argument
//The default port number is '3000'
var port = process.env.PORT || 3000

//set up parsing for the entire request body using bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//send the Weather App
app.use(express.static(__dirname + '/app/build/'));

//Make app listen to a specific port
var server = app.listen(port, ()=>{

	//get host and port 
	var host = server.address().address
	var port = server.address().port

	//configure hostname if "::" to "localhost"
	host = (host == "::" ? "localhost" : host );

	//open browser
	opn('http://'+host+':'+port+'');

	console.log("Server started: host = '%s' port = '%s' ", host, port);
});



