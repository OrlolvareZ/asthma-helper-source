import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, lastValueFrom, of, skip } from 'rxjs';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
    deps: [HttpClient]
})
export class MailService {

    http: HttpClient;
    apiKey: string | null = null;

    constructor(
        private db: AngularFirestore,
    ) {
        this.http = inject(HttpClient);
    }

    async sendMail(
        subject: string,
        ...messages: string[]
    ): Promise<string | null> {

        const contacts = await this.getContacts([]) as any;
        const recipients = contacts.docs[0].data().contacts;

        if (!recipients || recipients.length === 0) {
            return "No hay contactos guardados.";
        }

        const mailBody = this.buildMailBody(...messages);

        const mail = {
            sender: {
                ...environment.brevo.sender,

            },
            to: [
                ...recipients.map((contact: string) => {
                    return {
                        email: contact,
                        name: contact.split('@')[0]
                    };
                })
            ],
            subject: subject,
            htmlContent: mailBody
        };

        const apiKey = await this.getApiKey();

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': apiKey!,
        }

        try {
            await lastValueFrom(
                this.http.post(
                    'https://api.brevo.com/v3/smtp/email',
                    mail,
                    { headers }
                )
            );
            return null;
        }
        catch (error) {
            return "El servicio de correos no está disponible o no hay conexión a internet.";
        }

    }

    private async getContacts(contacts: string[]) {
        return await lastValueFrom(this.db.collection('contacts').get());
    }

    private buildMailBody(...messages: string[]) {

        return `
        <html>
            <head>
                <meta charset="utf-8">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&amp;display=swap" rel="stylesheet">
                <style>
                    
                    body {
                        font-family: 'Manrope', sans-serif;
                        background-color: #202020;
                        color: #ffffff;
                    }
        
                    h1 {
                        color: #69F0AE;
                    }
        
                    h1, p {
                        margin-left: 1rem;
                        margin-bottom: 1rem;
                    }
        
                    p.low {
                        opacity: 0.6;
                    }
        
                    p.msg {
                        margin-left: 1.5rem;
                        font-size: 1.2rem;
                    }
        
                    div.divider {
                        background-color: #FFF176;
                        opacity: 0.6;
                        height: 2px;
                        width: 100%;
                    }
        
                </style>
            </head>
            <body>
                <h1><b>INHAlert<b> Service</h1>
                <div class="divider"></div>
                <p class="low">Recibiste un mensaje de alerta:</p>
                <p class="msg">${messages.join('<br><br>')}</p>
                <p class="low">Por favor, verifica la situación y toma las medidas necesarias.</p>
            </body>
        </html>
        `

    }

    private async getApiKey() {

        if (this.apiKey) return this.apiKey;

        const key = await firstValueFrom(
            this.db.collection('keys').get()
        );

        this.apiKey = (key.docs[0].data() as any).value;
        return this.apiKey;

    }

}
