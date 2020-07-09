import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SemaphoreDetailsComponent } from './semaphore-details.component';

describe('SemaphoreDetailsComponent', () => {
  let component: SemaphoreDetailsComponent;
  let fixture: ComponentFixture<SemaphoreDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SemaphoreDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SemaphoreDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
