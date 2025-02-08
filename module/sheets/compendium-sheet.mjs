
import toggler from '../helpers/toggler.js';
import {
  capitalizeFirstLetter,
  localizeScolaire,
  menu,
} from "../helpers/common.mjs";

export class compendium extends FormApplication {
    constructor() {
      super(
        CONFIG.HPCOMPENDIUM
      );
    }

    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "compendium"],
        template: "systems/harry-potter-jdr/templates/compendium/compendium-sheet.html",
        title: game.i18n.localize("HP.COMPENDIUM.Label"),
        width: 1220,
        height: 720,
        tabs: [
          {navSelector: ".sheet-tabs", contentSelector: ".body", initial: "personnage"},
        ],
        dragDrop: [{dragSelector: [".draggable"], dropSelector: null}],
        resizable:true,
      });
    }

    getData() {


      return this.object;
    }

    activateListeners(html) {
      super.activateListeners(html);

      toggler.init(this.id, html);

      menu(html);

      html.find('.page').click(async ev => {
        const tgt = $(ev.currentTarget);
        const type = tgt.data('type');
        const actuel = parseInt(this.object[type].pages.actuel);
        const total = parseInt(this.object[type].pages.total);
        let page = tgt.data('page');

        if(page === 'previous') page = Math.max(actuel-1, 1);
        else if(page === 'next') page = Math.min(actuel+1, total)
        else page = parseInt(page);
        this.object[type].pages.actuel = page;
        this.render(true);
      });

      html.find('.tri').click(async ev => {
        const tgt = $(ev.currentTarget);
        const type = tgt.data('type');
        const tri = tgt.data('tri');
        const value = tgt.data('value');
        let object = this.object[type];

        for(let t in object.sort) {
          if(t !== tri) object.sort[t] = false;
        }

        object.sort[tri] = value;
        this._filter(type);

        this.render(true);
      });

      html.find('.search, .malus, .niveau').change(async ev => {
        const tgt = $(ev.currentTarget);
        const type = tgt.data('type');
        const subtype = tgt.data('subtype');
        const value = tgt.val();
        this.object[type][subtype] = value;

        this._filter(type);

        this.render(true);
      });

      html.find('.filter button').click(async ev => {
        ev.preventDefault();
        const tgt = $(ev.currentTarget);
        const type = tgt.data('type');
        const key = tgt.data('key');
        const special = tgt.data('special');

        if(special) {
          const split = key.split('_')[0];
          const result = this.object[type].filtres[split].find(itm => itm.key === key).checked ? false : true;

          this.object[type].filtres[split].find(itm => itm.key === key).checked = result;
        } else {
          const result = this.object.submenu[type].find(itm => itm.key === key).checked ? false : true;

          this.object.submenu[type].find(itm => itm.key === key).checked = result;
        }

        this._filter(type);

        this.render(true);
      });

      html.find('div.block span.label').click(async ev => {
        const header = $(ev.currentTarget).parents("div.block");
        const uuid = header.data('uuid');
        const itm = await fromUuid(uuid);

        itm.sheet.render(true);
      });
    }

    async _onDragStart(event) {
      const li = event.currentTarget;
      if ( event.target.classList.contains("content-link") ) return;

      // Create drag data
      let dragData;

      // Owned Items
      if ( li.dataset.uuid ) {
          dragData = {
            uuid:li.dataset.uuid,
            type:li.dataset.type,
          };
      }

      // Active Effect
      if ( li.dataset.effectId ) {
        const effect = this.actor.effects.get(li.dataset.effectId);
        dragData = effect.toDragData();
      }

      if ( !dragData ) return;

      // Set data transfer
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    _filter(type) {
      const data = this.object[type];
      const submenu = this.object.submenu[type];
      const search = data.search;
      const malus = data.malus;
      const niveau = data.niveau;
      let tri;

      switch(type) {
        case 'objet':
          tri = data.all.filter(itm =>
            itm.all.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.particularite.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.prix.toLowerCase().includes(search.toLowerCase()));

          for(let sm of submenu) {
            if(!sm.checked) tri = tri.filter(itm => !itm.uuid.includes(sm.key));
          }
          break;

        case 'arme':
          const demidgts = game.i18n.localize('HP.DemiDegats');
          const fulldgts = game.i18n.localize('HP.DERIVES.Degats');
          const distance = game.i18n.localize("HP.ARMES.Distance-short")
          const contact = game.i18n.localize("HP.ARMES.Contact-short")

          tri = data.all.filter(itm =>
            itm.all.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.description.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.portee.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.degats.value.toLowerCase().includes(search.toLowerCase()) ||
            (itm.all.system.degats.adddmg == "0.5" ? demidgts.toLowerCase().includes(search.toLowerCase()) : false) ||
            (itm.all.system.degats.adddmg == "1" ? fulldgts.toLowerCase().includes(search.toLowerCase()) : false) ||
            (itm.all.system.distance ? distance.toLowerCase().includes(search.toLowerCase()) : false) ||
            (!itm.all.system.distance ? contact.toLowerCase().includes(search.toLowerCase()) : false) );

          for(let sm of submenu) {
            if(!sm.checked) tri = tri.filter(itm => !itm.uuid.includes(sm.key));
          }
          break;

        case 'protection':
          const armure = game.i18n.localize("HP.PROTECTIONS.Armure")
          const bouclier = game.i18n.localize("HP.PROTECTIONS.Bouclier")

          tri = data.all.filter(itm =>
            itm.all.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.description.toLowerCase().includes(search.toLowerCase()) ||
            `${itm.all.system.armure}`.includes(search.toLowerCase()) ||
            (itm.all.system.bouclier ? bouclier.toLowerCase().includes(search.toLowerCase()) : false) ||
            (!itm.all.system.bouclier ? armure.toLowerCase().includes(search.toLowerCase()) : false) );

          for(let sm of submenu) {
            if(!sm.checked) tri = tri.filter(itm => !itm.uuid.includes(sm.key));
          }
          break;

        case 'avantage':
        case 'desavantage':
        case 'capacitefamilier':
          tri = data.all.filter(itm =>
            itm.all.name.toLowerCase().includes(search.toLowerCase()) ||
            `${itm.all.cout}`.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.description.toLowerCase().includes(search.toLowerCase()));

          for(let sm of submenu) {
            if(!sm.checked) tri = tri.filter(itm => !itm.uuid.includes(sm.key));
          }
          break;

        case 'crochepatte':
        case 'coupspouce':
        case 'capacite':
          tri = data.all.filter(itm =>
            itm.all.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.description.toLowerCase().includes(search.toLowerCase()));

          for(let sm of submenu) {
            if(!sm.checked) tri = tri.filter(itm => !itm.uuid.includes(sm.key));
          }
          break;

        case 'sortilege':
          tri = data.all.filter(itm =>
            (itm.all.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.incantation.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.effets.toLowerCase().includes(search.toLowerCase()) ||
            this._traTypeSortilege(itm.all.system.type).toLowerCase().includes(search.toLowerCase()) ||
            this._traCible(itm.all.system.cibles).toLowerCase().includes(search.toLowerCase())) &&
            this._checkedCible(itm.all.system.cibles, data.filtres.cibles)
          );

          if(niveau) {
            tri = tri.filter(itm => itm.all.system.niveau.includes(niveau));
          }

          if(malus) {
            tri = tri.filter(itm => ((itm.all.system.malus.fc == malus) ||
            (itm.all.system.malus.fe.has && itm.all.system.malus.fe.malus == malus) ||
            (itm.all.system.malus.fe.fc.reduction && itm.all.system.malus.fe.fc.malus == malus)))
          }
          break;

        case 'potion':
          tri = data.all.filter(itm =>
            (itm.all.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.effets.toLowerCase().includes(search.toLowerCase()) ||
            this._traCible(itm.all.system.cibles).toLowerCase().includes(search.toLowerCase())) &&
            this._checkedCible(itm.all.system.cibles, data.filtres.cibles)
          );

          if(niveau) {
            tri = tri.filter(itm => itm.all.system.niveau.includes(niveau));
          }

          if(malus) {
            tri = tri.filter(itm => itm.all.system.malus == malus);
          }
          break;

        case 'baguette':
          tri = data.all.filter(itm =>
            (itm.all.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.visuel.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.description.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.bois.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.bois.description.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.coeur.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.coeur.description.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.taille.toLowerCase().includes(search.toLowerCase()) ||
            this._traAffinitesBaguette(itm.all.system.affinite).toLowerCase().includes(search.toLowerCase()))
          );
          break;

        case 'balai':
          tri = data.all.filter(itm =>
            (itm.all.name.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.marque.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.visuel.toLowerCase().includes(search.toLowerCase()) ||
            itm.all.system.description.toLowerCase().includes(search.toLowerCase()) ||
            this._traBonusBalai(itm.all.system.bonus).toLowerCase().includes(search.toLowerCase()))
          );
          break;
      }

      this.object[type].pages.actuel = 1;
      this.object[type].pages.total = Math.ceil(tri.length / 20);

      this._reorder(tri, type);
    }

    _reorder(data, type) {
      let label = this.object[type].sort.label;
      let distance;
      let portee;
      let armure;
      let bouclier;
      let cout;
      let niveau;
      let oType;
      let incantation;
      let cible;
      let malus;
      let bois;
      let coeur;
      let taille;
      let affinite;
      let marque;

      // Fonction de comparaison de chaine contenant des nombres et des lettres.
      const compare = (str1, str2, order) => {
        const regex = /(\d+)([a-zA-Z]+)/; // Regex pour séparer les nombres et les lettres
        const match1 = str1.match(regex);
        const match2 = str2.match(regex);

        // Comparer les parties numériques
        const num1 = match1 ? parseInt(match1[1]) : 0;
        const num2 = match2 ? parseInt(match2[1]) : 0;

        if (num1 !== num2) {
          return order === 'asc' ? num1 - num2 : num2 - num1; // Trier par nombre selon l'ordre
        }

        // Comparer les parties alphabétiques
        const alpha1 = match1 ? match1[2] : '';
        const alpha2 = match2 ? match2[2] : '';
        return order === 'asc' ? alpha1.localeCompare(alpha2) : alpha2.localeCompare(alpha1); // Trier par lettre selon l'ordre
      };

      switch(type) {
        case 'avantage':
        case 'desavantage':
        case 'capacitefamilier':
          cout = this.object[type].sort.cout;

          data.sort((a, b) => {
            if(label) {
              const nameComparison = a.all.name.localeCompare(b.all.name);
              const sortOrder = label === 'asc' ? -1 : 1;
              return nameComparison * sortOrder;
            } else if(cout) {
              const coutComparison = parseInt(a.all.system.cout) - parseInt(b.all.system.cout);
              const coutOrder = cout === 'asc' ? -1 : 1;

              return coutComparison * coutOrder;
            }
          });
          break;

        case 'crochepatte':
        case 'coupspouce':
        case 'objet':
        case 'capacite':
          data.sort((a, b) => {
            const nameComparison = a.all.name.localeCompare(b.all.name);
            const sortOrder = label === 'asc' ? -1 : 1;
            return nameComparison * sortOrder;
          });
          break;

        case 'arme':
          distance = this.object[type].sort.type;
          portee = this.object[type].sort.portee;

          data.sort((a, b) => {
            if(label) {
              const nameComparison = a.all.name.localeCompare(b.all.name);
              const nameOrder = label === 'asc' ? -1 : 1;

              return nameComparison * nameOrder;
            } else if(distance) {
              const distanceComparison = a.all.system.distance ? -1 : b.all.system.distance ? 1 : 0;
              const distanceOrder = distance === 'asc' ? -1 : 1;

              return distanceComparison * distanceOrder;
            } else if(portee) {
              return compare(a.all.system.portee, b.all.system.portee, portee);
            }
          });
          break;

        case 'protection':
          armure = this.object[type].sort.armure;
          bouclier = this.object[type].sort.type;
          data.sort((a, b) => {
            if(label) {
              const nameComparison = a.all.name.localeCompare(b.all.name);
              const nameOrder = label === 'asc' ? -1 : 1;

              return nameComparison * nameOrder;
            } else if(bouclier) {
              const bouclierComparison = a.all.system.bouclier ? -1 : b.all.system.bouclier ? 1 : 0;
              const bouclierOrder = bouclier === 'asc' ? -1 : 1;

              return bouclierComparison * bouclierOrder;
            } else if(armure) {
              const armureComparison = parseInt(a.all.system.armure) - parseInt(b.all.system.armure);
              const armureOrder = armure === 'asc' ? -1 : 1;

              return armureComparison * armureOrder;
            }
          });
          break;

        case 'sortilege':
          oType = this.object[type].sort.type;
          niveau = this.object[type].sort.niveau;
          incantation = this.object[type].sort.incantation;
          cible = this.object[type].sort.cible;
          malus = this.object[type].sort.malus;
          data.sort((a, b) => {
            if(label) {
              const nameComparison = a.all.name.localeCompare(b.all.name);
              const nameOrder = label === 'asc' ? -1 : 1;

              return nameComparison * nameOrder;
            } else if(incantation) {
              const incantationComparison = a.all.system.incantation.localeCompare(b.all.incantation);
              const incantationOrder = incantation === 'asc' ? -1 : 1;

              return incantationComparison * incantationOrder;
            } else if(niveau) {
              const niveauA = parseInt(a.all.system.niveau);
              const niveauB = parseInt(b.all.system.niveau);
              const niveauOrder = niveau === 'asc' ? -1 : 1;

              return (niveauA - niveauB) * niveauOrder;
            } else if(oType) {
              const typeComparison = this._traTypeSortilege(a.all.system.type).localeCompare(b.all.name);
              const typeOrder = oType === 'asc' ? -1 : 1;

              return typeComparison * typeOrder;
            } else if(cible) {
              const cibleComparison = this._abreviationTraCible(a.all.system.cibles).localeCompare(this._abreviationTraCible(b.all.system.cibles));
              const cibleOrder = cible === 'asc' ? -1 : 1;

              return cibleComparison * cibleOrder;
            } else if(malus) {
              const malusComparison = this._traMalusSortilege(a.all.system.malus).localeCompare(this._traMalusSortilege(b.all.system.malus));
              const malusOrder = malus === 'asc' ? -1 : 1;

              return malusComparison * malusOrder;
            }
          });
          break;

        case 'potion':
          niveau = this.object[type].sort.niveau;
          cible = this.object[type].sort.cible;
          malus = this.object[type].sort.malus;
          data.sort((a, b) => {
            if(label) {
              const nameComparison = a.all.name.localeCompare(b.all.name);
              const nameOrder = label === 'asc' ? -1 : 1;

              return nameComparison * nameOrder;
            } else if(niveau) {
              const niveauA = parseInt(a.all.system.niveau);
              const niveauB = parseInt(b.all.system.niveau);
              const niveauOrder = niveau === 'asc' ? -1 : 1;

              return (niveauA - niveauB) * niveauOrder;
            } else if(cible) {
              const cibleComparison = this._abreviationTraCible(a.all.system.cibles).localeCompare(this._abreviationTraCible(b.all.system.cibles));
              const cibleOrder = cible === 'asc' ? -1 : 1;

              return cibleComparison * cibleOrder;
            } else if(malus) {
              const malusA = parseInt(a.all.system.malus);
              const malusB = parseInt(b.all.system.malus);
              const malusOrder = malus === 'asc' ? -1 : 1;

              return (malusA - malusB) * malusOrder;
            }
          });
          break;

        case 'baguette':
          bois = this.object[type].sort.bois;
          coeur = this.object[type].sort.coeur;
          taille = this.object[type].sort.taille;
          affinite = this.object[type].sort.affinite;
          data.sort((a, b) => {
            if(label) {
              const nameComparison = a.all.name.localeCompare(b.all.name);
              const nameOrder = label === 'asc' ? -1 : 1;

              return nameComparison * nameOrder;
            } else if(bois) {
              const boisComparison = a.all.system.bois.name.localeCompare(b.all.system.bois.name);
              const boisOrder = bois === 'asc' ? -1 : 1;

              return boisComparison * boisOrder;
            } else if(coeur) {
              const coeurComparison = a.all.system.coeur.name.localeCompare(b.all.system.coeur.name);
              const coeurOrder = coeur === 'asc' ? -1 : 1;

              return coeurComparison * coeurOrder;
            } else if(taille) {
              const tailleComparison = a.all.system.taille.localeCompare(b.all.system.taille);
              const tailleOrder = taille === 'asc' ? -1 : 1;

              return tailleComparison * tailleOrder;
            } else if(affinite) {
              const affiniteComparison = this._traAffinitesBaguette(a.all.system.affinite).localeCompare(this._traAffinitesBaguette(b.all.system.affinite));
              const affiniteOrder = affinite === 'asc' ? -1 : 1;

              return affiniteComparison * affiniteOrder;
            }
          });
          break;

        case 'balai':
          marque = this.object[type].sort.marque;
          data.sort((a, b) => {
            if(label) {
              const nameComparison = a.all.name.localeCompare(b.all.name);
              const nameOrder = label === 'asc' ? -1 : 1;

              return nameComparison * nameOrder;
            } else if(marque) {
              const marqueComparison = a.all.system.marque.localeCompare(b.all.system.marque);
              const marqueOrder = marque === 'asc' ? -1 : 1;

              return marqueComparison * marqueOrder;
            }
          });
          break;
      }

      this.object[type].data = data;
    }

    _traTypeSortilege(string) {
      let translate;
      let result = '';
      if(string === 'e') translate = 'enchantements';
      else if(string === 's') translate = 'mauvaisorts';
      else if(string === 'm') translate = 'metamorphose';

      result = game.settings.get('harry-potter-jdr', `${translate}`) ? game.settings.get('harry-potter-jdr', `${translate}`) : game.i18n.localize(`HP.COMPETENCES.${translate.charAt(0).toUpperCase() + translate.slice(1)}`);
      result += ` (${game.settings.get('harry-potter-jdr', `${translate}-abreviation`) ? game.settings.get('harry-potter-jdr', `${translate}-abreviation`) : game.i18n.localize(`HP.COMPETENCES.${translate.charAt(0).toUpperCase() + translate.slice(1)}-abreviation`)})`;

      return result;
    }

    _traCible(array) {
      let result = '';

      for(let c in array) {
        if(!array[c]) continue;

        result += `${game.i18n.localize(`HP.${c.toUpperCase()}`)}${game.i18n.localize(`HP.${c.toUpperCase()}Full`)}`;
      }

      return result;
    }

    _abreviationTraCible(array) {
      let result = [];

      for(let c in array) {
        if(!array[c]) continue;

        result.push(`${game.i18n.localize(`HP.${c.toUpperCase()}`)}`);
      }

      return result.join(' / ');
    }

    _checkedCible(array, filter) {
      let result = false;

      for(let c in array) {
        if(!array[c]) continue;

        const filtered = filter.find(itm => itm.key === `cibles_${c}`);

        if(filtered.checked) result = true;
      }

      return result;
    }

    _traMalusSortilege(malus) {
      let result = '';

      result += `${game.i18n.localize('HP.SORTILEGES.FormuleClassique-short')} : ${malus.fc}%`;

      if(malus.fe.has) {
        result += ` ${game.i18n.localize("HP.SORTILEGES.FormuleExtreme-short")} : `;

        if(malus.fe.fc.reduction) {
          result += `${malus.fe.fc.malus}% / `;
        }

        result += `${malus.fe.malus}%`;
      }

      return result;
    }

    _traAffinitesBaguette(affinite) {
      const communes = CONFIG.HP.communes;
      const particulieres = CONFIG.HP.particulieres;
      let list = {};

      for(let c in communes) {
        const name = communes[c];
        const isCmp = c.split('_')[0] === 'competence' ? true : false;
        const cmp = c.split('_')[1];
        let finalName = '';

        if(isCmp) finalName = game.settings.get('harry-potter-jdr', `${cmp}`) ? game.settings.get('harry-potter-jdr', `${cmp}`) : game.i18n.localize(name);
        else finalName = game.i18n.localize(name);

        let string = '';

        string = `${game.i18n.localize('HP.BAGUETTES.Commune')} : ${finalName}`;

        list[c] = string;
      }

      for(let c in particulieres) {
        const name = particulieres[c];
        let string = '';

        string = `${game.i18n.localize('HP.BAGUETTES.Particuliere')} : ${game.i18n.localize(name)}`;

        list[c] = string;
      }

      return `${list[affinite.key]} ${affinite.value}`;
    }

    _traBonusBalai(bonus) {
      let result = [];

      for(let b of bonus.liste) {
        const key = b?.key ?? '';
        const label = b?.label ?? '';

        if(label) {
            switch(key) {
                case 'caracteristique':
                    result.push(`${game.i18n.localize(CONFIG.HP.caracteristiques[label])} (${b.value})`);
                    break;

                case 'competence':
                  result.push(`${game.i18n.localize(`HP.COMPETENCES.Competence${capitalizeFirstLetter(label.split('_')[1])}`)} : ${localizeScolaire(label.split('_')[2])} (${b.value})`);
                    break;

                case 'autre':
                  result.push(`${label} (${b.value})`);
                  break;
            }
        }
      }


      return result.join(' / ');
    }
}