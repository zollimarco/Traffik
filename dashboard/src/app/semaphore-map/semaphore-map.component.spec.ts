import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SemaphoreMapComponent } from './semaphore-map.component';

describe('SemaphoreMapComponent', () => {
  let component: SemaphoreMapComponent;
  let fixture: ComponentFixture<SemaphoreMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SemaphoreMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SemaphoreMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
