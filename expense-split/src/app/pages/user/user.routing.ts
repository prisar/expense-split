import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
// import { EconomicCalculatorComponent } from './economic-calculator/economic-calculator.component';
// import { ReportsComponent } from './reports/reports.component';

export const UserRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  // {
  //   path: 'calculator',
  //   component: EconomicCalculatorComponent
  // },
  // {
  //   path: 'reports',
  //   component: ReportsComponent
  // }
];
