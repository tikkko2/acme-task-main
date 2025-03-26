import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidenavComponent } from './components/sidenav/sidenav.component';

@Component({
  imports: [RouterModule, SidenavComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {}
