import type { Niveau, Profil } from '../lib/types'

export interface Option {
  dessin: string
  label?: string
  bon?: boolean
  pointe?: boolean // Piou regarde cette image
}

interface Commun {
  id: string
  consigne: string // dite par la voix et affichée
}

export type Exercice =
  | (Commun & { type: 'imiter'; modele: string; dessin?: string; grandTexte?: string; famille?: string[] })
  | (Commun & { type: 'souffle' })
  | (Commun & { type: 'choisir'; cible?: string; options: Option[]; dire?: string; tousBons?: boolean; coloriage?: boolean })
  | (Commun & { type: 'ordre'; etapes: { dessin: string; label: string }[] })
  | (Commun & { type: 'tracer'; forme: 'ligne' | 'vague' | 'rond' | 'lettre'; lettre?: string; dire?: string })
  | (Commun & { type: 'geste'; dessin?: string; texte?: string })
  | (Commun & { type: 'bulles'; cible: 'bulle' | 'etoile' })
  | (Commun & { type: 'tour' })
  | (Commun & { type: 'pictos'; pictos: { dessin: string; mot: string }[] })
  | (Commun & { type: 'histoire'; phrases: { texte: string; dessin: string }[]; question: string; options: Option[] })
  | (Commun & { type: 'devinette'; objet: string; nomObjet: string; questions: { texte: string; reponse: string }[] })

const imiter = (id: string, consigne: string, modele: string, extra: Partial<{ dessin: string; grandTexte: string; famille: string[] }> = {}): Exercice => ({
  type: 'imiter',
  id,
  consigne,
  modele,
  ...extra,
})

const choisir = (id: string, consigne: string, options: Option[], extra: Partial<{ cible: string; dire: string; tousBons: boolean; coloriage: boolean }> = {}): Exercice => ({
  type: 'choisir',
  id,
  consigne,
  options,
  ...extra,
})

const geste = (id: string, consigne: string, dessin?: string, texte?: string): Exercice => ({ type: 'geste', id, consigne, dessin, texte })

