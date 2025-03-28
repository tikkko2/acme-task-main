import { Component, Output, EventEmitter } from '@angular/core';
import { sidebarItems } from '../../data/sidebar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  imports: [CommonModule, RouterModule, MatIconModule],
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  animations: [
    trigger('sidebarState', [
      state('expanded', style({
        width: '250px',
        opacity: 1
      })),
      state('collapsed', style({
        width: '70px',
        opacity: 1
      })),
      transition('expanded <=> collapsed', [
        animate('300ms ease-in-out')
      ])
    ]),
    trigger('textState', [
      state('expanded', style({
        opacity: 1,
        display: 'block',
        transform: 'translateX(0)',
      })),
      state('collapsed', style({
        opacity: 0,
        display: 'none',
        transform: 'translateX(-110px)',
      })),
      transition('expanded <=> collapsed', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class SidenavComponent {
  @Output() sidebarStateChange = new EventEmitter<boolean>();
  
  sidebarItems = sidebarItems;
  isExpanded = true;
  isMobile = false;

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isExpanded = false;
    }
    this.sidebarStateChange.emit(this.isExpanded);
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
    this.sidebarStateChange.emit(this.isExpanded);
  }
}
