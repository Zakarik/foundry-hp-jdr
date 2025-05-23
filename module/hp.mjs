// Import document classes.
import { HPActor } from "./documents/actor.mjs";
import { HPItem } from "./documents/item.mjs";

// Import sheet classes.
import { SorcierActorSheet } from "./sheets/actors/sorcier-sheet.mjs";
import { CreatureActorSheet } from "./sheets/actors/creature-sheet.mjs";
import { AvDvItemSheet } from "./sheets/items/avdv-sheet.mjs";
import { SortilegeItemSheet } from "./sheets/items/sortilege-sheet.mjs";
import { PotionItemSheet } from "./sheets/items/potion-sheet.mjs";
import { ObjetItemSheet } from "./sheets/items/objet-sheet.mjs";
import { BaguetteItemSheet } from "./sheets/items/baguette-sheet.mjs";
import { BalaiItemSheet } from "./sheets/items/balai-sheet.mjs";
import { CapaciteItemSheet } from "./sheets/items/capacite-sheet.mjs";
import { ArmeItemSheet } from "./sheets/items/arme-sheet.mjs";
import { ProtectionItemSheet } from "./sheets/items/protection-sheet.mjs";
import { IngredientItemSheet } from "./sheets/items/ingredient-sheet.mjs";
import { compendium } from "./sheets/compendium-sheet.mjs";

// Import helper/utility classes and constants.
import { RegisterHandlebars } from "./helpers/handlebars.mjs";
import { HP } from "./helpers/config.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { rolldataHtmlEnricher } from "./helpers/enricher.mjs";
import { registerSystemSettings } from "./settings.mjs";
import { TextEditorMenu } from './helpers/textEditorMenu.mjs';
import HooksHP from "./hooks.mjs";
import {
  prepareRollSorcierCmp,
  prepareRollCaracteristique,
  prepareRollSortilege,
  prepareRollPotion,
  prepareRollDegats,
  prepareRollCreatureCmp,
  prepareRollCombat,
  generateNavigator,
} from "./helpers/common.mjs";