export const CONTENU: Record<Profil, Record<Niveau, Exercice[]>> = {
  // Profil 1 : ne parle pas, mais comprend
  1: {
    1: [
      { type: 'souffle', id: 'p1n1-souffle', consigne: 'Souffle ou dis « aaa » pour ouvrir la fleur.' },
      imiter('p1n1-chat', 'Le chat dit « miaou ». À toi !', 'Miaou', { dessin: 'chat' }),
      imiter('p1n1-vache', 'La vache dit « meuh ». À toi !', 'Meuh', { dessin: 'vache' }),
      imiter('p1n1-chien', 'Le chien dit « ouaf ». À toi !', 'Ouaf', { dessin: 'chien' }),
      imiter('p1n1-canard', 'Le canard dit « coin coin ». À toi !', 'Coin coin', { dessin: 'canard' }),
      { type: 'tracer', id: 'p1n1-chemin', consigne: 'Suis le chemin avec ton doigt en disant « aaa ».', forme: 'ligne', dire: 'aaa' },
    ],
    2: [
      imiter('p1n2-a', 'Voici le A. Dis « aaa ».', 'aaa', { grandTexte: 'A' }),
      imiter('p1n2-ba', 'Ba, comme ballon. Dis « ba ».', 'ba', { dessin: 'ballon', famille: ['A', 'ba'] }),
      imiter('p1n2-pa', 'Pa, comme papillon. Dis « pa ».', 'pa', { dessin: 'papillon', famille: ['A', 'pa'] }),
      imiter('p1n2-ma', 'Ma, comme maison. Dis « ma ».', 'ma', { dessin: 'maison', famille: ['A', 'ma'] }),
      imiter('p1n2-mama', 'Dis « mama ».', 'mama', { grandTexte: 'ma ma' }),
      imiter('p1n2-papa', 'Dis « papa ».', 'papa', { grandTexte: 'pa pa' }),
      { type: 'tracer', id: 'p1n2-vagues', consigne: 'Trace les vagues en disant « ooo ».', forme: 'vague', dire: 'ooo' },
    ],
    3: [
      choisir('p1n3-ballon', 'Touche le ballon.', [{ dessin: 'ballon', bon: true }, { dessin: 'pomme' }], { dire: 'ballon' }),
      choisir('p1n3-eau', 'Touche l’eau.', [{ dessin: 'lit' }, { dessin: 'verre', bon: true }], { dire: 'eau' }),
      choisir('p1n3-pomme', 'Touche la pomme.', [{ dessin: 'pomme', bon: true }, { dessin: 'voiture' }], { dire: 'pomme' }),
      choisir('p1n3-chat', 'Touche le chat.', [{ dessin: 'maison' }, { dessin: 'chat', bon: true }], { dire: 'chat' }),
      geste('p1n3-mains', 'Tape des mains et dis « bravo » !', 'main', 'bravo'),
      geste('p1n3-bras', 'Lève les bras et dis « en haut » !', 'soleil', 'en haut'),
    ],
    4: [
      imiter('p1n4-gateau', 'Piou a un gâteau. Pour l’avoir, dis « gâteau » !', 'gâteau', { dessin: 'gateau' }),
      imiter('p1n4-ballon', 'Piou a un ballon. Pour l’avoir, dis « ballon » !', 'ballon', { dessin: 'ballon' }),
      imiter('p1n4-voiture', 'Piou a une voiture. Pour l’avoir, dis « voiture » !', 'voiture', { dessin: 'voiture' }),
      imiter('p1n4-livre', 'Piou a un livre. Pour l’avoir, dis « livre » !', 'livre', { dessin: 'livre' }),
      { type: 'tracer', id: 'p1n4-soleil', consigne: 'Dessine un rond pour faire le soleil, puis dis « soleil ».', forme: 'rond', dire: 'soleil' },
    ],
  },
  // Profil 2 : ne parle pas et comprend peu
  2: {
    1: [
      choisir('p2n1-pomme', 'Trouve la même image.', [{ dessin: 'pomme', bon: true }, { dessin: 'banane' }], { cible: 'pomme' }),
      choisir('p2n1-chat', 'Trouve la même image.', [{ dessin: 'voiture' }, { dessin: 'chat', bon: true }], { cible: 'chat' }),
      choisir('p2n1-soleil', 'Trouve la même image.', [{ dessin: 'lune' }, { dessin: 'soleil', bon: true }, { dessin: 'maison' }], { cible: 'soleil' }),
      { type: 'bulles', id: 'p2n1-bulles', consigne: 'Attrape les bulles avec ton doigt.', cible: 'bulle' },
      { type: 'bulles', id: 'p2n1-etoile', consigne: 'Touche l’étoile.', cible: 'etoile' },
    ],
    2: [
      choisir('p2n2-chat', 'Chat.', [{ dessin: 'chat', bon: true }, { dessin: 'ballon' }]),
      choisir('p2n2-pomme', 'Pomme.', [{ dessin: 'voiture' }, { dessin: 'pomme', bon: true }]),
      choisir('p2n2-ballon', 'Ballon.', [{ dessin: 'lit' }, { dessin: 'ballon', bon: true }, { dessin: 'chaussure' }]),
      choisir('p2n2-chaussure', 'Chaussure.', [{ dessin: 'chaussure', bon: true }, { dessin: 'pomme' }, { dessin: 'chien' }]),
      { type: 'pictos', id: 'p2n2-pictos', consigne: 'Touche une image pour entendre le mot.', pictos: [{ dessin: 'verre', mot: 'boire' }, { dessin: 'assiette', mot: 'manger' }, { dessin: 'ballon', mot: 'jouer' }, { dessin: 'lit', mot: 'dormir' }] },
      choisir('p2n2-panier', 'Range la balle dans le panier.', [{ dessin: 'panier', bon: true }, { dessin: 'lit' }]),
    ],
    3: [
      imiter('p2n3-a', 'Voici le A. Écoute : « aaa ». À toi !', 'aaa', { grandTexte: 'A' }),
      imiter('p2n3-o', 'Voici le O. Écoute : « ooo ». À toi !', 'ooo', { grandTexte: 'O' }),
      imiter('p2n3-i', 'Voici le I. Écoute : « iii ». À toi !', 'iii', { grandTexte: 'I' }),
      imiter('p2n3-ba', 'Ba, comme ballon.', 'ba', { dessin: 'ballon', famille: ['A', 'ba'] }),
      imiter('p2n3-ma', 'Ma, comme maison.', 'ma', { dessin: 'maison', famille: ['A', 'ma'] }),
      { type: 'tracer', id: 'p2n3-lettre-a', consigne: 'Repasse le grand A en chantant « aaa ».', forme: 'lettre', lettre: 'A', dire: 'aaa' },
    ],
    4: [
      imiter('p2n4-mama', 'Dis « mama ».', 'mama', { grandTexte: 'ma ma' }),
      imiter('p2n4-papa', 'Dis « papa ».', 'papa', { grandTexte: 'pa pa' }),
      imiter('p2n4-bobo', 'Dis « bobo ».', 'bobo', { grandTexte: 'bo bo' }),
      choisir('p2n4-boire', 'Tu veux boire ? Montre l’image, ou dis « eau ».', [{ dessin: 'verre', label: 'boire', bon: true }, { dessin: 'assiette', label: 'manger' }], { dire: 'eau' }),
      geste('p2n4-dormir', 'Fais semblant de dormir.', 'lit', 'dodo'),
      geste('p2n4-manger', 'Fais semblant de manger.', 'assiette', 'miam'),
    ],
  },
  // Profil 3 : parle, mais comprend peu
  3: {
    1: [
      choisir('p3n1-chat', 'Où est le chat ?', [{ dessin: 'chat', bon: true }, { dessin: 'chien' }]),
      choisir('p3n1-voiture', 'Où est la voiture ?', [{ dessin: 'maison' }, { dessin: 'voiture', bon: true }]),
      choisir('p3n1-livre', 'Où est le livre ?', [{ dessin: 'chaussure' }, { dessin: 'pomme' }, { dessin: 'livre', bon: true }]),
      geste('p3n1-nez', 'Touche ton nez.', 'nez'),
      geste('p3n1-main', 'Montre ta main.', 'main'),
    ],
    2: [
      choisir('p3n2-dort', 'Le chat dort.', [{ dessin: 'chat_saute' }, { dessin: 'chat_dort', bon: true }]),
      choisir('p3n2-saute', 'Le chat saute.', [{ dessin: 'chat_saute', bon: true }, { dessin: 'chat_mange' }]),
      choisir('p3n2-mange', 'Le chat mange.', [{ dessin: 'chat_dort' }, { dessin: 'chat_saute' }, { dessin: 'chat_mange', bon: true }]),
      choisir('p3n2-colorie-pomme', 'Colorie la pomme.', [{ dessin: 'pomme', bon: true }, { dessin: 'banane' }, { dessin: 'ballon' }], { coloriage: true }),
      choisir('p3n2-colorie-soleil', 'Colorie le soleil.', [{ dessin: 'lune' }, { dessin: 'soleil', bon: true }, { dessin: 'etoile' }], { coloriage: true }),
    ],
    3: [
      choisir('p3n3-grand', 'Touche le grand ballon.', [{ dessin: 'petit_ballon' }, { dessin: 'grand_ballon', bon: true }]),
      choisir('p3n3-petite', 'Touche la petite maison.', [{ dessin: 'petite_maison', bon: true }, { dessin: 'grande_maison' }]),
      choisir('p3n3-dans', 'La balle est dans la boîte.', [{ dessin: 'balle_sur_boite' }, { dessin: 'balle_dans_boite', bon: true }]),
      choisir('p3n3-sous', 'La balle est sous la table.', [{ dessin: 'balle_sous_table', bon: true }, { dessin: 'balle_sur_table' }]),
      geste('p3n3-tete', 'Mets ta main sur ta tête.', 'main'),
    ],
    4: [
      {
        type: 'histoire',
        id: 'p3n4-chat',
        consigne: 'Écoute l’histoire.',
        phrases: [
          { texte: 'Le chat a faim.', dessin: 'chat' },
          { texte: 'Il mange dans son bol.', dessin: 'chat_mange' },
          { texte: 'Puis il fait dodo.', dessin: 'chat_dort' },
        ],
        question: 'Qui mange ?',
        options: [{ dessin: 'chien' }, { dessin: 'chat', bon: true }, { dessin: 'poisson' }],
      },
      {
        type: 'histoire',
        id: 'p3n4-piou',
        consigne: 'Écoute l’histoire.',
        phrases: [
          { texte: 'Le soleil se lève.', dessin: 'soleil' },
          { texte: 'Piou met son tee-shirt.', dessin: 'tshirt' },
          { texte: 'Il mange une pomme.', dessin: 'pomme' },
        ],
        question: 'Que mange Piou ?',
        options: [{ dessin: 'pomme', bon: true }, { dessin: 'banane' }, { dessin: 'gateau' }],
      },
      { type: 'ordre', id: 'p3n4-matin', consigne: 'Remets dans l’ordre : se lever, s’habiller, manger.', etapes: [{ dessin: 'soleil', label: 'se lever' }, { dessin: 'tshirt', label: 's’habiller' }, { dessin: 'assiette', label: 'manger' }] },
      { type: 'ordre', id: 'p3n4-soir', consigne: 'Remets dans l’ordre : se laver les mains, manger, dormir.', etapes: [{ dessin: 'goutte', label: 'se laver les mains' }, { dessin: 'assiette', label: 'manger' }, { dessin: 'lit', label: 'dormir' }] },
    ],
  },
  // Profil 4 : parle et comprend, mais communique peu
  4: {
    1: [
      choisir('p4n1-ballon', 'Regarde ce que regarde Piou. Touche-le.', [{ dessin: 'ballon', pointe: true, bon: true }, { dessin: 'livre' }]),
      choisir('p4n1-fleur', 'Regarde ce que regarde Piou. Touche-le.', [{ dessin: 'voiture' }, { dessin: 'fleur', pointe: true, bon: true }]),
      choisir('p4n1-chat', 'Regarde ce que regarde Piou. Touche-le.', [{ dessin: 'pomme' }, { dessin: 'lit' }, { dessin: 'chat', pointe: true, bon: true }]),
      geste('p4n1-surprise', 'Une surprise ! Montre-la à papa ou à maman.', 'cadeau', 'regarde'),
      geste('p4n1-surprise2', 'Un papillon ! Montre-le à quelqu’un.', 'papillon', 'regarde'),
    ],
    2: [
      { type: 'tour', id: 'p4n2-balle', consigne: 'On se passe la balle. Chacun son tour !' },
      geste('p4n2-miroir', 'Le jeu du miroir : le parent fait un geste, l’enfant l’imite. Puis on change.'),
      { type: 'tour', id: 'p4n2-balle2', consigne: 'Encore une partie de balle. À toi, puis à moi !' },
    ],
    3: [
      choisir('p4n3-content', 'Montre le visage content.', [{ dessin: 'content', label: 'Content', bon: true }, { dessin: 'triste', label: 'Triste' }, { dessin: 'fache', label: 'Fâché' }, { dessin: 'surpris', label: 'Surpris' }]),
      choisir('p4n3-triste', 'Montre le visage triste.', [{ dessin: 'content', label: 'Content' }, { dessin: 'triste', label: 'Triste', bon: true }, { dessin: 'surpris', label: 'Surpris' }]),
      choisir('p4n3-fache', 'Montre le visage fâché.', [{ dessin: 'fache', label: 'Fâché', bon: true }, { dessin: 'content', label: 'Content' }, { dessin: 'triste', label: 'Triste' }]),
      choisir('p4n3-surpris', 'Montre le visage surpris.', [{ dessin: 'triste', label: 'Triste' }, { dessin: 'surpris', label: 'Surpris', bon: true }]),
      choisir('p4n3-humeur', 'Et toi, comment te sens-tu aujourd’hui ?', [{ dessin: 'content', label: 'Content' }, { dessin: 'triste', label: 'Triste' }, { dessin: 'fache', label: 'Fâché' }, { dessin: 'surpris', label: 'Surpris' }], { tousBons: true }),
    ],
    4: [
      choisir('p4n4-bonjour', 'Tu arrives à la boulangerie. Que dis-tu ?', [{ dessin: 'main', label: 'Bonjour', bon: true }, { dessin: 'porte', label: 'Au revoir' }, { dessin: 'cadeau', label: 'Merci' }], { dire: 'Bonjour' }),
      choisir('p4n4-merci', 'On te donne un cadeau. Que dis-tu ?', [{ dessin: 'main', label: 'Bonjour' }, { dessin: 'cadeau', label: 'Merci', bon: true }], { dire: 'Merci' }),
      choisir('p4n4-aurevoir', 'Tu pars de l’école. Que dis-tu ?', [{ dessin: 'porte', label: 'Au revoir', bon: true }, { dessin: 'cadeau', label: 'Merci' }], { dire: 'Au revoir' }),
      {
        type: 'devinette',
        id: 'p4n4-devinette-pomme',
        consigne: 'Piou cache un objet. Pose-lui des questions pour le trouver.',
        objet: 'pomme',
        nomObjet: 'une pomme',
        questions: [
          { texte: 'C’est rouge ?', reponse: 'Oui, c’est rouge !' },
          { texte: 'C’est un animal ?', reponse: 'Non, ce n’est pas un animal.' },
          { texte: 'Ça se mange ?', reponse: 'Oui, ça se mange !' },
        ],
      },
      {
        type: 'devinette',
        id: 'p4n4-devinette-chat',
        consigne: 'Piou cache un objet. Pose-lui des questions pour le trouver.',
        objet: 'chat',
        nomObjet: 'un chat',
        questions: [
          { texte: 'C’est un animal ?', reponse: 'Oui, c’est un animal !' },
          { texte: 'Il fait miaou ?', reponse: 'Oui, il fait miaou !' },
          { texte: 'Ça se mange ?', reponse: 'Non, ça ne se mange pas !' },
        ],
      },
    ],
  },
}

