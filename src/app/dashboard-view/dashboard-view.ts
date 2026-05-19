import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ITestResponse } from '../core/models/test-response';
import { DashboardFacade } from './state/dashboard.facade';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-view.html',
  styleUrls: ['./dashboard-view.css']
})
export class DashboardViewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardFacade = inject(DashboardFacade);

  pingResult: string | null = null;
  testResult: ITestResponse | null = null;
  isLoading = true;

  constructor() { }

  ngOnInit(): void {
    // Subscribe to store selectors with automatic cleanup
    this.dashboardFacade.ping$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ping) => {
        this.pingResult = ping;
      });

    this.dashboardFacade.testData$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((testData) => {
        this.testResult = testData;
      });

    this.dashboardFacade.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    // Load dashboard data on init
    this.dashboardFacade.loadDashboard();
  }

  refreshData(): void {
    this.dashboardFacade.refreshDashboard();
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('es-ES');
  }
}
