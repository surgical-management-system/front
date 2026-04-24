import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KeycloakService } from '../core/services/keycloak.service';
import { Agenda } from '../shared/agenda/agenda';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { IEstadisticasGenerales } from '../core/models/estadisticas-generales';
import { DashboardService } from '../core/services/dashboard.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Agenda, MatTabsModule, MatIconModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  title = 'DACS Frontend - Pantalla Principal';
  isLoggedIn = false;
  hasRoleA = false;
  hasRoleB = false;
  selectedTab = 0;
  estadisticas: IEstadisticasGenerales | undefined;
  isLoading = true;

  constructor(public keycloakService: KeycloakService, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    document.body.classList.add('home-page');
    this.checkLoginStatus();
    this.subscribeToUserProfile();
    this.loadEstadisticasGenerales();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('home-page');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkLoginStatus(): void {
    this.isLoggedIn = this.keycloakService.isLoggedIn();
    this.updateRoleStatus();
  }

  private subscribeToUserProfile(): void {
    this.keycloakService.userProfile$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isLoggedIn = this.keycloakService.isLoggedIn();
      this.updateRoleStatus();
    });
  }

  private updateRoleStatus(): void {
    this.hasRoleA = this.keycloakService.hasRole('ROLE-A');
    this.hasRoleB = this.keycloakService.hasRole('ROLE-B');
  }

  login(): void {
    this.keycloakService.login();
  }

  canAccessTableGrid(): boolean {
    return this.isLoggedIn && this.hasRoleA;
  }

  canAccessDashboard(): boolean {
    return this.isLoggedIn && this.hasRoleB;
  }

  getAccessMessage(role: string): string {
    if (!this.isLoggedIn) {
      return 'Inicia sesión para acceder';
    }
    return `Se requiere ${role} para acceder`;
  }

  loadEstadisticasGenerales(): void {
    this.dashboardService.getEstadisticasGenerales().subscribe({
      next: (resp) => {
        if (resp && resp.data) {
          this.estadisticas = resp.data;
        } else {
          this.estadisticas = undefined;
        }
      },
      error: (error) => {
        console.error('Error al obtener estadísticas generales:', error);
        this.estadisticas = undefined;
      },
    });
  }
}
