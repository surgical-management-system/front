import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteHospitalListComponent } from './paciente-hospital-list';

describe('PacienteHospitalList', () => {
  let component: PacienteHospitalListComponent;
  let fixture: ComponentFixture<PacienteHospitalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteHospitalListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteHospitalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
