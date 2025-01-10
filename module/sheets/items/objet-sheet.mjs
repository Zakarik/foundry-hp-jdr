  /**
   * @extends {ItemSheet}
   */
  export class ObjetItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "item", "objet"],
        template: "systems/harry-potter-jdr/templates/items/objet-sheet.html",
        width: 850,
        height: 380,
        dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
      });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async getData() {
      const context = super.getData();

      context.systemData = context.data.system;
      context.systemData.particularite = await TextEditor.enrichHTML(context.item.system.particularite, {async: true});

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
  }