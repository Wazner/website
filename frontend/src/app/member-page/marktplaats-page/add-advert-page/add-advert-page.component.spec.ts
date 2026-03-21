import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdvertPageComponent } from './add-advert-page.component';

describe('AddAdvertPageComponent', () => {
  let component: AddAdvertPageComponent;
  let fixture: ComponentFixture<AddAdvertPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAdvertPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAdvertPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
