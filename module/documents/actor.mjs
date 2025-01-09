import {
    getDefaultImg,
  } from "../helpers/common.mjs";
  
  /**
   * Extend the base Actor document to support attributes and groups with a custom template creation dialog.
   * @extends {Actor}
   */
  export class HPActor extends Actor {
  
    /**
       * Create a new entity using provided input data
       * @override
       */
    static async create(data, context={}) {
      if (data.img === undefined) data.img = getDefaultImg(data.type);
  
      const createData = data instanceof Array ? data : [data];
      const created = await this.createDocuments(createData, context);
      return data instanceof Array ? created : created.shift();
    }
  
    /** @override */
    prepareData() {
      // Prepare data for the actor. Calling the super version of this executes
      // the following, in order: data reset (to clear active effects),
      // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
      // prepareDerivedData().
      super.prepareData();
    }
  
    prepareDerivedData() {
      const actorData = this;
    }
  }