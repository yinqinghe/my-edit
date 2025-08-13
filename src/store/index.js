import { createStore } from 'vuex';

export default createStore({
    state: {
        sharedData: {}
    },
    mutations: {
        updateData(state, payload) {
            state.sharedData = payload;
        }
    },
    actions: {
        updateData({ commit }, payload) {
            console.log('===payload', payload);
            commit('updateData', payload);
        }
    }
});
