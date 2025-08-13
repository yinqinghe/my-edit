import { createWebHashHistory, createRouter } from 'vue-router';

import Home from '../views/Home.vue';
import MainPage from '../views/SinglePage.vue';
import MoreFileEdit from '../views/MoreFileEdit.vue';
import customers from '../views/Customers.vue';
import showresult from '../views/ShowResult.vue';
// import test from '../views/Test.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/mike',
        name: 'MainPage',
        component: MainPage
    },
    {
        path: '/edit',
        name: 'MoreFileEdit',
        component: MoreFileEdit
    },
    {
        path: '/customers',
        name: 'customers',
        component: customers
    },
    {
        path: '/showresult',
        name: 'showresult',
        component: showresult
    }
];

const router = createRouter({
    scrollBehavior: () => ({ y: 0 }),
    history: createWebHashHistory(),
    routes
});

export function resetRouter() {
    const newRouter = createRouter();
    router.matcher = newRouter.matcher; // reset router
}
export default router;
