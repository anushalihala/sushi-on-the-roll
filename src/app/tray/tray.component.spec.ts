import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrayComponent } from './tray.component';

describe('TrayComponent', () => {
  let component: TrayComponent;
  let fixture: ComponentFixture<TrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
