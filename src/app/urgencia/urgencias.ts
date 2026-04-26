import { Component } from '@angular/core';
import { PageHeader } from '../shared/page-header/page-header';
import { UrgenciasListComponent } from "./urgencias-list/urgencias-list";

@Component({
  selector: 'app-urgencias',
  imports: [PageHeader, UrgenciasListComponent],
  templateUrl: './urgencias.html',
  styleUrl: './urgencias.css',
})
export class UrgenciasComponent {}
