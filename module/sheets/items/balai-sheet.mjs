import {
  capitalizeFirstLetter,
  localizeScolaire,
} from "../../helpers/common.mjs";

  /**
   * @extends {ItemSheet}
   */
  export class BalaiItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "item", "balai"],
        template: "systems/harry-potter-jdr/templates/items/balai-sheet.html",
        width: 850,
        height: 500,
        dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
      });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    getData() {
      const context = super.getData();

      context.item.listbonus = CONFIG.HP.balai;
      context.item.listcaracteristique = this._prepareListPotentiel('caracteristique');
      context.item.listcompetence = this._prepareListPotentiel('competence');

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

      // Everything below here is only needed if the sheet is editable
      if ( !this.isEditable ) return;

      html.find('.addBonus').click(async ev => {
        let list = this.item.system.bonus.liste;
        list.push({
          key:'autre',
          label:'',
          description:'',
          value:5,
          cout:0
        })

        this.item.update({[`system.bonus.liste`]:list})
      });

      html.find('.deleteBonus').click(async ev => {
        const tgt = $(ev.currentTarget);
        const index = tgt.data("index");
        let list = this.item.system.bonus.liste;
        list.splice(index, 1);

        this.item.update({[`system.bonus.liste`]:list})
      });
    }

    _prepareListPotentiel(type) {
      let result = {
        '':''
      };

      switch(type) {
        case 'caracteristique':
          result = foundry.utils.mergeObject(result, Object.entries(CONFIG.HP.caracteristiques).reduce((acc, [key, value]) => {
            acc[key] = game.i18n.localize(value);
            return acc;
          }, {}));
          break;
        case 'competence':
          const list = CONFIG.HP.competences;

          for(let c in list) {
            let str = `competences_${c}`;

            for(let inC in list[c]) {
              if(inC === 'connaissance') result[`${str}_${inC}`] = `${game.i18n.localize(`HP.COMPETENCES.Competence${capitalizeFirstLetter(c)}`)} : ${game.i18n.localize(localizeScolaire(inC))}`;
              else result[`${str}_${inC}`] = `${game.i18n.localize(`HP.COMPETENCES.Competence${capitalizeFirstLetter(c)}`)} : ${game.i18n.localize(localizeScolaire(inC))}`;
            }
          }
          break;
      }

      return result;
    }
  }