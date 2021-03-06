"use strict";

let logger = require("../../../core/logger");
let config = require("../../../config");
let C = require("../../../core/constants");

let _ = require("lodash");

let Activity = require("./models/activity");

module.exports = {
    settings: {
        name: "activities",
        version: 1,
        namespace: "activities",
        rest: true,
        ws: true,
        graphql: true,
        permission: C.PERM_LOGGEDIN,
        role: "user",
        collection: Activity,

        modelPropFilter: "code desc users lastUpdate status turn",

        modelPopulates: {
            "users": "persons",
            "turn": "persons"
        }
    },

    actions: {
        find: {
            cache: false,
            handler(ctx) {
                let filter = { users: ctx.user.id };

                let query = Activity.find(filter);

                return ctx.queryPageSort(query).exec().then((docs) => {
                        return this.toJSON(docs);
                    })
                    .then((json) => {
                        return this.populateModels(json);
                    });
            }
        },

        // return a model by ID
        get: {
            cache: false, // if true, we don't increment the views!
            permission: C.PERM_PUBLIC,
            handler(ctx) {
                ctx.assertModelIsExist(ctx.t("app:ActivityNotFound"));

                return Activity.findByIdAndUpdate(ctx.modelID, { $inc: { views: 1 } }).exec().then((doc) => {
                        return this.toJSON(doc);
                    })
                    .then((json) => {
                        return this.populateModels(json);
                    });
            }
        },

        create: {
            handler(ctx) {
                this.validateParams(ctx, true);
                logger.log('info', 'This is ctx: ' + JSON.stringify(ctx.params));
                let activity = new Activity({});

                activity.users.push(ctx.user.id);
                activity.users.push(ctx.params.userId);
                activity.lastUpdate = Date.now();
                activity.desc = ctx.params.desc;
                activity.turn = ctx.user.id;

                return activity.save()
                    .then((doc) => {
                        return this.toJSON(doc);
                    })
                    .then((json) => {
                        return this.populateModels(json);
                    })
                    .then((json) => {
                        this.notifyModelChanges(ctx, "created", json);
                        return json;
                    });
            }
        },

        update: {
            handler(ctx) {
                logger.info('H0');
                ctx.assertModelIsExist(ctx.t("app:ActivityNotFound"));
                this.validateParams(ctx);
                logger.info('H1: ' + ctx.modelID);

                return this.collection.findById(ctx.modelID).exec()
                    .then((doc) => {
                        logger.info('H2');
                        doc.lastUpdate = Date.now();
                        logger.info('H3');
                        var nextId = doc.users.filter(function(id) {
                            return id != doc.turn;
                        });
                        logger.info('H4: ' + nextId);
                        doc.turn = parseInt(nextId);
                        logger.info('H5: ' + JSON.stringify(doc));
                        return doc.save();
                    })
                    .then((doc) => {
                        return this.toJSON(doc);
                    })
                    .then((json) => {
                        return this.populateModels(json);
                    })
                    .then((json) => {
                        this.notifyModelChanges(ctx, "updated", json);
                        return json;
                    });
            }
        },

        remove: {
            permission: C.PERM_OWNER,
            handler(ctx) {
                ctx.assertModelIsExist(ctx.t("app:ActivityNotFound"));

                return Activity.remove({ _id: ctx.modelID })
                    .then(() => {
                        return ctx.model;
                    })
                    .then((json) => {
                        this.notifyModelChanges(ctx, "removed", json);
                        return json;
                    });
            }
        }

    },

    methods: {
        /**
         * Validate params of context.
         * We will call it in `create` and `update` actions
         * 
         * @param {Context} ctx 			context of request
         * @param {boolean} strictMode 		strictMode. If true, need to exists the required parameters
         */
        validateParams(ctx, strictMode) {
            if (ctx.hasValidationErrors())
                throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);
        }

    },

    /**
     * Check the owner of model
     * 
     * @param {any} ctx	Context of request
     * @returns	{Promise}
     */
    ownerChecker(ctx) {
        return new Promise((resolve, reject) => {
            ctx.assertModelIsExist(ctx.t("app:ActivityNotFound"));
        });
    },

    init(ctx) {
        // Fired when start the service
        this.personService = ctx.services("persons");

        // Add custom error types
        C.append([], "ERR");
    },

    socket: {
        afterConnection(socket, io) {
            // Fired when a new client connected via websocket
        }
    },

    graphql: {

        query: `
			activities(limit: Int, offset: Int, sort: String): [Activity]
			activity(code: String): Activity
		`,

        types: `
			type Activity {
				users: [Person]
				desc: String
				status: Int
				lastUpdate: Timestamp
			}
		`,

        mutation: `
			activityCreate(desc: String!): Activity
			activityUpdate(code: String!, desc: String!): Activity
			activityRemove(code: String!): Activity
		`,

        resolvers: {
            Query: {
                activities: "find",
                activity: "get"
            },

            Mutation: {
                activityCreate: "create",
                activityUpdate: "update",
                activityRemove: "remove",
            }
        }
    }

};