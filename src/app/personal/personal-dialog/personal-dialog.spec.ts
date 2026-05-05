import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDialogComponent } from './personal-dialog';

describe('PersonalDialogComponent', () => {
  let component: PersonalDialogComponent;
  let fixture: ComponentFixture<PersonalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
