import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarktplaatsPageComponent } from './marktplaats-page.component';

describe('MarktplaatsPageComponent', () => {
  let component: MarktplaatsPageComponent;
  let fixture: ComponentFixture<MarktplaatsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarktplaatsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarktplaatsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
