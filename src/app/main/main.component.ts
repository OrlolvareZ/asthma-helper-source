import { Component, OnInit } from '@angular/core';
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
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../environment';
import { DialogComponent } from '../dialog/dialog.component';
import { firstValueFrom, lastValueFrom } from 'rxjs';

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
        ReactiveFormsModule,
        // Firebase
        AngularFireModule,
        AngularFirestoreModule,
    ],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {

    // Data
    smokeValue: number | null = null;
    dustValue: number | null = null;

    // App state
    isSyncing = true;

    isLoadingContacts = true;
    wasAbleToFetchContacts = false;
    isUpdatingContacts = false;

    dialogRef: MatDialogRef<DialogComponent, any> | null = null;

    fg: FormGroup;
    contactsFormArray: FormArray<any>;

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
        private fb: FormBuilder,
    ) {

        this.contactsFormArray = new FormArray([] as any[]);
    
        this.fg = this.fb.group({
            contacts: this.contactsFormArray,
        });

    }

    ngOnInit(): void {
        
        /* this.requestParticle('allData').subscribe({
            next: (data: any) => {
                console.log(data);
            },
            error: (error: any) => {
                this.snack.open('Error fetching data from Particle', 'Dismiss');
            }
        }); */

    }

    openEmailDialog(emailView: any) {

        this.getContacts();

        this.contactsFormArray.markAsPristine();

        this.dialogRef = this.dialog.open(DialogComponent, {
            data: emailView,
            ...this.dialogSize,
            disableClose: true,
        });

    }

    async getContacts() {

        this.isLoadingContacts = true;

        this.contactsFormArray.clear();

        const _dbContacts = await this.getContactsFromDb();
        const dbContacts = _dbContacts.empty ? [] : (_dbContacts.docs[0] as any).data().contacts;
        console.log(dbContacts);

        this.requestParticle('getContacts').subscribe({
            next: (data: any) => {

                console.log(data);
                const contacts = JSON.parse(data.result);

                dbContacts.forEach((contact: string) => {
                    this.addContact(contact);
                    
                    if (
                    dbContacts
                    && dbContacts.some((lc: any) => !contacts.includes(lc))
                ) {

                    this.saveContactsToDb();
                    this.snack.open(
                        `La lista de tu INHLR no está al día.
                        Por favor sincronízala ahora`,
                        'Ok'
                    );
                    this.contactsFormArray.markAsDirty();

                }
            });
                
                this.isLoadingContacts = false;
                this.wasAbleToFetchContacts = true;

            },
            error: (error: any) => {
                this.contactsFormArray.clear();
                this.isLoadingContacts = false;
                this.wasAbleToFetchContacts = false;
            }
        });

    }

    addContact(contact: string | null = null) {
        this.contactsFormArray.push(
            this.fb.control(contact, [Validators.required, Validators.email])
        );
    }

    removeContact(index: number) {
        this.contactsFormArray.removeAt(index);
        this.contactsFormArray.markAsDirty();
    }

    async saveContacts() {

        this.isUpdatingContacts = true;

        const contacts = this.fg.value.contacts;

        try {
            await this.saveContactsToDb();
        }
        catch (error) {
            this.isUpdatingContacts = false;
            return;
        };

        this.requestParticle(
            'setContacts', JSON.stringify(contacts)
        ).subscribe({

            next: () => {
                this.snack.open('Se actualizó tu lista de contactos ✅', 'Ok');
                this.isUpdatingContacts = false;
                this.dialogRef?.close();
                this.dialogRef = null;
            },

            error: () => {
                this.snack.open(
                    `Hubo un error al actualizar tu INHLR 😢
                    Por favor verifica que tu dispositivo y tu INHLR tengan conexión a internet e inténtalo de nuevo.`,
                    'Ok'
                );
                this.isUpdatingContacts = false;
            },

        })

    }

    private async saveContactsToDb() {

        const contacts = this.fg.value.contacts;

        try {
            await this.db.collection('contacts').doc('contacts').set({ contacts });
        }
        catch (error) {
            this.snack.open(
                `Hubo un error al guardar la lista de contactos 😢
                Por favor verifica que tu conexión a internet e inténtalo de nuevo.`,
                'Ok'
            );
        };

    }

    private async getContactsFromDb() {

        return await lastValueFrom(this.db.collection('contacts').get());

    }

    requestParticle(endpoint: string, params: string = '') {

        const request = params === '' ?
        this.http.get(
            `${environment.particle.particleUrlBase}/${endpoint}?access_token=${environment.particle.accessToken}`,
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        )
        : this.http.post(
            `${environment.particle.particleUrlBase}/${endpoint}?access_token=${environment.particle.accessToken}`,
            `$params=${params}`,
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        return request;

    }

}