// Fiches à imprimer par niveau (générées en PDF dans l'espace parent).
export type Fiche = { titre: string; forme: 'ligne' | 'vague' | 'rond' | 'lettre' | 'coloriage' | 'humeur'; lettre?: string; dessin?: string; consigne: string }

export const FICHES: Record<Profil, Record<Niveau, Fiche[]>> = {
  1: {
    1: [{ titre: 'Le chemin du doigt', forme: 'ligne', consigne: 'Suis les pointillés au crayon en disant « aaa ».' }],
    2: [{ titre: 'Les vagues', forme: 'vague', consigne: 'Trace les vagues en disant « ooo ».' }, { titre: 'Le grand A', forme: 'lettre', lettre: 'A', consigne: 'Repasse le A en chantant « aaa ».' }],
    3: [{ titre: 'Je colorie et je dis', forme: 'coloriage', dessin: 'ballon', consigne: 'Colorie le ballon, puis dis « ballon ».' }],
    4: [{ titre: 'Je dessine et je nomme', forme: 'rond', consigne: 'Repasse le rond pour faire un soleil, puis dis « soleil ».' }],
  },
  2: {
    1: [{ titre: 'Les ronds', forme: 'rond', consigne: 'Repasse les ronds avec ton doigt, puis au crayon.' }],
    2: [{ titre: 'Je colorie la pomme', forme: 'coloriage', dessin: 'pomme', consigne: 'Colorie la pomme.' }],
    3: [{ titre: 'La voyelle géante A', forme: 'lettre', lettre: 'A', consigne: 'Repasse le grand A en chantant « aaa ».' }, { titre: 'La voyelle géante O', forme: 'lettre', lettre: 'O', consigne: 'Repasse le grand O en chantant « ooo ».' }],
    4: [{ titre: 'Les vagues', forme: 'vague', consigne: 'Trace les vagues en disant « mama ».' }],
  },
  3: {
    1: [{ titre: 'Je colorie le chat', forme: 'coloriage', dessin: 'chat', consigne: 'Colorie le chat.' }],
    2: [{ titre: 'Colorie ce que je dis', forme: 'coloriage', dessin: 'soleil', consigne: 'Colorie le soleil en jaune.' }, { titre: 'Colorie ce que je dis', forme: 'coloriage', dessin: 'pomme', consigne: 'Colorie la pomme en rouge.' }],
    3: [{ titre: 'Grand et petit', forme: 'rond', consigne: 'Repasse le grand rond, puis le petit rond.' }],
    4: [{ titre: 'Je colorie la maison', forme: 'coloriage', dessin: 'maison', consigne: 'Colorie la maison, puis raconte qui y habite.' }],
  },
  4: {
    1: [{ titre: 'Je colorie le cadeau', forme: 'coloriage', dessin: 'cadeau', consigne: 'Colorie le cadeau, puis montre-le à quelqu’un.' }],
    2: [{ titre: 'Le chemin de la balle', forme: 'vague', consigne: 'À tour de rôle, tracez chacun une vague.' }],
    3: [{ titre: 'Dessine ton humeur', forme: 'humeur', consigne: 'Dessine le visage qui montre comment tu te sens aujourd’hui.' }],
    4: [{ titre: 'Je colorie et je raconte', forme: 'coloriage', dessin: 'pain', consigne: 'Colorie le pain, puis joue à la boulangerie : « Bonjour, merci, au revoir ».' }],
  },
}
