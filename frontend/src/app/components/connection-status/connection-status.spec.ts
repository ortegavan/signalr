import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionStatus } from './connection-status';

describe('ConnectionStatus', () => {
  let component: ConnectionStatus;
  let fixture: ComponentFixture<ConnectionStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
