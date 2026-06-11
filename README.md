# Docta

**Docta** — SIH (Système d'Information Hospitalier) open source pour **l'hôpital africain moderne**.
Conçu d'abord pour les réalités de la **RD Congo** : multi-services, multi-devises (CDF/USD), mobile money, fonctionnement hors-ligne, et une interface **visuelle et iconographique** compréhensible même par un personnel peu à l'aise avec la technologie.

> Statut : 🌱 Cadrage — ce document est la référence produit.

---

## 1. Vision

La plupart des hôpitaux en RDC tournent sur du papier, des cahiers et des fichiers Excel dispersés. Les SIH importés sont chers, fermés, pensés pour l'Occident (mono-devise, connexion permanente, beaucoup de texte). **Docta** vise l'inverse :

- **Un hôpital complet**, pas un dispensaire : urgences, hospitalisation, blocs, maternité, labo, imagerie, pharmacie, logistique, RH.
- **Adapté à la RDC** : franc congolais **et** dollar, mobile money, coupures de courant/internet, langues locales.
- **Pour les novices** : on **clique sur des images**, pas sur du jargon. Moins de texte, plus d'**illustrations SVG**, gros boutons, codes couleur par service.
- **Open source & souverain** : les données restent à l'hôpital, auditable, sans rançon d'éditeur.
- **Interopérable** : standards FHIR/HL7 et export **DHIS2 / SNIS** pour le Ministère de la Santé.

## 2. Réalités RD Congo prises en compte (le cœur du projet)

| Réalité terrain | Réponse de Docta |
|---|---|
| **Deux monnaies** (CDF + USD) au quotidien | Comptabilité bi-monétaire, **taux du jour** configurable, paiement mixte, rendu de monnaie inter-devises |
| **Mobile money** dominant | M-Pesa (Vodacom), Orange Money, Airtel Money, Africell — encaissement intégré |
| **Coupures courant/internet** | **Offline-first** (PWA) : fonctionne sans réseau, synchronise au retour, mode dégradé, onduleur/solaire |
| **Faible bande passante / vieux matériel** | App légère, images vectorielles, fonctionne sur petits PC et tablettes Android d'entrée de gamme |
| **Bons papier** ancrés dans les habitudes | Génération + **impression thermique** des bons (caisse, examen, réquisition, sortie, transfert) |
| **Langues** | Français + **Lingala, Swahili, Kikongo, Tshiluba** (interface traduisible) |
| **Personnel peu technophile** | Navigation par **icônes/illustrations**, mode formation, gros boutons tactiles |
| **Reporting sanitaire obligatoire** | Export automatique vers **DHIS2/SNIS** (paludisme, TB, VIH, PEV, CPN…) |
| **Identité patient** peu fiable | Dossier unique + bracelet **code-barres/QR**, option biométrie |
| **Bracelets, imprimantes, lecteurs** | Support imprimantes thermiques, lecteurs code-barres, balances/tensiomètres connectables |

## 3. Personas

Médecin · Spécialiste · Chirurgien · Anesthésiste · Sage-femme · Infirmier·ère · Aide-soignant · Réceptionniste/Admission · Caissier · Pharmacien · Laborantin · Technicien d'imagerie · Brancardier/Logistique · Magasinier · Responsable biomédical (maintenance) · Gestionnaire RH · Médecin-chef / Directeur · Partenaire (mutuelle, ONG, employeur) · **Patient**.

## 4. Périmètre fonctionnel — un hôpital complet

### A. Parcours patient (clinique)
- **Accueil & Admission** — enregistrement, identification, orientation, **triage urgences**, file d'attente visuelle.
- **Urgences** — tri (échelle de gravité), prise en charge rapide, déchocage.
- **Consultations externes (polyclinique)** — toutes spécialités, agenda par praticien.
- **Dossier Patient unique (EMR)** — antécédents, allergies, constantes, notes, documents, historique inter-services.
- **Hospitalisation** — services & **salles/lits** (médecine, chirurgie, pédiatrie, **maternité**, gynéco…), admissions, transferts, sorties, **plan de soins**, tour des médecins.
- **Bloc opératoire** — **programme opératoire**, checklist sécurité (OMS), équipe, anesthésie, **matériel & instrumentation**, comptes d'instruments, compte-rendu.
- **Maternité & salle d'accouchement** — CPN/CPON, partogramme, accouchement, nouveau-né.
- **Réanimation / soins intensifs** — surveillance rapprochée.
- **Plateaux techniques** : **Laboratoire** (biologie), **Imagerie** (radio, écho, scanner), **Banque de sang/transfusion**, **Stérilisation (CSSD)**, **Kinésithérapie**.
- **Programmes de traitement / protocoles** — VIH, Tuberculose, Paludisme, **PEV (vaccination)**, Nutrition, CPN — avec suivi de cohorte et reporting.

### B. Gestion des « bons » (workflow central RDC)
Bon de caisse · Bon d'examen (labo/imagerie) · Bon de réquisition (pharmacie/magasin) · Bon d'hospitalisation · Bon de transfert · Bon de sortie · Bon de prise en charge (mutuelle/employeur). Chaque bon : numéroté, traçable, **imprimable**, validable par scan.

### C. Finances & Caisse
- **Facturation** des actes, séjours, médicaments, examens.
- **Multi-devises CDF/USD** avec taux du jour, paiement **mixte**.
- **Méthodes de paiement** : espèces (double caisse CDF/USD), **mobile money** (M-Pesa, Orange, Airtel, Africell), carte/TPE, virement, **tiers payant** (mutuelle/assurance/ONG), bon employeur, crédit/échelonné.
- Caisse, clôture de caisse, reçus imprimés, remises, créances.

### D. Partenaires & tiers
- **Mutuelles / assurances / conventions** (tiers payant, plafonds, taux de couverture).
- **Employeurs** (prise en charge salariés), **ONG/bailleurs** (programmes financés).
- **Fournisseurs** (médicaments, consommables, équipements), **labos/imagerie de référence** externes.
- **Ministère de la Santé** (reporting SNIS/DHIS2).

### E. Logistique & approvisionnement
- **Pharmacie & stock** multi-magasin (central, services, officine), dispensation, **alertes péremption & rupture**, **chaîne du froid** (vaccins).
- **Achats** : demandes, commandes fournisseurs, réceptions, valorisation du stock.
- **Inventaires**, mouvements inter-magasins, traçabilité par lot.

### F. Équipements & matériel médical (biomédical)
- Inventaire des équipements (bloc, imagerie, labo…), **maintenance préventive/curative**, pannes, contrats, durée de vie, affectation par salle.

### G. Ressources humaines & permanences
- Annuaire du personnel, rôles & habilitations.
- **Planning des gardes/permanences** (médecins, infirmiers), rotations, astreintes.
- **Pointage/présence**, congés ; base pour la paie.

### H. Pilotage & santé publique
- **Tableaux de bord** par service (occupation des lits, recettes, file d'attente, activité bloc).
- **Indicateurs SNIS** et **export DHIS2** automatisé.
- Registres réglementaires : naissances, **décès / morgue**, déclarations épidémiologiques.

### I. Patient connecté
- **Portail / app patient** : RDV, résultats, ordonnances, historique.
- **Rappels SMS/USSD** (RDV, vaccination, traitement) — fonctionne sans smartphone.
- **Téléconsultation** (zones reculées).

## 5. Conception UI/UX — « on comprend sans savoir lire un écran »

- **Iconographie SVG sur-mesure** (style ligne claire, cohérent) — **jamais d'emoji**.
- Écran d'accueil = **tuiles illustrées** par service (Urgences, Maternité, Pharmacie, Caisse…).
- **Codes couleur** stables par domaine ; gros boutons ; cibles tactiles larges.
- **Moins de texte** : libellés courts + pictogramme ; info détaillée à la demande.
- **Multilingue** (FR + langues nationales), **mode formation** pour les nouveaux.
- Parcours « 3 clics » pour les actions fréquentes (encaisser, imprimer un bon, admettre).
- Impression native des bons/reçus (thermique) ; bracelets QR.

## 6. Architecture technique

```
   Web (PWA offline)     Portail/App patient      Tablette de service
          │                      │                        │
          └──────────────┬───────┴────────────────────────┘
                  API Gateway  (REST/JSON + FHIR)
                         │
   ┌──────────┬──────────┼───────────┬───────────┬───────────┐
 Auth/RBAC   EMR        Bloc        Pharmacie    Finance     RH/Permanences
 (multi-     RDV     Hospitalisation  /Stock    /Caisse      Logistique
  tenant)   Labo/Imagerie            (lots)   (CDF/USD,MM)   Biomédical
   └──────────┴──────────┬───────────┴───────────┴───────────┘
            PostgreSQL (multi-tenant + RLS)  ·  Redis (queue/cache)
            MinIO/S3 (documents, imagerie)   ·  Sync offline (edge)
                         │
            Intégrations : Mobile Money · SMS/USSD · DHIS2/SNIS · Imprimantes
```

**Stack envisagée**
- **Frontend** : React + TypeScript, PWA (offline + sync), Tailwind, librairie d'**icônes SVG maison**.
- **Backend** : NestJS (Node/TS), API REST + **FHIR**, files d'attente (BullMQ).
- **Base** : PostgreSQL (multi-tenant par `tenant_id` + **RLS**), partitionnement.
- **Stockage** : MinIO/S3 (documents, imagerie légère).
- **Edge/offline** : cache local + moteur de synchronisation, résolution de conflits.
- **Infra** : Docker, self-hostable (serveur local de l'hôpital), CI/CD GitHub Actions, sauvegardes chiffrées.

## 7. Sécurité & conformité

Chiffrement en transit & au repos · **piste d'audit** de tout accès au dossier · RBAC fin + consentement · pseudonymisation pour l'analytique · sauvegardes chiffrées & PRA · hébergement local possible (souveraineté des données).

## 8. Modèle de données (entités clés)

`Tenant/Établissement` · `Utilisateur` · `Rôle/Permission` · `Patient` · `Dossier/Épisode` · `Admission` · `Service` · `Salle` · `Lit` · `RendezVous` · `Consultation` · `Diagnostic (CIM-10)` · `Prescription` · `ActeMédical` · `InterventionBloc` · `Bon` · `Facture` · `Paiement` · `Caisse` · `Devise/Taux` · `Mutuelle/Convention` · `Partenaire/Fournisseur` · `Produit/Lot/Stock` · `Magasin` · `Mouvement` · `Équipement/Maintenance` · `Programme/ProtocoleSoins` · `Permanence/Garde` · `RésultatLabo` · `Imagerie` · `IndicateurSNIS`.

## 9. Roadmap

| Phase | Contenu | Indicatif |
|---|---|---|
| **0 — Cadrage** | Specs détaillées, maquettes SVG, modèle de données, design system | 3–4 sem. |
| **1 — Socle** | Multi-tenant, Auth/RBAC, **bi-devise**, offline/sync, impression bons, CI/CD | 4–6 sem. |
| **2 — Cœur clinique** | Admission/Accueil, EMR, RDV, Consultation, **Hospitalisation (lits)**, Urgences | 8–10 sem. |
| **3 — Plateaux & finance** | Pharmacie/Stock, Labo, Imagerie, **Facturation + Caisse + Mobile Money**, Bons | 8–10 sem. |
| **4 — Bloc & spécialisés** | Bloc opératoire, Maternité, Banque de sang, Stérilisation | 6–8 sem. |
| **5 — Gestion** | RH/Permanences, Logistique/Achats, Biomédical, Partenaires/Mutuelles | 6–8 sem. |
| **6 — Santé publique & patient** | DHIS2/SNIS, Programmes (VIH/TB/Palu/PEV), Portail patient, SMS/USSD, Télé | en continu |
| **Pilote** | Déploiement clinique pilote (RDC), formation, retours terrain | continu |

## 10. Démarrage (à venir)

```bash
git clone https://github.com/Jeffbuleli/DOCTA.git
cd DOCTA
# instructions d'installation à compléter
```

## 11. Licence

**AGPL-3.0** recommandée (protège un SaaS de santé open source contre l'appropriation propriétaire).

---
_Docta — le SIH open source de l'hôpital africain moderne._
