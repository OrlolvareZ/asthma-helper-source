import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCard } from '@angular/material/card';
import { MatGridList, MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';   
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-on-off',
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatSnackBarModule,
    MatCard,
    MatGridListModule,
    MatGridList,
    MatGridTile,
    MatIcon,
    HttpClientModule,
  ],
  providers: [HttpClient, MatSnackBar,],
  templateUrl: './on-off.component.html',
  styleUrl: './on-off.component.scss'
})
export class OnOffComponent {

    accessToken = "6cb0a953824a29cbe8d06deebb8b18e362149c9a";
    deviceID = "2f002e001847393035313137";
    url = `https://api.particle.io/v1/devices/${this.deviceID}/led`;

    isOn = false;
    icon = "lightbulb_outline";

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar,
    ) {}
    
    on() {
        this.isOn = true;

        this.http.post(
            `${this.url}?access_token=${this.accessToken}`,
            'params=on',
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        ).subscribe({
            next: (response) => this.snack.open('Bulb is on!', 'Ok'),
            error: (error) => this.snack.open('Failed to turn on LED!', 'Ok'),
        });
    }

    off() {
        this.isOn = false;

        this.http.post(
            `${this.url}?access_token=${this.accessToken}`,
            'params=off',
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        ).subscribe({
            next: (response) => this.snack.open('Bulb is off!', 'Ok'),
            error: (error) => this.snack.open('Failed to turn off LED!', 'Ok'),
        });
    }

}
