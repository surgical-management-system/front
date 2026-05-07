import { Component } from '@angular/core';
import { PageHeader } from "../shared/page-header/page-header";
import { PersonalList } from "./personal-list/personal-list";

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [PageHeader, PersonalList],
  templateUrl: './personal.html',
  styleUrl: './personal.css'
})
export class PersonalComponent {

}
