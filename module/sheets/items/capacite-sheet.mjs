  import {
    confirmationDialog,
    menu,
  } from "../../helpers/common.mjs";

  /**
   * @extends {ItemSheet}
   */
  export class CapaciteItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "item", "capacite"],
        template: "systems/harry-potter-jdr/templates/items/capacite-sheet.html",
        width: 850,
        height: 500,
        dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
        tabs: [
          {navSelector: ".sheet-tabs", contentSelector: ".body", initial: "effets"},
        ],
      });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async getData() {
      const context = super.getData();

      context.item.optionseffects = this._setListEffects();

      context.systemData = context.data.system;
      context.systemData.description = await TextEditor.enrichHTML(context.item.system.description, {async: true});

      console.warn(context);

      return context;
    }

    /**
       * Return a light sheet if in "limited" state
       * @override
       */
     get template() {

      return this.options.template;
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    activateListeners(html) {
      super.activateListeners(html);

      menu(html);

      // Everything below here is only needed if the sheet is editable
      if ( !this.isEditable ) return;

      html.find('button.addEffets').click(async ev => {
        const effects = this.item.system.effets;
        effects.push({
          key:'',
          value:0,
          mode:CONST.ACTIVE_EFFECT_MODES.ADD,
        });

        this.item.update({['system.effets']:effects});
      });

      html.find('i.deleteEffets').click(async ev => {
        const tgt = $(ev.currentTarget);
        const index = tgt.data("index");
        let list = this.item.system.effets;

        if(!await confirmationDialog('delete')) return;
        const effects = this.item.effects.contents[0];
        const actor = this.item.actor;
        const key = list[index].key;
        let update = {};
        let itemUpdate = [];
        let actorUpdate = [];

        if(key.includes('custom')) {
          const split = key.split('.');
          const domain = split[1];
          const cmp = split[2];

          itemUpdate.push({
            _id:effects._id,
            img:'',
            changes:effects.changes.filter(itm => !itm.key.includes(key)),
            name:this.item.name
          });

          if(actor) {
            const actorEffects = actor.effects.find(itm => itm.origin === `Actor.${actor._id}.Item.${this.item._id}`);

            update[`system.competences.${domain}.custom`] = actor.system.competences[domain].custom.filter(itm => !itm.origin.includes(key));

            actorUpdate.push({
              _id:actorEffects._id,
              img:'',
              changes:effects.changes.filter(itm => !itm.key.includes(key)),
              name:this.item.name
            })
          }
        }

        if(itemUpdate.length > 0) this.item.updateEmbeddedDocuments("ActiveEffect", itemUpdate);
        if(actorUpdate.length > 0) actor.updateEmbeddedDocuments("ActiveEffect", actorUpdate);

        list.splice(index, 1);
        this.item.update({['system.effets']:list});

        if(!foundry.utils.isEmpty(update)) this.item.actor.update(update);
      });
    }

    /** @inheritdoc */
    async close(options={}) {
      super.close(options);
      if(!this.isEditable) return;

      const version = game.version.split('.')[0];
      const effects = this.item.effects.contents[0];
      const dataEffects = this.item.system.effets;

      if(effects) {
          this.item.updateEmbeddedDocuments("ActiveEffect", [{
          _id:effects._id,
          img:'',
          changes:dataEffects,
          name:this.item.name
        }]);
      } else {
        this.item.createEmbeddedDocuments("ActiveEffect", [{
          img:'',
          changes:dataEffects,
          name:this.item.name,
          parent:this.item._id
        }]);
      }

      if(this.item.actor && version <= 12) {
        const actorEffects = this.item.actor.effects.find(itm => itm.origin === `Actor.${this.actor._id}.Item.${this.item._id}`);

        if(actorEffects) {
          this.item.actor.updateEmbeddedDocuments("ActiveEffect", [{
            _id:actorEffects._id,
            img:'',
            changes:dataEffects,
            name:this.item.name
          }]);
        } else {
          this.item.actor.createEmbeddedDocuments("ActiveEffect", [{
            img:'',
            changes:dataEffects,
            origin:`Actor.${this.item.actor._id}.Item.${this.item._id}`,
            transfer:true,
            name:this.item.name,
            parent:this.item._id
          }]);
        }
      }
    }

    _setListEffects() {
      const caracteristiques = CONFIG.HP.caracteristiques;
      const competences = CONFIG.HP.competencescreatures;
      let result = {}

      result[''] = '';

      for(let c in caracteristiques) {
        result[`system.caracteristiques.${c}.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Caracteristique', {name:game.i18n.localize(caracteristiques[c])});
      }

      for(let c in competences) {
        const name = game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`);

        result[`system.competences.${c}.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Competence', {name});
      }

      result[`custom`] = game.i18n.localize('HP.EFFETS.AjouterCompetenceSimple');

      result['system.seuils.epicsuccess.mod'] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Reussite')});
      result['system.seuils.epicfail.mod'] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Echec')});
      result[`system.derives.chance.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Chance')});
      result[`system.derives.idee.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Idee')});
      result[`system.derives.pv.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.PV')});
      result[`system.derives.armure.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Armure')});
      result[`system.derives.mouvement.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Mouvement')});
      result[`system.initiative`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Initiative')});

      return result;
    }
  }