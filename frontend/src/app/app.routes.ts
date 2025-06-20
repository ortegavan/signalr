import { Routes } from '@angular/router';
import { ConnectionStatus } from './components/connection-status/connection-status';

export const routes: Routes = [
    {
        path: 'connstatus',
        component: ConnectionStatus,
    },
];
