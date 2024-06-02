import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCard } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../environment';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [
        // Material
        MatButtonModule,
        MatSnackBarModule,
        MatCard,
        MatIconModule,
        MatProgressSpinnerModule,
        MatToolbarModule,
        MatMenuModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatDividerModule,
        MatProgressBar,
        // Angular
        HttpClientModule,
        FormsModule,
        // Firebase
        AngularFireModule,
        AngularFirestoreModule,
    ],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent {

    // Collections
    contacts: string[] | null = null;

    // App state
    isSyncing = true;

    isLoadingContacts = true;
    contactsChanged = false;

    dialogRef: MatDialogRef<any> | null = null;

    // UI
    dialogSize = {
        width: '80%',
        height: 'auto',
    };

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar,
        private db: AngularFirestore,
        private dialog: MatDialog,
    ) { }

    openEmailDialog(emailView: any) {

        this.dialogRef = this.dialog.open(DialogComponent, {
            data: emailView,
            ...this.dialogSize,
        });

        this.dialogRef.afterClosed().subscribe(result => {
            this.dialogRef = null;
        });

    }

    requestParticle(endpoint: string, params: string = '') {
        return this.http.post(
            `${environment.particle.particleUrlBase}${endpoint}?access_token=${environment.particle.accessToken}`,
            params,
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );
    }

}