// MODELS
import { SorcierDataModel } from "./documents/models/actors/sorcier-data-model.mjs";
import { CreatureDataModel } from "./documents/models/actors/creature-data-model.mjs";
import { AvDvDataModel } from "./documents/models/items/avdv-data-model.mjs";
import { SortilegeDataModel } from "./documents/models/items/sortilege-data-model.mjs";
import { PotionDataModel } from "./documents/models/items/potion-data-model.mjs";
import { ObjetDataModel } from "./documents/models/items/objet-data-model.mjs";
import { BaguetteDataModel } from "./documents/models/items/baguette-data-model.mjs";
import { BalaiDataModel } from "./documents/models/items/balai-data-model.mjs";
import { CapaciteDataModel } from "./documents/models/items/capacite-data-model.mjs";
import { ArmeDataModel } from "./documents/models/items/arme-data-model.mjs";
import { ProtectionDataModel } from "./documents/models/items/protection-data-model.mjs";
import { IngredientDataModel } from "./documents/models/items/ingredient-data-model.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.hp = {
    applications: {
      SorcierActorSheet,
      AvDvItemSheet,
      SortilegeItemSheet,
      PotionItemSheet,
      ObjetItemSheet,
      BaguetteItemSheet,
      BalaiItemSheet,
      CapaciteItemSheet,
      ArmeItemSheet,
      ProtectionItemSheet,
      IngredientItemSheet,
    },
    documents:{
      HPActor,
      HPItem,
    },
    RollMacro,
  };

  // Add custom constants for configuration.
  CONFIG.HP = HP;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1D6+@caracteristiques.dexterite.total+@initiative",
    decimals: 2
  };
  // Define custom Document classes
  CONFIG.Actor.documentClass = HPActor;
  CONFIG.Item.documentClass = HPItem;

  CONFIG.Actor.dataModels = {
    sorcier:SorcierDataModel,
    familier:CreatureDataModel,
    creature:CreatureDataModel,
  };

  CONFIG.Item.dataModels = {
    coupspouce:AvDvDataModel,
    crochepatte:AvDvDataModel,
    avantage:AvDvDataModel,
    desavantage:AvDvDataModel,
    sortilege:SortilegeDataModel,
    potion:PotionDataModel,
    objet:ObjetDataModel,
    baguette:BaguetteDataModel,
    balai:BalaiDataModel,
    capacite:CapaciteDataModel,
    capacitefamilier:CapaciteDataModel,
    arme:ArmeDataModel,
    protection:ProtectionDataModel,
    ingredient:IngredientDataModel,
  };

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);

  Actors.registerSheet("harry-potter-jdr", SorcierActorSheet, {
    types: ["sorcier"],
    makeDefault: true
  });

  Actors.registerSheet("harry-potter-jdr", CreatureActorSheet, {
    types: ["creature", "familier"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", AvDvItemSheet, {
    types: ["coupspouce", "crochepatte", "avantage", "desavantage"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", SortilegeItemSheet, {
    types: ["sortilege"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", PotionItemSheet, {
    types: ["potion"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", ObjetItemSheet, {
    types: ["objet"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", BaguetteItemSheet, {
    types: ["baguette"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", BalaiItemSheet, {
    types: ["balai"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", CapaciteItemSheet, {
    types: ["capacite", "capacitefamilier"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", ArmeItemSheet, {
    types: ["arme"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", ProtectionItemSheet, {
    types: ["protection"],
    makeDefault: true
  });

  Items.registerSheet("harry-potter-jdr", IngredientItemSheet, {
    types: ["ingredient"],
    makeDefault: true
  });

  // SETTINGS
  registerSystemSettings();

  // HANDLEBARS
  RegisterHandlebars();

  HooksHP.init()

	CONFIG.TextEditor.enrichers.push(rolldataHtmlEnricher);
	TextEditorMenu.initialize();

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

Hooks.once("ready", async function() {
  Hooks.on("hotbarDrop", (bar, data, slot) => createMacro(bar, data, slot));

  if (game.modules.get("babele")?.active && game.i18n.lang !== "fr") {
    Hooks.once("babele.ready", async function () {
      Hooks.on('updateCompendium', async function () {
        await generateNavigator();
      });
    });
  } else {
    Hooks.on('updateCompendium', async function () {
      await generateNavigator();
    });
  }
});

Hooks.on('renderItemDirectory', async function () {
  if (game.modules.get("babele")?.active && game.i18n.lang !== "fr") {
    Hooks.once("babele.ready", async function () {
      await generateNavigator();

      $("section#items footer.action-buttons button.compendium").remove();
      $("section#items footer.action-buttons").append(`<button class='compendium'>${game.i18n.localize('HP.COMPENDIUM.Label')}</button>`);

      $("section#items footer.action-buttons button.compendium").on( "click", async function() {
        const dial = new compendium();
        dial.render(true);
      });
    });
  } else {
    await generateNavigator();

    $("section#items footer.action-buttons button.compendium").remove();
    $("section#items footer.action-buttons").append(`<button class='compendium'>${game.i18n.localize('HP.COMPENDIUM.Label')}</button>`);

    $("section#items footer.action-buttons button.compendium").on( "click", async function() {
      const dial = new compendium();
      dial.render(true);
    });
  }
});

async function createMacro(bar, data, slot) {
  if(data.type === 'Item' || foundry.utils.isEmpty(data)) return;
  // Create the macro command
  const id = data.id;
  const label = id === 'dgts' ? game.i18n.localize("HP.DERIVES.Degats") : data.label;
  const actorId = data.actorId;
  const sceneId = data.sceneId;
  const tokenId = data.tokenId;
  const command = `game.hp.RollMacro("${actorId}", "${sceneId}", "${tokenId}", "${id}", event);`;

  let img = data?.img ?? "";
  if(img === "") img = "systems/harry-potter-jdr/assets/icons/d20.svg";

  let macro = await Macro.create({
    name: label,
    type: "script",
    img: img,
    command: command,
    flags: {}
  });
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

async function RollMacro(actorId, sceneId, tokenId, id, event) {
  const actor = tokenId === 'null' ? game.actors.get(actorId) : game.scenes.get(sceneId).tokens.find(token => token.id === tokenId).actor;
  const splitId = id.split('_');

  switch(splitId[0]) {
    case 'specialisation':
    case 'custom':
      if(actor.type === 'sorcier') prepareRollSorcierCmp(id, actor);
      else if(actor.type === 'familier') prepareRollCreatureCmp(id, actor);
      else if(actor.type === 'creature') prepareRollCreatureCmp(id, actor);
      break;

    case 'caracteristique':
      prepareRollCaracteristique(id, actor);
      break;

    case 'dgts':
      prepareRollDegats(actor);
      break;

    case 'combat':
      prepareRollCombat(id, actor);
      break;

    case 'itm':
      const item = actor.items.get(id.split('_')[1]);

      if(item.type === 'sortilege') prepareRollSortilege(id.split('_')[1], actor);
      else if(item.type === 'potion') prepareRollPotion(id.split('_')[1], actor);
      else if(item.type === 'arme') prepareRollDegats(actor, id.split('_')[1]);
      break;

    default:
      if(actor.type === 'sorcier') prepareRollSorcierCmp(id, actor);
      else if(actor.type === 'familier') prepareRollCreatureCmp(id, actor);
      else if(actor.type === 'creature') prepareRollCreatureCmp(id, actor);
      break;
  }

}