import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import UploadView from './views/UploadView.vue';
import ReportView from './views/ReportView.vue';
import HistoryView from './views/HistoryView.vue';
import PricingView from './views/PricingView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/upload', name: 'upload', component: UploadView },
    { path: '/report/:id', name: 'report', component: ReportView },
    { path: '/history', name: 'history', component: HistoryView },
    { path: '/pricing', name: 'pricing', component: PricingView },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
