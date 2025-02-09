  /**
   * @extends {ItemSheet}
   */
  export class IngredientItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["hp", "sheet", "item", "ingredient"],
        template: "systems/harry-potter-jdr/templates/items/ingredient-sheet.html",
        width: 850,
        height: 380,
        dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
      });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async getData() {
      const context = super.getData();
      this._prepareData(context);

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

      // Everything below here is only needed if the sheet is editable
      if ( !this.isEditable ) return;
    }

    async _prepareData(itemData) {
      const item = itemData.item;

      item.listrarete = {
        'communs':`HP.Communs`,
        'rares':`HP.Rares`,
        'rarissimes':`HP.Rarissimes`,
      };
    }

    /** @inheritdoc */
    async _updateObject(event, formData) {
      if ( !this.object.id ) return;
      const parent = this.item.flags?.['harry-potter-jdr']?.parent;

      if(!parent) return super._updateObject(event, formData);
      const getItm = await fromUuid(parent);

      if(!getItm) return;

      const getAllIngredient = getItm.system.ingredients.items;
      let getIngredient = getAllIngredient.find(itm => itm._id === this.item.id)

      let update = {};
      getIngredient.name = formData.name;
      getIngredient.img = formData.img;
      getIngredient.system.rarete = formData?.['system.rarete'] ?? 'communs';
      getIngredient.system.description = formData?.['system.description'] ?? this.item.system.description;

      update['system.ingredients.items'] = getAllIngredient;
      await getItm.update(update);

      this.item.system.description = formData?.['system.description'] ?? this.item.system.description;
    }
  }