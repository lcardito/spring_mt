import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {App} from './app/containers/App';

@Component({
  selector: 'root',
  template: '<router-outlet></router-outlet>',
  directives: [ROUTER_DIRECTIVES]
})
export class Root {
}

export const routes = [
  {
    path: '',
    component: App
  }
];
