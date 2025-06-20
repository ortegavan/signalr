import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageDisplay } from './message-display';

describe('MessageDisplay', () => {
  let component: MessageDisplay;
  let fixture: ComponentFixture<MessageDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
