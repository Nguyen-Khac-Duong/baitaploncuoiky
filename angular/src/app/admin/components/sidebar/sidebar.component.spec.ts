import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo SidebarComponent thành công', () => {
    expect(component).toBeTruthy();
  });

  it('nên có đủ menu quản trị', () => {
    expect(component.menuItems.length).toBe(3);
  });

  it('nên có class collapsed khi set input thuGon', async () => {
    fixture.componentRef.setInput('thuGon', true);
    fixture.detectChanges();
    await fixture.whenStable();
    const sidebarEl = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebarEl.classList.contains('collapsed')).toBe(true);
  });
});
