  /**
   * @extends {ItemSheet}
   */
  export class SortilegeItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "item", "sortilege"],
        template: "systems/harry-potter-jdr/templates/items/sortilege-sheet.html",
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

      html.find('.addFE').click(async ev => {
        let list = this.item.system.malus.fe;
        list.push(0)

        this.item.update({[`system.malus.fe`]:list})
      });

      html.find('i.delete').click(async ev => {
        const tgt = $(ev.currentTarget);
        const index = tgt.data("index");
        let list = this.item.system.malus.fe;
        list.splice(index, 1);

        this.item.update({[`system.malus.fe`]:list})
      });

      html.find('div.cible div').click(async ev => {
        const tgt = $(ev.currentTarget);
        const cible = tgt.data("cible");
        const value = this.item.system.cibles[cible];
        let result = true;
        if(value) result = false;

        this.item.update({[`system.cibles.${cible}`]:result})
      });

      html.find('.btnHasFE').click(async ev => {
        const tgt = $(ev.currentTarget);
        const value = tgt.data("value");
        let result = true;
        if(value) result = false;

        this.item.update({[`system.malus.fe.has`]:result});
      });

      html.find('.btnHasFC').click(async ev => {
        const tgt = $(ev.currentTarget);
        const value = tgt.data("value");
        let result = true;
        if(value) result = false;

        this.item.update({[`system.malus.fe.fc.reduction`]:result});
      });
    }

    async _prepareData(itemData) {
      const item = itemData.item;
      const enchantement = game.settings.get('harry-potter-jdr', `enchantements-singulier`) ? game.settings.get('harry-potter-jdr', `enchantements-singulier`) : game.i18n.localize('HP.COMPETENCES.Enchantements-singulier');
      const enchantementAB = game.settings.get('harry-potter-jdr', `enchantements-abreviation`) ? game.settings.get('harry-potter-jdr', `enchantements-abreviation`) : game.i18n.localize('HP.COMPETENCES.Enchantements-abreviation');
      const mauvaisort = game.settings.get('harry-potter-jdr', `mauvaisorts`) ? game.settings.get('harry-potter-jdr', `mauvaisorts`) : game.i18n.localize('HP.COMPETENCES.Mauvaisorts');
      const mauvaisortAB = game.settings.get('harry-potter-jdr', `mauvaisorts-abreviation`) ? game.settings.get('harry-potter-jdr', `mauvaisorts-abreviation`) : game.i18n.localize('HP.COMPETENCES.Mauvaisorts-abreviation');
      const metamorphose = game.settings.get('harry-potter-jdr', `metamorphose`) ? game.settings.get('harry-potter-jdr', `metamorphose`) : game.i18n.localize('HP.COMPETENCES.Metamorphose');
      const metamorphoseAB = game.settings.get('harry-potter-jdr', `metamorphose-abreviation`) ? game.settings.get('harry-potter-jdr', `metamorphose-abreviation`) : game.i18n.localize('HP.COMPETENCES.Metamorphose-abreviation');

      item.listtype = {
        'e':`${enchantement} (${enchantementAB})`,
        's':`${mauvaisort} (${mauvaisortAB})`,
        'm':`${metamorphose} (${metamorphoseAB})`,
      };
    }
  }