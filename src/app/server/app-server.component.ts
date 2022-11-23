import { Component } from "@angular/core";
@Component({
    selector: 'app-server',
    templateUrl: './app-server.component.html',
})
export class AppServerComponent {
    serverId = 10;
    serverStatus = 'offline';
    allowNewServer = false;
    serverCreationStatus = 'No server was created'
    serverName = '';
    serverCreated = false;

    constructor() {
        setTimeout(() => {
            this.allowNewServer = true;
        }, 2000);
    }

    ngOnInit() {

    }

    onCreateServer() {
        this.serverCreated = true;
        this.serverCreationStatus = 'Server was created' + this.serverName;
    }

    getServerStatus() {
        return this.serverStatus;
    }
}