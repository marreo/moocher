"use strict";

import Vue from "vue";
import VueRouter from "vue-router";

import Home from "../modules/home";
import Profile from "../modules/profile";
import Activity from "../modules/activities";

Vue.use(VueRouter);

export default new VueRouter({
    mode: "hash",
    routes: [
        { path: "/", component: Activity },
        { path: "/profile", component: Profile }
        // { path: "/users", component: User, meta: { needRole: "admin" } },
        //{ path: "*", component: NotFound }
    ]
});