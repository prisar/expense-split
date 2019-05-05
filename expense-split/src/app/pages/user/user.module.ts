import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { UserRoutes } from './user.routing';

import { DashboardComponent } from './dashboard/dashboard.component';
// import { EconomicCalculatorComponent } from './economic-calculator/economic-calculator.component';
// import { ReportsComponent } from './reports/reports.component';
import { RouterModule } from '@angular/router';
// import { ComponentsModule } from 'src/app/components/components.module';

// Components
const components = [
  DashboardComponent,
  // EconomicCalculatorComponent,
  // ReportsComponent
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // ComponentsModule,
    NgbModule,
    RouterModule.forChild(UserRoutes),
  ],
  declarations: [...components],
  exports: [...components]
})
export class UserModule { }
