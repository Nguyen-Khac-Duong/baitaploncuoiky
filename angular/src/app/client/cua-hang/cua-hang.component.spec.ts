import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { CuaHangComponent } from './cua-hang.component';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';

describe('CuaHangComponent', () => {
  let component: CuaHangComponent;
  let fixture: ComponentFixture<CuaHangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuaHangComponent],
      providers: [provideRouter([]), DuLieuService]
    }).compileComponents();

    fixture = TestBed.createComponent(CuaHangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo CuaHangComponent thành công', () => {
    expect(component).toBeTruthy();
  });

  it('nên có đủ danh sách danh mục', () => {
    expect(component.danhMucList.length).toBeGreaterThan(3);
  });
});
