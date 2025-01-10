  /**
   * @extends {ItemSheet}
   */
  export class BaguetteItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "item", "baguette"],
        template: "systems/harry-potter-jdr/templates/items/baguette-sheet.html",
        width: 850,
        height: 500,
        dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
      });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async getData() {
      const context = super.getData();

      context.item.affinite = this._getAffinites();

      context.systemData = context.data.system;
      context.systemData.description = await TextEditor.enrichHTML(context.item.system.description, {async: true});

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
    }

    _getAffinites() {
      const communes = CONFIG.HP.communes;
      const particulieres = CONFIG.HP.particulieres;
      let list = {};
      list[''] = '';

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

      return list;
    }
  }