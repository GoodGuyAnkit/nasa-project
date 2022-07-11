const mongoose = require('mongoose');

const launchSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    },
    launchDate: {
        type: Date,
        required: true
    },
    mission: {
        type: String,
        required: true
    },
    rocket: {
        type: String,
        reqruired: true
    },
    target: {
        type: String
    },
    success: {
        type: Boolean,
        default: true
    },
    upcoming: {
        type: Boolean,
        default: true
    },
    customers: [ String ]
});

module.exports = mongoose.model('Launch', launchSchema);