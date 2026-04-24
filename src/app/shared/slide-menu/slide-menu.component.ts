import { Component, OnDestroy, OnInit } from '@angular/core';
import { KeycloakService } from '../../core/services/keycloak.service';
import { KeycloakProfile } from 'keycloak-js';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-slide-menu',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule, RouterModule],
  templateUrl: './slide-menu.html',
  styleUrls: ['./slide-menu.css'],
})
export class SlideMenuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  
  isLoggedIn = false;
  showUserMenu = false;
  showCirugias = false;
  userProfile: KeycloakProfile | null = null;

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.subscribeToUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkLoginStatus(): void {
      this.isLoggedIn = this.keycloakService.isLoggedIn();
      if (this.isLoggedIn) {
        this.userProfile = this.keycloakService.getUserProfile();
      }
    }
  
    private subscribeToUserProfile(): void {
      this.keycloakService.userProfile$
        .pipe(takeUntil(this.destroy$))
        .subscribe(profile => {
          this.userProfile = profile;
          this.isLoggedIn = this.keycloakService.isLoggedIn();
        });
    }

  login(): void {
    this.keycloakService.login();
  }

  logout(): void {
    this.keycloakService.logout();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  getFullName(): string {
    return this.keycloakService.getFullName();
  }

  getEmail(): string {
    return this.keycloakService.getEmail();
  }

  getAvatarLetter(): string {
    const fullName = this.getFullName().trim();
    return fullName ? fullName.charAt(0).toUpperCase() : 'U';
  }

  getUsername(): string {
    return this.keycloakService.getUsername();
  }

  getUserRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }

  hasRole(role: string): boolean {
    return this.keycloakService.hasRole(role);
  }

  goToAccount(): void {
    window.open(this.keycloakService.getAccountUrl(), '_blank');
  }
}
