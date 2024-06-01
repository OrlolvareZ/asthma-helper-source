import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCard } from '@angular/material/card';
import { MatGridList, MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-main',
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
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

    accessToken = "6cb0a953824a29cbe8d06deebb8b18e362149c9a";
    deviceID = "2f002e001847393035313137";
    particleUrlBase = `https://api.particle.io/v1/devices/${this.deviceID}`;
    particleUrls = {
        // Syncs shots left in the inhaler and mails to send to
        sync: `${this.particleUrlBase}/sync`,
    }

    /**
     * Request example:
     * 
     * this.http.post(
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
     */

}
