import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { KhungChinhComponent } from './khung-chinh.component';

describe('KhungChinhComponent', () => {
  let component: KhungChinhComponent;
  let fixture: ComponentFixture<KhungChinhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KhungChinhComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(KhungChinhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo KhungChinhComponent thành công', () => {
    expect(component).toBeTruthy();
  });

  it('nên thay đổi trạng thái sidebarThuGon khi gọi onToggleSidebar', () => {
    expect(component.sidebarThuGon).toBe(false);
    component.onToggleSidebar();
    expect(component.sidebarThuGon).toBe(true);
    component.onToggleSidebar();
    expect(component.sidebarThuGon).toBe(false);
  });
});
