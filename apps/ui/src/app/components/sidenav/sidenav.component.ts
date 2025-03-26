import { Component } from '@angular/core';
import { sidebarItems } from '../../data/sidebar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [CommonModule, RouterModule, MatIconModule],
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  sidebarItems = sidebarItems;
}
