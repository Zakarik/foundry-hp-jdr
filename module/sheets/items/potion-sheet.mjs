import { getDefaultImg } from "../../helpers/common.mjs";

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
    async getData() {
      const context = super.getData();

      this._prepareData(context);

      context.systemData = context.data.system;
      context.systemData.effets = await TextEditor.enrichHTML(context.item.system.effets, {async: true});

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
        const id = foundry.utils.randomID();
        const itm = this.item.system.ingredients.items;
        itm.push({
          _id:id,
          img:getDefaultImg('ingredient'),
          name:game.i18n.localize('TYPES.Item.ingredient'),
          system:{
            type:'communs',
            description:'',
            enriched:'',
          }
        });

        this.item.update({[`system.ingredients.items`]:itm});
      });

      html.find('i.edit').click(async ev => {
        const tgt = $(ev.currentTarget);
        const id = tgt.data("id");
        const itm = new game.hp.documents.HPItem(foundry.utils.mergeObject({
          ownership:this.item.ownership,
          type:'ingredient',
          flags:{
            'harry-potter-jdr':{
              'parent':this.item.uuid
            }
          }
        }, this.item.system.ingredients.items.find(itm => itm._id === id)));

        itm.sheet.render(true);
      });

      html.find('i.delete').click(async ev => {
        const tgt = $(ev.currentTarget);
        const id = tgt.data("id");
        let item = this.item.system.ingredients.items;
        let itmIndex = item.findIndex(itm => itm._id === id);
        item.splice(itmIndex, 1);
        let update = {};
        update[`system.ingredients.items`] = item;

        await this.item.update(update)
      });

      html.find('div.ingredients div.liste div.main, div.ingredients div.liste div.hovered').on("mouseenter", ev => {
        $(ev.currentTarget).find('.hovered').addClass('show');
      });

      html.find('div.ingredients div.liste div.main, div.ingredients div.liste div.hovered').on("mouseleave", ev => {
        $(ev.currentTarget).find('.hovered').removeClass('show');
      });
    }

    async _prepareData(itemData) {
      const item = itemData.item;
      const ingredients = item.system.ingredients.items;

      item.listtypeingredients = {
        'communs':`HP.Communs`,
        'rares':`HP.Rares`,
        'rarissimes':`HP.Rarissimes`,
      };

      for(let i of ingredients) {
        i.system.enriched = await TextEditor.enrichHTML(i.system.description);
      }
    }

    /**
    * Event handler for the drop portion of a drag-and-drop event.
    * @param {DragEvent} event  The drag event being dropped onto the canvas
    * @private
    */
    async _onDrop(event) {
      event.preventDefault();
      const data = TextEditor.getDragEventData(event);
      if ( !data.type ) return;
      if ( data.type !== 'Item') return;
      const itm = await fromUuid(data.uuid);
      const id = foundry.utils.randomID();
      const listItm = this.item.system.ingredients.items;
      listItm.push({
        _id:id,
        img:itm.img,
        name:itm.name,
        system:{
          type:itm.system.type,
          description:itm.system.description,
          enriched:'',
        }
      });

      this.item.update({[`system.ingredients.items`]:listItm});
    }
  }