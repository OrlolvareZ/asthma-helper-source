const deviceID = "2f002e001847393035313137";

export const environment = {
    particle: {
        accessToken: "6cb0a953824a29cbe8d06deebb8b18e362149c9a",
        particleUrlBase: `https://api.particle.io/v1/devices/${deviceID}`,
    },
    firebase: {
        apiKey: "AIzaSyBgcS0HXus6-SSZGG4NnTTwYAy8N0TaAXw",
        authDomain: "asthma-warriors-db.firebaseapp.com",
        projectId: "asthma-warriors-db",
        storageBucket: "asthma-warriors-db.appspot.com",
        messagingSenderId: "240703391266",
        appId: "1:240703391266:web:932d0a535f1394a9b0ec7b",
        measurementId: "G-8KWDY6E32R"
    },
    brevo: {
        sender: {
            name: "INHAlert Service",
            email: "orlolvarez@gmail.com"
        },
    }
}