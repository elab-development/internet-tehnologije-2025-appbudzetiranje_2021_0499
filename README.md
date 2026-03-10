# Savely

**SAVELY** je moderna SPA (Single Page Application) za planiranje troškova, vođenje ličnih finansija i kolaboraciju kroz štedne grupe. Frontend je razvijen u **React** + **MUI**, a backend u **Laravelu** (API + Sanctum autentikacija). U sklopu aplikacije postoje napredne analitike (Recharts), administrativni modul, kao i “grupe” sa chat-om i pretragom članova.

---

# Tehnologije

Projekat koristi sledeće tehnologije:

- React
- Laravel
- MySQL
- Docker
- Docker Compose
- Nginx
- PHP-FPM

---

# Struktura projekta
project-root
│
├── app_backend
│ └── Laravel backend aplikacija
│
├── app_frontend
│ └── React frontend aplikacija
│
├── docker-compose.yml
│
└── README.md


---
## Korisničke uloge i prava

### 1) Neulogovani korisnik
- Može da pristupi **/ (login)** i **/register**.
- Nema uvid u podatke niti API pozive pod auth middleware-om.
- Posle uspešne prijave session se čuva u `sessionStorage` (`token`, `user`).

### 2) Regularan korisnik
- Pristupa **Home**, **Track Expenses**, **Savings Reports**, **My Savings Groups**.
- **Troškovi:** pun CRUD i sortiranja/filtriranja.
- **Izveštaji:** pravljenje mesečnih izveštaja, analitika i pregled stavki.
- **Grupe:** kreiranje (postaje *owner*), učlanjenje/napuštanje; *owner* može edit/ delete; chat dostupnan samo članovima.
- **Vidljivost dugmadi u grupama:** „Members/Chat“ su skriveni dok korisnik ne postane član.
- Nema pristup admin modulima.

### 3) Administrator
- Posle logovanja preusmerava se na **/admin-dashboard**.
- Vidi linkove: **Admin Dashboard** i **Users Management**.
- **Admin Dashboard:** globalne statistike (Top 8 meseci po sumi, trend 12 meseci, KPI čipovi); widget za najnovije vesti; dugme za slanje izveštaja na e-mail.
- **Users Management:** lista *regular* korisnika, pretraga, brisanje, CSV eksport.
- Nema manipulaciju tuđim ličnim podacima mimo navedenog.

---

## Stranice i UI moduli

- **Auth.jsx** – Login/Registracija, upload avatara, role-based redirect (admin → `/admin-dashboard`, ostali → `/home`).
- **Home.jsx** – dobrodošlica i kratki set CTA/feature kartica.
- **TrackExpenses.jsx** – grid kartica troškova, filteri (kategorija, sort).
- **SavingsReports.jsx** – kartice mesečnih izveštaja, „View analytics“ i „View expenses“ modali.
- **MySavingsGroups.jsx** – mreža kartica grupa (fiksna širina, 6 po stranici), badge privatnosti, Join/Leave na vrhu, članovi + chat modal; pretraga korisnika sa avatarom i status tačkom.
- **AdminDashboard.jsx** – KPI, dva grafa (Bar/Area), slider News widget, „Email report“ modal.
- **UserManagement.jsx** – tabela sa avatarom, imenom, statusom, datumom registracije, akcije (Delete), dugme „Export CSV“.
- **NavigationMenu.jsx** – role-aware linkovi (administrator vidi samo Admin Dashboard i Users Management).
- **Footer.jsx** – lagani, fiksni footer.



# Pokretanje aplikacije

Aplikacija se pokreće pomoću **Docker Compose**.

## 1. Kloniranje repozitorijuma
git clone <repo-url>
cd <repo-folder>


## 2. Pokretanje aplikacije
docker compose up -d --build


## 3. Provera servisa
docker compose ps


---

# Pristup aplikaciji

Frontend aplikacija:
http://localhost:3000


Backend API:
http://localhost:8000


---

# Docker servisi

Docker Compose pokreće tri servisa:

### frontend
React aplikacija koja predstavlja korisnički interfejs.

### backend
Laravel REST API koji obrađuje zahteve i upravlja autentikacijom korisnika.

### db
MySQL baza podataka koja čuva sve podatke aplikacije.

---

# Autentikacija

Aplikacija koristi **Bearer token autentikaciju**.

Primer login zahteva:
curl -X POST http://localhost:8000/api/login

-H "Content-Type: application/json"
-d '{"email":"test@example.com
","password":"password"}'


Uspešan odgovor vraća token koji se koristi za pristup zaštićenim rutama.

Primer zahteva sa tokenom:
curl http://localhost:8000/api/expenses
-H "Authorization: Bearer <TOKEN>"


---

# API dokumentacija

API dokumentacija je generisana pomoću **Swagger (OpenAPI)** alata i dostupna je na:
http://localhost:8000/api/documentation


---


# Git workflow

Projekat koristi sledeću strukturu grana:
main – stabilna verzija projekta
develop – integraciona grana
feature/* – razvoj pojedinačnih funkcionalnosti


Feature grane u projektu:
feature/core-auth
feature/api
feature/frontend
feature/docker


---

# Bezbednost

Aplikacija implementira osnovne bezbednosne mehanizme:

- CORS zaštitu
- SQL Injection zaštitu putem ORM-a
- validaciju korisničkog unosa

---


