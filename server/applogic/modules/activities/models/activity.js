"use strict";

// let ROOT 			= "../../../../";
let config = require("../../../../config");
let logger = require("../../../../core/logger");

let _ = require("lodash");

let db = require("../../../../core/mongo");
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let hashids = require("../../../../libs/hashids")("posts");
let autoIncrement = require("mongoose-auto-increment");

let schemaOptions = {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};

let ActivitySchema = new Schema({
    users: [{
        type: Number,
        required: "Please fill a User ID",
        ref: "User"
    }],
    desc: {
        type: String
    },
    lastUpdate: {
        type: Date
    },
    status: {
        type: Number,
        default: 1
    },
    metadata: {}

}, schemaOptions);

/**
 * Virtual `code` field instead of _id
 */
ActivitySchema.virtual("code").get(function() {
    return this.encodeID();
});

/**
 * Encode `_id` to `code`
 */
ActivitySchema.methods.encodeID = function() {
    return hashids.encodeHex(this._id);
};

/**
 * Decode `code` to `_id`
 */
ActivitySchema.methods.decodeID = function(code) {
    return hashids.decodeHex(code);
};

/**
 * Auto increment for `_id`
 */
ActivitySchema.plugin(autoIncrement.plugin, {
    model: "Activity",
    startAt: 1
});

let Activity = mongoose.model("Activity", ActivitySchema);

module.exports = Activity;