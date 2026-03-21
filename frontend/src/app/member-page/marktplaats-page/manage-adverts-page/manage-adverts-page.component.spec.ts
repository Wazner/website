import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAdvertsPageComponent } from './manage-adverts-page.component';

describe('ManageAdvertsPageComponent', () => {
  let component: ManageAdvertsPageComponent;
  let fixture: ComponentFixture<ManageAdvertsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageAdvertsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAdvertsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
