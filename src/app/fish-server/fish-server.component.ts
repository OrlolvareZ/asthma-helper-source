import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCard } from '@angular/material/card';
import { MatGridList, MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-fish-server',
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatFabButton,
    MatSnackBarModule,
    MatCard,
    MatGridListModule,
    MatGridList,
    MatGridTile,
    MatIcon,
    MatProgressSpinner, 
    HttpClientModule,
  ],
  providers: [HttpClient, MatSnackBar,],
  templateUrl: './fish-server.component.html',
  styleUrl: './fish-server.component.scss'
})
export class FishServerComponent {

    accessToken = "6cb0a953824a29cbe8d06deebb8b18e362149c9a";
    deviceID = "2f002e001847393035313137";
    url = `https://api.particle.io/v1/devices/${this.deviceID}/serve`;

    isFeeding = false;

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar,
    ) {}
    
    feed() {

        this.isFeeding = true;

        this.http.post(
            `${this.url}?access_token=${this.accessToken}`,
            'params=placeholder',
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        ).subscribe({
            next: (response) => {

                console.log(response);

                this.snack.open('¡Tu pececito está feliz! 🐠', 'Ok');
                this.isFeeding = false;
            },
            error: (error) => {
                this.snack.open('¡No se pudo alimentar a tu pez! 😢', 'Ok');
                this.isFeeding = false;
            }
        });
    }

}
