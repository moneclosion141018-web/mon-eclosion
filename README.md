# Mon Éclosion

Jeu d’apprentissage pensé pour les enfants différents, à partager en famille. Application web installable (tablette, ordinateur, téléphone en portrait), qui fonctionne hors connexion.

Mon Éclosion est un jeu d’apprentissage. Il ne remplace pas l’accompagnement d’un professionnel.

## Ce que contient la version de test

- Compte parent par mail (Supabase, hébergé à Paris), code parent à 4 chiffres avec calcul de secours.
- Plusieurs enfants par compte.
- Questionnaire d’accueil (parole, compréhension, communication, confort) qui propose l’un des 4 parcours, avec choix manuel possible.
- 4 parcours de 4 niveaux, 85 exercices de 11 types : imiter un son, souffler, choisir la bonne image, colorier, remettre dans l’ordre, tracer au doigt ou au stylet, gestes, bulles, jeu à deux, pictogrammes, petites histoires, devinettes.
- Après chaque essai, l’enfant voit « Bel effort ! » et le parent évalue l’essai. Le niveau suivant s’ouvre après 8 réussites sur les 10 derniers essais.
- Jardin de récompenses (ou garage, ou ferme), pauses calmes, pause proposée après plusieurs essais difficiles.
- Espace parent : progrès, temps de jeu, fiches PDF à imprimer, durée maximale par jour, grands boutons, animations coupées, sons doux.
- Voix de synthèse intégrée à l’appareil. Le micro détecte seulement qu’un son a été émis : rien n’est enregistré.

## Lancer en local

```bash
npm install
npm run dev
```

## Mise en ligne

Chaque mise à jour de la branche `main` publie l’application sur GitHub Pages (`.github/workflows/publier.yml`). Dans le dépôt GitHub : Settings → Pages → Source : « GitHub Actions ».

Dans Supabase (Authentication → URL Configuration), ajouter l’adresse GitHub Pages comme « Site URL » et dans « Redirect URLs », pour que les liens des mails de confirmation ramènent dans l’application.

## Organisation du code

- `src/data/` : questionnaire et contenu des exercices.
- `src/components/Exercices.tsx` : le moteur des 11 types d’exercices.
- `src/lib/` : stockage hors connexion et synchronisation, voix, micro, sons, progression, fiches PDF.
- `src/pages/` : les écrans.
