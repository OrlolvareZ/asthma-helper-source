import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FishServerComponent } from './fish-server.component';

describe('OnOffComponent', () => {
  let component: FishServerComponent;
  let fixture: ComponentFixture<FishServerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FishServerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FishServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
