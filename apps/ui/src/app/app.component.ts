import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { CommonModule } from '@angular/common';

@Component({
  imports: [RouterModule, SidenavComponent, CommonModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isSidebarExpanded = true;

  onSidebarStateChange(expanded: boolean) {
    this.isSidebarExpanded = expanded;
  }
}
