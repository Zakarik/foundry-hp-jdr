  /**
   * @extends {ItemSheet}
   */
  export class PotionItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "item", "potion"],
        template: "systems/harry-potter-jdr/templates/items/potion-sheet.html",
        width: 850,
        height: 580,
        dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
      });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    getData() {
      const context = super.getData();

      this._prepareData(context);

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

      html.find('div.cible div').click(async ev => {
        const tgt = $(ev.currentTarget);
        const cible = tgt.data("cible");
        const value = this.item.system.cibles[cible];
        let result = true;
        if(value) result = false;

        this.item.update({[`system.cibles.${cible}`]:result})
      });

      html.find('.addIngredient').click(async ev => {
        let list = this.item.system.ingredients.liste;
        list.push('')

        this.item.update({[`system.ingredients.liste`]:list})
      });

      html.find('i.delete').click(async ev => {
        const tgt = $(ev.currentTarget);
        const index = tgt.data("index");
        let list = this.item.system.ingredients.liste;
        list.splice(index, 1);

        this.item.update({[`system.ingredients.liste`]:list})
      });
    }

    async _prepareData(itemData) {
      const item = itemData.item;

      item.listtypeingredients = {
        'communs':`HP.Communs`,
        'rares':`HP.Rares`,
        'rarissimes':`HP.Rarissimes`,
      };
    }
  }