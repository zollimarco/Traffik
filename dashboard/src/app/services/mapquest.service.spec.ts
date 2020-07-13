import { TestBed } from '@angular/core/testing';

import { MapquestService } from './mapquest.service';

describe('MapquestServiceService', () => {
  let service: MapquestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapquestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
