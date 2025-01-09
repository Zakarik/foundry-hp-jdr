import {
  confirmationDialog,
  menu,
} from "../../helpers/common.mjs";

  /**
   * @extends {ItemSheet}
   */
  export class AvDvItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "item", "avdv"],
        template: "systems/harry-potter-jdr/templates/items/avdv-sheet.html",
        width: 850,
        height: 580,
        tabs: [
          {navSelector: ".sheet-tabs", contentSelector: ".body", initial: "description"},
        ],
        dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
      });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    getData() {
      const context = super.getData();

      context.item.optionseffects = this._setListEffects();

      context.systemData = context.data.system;

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

        if(key.includes('addspe')) {
          const split = key.split('.');
          const domain = split[1];
          const cmp = split[2];

          itemUpdate.push({
            _id:effects._id,
            img:'',
            changes:effects.changes.filter(itm => !itm.key.includes(key)),
            name:this.item.name
          })

          if(actor) {
            const actorEffects = actor.effects.find(itm => itm.origin === `Actor.${actor._id}.Item.${this.item._id}`);

            update[`system.competences.${domain}.${cmp}.list`] = actor.system.competences[domain][cmp].list.filter(itm => !itm.origin.includes(key));

            actorUpdate.push({
              _id:actorEffects._id,
              img:'',
              changes:effects.changes.filter(itm => !itm.key.includes(key)),
              name:this.item.name
            })
          }
        }

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

      if(this.item.actor) {
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
      const competences = CONFIG.HP.competences;
      let result = {}

      result[''] = '';

      for(let c in caracteristiques) {
        result[`system.caracteristiques.${c}.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Caracteristique', {name:game.i18n.localize(caracteristiques[c])});
      }

      for(let c in competences.generales) {
        const data = competences.generales[c];
        const name = game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`);

        if(data.specialisation) {
          result[`addspe.generales.${c}`] = game.i18n.format('HP.EFFETS.AjouterCompetence', {name});
        } else {
          result[`system.competences.generales.${c}.base.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.CompetenceGeneraleBase', {name});
          result[`system.competences.generales.${c}.max.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.CompetenceGeneraleMax', {name});
        }
      }

      for(let c in competences.sorciers) {
        const data = competences.sorciers[c];
        const name = game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`);

        if(data.specialisation) {
          result[`addspe.sorciers.${c}`] = game.i18n.format('HP.EFFETS.AjouterCompetence', {name:`${name} (${game.i18n.localize('HP.Sorcier')})`});
        } else {
          result[`system.competences.sorciers.${c}.base.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.CompetenceSorcierBase', {name});
          result[`system.competences.sorciers.${c}.max.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.CompetenceSorcierMax', {name});
        }
      }

      for(let c in competences.scolaires) {
        const data = competences.scolaires[c];
        const name = game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`);

        if(data.specialisation) {
          result[`addspe.scolaires.${c}`] = game.i18n.format('HP.EFFETS.AjouterCompetence', {name});
        } else {
          result[`system.competences.scolaires.${c}.base.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.CompetenceScolaireBase', {name});
          result[`system.competences.scolaires.${c}.max.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.CompetenceScolaireMax', {name});
        }

      }

      for(let c in competences.moldus) {
        const data = competences.moldus[c];
        const name = game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`);

        if(data.specialisation) {
          result[`addspe.moldus.${c}`] = game.i18n.format('HP.EFFETS.AjouterCompetence', {name:`${name} (${game.i18n.localize('HP.Moldu')})`});
        } else {
          result[`system.competences.moldus.${c}.base.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.CompetenceMolduBase', {name});
          result[`system.competences.moldus.${c}.max.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.CompetenceMolduMax', {name});
        }
      }

      result[`custom.generales`] = game.i18n.format('HP.EFFETS.AjouterCompetence', {name:game.i18n.localize('HP.COMPETENCES.CompetencesGenerales')});
      result[`custom.sorciers`] = game.i18n.format('HP.EFFETS.AjouterCompetence', {name:game.i18n.localize('HP.COMPETENCES.CompetencesSorciers')});
      result[`custom.scolaires`] = game.i18n.format('HP.EFFETS.AjouterCompetence', {name:game.i18n.localize('HP.COMPETENCES.CompetencesScolaires')});
      result[`custom.moldus`] = game.i18n.format('HP.EFFETS.AjouterCompetence', {name:game.i18n.localize('HP.COMPETENCES.CompetencesMoldus')});

      result['system.seuils.epicsuccess.mod'] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Reussite')});
      result['system.seuils.epicfail.mod'] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Echec')});
      result[`system.derives.chance.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Chance')});
      result[`system.derives.degats.mod.dice.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.DegatsDes')});
      result[`system.derives.degats.mod.face.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.DegatsFace')});
      result[`system.derives.fougue.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Fougue')});
      result[`system.derives.idee.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.Idee')});
      result[`system.derives.pv.mod.${this.item.type}`] = game.i18n.format('HP.EFFETS.Autre', {name:game.i18n.localize('HP.EFFETS.PV')});

      return result;
    }
  }