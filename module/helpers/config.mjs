export const HP = {};

HP.caracteristiques = {
    'force':'HP.CARACTERISTIQUES.Force',
    'constitution':'HP.CARACTERISTIQUES.Constitution',
    'taille':'HP.CARACTERISTIQUES.Taille',
    'perception':'HP.CARACTERISTIQUES.Perception',
    'intelligence':'HP.CARACTERISTIQUES.Intelligence',
    'dexterite':'HP.CARACTERISTIQUES.Dexterite',
    'apparence':'HP.CARACTERISTIQUES.Apparence',
    'pouvoir':'HP.CARACTERISTIQUES.Pouvoir',
}

HP.competences = {
  generales: {
      acrobatiequidditch: {
          base: 10,
          max: 60,
          canextend: false,
          specialisation: false
      },
      artisanat: {
          base: 5,
          max: 30,
          canextend: true,
          specialisation: false
      },
      athletisme: {
          base: 20,
          max: 75,
          canextend: false,
          specialisation: false
      },
      bagarre: {
          base: 10,
          max: 50,
          canextend: true,
          specialisation: false
      },
      bibliotheque: {
          base: 10,
          max: 75,
          canextend: true,
          specialisation: false
      },
      commandement: {
          base: 10,
          max: 60,
          canextend: false,
          specialisation: false
      },
      connaissancescolaire: {
          base: 10,
          max: 50,
          canextend: true,
          specialisation: false
      },
      deguisement: {
          base: 5,
          max: 55,
          canextend: false,
          specialisation: false
      },
      discretion: {
          base: 10,
          max: 60,
          canextend: false,
          specialisation: false
      },
      dressagesoin: {
          base: 10,
          max: 30,
          canextend: true,
          specialisation: false
      },
      empathie: {
          base: 20,
          max: 75,
          canextend: false,
          specialisation: false
      },
      esquive: {
          base: 25,
          max: 80,
          canextend: false,
          specialisation: false
      },
      fouillemenage: {
          base: 20,
          max: 60,
          canextend: false,
          specialisation: false
      },
      langueetrangere: {
          base: 5,
          max: 60,
          canextend: false,
          specialisation: true
      },
      languenatale: {
          base: 70,
          max: 95,
          canextend: false,
          specialisation: false
      },
      orientation: {
          base: 20,
          max: 80,
          canextend: false,
          specialisation: false
      },
      persuasionbaratin: {
          base: 10,
          max: 80,
          canextend: false,
          specialisation: false
      },
      psychologie: {
          base: 5,
          max: 70,
          canextend: false,
          specialisation: false
      },
      secourisme: {
          base: 0,
          max: 20,
          canextend: true,
          specialisation: false
      },
      survie: {
          base: 0,
          max: 20,
          canextend: true,
          specialisation: false
      },
      triche: {
          base: 0,
          max: 40,
          canextend: true,
          specialisation: false
      },
      vigilance: {
          base: 20,
          max: 75,
          canextend: false,
          specialisation: false
      }
  },
  sorciers: {
      connaissance: {
          base: 0,
          max: 50,
          canextend: true,
          specialisation: true
      },
      connaissancedesmoldu: {
          base: 0,
          max: 40,
          canextend: true,
          specialisation: false
      },
      culturegeneraledessorciers: {
          base: 5,
          max: 80,
          canextend: true,
          specialisation: false
      },
      jeuxsorciers: {
          base: 10,
          max: 60,
          canextend: false,
          specialisation: false
      },
      languelatins: {
          base: 15,
          max: 95,
          canextend: false,
          specialisation: false
      },
      mythesetlegendesdessorciers: {
          base: 5,
          max: 75,
          canextend: false,
          specialisation: false
      }
  },
  moldus: {
      bricolage: {
          base: 10,
          max: 50,
          canextend: true,
          specialisation: false
      },
      conduite: {
          base: 0,
          max: 30,
          canextend: true,
          specialisation: false
      },
      connaissance: {
          base: 0,
          max: 50,
          canextend: true,
          specialisation: true
      },
      culturegeneralemoldus: {
          base: 20,
          max: 80,
          canextend: false,
          specialisation: false
      },
      jeuxmoldus: {
          base: 10,
          max: 80,
          canextend: false,
          specialisation: false
      },
      languelatinm: {
          base: 5,
          max: 95,
          canextend: false,
          specialisation: false
      },
      serrurerie: {
          base: 10,
          max: 50,
          canextend: true,
          specialisation: false
      }
  },
  scolaires: {
      arithmancie: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      artmagique: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      artmoldu: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      astronomie: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      botanique: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      defensecontredesforcesdumal: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      divination: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      enchantements: {
          base: 5,
          max: 0,
          canextend: false,
          specialisation: false
      },
      etudedesmoldus: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      etudedesrunes: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      histoiredelamagie: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      mauvaisorts: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      metamorphose: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      musiquemagique: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      musiquemoldue: {
          base: 5,
          max: 0,
          canextend: false,
          specialisation: false
      },
      potion: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      soinsdescreaturesmagiques: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      },
      volenbalai: {
          base: 0,
          max: 0,
          canextend: false,
          specialisation: false
      }
  }
};

HP.competencescreatures = {
    acrobatie:{},
    discretion:{},
    esquive:{},
    orientation:{},
    survie:{},
    vigilance:{},
}

HP.communes = {
    'competence_enchantements':"HP.BAGUETTES.Enchantements",
    'competence_mauvaisorts':"HP.BAGUETTES.Mauvaisorts",
    'competence_metamorphose':"HP.BAGUETTES.Metamorphose",
    'competence_potion':"HP.BAGUETTES.Potions",
}

HP.particulieres = {
    'sort_air':"HP.BAGUETTES.Air",
    'cible_a':"HP.BAGUETTES.Animal",
    'cible_p':"HP.BAGUETTES.Corps",
    'cible_o':"HP.BAGUETTES.Objet",
    'cible_v':"HP.BAGUETTES.Vegetaux",
    'sort_eau':"HP.BAGUETTES.Eau",
    'sort_esprit':"HP.BAGUETTES.Esprit",
    'sort_feu':"HP.BAGUETTES.Feu",
    'sort_manipulation':"HP.BAGUETTES.Manipulation",
    'sort_terre':"HP.BAGUETTES.Terre",
}

HP.balai = {
    'competence':"HP.BALAIS.BONUS.Competence",
    'caracteristique':"HP.BALAIS.BONUS.Caracteristique",
    'autre':"HP.BALAIS.BONUS.Autre",
}

HP.ItemsInterdits = {
    'familier':["coupspouce", "crochepatte", "avantage", "desavantage", "sortilege", "potion", "objet", "baguette", "balai"],
    'creature':["coupspouce", "crochepatte", "avantage", "desavantage", "sortilege", "potion", "objet", "baguette", "balai"],
    'sorcier':["capacite"]
}