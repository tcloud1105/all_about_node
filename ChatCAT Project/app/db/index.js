'use strict';
const config = require('../config');
const logger = require('../logger');
const Moongoose = require('./development.json').connect(config.dbURI);

// Log an error if the connection fails
Moongoose.connection.on('error', error=>{
    logger.log('error','MongoDB Error: '+error);
});

// Create a Schema that defines the structure for storing user data
const chatUser = new  Moongoose.Schema({
    profileId: String,
    fullName: String,
    profilePic: String
})

// Turn the schema into the model
let userModel = Moongoose.model('chatUser',chatUser);

module.exports = {
    Moongoose,
    userModel
}
