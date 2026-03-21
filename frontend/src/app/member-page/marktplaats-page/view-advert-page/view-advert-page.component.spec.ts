import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdvertPageComponent } from './view-advert-page.component';

describe('ViewAdvertPageComponent', () => {
  let component: ViewAdvertPageComponent;
  let fixture: ComponentFixture<ViewAdvertPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAdvertPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAdvertPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
