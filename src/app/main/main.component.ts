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
import { MatBadgeModule } from '@angular/material/badge';
import { MatSliderModule } from '@angular/material/slider';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../environment';
import { DialogComponent } from '../dialog/dialog.component';
import { BehaviorSubject, Subject, debounceTime, first, lastValueFrom, skip, tap, timeout } from 'rxjs';
import { MailService } from '../services/mail.service';

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
        MatBadgeModule,
        MatSliderModule,
        // Angular
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
    inhalerShots: number | null = null;
    smokeValue: number | null = null;
    dustValue: number | null = null;

    // App state
    isSyncing = true;

    isLoadingContacts = false;
    isUpdatingContacts = false;
    isUpdatingShots = false;

    wasAbleToFetchContacts = false;

    alertsAreApplicable = false;

    private updateShotsSubject = new BehaviorSubject<
    {
        oldShots: number,
        newShots: number,
    }
    >({
        oldShots: -1,
        newShots: -1,
    });

    dialogRef: MatDialogRef<DialogComponent, any> | null = null;
    
    fg: FormGroup;
    contactsFormArray: FormArray<any>;
    
    updateInterval: number;
    intervalId: any = null;
    
    // UI
    dialogSize = {
        width: '80%',
        height: 'auto',
    };
    messages = {
        noInternetConnection: 'No tienes conexión a internet 😢\nIntentando conectar de vuelta',
        noInternetConnButRetry: 'No tienes conexión a internet 😢\nIntentando conectar de vuelta',
        noInhlrConnection: '¡Se perdió la conexión con tu INHLR! Por favor revisa que ambos dispositivos estén conectados a internet.',
        unableSyncInhlr: 'Hubo un error al actualizar tu INHLR 😢',
        unableSyncContactsDb: 'Hubo un error al guardar tus contactos 😢',
    };

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar,
        private db: AngularFirestore,
        private dialog: MatDialog,
        private fb: FormBuilder,
        private mail: MailService,
    ) {

        this.updateInterval = parseInt(localStorage.getItem('updateInterval') ?? '5000');

        this.contactsFormArray = new FormArray([] as any[]);
    
        this.fg = this.fb.group({
            contacts: this.contactsFormArray,
        });

        this.updateShotsSubject
        .pipe(
            skip(2), // Skip initial value and the one after getting from the DB
            tap(({ oldShots, newShots }) => this.inhalerShots = newShots),
            debounceTime(1500)
        )
        .subscribe(
            async values => {

                this.isUpdatingShots = true;

                const { oldShots, newShots } = values;

                try {
                    await this.updateShotsInDB(newShots);
                }
                catch (error) {
                    this.snack.open(this.messages.noInternetConnection, 'Ok');
                    this.isUpdatingShots = false;
                    return;
                };

                try {

                    await this.updateShotsInParticle(newShots);
                    this.snack.open('Se actualizó el contador ✅', 'Ok', { duration: 2000 });

                    this.isUpdatingShots = false;

                }
                catch (error) {
                    this.snack.open(
                        `${this.messages.unableSyncInhlr}\n${this.messages.noInhlrConnection}`,
                        'Ok'
                    );
                    this.isUpdatingShots = false;
                    return;
                };
            }
        );

    }

    async ngOnInit() {
        
        this.getDashboardData();
        this.intervalId = setInterval(() => {
            this.getDashboardData();
        }, this.updateInterval);

        this.getShotsFromDb();

    }
    
    getDashboardData() {

        this.requestParticle('allData').subscribe({
            next: (data: any) => {
                const parsedData = JSON.parse(data.result);
                this.smokeValue = parsedData.smokeValue;
                this.dustValue = parsedData.pm05;
                this.isSyncing = false;
            },
            error: (error: any) => {
                this.snack.open(this.messages.noInhlrConnection, 'Ok');
            }
        });

    };

    openEmailDialog(emailView: any) {

        this.getContacts();

        this.contactsFormArray.markAsPristine();

        this.dialogRef = this.dialog.open(DialogComponent, {
            data: emailView,
            ...this.dialogSize,
            disableClose: true,
        });

    }

    private async getContacts() {

        this.isLoadingContacts = true;

        this.contactsFormArray.clear();

        const _dbContacts = await this.getContactsFromDb();
        const dbContacts = _dbContacts.empty ? [] : (_dbContacts.docs[0] as any).data().contacts;

        this.requestParticle('getContacts').subscribe({
            next: (data: any) => {

                const contacts = JSON.parse(data.result);

                dbContacts.forEach((contact: string) => {
                    this.addContact(contact);
                    
                    if (
                        dbContacts
                        && (dbContacts.length !== contacts.length
                            || dbContacts.some((lc: any) => !contacts.includes(lc))
                    )
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
                    `${this.messages.unableSyncInhlr}\n${this.messages.noInhlrConnection}`,
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
                `${this.messages.unableSyncContactsDb}\n${this.messages.noInhlrConnection}`,
                'Ok'
            );
        };

    }

    private async getContactsFromDb() {

        return await lastValueFrom(this.db.collection('contacts').get());

    }

    getShotsFromDb() {

        this.db.collection('shots').doc('count').valueChanges()
            .pipe(first())
            .subscribe({
                next: async (data: any) => {

                    this.inhalerShots = data.value;
                    this.updateShotsSubject.next(
                        {
                            oldShots: data.value,
                            newShots: data.value,
                        }
                    );
                    // Always try to keep the particle updated on the shots
                    await this.updateShotsInParticle(data.value);

                },
                error: (error: any) => {
                    this.snack.open(this.messages.noInternetConnButRetry, 'Ok');
                }
            });

    }

    updateShots(numShots: number) {

        const { oldShots, newShots } = this.updateShotsSubject.value;
        this.updateShotsSubject.next(
            {
                oldShots: newShots,
                newShots: newShots + numShots > 0 ? newShots + numShots : 0,
            }
        );
    }

    private async updateShotsInParticle(numShots: number) {
        await lastValueFrom(this.requestParticle('setShots', numShots.toString()));
    }

    async onlyUpdateShotsInParticle() {

        this.isUpdatingShots = true;
        try {
            await this.updateShotsInParticle(this.inhalerShots!);
        }
        catch (error) {
            this.snack.open(
                `${this.messages.unableSyncInhlr}\n${this.messages.noInhlrConnection}`,
                'Ok'
            );
        }
        finally {
            this.isUpdatingShots = false
        }

    }
    
    private async updateShotsInDB(numShots: number) {
        await this.db.collection('shots').doc('count').set({ value: numShots });
    }

    

    requestParticle(endpoint: string, params: string = '') {

        const url = `${environment.particle.particleUrlBase}/${endpoint}?access_token=${environment.particle.accessToken}`;
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

        const request = params === '' ?
        this.http.get(
            url, { headers }

        )
        : this.http.post(
            url, `$params=${params}`, { headers }
        );

        return request.pipe(timeout(this.updateInterval - 500));

    }

    openSettingsDialog(settingsView: any) {
        this.dialog.open(DialogComponent, {
            data: settingsView,
            ...this.dialogSize
        });
    }

    saveInterval(value: string) {

        localStorage.setItem('updateInterval', value);

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            this.getDashboardData();
        }, parseInt(value));

    }

}
