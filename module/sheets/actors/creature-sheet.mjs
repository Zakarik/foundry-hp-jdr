import {
    getDefaultImg,
    menu,
    confirmationDialog,
    prepareRollCreatureCmp,
    prepareRollCaracteristique,
    prepareRollCombat,
    capitalizeFirstLetter,
    splitArrayInHalf,
    localizeScolaire,
    prepareRollSortilegeCreature,
    enrichItems,
    prepareRollDegats,
    enrichDescription,
    doRoll,
  } from "../../helpers/common.mjs";

  import toggler from '../../helpers/toggler.js';

/**
 * @extends {ActorSheet}
 */
export class CreatureActorSheet extends ActorSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["hp", "sheet", "actor", "creature"],
      template: "systems/harry-potter-jdr/templates/actors/creature-sheet.html",
      width: 1020,
      height: 720,
      tabs: [
        {navSelector: ".sheet-tabs", contentSelector: ".body", initial: "personnage"},
        {navSelector: ".sheet-capacitessortileges", contentSelector: ".capacitessortileges", initial: "listcapacite"},
      ],
      dragDrop: [{dragSelector: [".draggable"], dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData() {
    const context = super.getData();

    await this._prepareCharacterItems(context);

    const {data} = context
    const system = data.system;

    context.systemData = system;

    console.warn(context);

    return context;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
   get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/harry-potter-jdr/templates/actors/limited-creature-sheet.html";
    }
    return this.options.template;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    toggler.init(this.id, html);

    menu(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    html.find('img.options').hover(ev => {
      $(ev.currentTarget).attr("src", "systems/harry-potter-jdr/assets/icons/optionWhite.svg");
    }, ev => {
      const main = $(ev.currentTarget).parents('.js-simpletoggler');
      const siblings = main.siblings();

      if(!$(siblings[0]).is(':visible')) {
        $(ev.currentTarget).attr("src", "systems/harry-potter-jdr/assets/icons/optionBlack.svg");
      }
    });

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.item-edit').click(ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));

      item.sheet.render(true);
    });

    html.find('.item-delete').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const id = header.data("item-id");
      const item = this.actor.items.get(id);
      const actor = this.actor;

      if(!await confirmationDialog('delete')) return;
      const effect = actor.effects.find(itm => itm.origin === `Actor.${actor._id}.Item.${id}`);
      let update = {};

      if(effect) {
        const change = effect.changes;
        const custom = change.filter(itm => itm.key.includes('custom'));

        for(let c of custom) {
          const split = c.key.split('.');

          if(!update?.[`system.competences.custom`]) {
            update[`system.competences.custom`] = actor.system.competences.custom.filter(itm => !itm.origin.includes(effect.origin));
          }
        }
      }

      if(!foundry.utils.isEmpty(update)) this.actor.update(update);

      item.delete();
      header.slideUp(200, () => this.render(false));
    });

    html.find('div.capacites .sendchat').click(async ev => {
      const chatRollMode = game.settings.get("core", "rollMode");
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const label = tgt.data("label");
      const items = this.actor.items;
      const itm = items.get(id);

      let main = {
        header:label,
        msg:await enrichDescription(itm),
        class:'justify'
      }

      let chatData = {
          user:game.user.id,
          speaker: {
            actor: this.actor?.id ?? null,
            token: this.actor?.token ?? null,
            alias: this.actor?.name ?? null,
            scene: this.actor?.token?.parent?.id ?? null
          },
          content:await renderTemplate('systems/harry-potter-jdr/templates/roll/msg.html', main),
          sound: CONFIG.sounds.dice,
          rollMode:chatRollMode,
          flags:{
            'harry-potter-jdr':{
              roll:true,
            }
          }
      };

      const msg = await ChatMessage.create(chatData);
    });

    html.find('.specialisation i.add').click(async ev => {
      const header = $(ev.currentTarget).parents(".specialisation");
      const key = header.data("key");
      let list = this.actor.system.competences[key].list;
      const add = foundry.utils.mergeObject(this.actor.system.competences[key].modele, {id:foundry.utils.randomID()});
      list.push(add);

      this.actor.update({[`system.competences.${key}.list`]:list});
    });

    html.find('.specialisation i.delete').click(async ev => {
      const tgt = $(ev.currentTarget);
      const header = tgt.parents(".specialisation");
      const key = header.data("key");
      const index = tgt.data("index");
      let list = this.actor.system.competences[key].list;
      list.splice(index, 1);

      if(!await confirmationDialog('delete')) return;

      this.actor.update({[`system.competences.${key}.list`]:list})
    });

    html.find('button.addCmp').click(async ev => {
      let list = this.actor.system.competences.custom;
      let add = foundry.utils.mergeObject(this.actor.system.competences.modele, {id:foundry.utils.randomID()});
      list.push(add)

      this.actor.update({[`system.competences.custom`]:list});
    });

    html.find('button.addCombat').click(async ev => {
      let list = this.actor.system.combat;
      list.push({
        id:foundry.utils.randomID(),
        label:'',
        attaque:0,
        degats:1,
      })

      this.actor.update({[`system.combat`]:list});
    });

    html.find('div.competences .custom i.delete').click(async ev => {
      const tgt = $(ev.currentTarget);
      const index = tgt.data("index");
      let list = this.actor.system.competences.custom;
      list.splice(index, 1);

      if(!await confirmationDialog('delete')) return;

      this.actor.update({[`system.competences.custom`]:list})
    });

    html.find('div.combat i.delete').click(async ev => {
      const tgt = $(ev.currentTarget);
      const index = tgt.data("index");
      let list = this.actor.system.combat;
      list.splice(index, 1);

      if(!await confirmationDialog('delete')) return;

      this.actor.update({[`system.combat`]:list})
    });

    html.find('div.caracteristiques span.roll').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const actor = this.actor;

      prepareRollCaracteristique(id, actor);
    });

    html.find('div.competences .roll').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const actor = this.actor;

      prepareRollCreatureCmp(id, actor);
    });

    html.find('div.combat .roll').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const actor = this.actor;

      prepareRollCombat(id, actor);
    });

    html.find('button.ModSeuil').click(async ev => {
      const data = this.actor.system;

      const content = await renderTemplate('systems/harry-potter-jdr/templates/dialog/dialog-std-sheet.html', {
        data:[
          {
            key:'number',
            label:"HP.EFFETS.Reussite",
            class:'check reussite',
            data:'epicsuccess',
            value:data?.seuils?.epicsuccess?.base ?? 0,
          },
          {
            key:'number',
            label:"HP.EFFETS.Echec",
            class:'check echec',
            data:'epicfail',
            value:data?.seuils?.epicfail?.base ?? 0,
          }
        ]
      });

      let d = new Dialog({
        title: game.i18n.localize("HP.ModificationSeuils"),
        content: content,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("HP.Sauvegarder"),
            callback: (html) => {
              const reussite = html.find('label.check.reussite input').val();
              const echec = html.find('label.check.echec input').val();
              let update = {};
              update['system.seuils.epicsuccess.base'] = reussite;
              update['system.seuils.epicfail.base'] = echec;

              this.actor.update(update);
            }
          },
          two: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("HP.Annuler"),
            callback: () => {}
          }
        },
        render: html => {},
        close: html => {}
       }, {
        classes: ["hp", "sheet", "dialog", "hp", "options", "familier"],
       });
       d.render(true);
    });

    html.find('div.listpouvoirs .roll').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const label = tgt.data("label");
      await prepareRollSortilegeCreature(id.split('_')[1], this.actor);
    });

    html.find('div.listpouvoirs .sendchat').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const label = tgt.data("label");
      const actor = this.actor;
      const items = actor.items;
      const itmSortilege = items.get(id);
      const type = itmSortilege.system.type;
      const sortilegeType = {'e':'enchantements', 's':'mauvaisorts', 'm':'metamorphose'}[type];
      let cibles = [];

      if(itmSortilege.system.cibles.a) cibles.push(`<p title="${game.i18n.localize('HP.Animal')}">${game.i18n.localize('HP.A')}</p>`);
      if(itmSortilege.system.cibles.o) cibles.push(`<p title="${game.i18n.localize('HP.Objet')}">${game.i18n.localize('HP.O')}</p>`);
      if(itmSortilege.system.cibles.p) cibles.push(`<p title="${game.i18n.localize('HP.Personne')}">${game.i18n.localize('HP.P')}</p>`);
      if(itmSortilege.system.cibles.v) cibles.push(`<p title="${game.i18n.localize('HP.Vegetaux')}">${game.i18n.localize('HP.V')}</p>`);

      let malus = `${game.i18n.localize('HP.SORTILEGES.FormuleClassique-short')} : ${itmSortilege.system.malus.fc}%`

      if(itmSortilege.system.malus.fe.has && itmSortilege.system.malus.fe.fc.reduction) {
        malus += `<br/>${game.i18n.localize('HP.SORTILEGES.FormuleExtreme-short')} : ${itmSortilege.system.malus.fe.fc.malus}% / ${itmSortilege.system.malus.fe.malus}%`;
      } else if(itmSortilege.system.malus.fe.has) {
        malus += `<br/>${game.i18n.localize('HP.SORTILEGES.FormuleExtreme-short')} : ${itmSortilege.system.malus.fe.malus}%`
      }

      const sortilege = {
        cibles:cibles.join(' / '),
        niveau:itmSortilege.system.niveau,
        type:localizeScolaire(sortilegeType),
        malus:malus,
        description:await enrichDescription(itmSortilege)
      }

      const chatRollMode = game.settings.get("core", "rollMode");

      let main = {
        header:label,
        sortilege
      }

      let chatData = {
          user:game.user.id,
          speaker: {
              actor: actor?.id ?? null,
              token: actor?.token ?? null,
              alias: actor?.name ?? null,
              scene: actor?.token?.parent?.id ?? null
          },
          content:await renderTemplate('systems/harry-potter-jdr/templates/roll/std.html', main),
          sound: CONFIG.sounds.dice,
          rollMode:chatRollMode,
          flags:{
            'harry-potter-jdr':{
              roll:true,
            }
          }
      };

      const msg = await ChatMessage.create(chatData);
    });

    html.find('.fe-appris').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const value = tgt.data("value");
      let result = true;
      if(value) result = false;

      this.actor.items.get(id).update({['system.malus.fe.appris']:result});
    });

    html.find('a.rollCaracteristique').click(async ev => {
      const tgt = $(ev.currentTarget);
      const caracteristique = tgt.data("caracteristique");
      const modifier = tgt.data("modifier");
      const actor = this.actor;

      prepareRollCaracteristique(`caracteristique_${caracteristique}`, actor, modifier);
    });

    html.find('a.rollCompetence').click(async ev => {
      const tgt = $(ev.currentTarget);
      const cmp = tgt.data("competence");
      const split = cmp.split('_');
      const modifier = tgt.data("modifier");
      const actor = this.actor;

      if(split[0].includes(actor.type)) {
        await prepareRollCreatureCmp(split[1], actor, modifier);
      }
    });

    html.find('.wpn i.roll').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id").split('_')[1];

      prepareRollDegats(this.actor, id);
    });

    html.find('.protection span.eqp').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const id = header.data("item-id");
      const item = this.actor.items.get(id);
      const wear = item.system.wear;
      const newValue = wear ? false : true;
      let update = [];

      update.push({
        _id:id,
        'system.wear':newValue,
      });

      if(newValue) {
        for(let itm of this.actor.items.filter(itm => itm.type === 'protection' && itm._id !== id && itm.system.wear && itm.system.bouclier === item.system.bouclier)) {
          update.push({
            _id:itm._id,
            'system.wear':false,
          });
        }
      }

      this.actor.updateEmbeddedDocuments('Item', update);
    });

    html.find('.protection i.sendchat').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const actor = this.actor;
      const items = actor.items;
      const itm = items.get(id);

      const data = {
        armure:itm.system.armure,
        description:await enrichDescription(itm)
      }

      const chatRollMode = game.settings.get("core", "rollMode");

      let main = {
        header:itm.name,
        protection:data
      }

      let chatData = {
          user:game.user.id,
          speaker: {
              actor: actor?.id ?? null,
              token: actor?.token ?? null,
              alias: actor?.name ?? null,
              scene: actor?.token?.parent?.id ?? null
          },
          content:await renderTemplate('systems/harry-potter-jdr/templates/roll/std.html', main),
          sound: CONFIG.sounds.dice,
          rollMode:chatRollMode,
          flags:{
            'harry-potter-jdr':{
              roll:true,
            }
          }
      };

      const msg = await ChatMessage.create(chatData);
    });

    html.find('button.generation').click(async ev => {
      const tgt = $(ev.currentTarget);
      const value = tgt.data("value") ? false : true;

      this.actor.update({[`system.generation`]:value})
    });

    html.find('i.rollGenerationCaracteristique').click(async ev => {
      const chatRollMode = game.settings.get("core", "rollMode");
      const tgt = $(ev.currentTarget);
      const jet = tgt.data("jet");
      const key = tgt.data("key");
      const actor = this.actor;
      const roll = new Roll(jet);
      await roll.evaluate();
      let rollTotal = roll.total;

      let main = {
        header:game.i18n.localize(`HP.Generation${capitalizeFirstLetter(key)}`),
        tooltip:await roll.getTooltip(),
        label:game.i18n.format(`HP.SetBase${capitalizeFirstLetter(key)}`, {value:rollTotal}),
      }

      let chatData = {
        user:game.user.id,
        speaker: {
            actor: actor?.id ?? null,
            token: actor?.token ?? null,
            alias: actor?.name ?? null,
            scene: actor?.token?.parent?.id ?? null
        },
        content:await renderTemplate('systems/harry-potter-jdr/templates/roll/std.html', main),
        sound: CONFIG.sounds.dice,
        rolls:[roll],
        flags:{
          'harry-potter-jdr':{
            roll:true,
          }
        },
        rollMode:chatRollMode,
    };

    const msg = await ChatMessage.create(chatData);

    actor.update({[`system.caracteristiques.${key}.base`]:rollTotal});
  });
  }

  async _prepareCharacterItems(actorData) {
    const actor = actorData.actor;
    const items = actorData.items;
    const effects = actorData.effects;
    const data = this.actor.system;
    const cfgCompetences = actor.type === 'familier' ? CONFIG.HP.competencesfamilier : CONFIG.HP.competencescreatures;
    const dataCompetence = data.competences;
    const competences = Object.keys(dataCompetence).filter(c => Object.keys(cfgCompetences).includes(c) || c === 'custom');
    let listCompetences = [];
    let capacites = [];
    let sortilege = [];
    let inventaire = [];
    let baguettes = [];
    let balais = [];
    let armes = [];
    let protections = [];

    actor.enriched = await TextEditor.enrichHTML(actor.system.description);
    await enrichItems(items);

    for (let i of items) {
      const type = i.type;
      const data = i.system;

      switch(type) {
        case 'capacite':
        case 'capacitefamilier':
          capacites.push(i);
          break;

        case 'sortilege':
          sortilege.push(i);
          break;

          case "objet":
            inventaire.push(i);
            break;

          case "balai":
            balais.push(i);
            break;

          case "arme":
            armes.push(i);
            break;

          case "protection":
            protections.push(i);
            break;

          case "baguette":
            const tra = foundry.utils.mergeObject(CONFIG.HP.communes, CONFIG.HP.particulieres);
            let allData = i;

            allData.system.affinite.label = allData.system.affinite.key ? `${game.i18n.localize(tra[allData.system.affinite.key])} (${allData.system.affinite.value}%)` : '';

            baguettes.push(allData);
            break;
      }
    };

    for (let e of effects) {
      const changes = e.changes;
      const addCustom = changes.filter(itm => itm.key.includes('custom'));
      let existIndex = -1;

      for(let ac of addCustom) {
        existIndex = data.competences.custom.findIndex(itm => itm.origin.includes(`${e.origin}.${ac.key}`));

        if(existIndex < 0) {
          let add = data.competences.custom;
          add.push(foundry.utils.mergeObject(data.competences.modele, {origin:`${e.origin}.${ac.key}`, label:ac.value}));
        } else if(existIndex >= 0) {
          data.competences.custom[existIndex].label = ac.value;
        }
      }
    };

    listCompetences = Object.keys(competences).map(c => ({
      key: competences[c],
      label: competences[c] === 'custom' ? c : game.i18n.localize(`HP.COMPETENCES.${capitalizeFirstLetter(competences[c])}`),
      specialisation:cfgCompetences[competences[c]]?.specialisation,
      data: dataCompetence[competences[c]]
    })).sort((a, b) => {
      if (a.key === 'custom') return 1;
      if (b.key === 'custom') return -1;
      return a.label.localeCompare(b.label);
    });

    const [firstCmp, secondCmp] = splitArrayInHalf(listCompetences);

    actor.listCompetencesFirst = firstCmp;
    actor.listCompetencesSecond = secondCmp;
    actor.listCombat = data.combat;
    actor.capacites = capacites;
    actor.sortileges = sortilege;
    actor.inventaire = inventaire;
    actor.baguettes = baguettes;
    actor.balais = balais;
    actor.armes = armes;
    actor.protections = protections;
  }

  /* -------------------------------------------- */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    const filtre = this.actor.type === 'familier' ? CONFIG.HP.ItemsInterdits.familier : CONFIG.HP.ItemsInterdits.creature

    if(filtre.includes(type)) return
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `${game.i18n.localize(`TYPES.Item.${type}`)}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
      img: getDefaultImg(type)
    };


    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  async _onDropItemCreate(itemData) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    const itemBaseType = itemData[0].type;
    const filtre = this.actor.type === 'familier' ? CONFIG.HP.ItemsInterdits.familier : CONFIG.HP.ItemsInterdits.creature

    if(filtre.includes(itemBaseType)) return;

    const itemCreate = await this.actor.createEmbeddedDocuments("Item", itemData);

    return itemCreate;
  }


  /** @inheritdoc */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ( event.target.classList.contains("content-link") ) return;

    // Create drag data
    let dragData;

    // Owned Items
    if ( li.dataset.itemId ) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    // Active Effect
    if ( li.dataset.effectId ) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }


    if(li.classList.contains('roll') || li.classList.contains('rolldgts')) {
      const label = $(li)?.data("label") || "";
      const id = $(li)?.data("id");

      // Create drag data
      dragData = {
        actorId: this.actor.id,
        sceneId: this.actor.isToken ? canvas.scene?.id : null,
        tokenId: this.actor.isToken ? this.actor.token.id : null,
        label:label,
        id:id
      };

      console.warn(dragData);

      if(id.split('_')[0] === 'itm') dragData.img = this.actor.items.get(id.split('_')[1]).img;
    }

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }
}