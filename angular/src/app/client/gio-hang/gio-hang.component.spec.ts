import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { GioHangComponent } from './gio-hang.component';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';

describe('GioHangComponent', () => {
  let component: GioHangComponent;
  let fixture: ComponentFixture<GioHangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GioHangComponent],
      providers: [provideRouter([]), DuLieuService, XacThucService]
    }).compileComponents();

    fixture = TestBed.createComponent(GioHangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo GioHangComponent thành công', () => {
    expect(component).toBeTruthy();
  });
});
