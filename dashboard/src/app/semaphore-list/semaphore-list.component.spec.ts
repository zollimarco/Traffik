import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SemaphoreListComponent } from './semaphore-list.component';

describe('SemaphoreListComponent', () => {
  let component: SemaphoreListComponent;
  let fixture: ComponentFixture<SemaphoreListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SemaphoreListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SemaphoreListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
