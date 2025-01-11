  /**
   * @extends {ItemSheet}
   */
  export class ArmeItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "item", "arme"],
        template: "systems/harry-potter-jdr/templates/items/arme-sheet.html",
        width: 850,
        height: 380,
        dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
      });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async getData() {
      const context = super.getData();

      context.item.adddmg = {
        0:"HP.NoDegatsSupplmentaire",
        0.5:"HP.DemiDegatsSupplmentaire",
        1:"HP.TotalDegatsSupplmentaire",
      }

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

      html.find('button.checkdistance').click(async ev => {
        const distance = this.item.system.distance;
        const value = distance ? false : true;

        this.item.update({['system.distance']:value});
      });
    }
  }