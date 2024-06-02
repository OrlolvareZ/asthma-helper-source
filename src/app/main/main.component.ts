import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCard } from '@angular/material/card';
import { MatGridList, MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
    AngularFireModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
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

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar,
        private db: AngularFirestore,
    ) {}

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
                
            },
            error: (error) => {
                this.snack.open('¡No se pudo alimentar a tu pez! 😢', 'Ok');
                this.isFeeding = false;
            }
        });
     */

}
