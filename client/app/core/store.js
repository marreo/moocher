import Vue from "vue";
import Vuex from "vuex";

import session from "../modules/session/store";
import profile from "../modules/profile/store";
import activities from "../modules/activities/store";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        session,
        profile,
        activities
    }
});