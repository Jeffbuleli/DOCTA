# Docta

**Docta** — SaaS SIH (Système d'Information Hospitalier) open source, pensé pour la clinique moderne.
Un dossier patient, des rendez-vous, une facturation et une pharmacie unifiés dans une plateforme multi-établissements, sécurisée et conforme.

> Statut : 🌱 Phase de cadrage / MVP

---

## 1. Vision

Offrir aux cliniques et hôpitaux de taille petite à moyenne un système d'information complet, abordable et conforme, là où les solutions existantes sont soit hors de prix, soit fermées et vieillissantes.

**Principes directeurs**
- **Open source** : transparent, auditable, sans dépendance à un éditeur unique.
- **Multi-tenant** : un déploiement, plusieurs établissements isolés.
- **Mobile-first & offline-friendly** : utilisable en zone à connectivité instable.
- **Conformité by design** : RGPD / protection des données de santé dès la conception.
- **Interopérable** : standards FHIR / HL7, pas de données prisonnières.

## 2. Personas

| Persona | Besoin clé |
|---|---|
| Médecin / praticien | Dossier patient rapide, prescriptions, antécédents |
| Infirmier·ère | Constantes, soins, planning |
| Réceptionniste | Rendez-vous, admission, file d'attente |
| Caissier / facturation | Devis, factures, assurances, paiements |
| Pharmacien | Stock, dispensation, alertes péremption |
| Laborantin | Demandes d'analyses, résultats |
| Administrateur clinique | Utilisateurs, rôles, rapports, paramètres |
| Patient | Prise de RDV en ligne, résultats, historique |

## 3. Périmètre fonctionnel (modules)

### MVP (V1)
- **Auth & RBAC** — comptes, rôles, permissions, multi-établissement.
- **Dossier Patient (EMR)** — identité, antécédents, allergies, documents.
- **Rendez-vous & Agenda** — planning praticiens, file d'attente, rappels.
- **Consultation** — motif, examen, diagnostic (CIM-10), prescriptions.
- **Facturation** — actes, devis, factures, paiements, caisse.
- **Tableau de bord admin** — KPI de base, gestion utilisateurs.

### V2
- **Pharmacie & Stock** — inventaire, dispensation, alertes.
- **Laboratoire** — demandes, résultats, intégration analyseurs.
- **Hospitalisation** — lits, admissions, sorties, notes de soins.
- **Assurances / tiers payant** — conventions, prises en charge.
- **Portail patient** — RDV en ligne, résultats, téléconsultation.

### V3+
- Imagerie (DICOM/PACS léger), Bloc opératoire, BI avancée, App mobile native, IA (aide au codage, triage).

## 4. Architecture technique (proposition)

```
┌─────────────┐   ┌─────────────┐   ┌──────────────┐
│  Web (SPA)  │   │ Portail pat.│   │  App mobile  │
└──────┬──────┘   └──────┬──────┘   └──────┬───────┘
       └─────────────────┼─────────────────┘
                    API Gateway (REST/JSON + FHIR)
                         │
        ┌────────────────┼────────────────┐
     Auth/RBAC      Services métier     Jobs/Events
        │           (EMR, RDV, Billing…)    │
        └────────────────┼─────────────────┘
                   PostgreSQL (multi-tenant)
                   + Redis (cache/queue) + S3 (fichiers)
```

**Stack envisagée** (à confirmer)
- **Frontend** : React + TypeScript, Vite, TanStack Query, Tailwind.
- **Backend** : NestJS (Node/TS) **ou** Django (Python) — API REST + FHIR.
- **Base de données** : PostgreSQL (isolation par `tenant_id` + RLS).
- **Infra** : Docker, déploiement self-hostable, CI/CD GitHub Actions.
- **Stockage fichiers** : S3 compatible (MinIO en self-host).

## 5. Sécurité & conformité

- Chiffrement en transit (TLS) et au repos.
- Journalisation / piste d'audit de tout accès au dossier patient.
- RBAC granulaire + consentement patient.
- Sauvegardes chiffrées, plan de reprise.
- Anonymisation/pseudonymisation pour l'analytique.

## 6. Roadmap

| Phase | Objectif | Durée indicative |
|---|---|---|
| 0 — Cadrage | Specs, maquettes, modèle de données | 2–3 sem. |
| 1 — Socle | Auth, RBAC, multi-tenant, CI/CD | 3–4 sem. |
| 2 — MVP | EMR + RDV + Consultation + Facturation | 8–10 sem. |
| 3 — Pilote | Déploiement clinique pilote, retours | 4 sem. |
| 4 — V2 | Pharmacie, Labo, Portail patient | en continu |

## 7. Démarrage (à venir)

```bash
git clone https://github.com/Jeffbuleli/DOCTA.git
cd DOCTA
# instructions d'installation à compléter
```

## 8. Licence

À définir (AGPL-3.0 recommandée pour un SaaS open source de santé).

---
_Docta — le SIH open source pour la clinique moderne._
