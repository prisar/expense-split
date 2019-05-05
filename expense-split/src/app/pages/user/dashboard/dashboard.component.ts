import { Component, OnInit } from '@angular/core';
// import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public overall: any[] = [];
  constructor(
    // private chartSvc: ChartService
    ) { }

  ngOnInit() {
    // this.chartSvc.getOverall().subscribe(res => {
    //   this.overall = res;
    // });
  }
}
