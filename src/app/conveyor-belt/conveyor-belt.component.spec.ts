import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConveyorBeltComponent } from './conveyor-belt.component';

describe('ConveyorBeltComponent', () => {
  let component: ConveyorBeltComponent;
  let fixture: ComponentFixture<ConveyorBeltComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConveyorBeltComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConveyorBeltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
