import { Component } from '@angular/core';
import { PageHeader } from '../shared/page-header/page-header';
import { UsuariosList } from './usuarios-list/usuarios-list';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [PageHeader, UsuariosList],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class Usuarios {

}
