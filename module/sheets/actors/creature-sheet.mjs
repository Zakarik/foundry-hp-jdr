import {
    getDefaultImg,
    menu,
    confirmationDialog,
    prepareRollCreatureCmp,
    prepareRollCaracteristique,
    prepareRollCombat,
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
      ],
      dragDrop: [{dragSelector: [".draggable"], dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    this._prepareCharacterItems(context);

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
        msg:itm.system.description,
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
      };

      const msg = await ChatMessage.create(chatData);

      msg.setFlag('harry-potter-jdr', 'hp', true);
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
  }

  async _prepareCharacterItems(actorData) {
    const actor = actorData.actor;
    const items = actorData.items;
    const effects = actorData.effects;
    const data = this.actor.system;
    const competences = data.competences;
    let listCompetences = [];
    let capacites = [];

    for (let i of items) {
      const type = i.type;
      const data = i.system;

      switch(type) {
        case 'capacite':
          capacites.push(i);
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

    listCompetences = Object.keys(competences).filter(c => c !== 'modele').map(c => ({
      key: c,
      label: c === 'custom' ? c : game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`),
      data: competences[c]
    })).sort((a, b) => {
      if (a.label === 'custom') return 1;
      if (b.label === 'custom') return -1;
      return a.label.localeCompare(b.label);
    });

    actor.listCompetences = listCompetences;
    actor.listCombat = data.combat;
    actor.capacites = capacites;
  }

  /* -------------------------------------------- */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;

    if(CONFIG.HP.ItemsInterdits.familier.includes(type)) return
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
    const actorData = this.getData().data.system;

    itemData = itemData instanceof Array ? itemData : [itemData];
    const itemBaseType = itemData[0].type;

    if(CONFIG.HP.ItemsInterdits.familier.includes(itemBaseType)) return;

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