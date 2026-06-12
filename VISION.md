# Vision — Docta, la plaque tournante de la santé en RD Congo

> Docta n'est pas un logiciel de gestion hospitalière. C'est une **infrastructure de santé publique** pour la RDC : un pont entre les patients, les hôpitaux et les soignants — gratuit pour le public, open source pour les développeurs, financé par les dons.

---

## 1. Le problème (pourquoi Docta existe)

En RDC, **accéder au bon soin au bon moment est un problème vital** :
- Une personne tombe malade et ne sait pas quel hôpital proche peut la prendre en charge en urgence → elle se retrouve face à des **non-professionnels ou des charlatans**.
- Le **dossier médical n'existe pas** : en quittant Goma pour Kinshasa, le patient perd tout son historique. Le nouveau médecin diagnostique « à l'aveugle ».
- Des **erreurs de médication** (mauvais médicament, mauvaise dose) tuent — sans traçabilité, personne n'en connaît la cause.
- Les hôpitaux tournent sur **Excel, VBA ou du papier** ; ils subissent des **abus** (patients qui fuient sans payer).

**Conséquence : des vies perdues, évitables.**

## 2. La vision

Docta brise ces limites avec une plateforme à deux faces :

### Face publique (patient) — gratuite, accessible à tous
- **Créer un compte soi-même**, en privé, sans passer par un hôpital.
- **Trouver un hôpital adapté et proche** (géolocalisation + capacité réelle) en cas de besoin → **sauver des vies**.
- **Consultation en ligne** et **prise de rendez-vous** avec un médecin / spécialiste de l'hôpital recommandé.
- **Téléconsultation vidéo** (Jitsi auto-hébergé).
- **Assistant IA** (OpenAI) : orientation des symptômes, vulgarisation, aide à la décision — **jamais un diagnostic**, toujours un routage vers un vrai soignant.
- **Dossier médical portable** : antécédents, évolution, traitements reçus partout — que le patient **possède** et **partage** avec un nouvel hôpital en quelques secondes.

### Face hôpital (SIH) — open source, white-label
- Le SIH complet déjà en construction (patients, hospitalisation, caisse, pharmacie…).
- **Chaque hôpital peut rebrander son dashboard** (logo, couleurs, nom).
- **Auto-hébergeable** : un hôpital garde ses données, branché au réseau Docta par consentement.

## 3. Le cœur de l'architecture : le patient possède son dossier

C'est l'idée la plus puissante. À détailler ainsi :

- **Identité unique nationale** (via KYC didit.me) : une personne = un seul compte, un seul dossier patient canonique, quel que soit l'hôpital. Empêche les doublons et l'usurpation.
- **Dossier porté par le patient** : un patient créé manuellement dans un hôpital **ou** inscrit seul retrouve toujours **ses** informations.
- **Partage par consentement** : à l'accueil d'un nouvel hôpital, le patient **autorise** l'accès à son historique (QR / code à usage unique, durée limitée). Le nouveau médecin voit antécédents, traitements, doses → **diagnostic plus rapide et plus sûr**.
- **Accès d'urgence (« break-glass »)** : pour un patient inconscient, accès vital encadré, **tracé et audité**.
- **Journal de médication (eMAR)** : chaque prescription et **chaque dose administrée** sont enregistrées, avec alertes allergies / interactions → **prévient les erreurs mortelles**.

## 4. Améliorations proposées (sur l'idée de base)

1. **Recommandation d'hôpital = proximité + capacité + spécialité.** Docta connaît déjà les **lits libres** par service ; on y ajoute la géolocalisation, les spécialités disponibles et l'urgence (triage IA) pour router intelligemment — pas juste « le plus proche », mais « le plus proche **capable** ».
2. **Inclusion avant tout.** Beaucoup de Congolais n'ont pas de pièce d'identité formelle. Le KYC didit.me ne doit **jamais exclure** : prévoir des **fallbacks** (téléphone + OTP, vérification par un agent de santé communautaire, biométrie simple). L'objectif est d'éviter les doublons, pas de bloquer les plus vulnérables.
3. **Recouvrement juste.** L'identité unique aide les hôpitaux à recouvrer (anti-fuite), mais on l'associe à des leviers **dignes** : pré-autorisation mobile money, acompte, lien vers mutuelles / fonds social — sans punir les pauvres.
4. **Sécurité IA stricte.** L'assistant OpenAI est **consultatif**, multilingue (FR + Lingala/Swahili/Kikongo/Tshiluba), avec garde-fous : il oriente, résume un dossier pour le médecin, signale des interactions médicamenteuses — **un humain valide toujours**. Chaque suggestion IA est journalisée.
5. **Hors-ligne d'abord.** Connexion instable = réalité. Le dossier, la file, la caisse fonctionnent **offline** et se synchronisent. La vidéo bascule en audio basse bande passante si besoin.
6. **Confiance & médico-légal.** Plateforme de santé = vies en jeu. Piste d'audit de tout accès au dossier, consentement explicite, protection des données, conservation médico-légale des historiques de traitement.
7. **Effet réseau = bien commun.** Plus d'hôpitaux rejoignent → meilleure recommandation, dossiers plus complets, moins d'erreurs. La valeur croît pour tous, gratuitement.

## 5. Modèle économique — dons, sans publicité ni abonnement

- **Gratuit pour les patients. Gratuit pour les hôpitaux. Open source.**
- **Pas de publicité, pas d'abonnement.** Les serveurs vivent de **dons**.
- Pistes complémentaires **fidèles à l'esprit** (à valider) : subventions et partenariats (ONG, bailleurs, Ministère de la Santé), et **auto-hébergement par les hôpitaux** (ils portent leur propre infra) pour garder les coûts centraux bas. Le patient ne paie jamais, aucune pub n'apparaît jamais.
- **Attribution :** chaque page porte « **Powered by McBuleli** » (lien `x.com/McBuleli`).

## 6. Briques techniques (fournies par l'équipe)

| Besoin | Outil |
|---|---|
| Assistant IA | **OpenAI API** |
| Téléconsultation vidéo | **Jitsi** auto-hébergé (VPS) |
| Stockage média (imagerie, documents) | **Cloudflare R2** |
| E-mail (confirmation, récupération mot de passe) | **Resend** |
| Vérification d'identité / KYC | **didit.me** |
| Second facteur / sans mot de passe | **Google Authenticator (TOTP)** + **Passkeys** |

## 7. Implications produit à intégrer à la feuille de route

- **Comptes patients self-service** (inscription publique) en plus des patients créés par l'hôpital, **réconciliés** par l'identité KYC.
- **Authentification renforcée** : e-mail vérifié (Resend), **TOTP**, **Passkeys**, récupération de mot de passe.
- **Annuaire des hôpitaux** + géolocalisation + **moteur de recommandation**.
- **Rendez-vous public** + **téléconsultation Jitsi**.
- **Dossier médical portable + partage par consentement** entre établissements.
- **Module médication / eMAR** avec alertes.
- **White-label** par hôpital (branding du dashboard).
- **Don** (page de dons, pas de pub).

---

_« Si c'était un simple projet de gestion, je l'aurais fait seul. C'est un projet complexe : une plateforme qui peut sauver des vies. »_
