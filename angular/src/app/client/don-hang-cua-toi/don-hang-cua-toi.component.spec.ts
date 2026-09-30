import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { DonHangCuaToiComponent } from './don-hang-cua-toi.component';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';

describe('DonHangCuaToiComponent', () => {
  let component: DonHangCuaToiComponent;
  let fixture: ComponentFixture<DonHangCuaToiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonHangCuaToiComponent],
      providers: [provideRouter([]), DuLieuService, XacThucService]
    }).compileComponents();

    fixture = TestBed.createComponent(DonHangCuaToiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo DonHangCuaToiComponent thành công', () => {
    expect(component).toBeTruthy();
  });
});
