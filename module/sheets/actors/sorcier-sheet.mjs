import {
    getDefaultImg,
    menu,
    confirmationDialog,
    rollDialog,
    doRoll,
    capitalizeFirstLetter,
    localizeScolaire,
    prepareRollSorcierCmp,
    prepareRollCaracteristique,
    prepareRollSortilege,
    prepareRollPotion,
    prepareRollDegats,
  } from "../../helpers/common.mjs";

  import toggler from '../../helpers/toggler.js';

/**
 * @extends {ActorSheet}
 */
export class SorcierActorSheet extends ActorSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["hp", "sheet", "actor", "sorcier"],
      template: "systems/harry-potter-jdr/templates/actors/sorcier-sheet.html",
      width: 1020,
      height: 720,
      tabs: [
        {navSelector: ".sheet-tabs", contentSelector: ".body", initial: "personnage"},
        {navSelector: ".sheet-competences", contentSelector: ".competences", initial: "generales"},
        {navSelector: ".sheet-historiques", contentSelector: ".historiques", initial: "background"},
      ],
      dragDrop: [{dragSelector: [".draggable"], dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    this._prepareCharacterItems(context);

    const {data} = context
    const system = data.system;

    context.systemData = system;

    console.warn(context);

    return context;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
   get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/harry-potter-jdr/templates/actors/limited-sorcier-sheet.html";
    }
    return this.options.template;
  }

  /* -------------------------------------------- */

    /**
     * Remove the close button
     * @override
     */
    _getHeaderButtons() {
      let buttons = super._getHeaderButtons();

      buttons.unshift({
        class:"options",
        icon:"fa-solid fa-gears",
        label:"HP.OPTIONS.Label",
        onclick:(ev) => this._onOptions(ev),
      })

      return buttons;
  }

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    toggler.init(this.id, html);

    menu(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    html.find('img.options').hover(ev => {
      $(ev.currentTarget).attr("src", "systems/harry-potter-jdr/assets/icons/optionWhite.svg");
    }, ev => {
      const main = $(ev.currentTarget).parents('.js-simpletoggler');
      const siblings = main.siblings();

      if(!$(siblings[0]).is(':visible')) {
        $(ev.currentTarget).attr("src", "systems/harry-potter-jdr/assets/icons/optionBlack.svg");
      }
    });

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.item-edit').click(ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));

      item.sheet.render(true);
    });

    html.find('.item-delete').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const id = header.data("item-id");
      const item = this.actor.items.get(id);
      const actor = this.actor;

      if(!await confirmationDialog('delete')) return;
      const effect = actor.effects.find(itm => itm.origin === `Actor.${actor._id}.Item.${id}`);
      let update = {};

      if(effect) {
        const change = effect.changes;
        const spe = change.filter(itm => itm.key.includes('addspe'));
        const custom = change.filter(itm => itm.key.includes('custom'));

        for(let s of spe) {
          const split = s.key.split('.');
          const domain = split[1];
          const cmp = split[2];

          if(!update?.[`system.competences.${domain}.${cmp}.list`]) {
            update[`system.competences.${domain}.${cmp}.list`] = actor.system.competences[domain][cmp].list.filter(itm => !itm.origin.includes(effect.origin));
          }
        }

        for(let c of custom) {
          const split = c.key.split('.');
          const domain = split[1];

          if(!update?.[`system.competences.${domain}.custom`]) {
            update[`system.competences.${domain}.custom`] = actor.system.competences[domain].custom.filter(itm => !itm.origin.includes(effect.origin));
          }
        }
      }

      if(!foundry.utils.isEmpty(update)) this.actor.update(update);

      item.delete();
      header.slideUp(200, () => this.render(false));
    });

    html.find('.specialisation i.add').click(async ev => {
      const header = $(ev.currentTarget).parents(".specialisation");
      const key = header.data("key");
      const domain = header.data("domain");
      let list = this.actor.system.competences[domain][key].list;
      const add = foundry.utils.mergeObject(this.actor.system.competences[domain][key].modele, {id:foundry.utils.randomID()});
      list.push(add);

      this.actor.update({[`system.competences.${domain}.${key}.list`]:list});
    });

    html.find('button.addCmp').click(async ev => {
      const domain = $(ev.currentTarget).data("domain");
      let list = this.actor.system.competences[domain].custom;
      const add = foundry.utils.mergeObject(this.actor.system.competences.modele, {id:foundry.utils.randomID()});
      list.push(add);

      this.actor.update({[`system.competences.${domain}.custom`]:list});
    });

    html.find('.specialisation i.delete').click(async ev => {
      const tgt = $(ev.currentTarget);
      const header = tgt.parents(".specialisation");
      const key = header.data("key");
      const domain = header.data("domain");
      const index = tgt.data("index");
      let list = this.actor.system.competences[domain][key].list;
      list.splice(index, 1);

      if(!await confirmationDialog('delete')) return;

      this.actor.update({[`system.competences.${domain}.${key}.list`]:list})
    });

    html.find('.custom i.delete').click(async ev => {
      const tgt = $(ev.currentTarget);
      const header = tgt.parents(".custom");
      const domain = header.data("domain");
      const index = tgt.data("index");
      let list = this.actor.system.competences[domain].custom;
      list.splice(index, 1);

      if(!await confirmationDialog('delete')) return;

      this.actor.update({[`system.competences.${domain}.custom`]:list})
    });

    html.find('button.addModifAge').click(async ev => {
      const data = this.actor.system;
      const listData = [];

      for(let c in data.caracteristiques) {
        listData.push(
          {
            key:'number',
            label:`HP.CARACTERISTIQUES.${capitalizeFirstLetter(c)}`,
            class:'check',
            data:c,
            value:data?.options?.modage?.[c] ?? 0,
          })
      }

      const content = await renderTemplate('systems/harry-potter-jdr/templates/dialog/dialog-std-sheet.html', {
        data:listData
      });

      let d = new Dialog({
        title: game.i18n.localize("HP.ModificateurAge"),
        content: content,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("HP.Sauvegarder"),
            callback: (html) => {
              const caracteristiques = html.find('label.check');
              let update = {};

              for(let c of caracteristiques) {
                const tgt = $(c);
                const carac = tgt.data('value');
                const value = parseInt(tgt.find('input').val());
                update[`system.options.modage.${carac}`] = value;
              }

              this.actor.update(update);
            }
          },
          two: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("HP.Annuler"),
            callback: () => {}
          }
        },
        render: html => {},
        close: html => {}
       }, {
        classes: ["hp", "sheet", "dialog", "hp", "options", "sorcier"],
       });
       d.render(true);
    });

    html.find('button.EvolutionMaitrise').click(async ev => {
      const data = this.actor.system;

      const content = await renderTemplate('systems/harry-potter-jdr/templates/dialog/dialog-std-sheet.html', {
        data:[
          {
            key:'number',
            label:"HP.COMPETENCES.CompetencesGenerales",
            class:'check',
            data:'generales',
            value:data?.options?.maitrisesmax?.generales ?? 0,
          },
          {
            key:'number',
            label:"HP.COMPETENCES.CompetencesMoldus",
            class:'check',
            data:'moldus',
            value:data?.options?.maitrisesmax?.moldus ?? 0,
          },
          {
            key:'number',
            label:"HP.COMPETENCES.CompetencesSorciers",
            class:'check',
            data:'sorciers',
            value:data?.options?.maitrisesmax?.sorciers ?? 0,
          },
          {
            key:'number',
            label:"HP.COMPETENCES.CompetencesScolaires",
            class:'check',
            data:'scolaires',
            value:data?.options?.maitrisesmax?.scolaires ?? 0,
          }
        ]
      });

      let d = new Dialog({
        title: game.i18n.localize("HP.COMPETENCES.EvolutionMaitrise"),
        content: content,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("HP.Sauvegarder"),
            callback: (html) => {
              const competences = html.find('label.check');
              let update = {};

              for(let c of competences) {
                const tgt = $(c);
                const domain = tgt.data('value');
                const value = parseInt(tgt.find('input').val());
                update[`system.options.maitrisesmax.${domain}`] = value;
              }

              this.actor.update(update);
            }
          },
          two: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("HP.Annuler"),
            callback: () => {}
          }
        },
        render: html => {},
        close: html => {}
       }, {
        classes: ["hp", "sheet", "dialog", "hp", "options", "sorcier"],
       });
       d.render(true);
    });

    html.find('button.EvolutionMaitriseBase').click(async ev => {
      const data = this.actor.system;

      const content = await renderTemplate('systems/harry-potter-jdr/templates/dialog/dialog-std-sheet.html', {
        data:[
          {
            key:'number',
            label:"HP.COMPETENCES.CompetencesGenerales",
            class:'check',
            data:'generales',
            value:data?.options?.maitrisesbase?.generales ?? 0,
          },
          {
            key:'number',
            label:"HP.COMPETENCES.CompetencesMoldus",
            class:'check',
            data:'moldus',
            value:data?.options?.maitrisesbase?.moldus ?? 0,
          },
          {
            key:'number',
            label:"HP.COMPETENCES.CompetencesSorciers",
            class:'check',
            data:'sorciers',
            value:data?.options?.maitrisesbase?.sorciers ?? 0,
          },
          {
            key:'number',
            label:"HP.COMPETENCES.CompetencesScolaires",
            class:'check',
            data:'scolaires',
            value:data?.options?.maitrisesbase?.scolaires ?? 0,
          }
        ]
      });

      let d = new Dialog({
        title: game.i18n.localize("HP.COMPETENCES.EvolutionBase"),
        content: content,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("HP.Sauvegarder"),
            callback: (html) => {
              const competences = html.find('label.check');
              let update = {};

              for(let c of competences) {
                const tgt = $(c);
                const domain = tgt.data('value');
                const value = parseInt(tgt.find('input').val());
                update[`system.options.maitrisesbase.${domain}`] = value;
              }

              this.actor.update(update);
            }
          },
          two: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("HP.Annuler"),
            callback: () => {}
          }
        },
        render: html => {},
        close: html => {}
       }, {
        classes: ["hp", "sheet", "dialog", "hp", "options", "sorcier"],
       });
       d.render(true);
    });

    html.find('button.EvolutionCompetence').click(async ev => {
      const chatRollMode = game.settings.get("core", "rollMode");
      const mGenerales = Object.entries(this.actor.system.competences.generales).filter(competence => competence[1].check);
      const cGenerales = this.actor.system.competences.generales.custom.filter(itm => itm.check);
      const mMoldus = Object.entries(this.actor.system.competences.moldus).filter(competence => competence[1].check);
      const cMoldus = this.actor.system.competences.moldus.custom;
      const mScolaires = Object.entries(this.actor.system.competences.scolaires).filter(competence => competence[1].check);
      const cScolaires = this.actor.system.competences.scolaires.custom;
      const mSorciers = Object.entries(this.actor.system.competences.sorciers).filter(competence => competence[1].check);
      const cSorciers = this.actor.system.competences.sorciers.custom;
      const sLangue = this.actor.system.competences.generales.langueetrangere.list;
      const sConnaissanceMoldu = this.actor.system.competences.moldus.connaissance.list;
      const sConnaissanceSorcier = this.actor.system.competences.sorciers.connaissance.list;
      const content = [];
      const allRoll = [];
      const intelligence = this.actor.system.caracteristiques.intelligence.total;
      let subcontent = [];
      let n = 0;

      for(let d of mGenerales) {
        const key = `generales_${d[0]}`;
        const data = d[1];
        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = data.base.initial+data.base.mod.user+data.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key,
          label:game.i18n.localize(`HP.COMPETENCES.${capitalizeFirstLetter(d[0])}`),
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });
      }

      for(let cD of cGenerales) {
        if(!cD.check) {
          n++;
          continue;
        }

        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = cD.base.initial+cD.base.mod.user+cD.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key:`custom_generales_${n}`,
          label:cD.label,
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });

        n++;
      }

      n = 0;

      for(let cD of sLangue) {
        if(!cD.check) {
          n++;
          continue;
        }

        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = cD.base.initial+cD.base.mod.user+cD.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key:`specialisation_generales_langueetrangere_${n}`,
          label:`${localizeScolaire('langueetrangere')} (${cD.specialisation})`,
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });

        n++;
      }

      if(subcontent.length > 0) {
        content.push({
          label:game.i18n.localize('HP.COMPETENCES.CompetencesGenerales'),
          subcontent:subcontent,
        });
      }

      subcontent = [];
      n = 0;

      for(let d of mSorciers) {
        const key = `sorciers_${d[0]}`;
        const data = d[1];
        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = data.base.initial+data.base.mod.user+data.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key,
          label:game.i18n.localize(`HP.COMPETENCES.${capitalizeFirstLetter(d[0])}`),
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });
      }

      for(let cD of sConnaissanceSorcier) {
        if(!cD.check) {
          n++;
          continue;
        }

        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = cD.base.initial+cD.base.mod.user+cD.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key:`specialisation_sorciers_connaissance_${n}`,
          label:`${localizeScolaire('connaissance')} - ${game.i18n.localize('HP.Sorcier')} (${cD.label})`,
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });

        n++;
      }

      n = 0;

      for(let cD of cSorciers) {
        if(!cD.check) {
          n++;
          continue;
        }

        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = cD.base.initial+cD.base.mod.user+cD.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key:`custom_sorciers_${n}`,
          label:cD.label,
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });

        n++;
      }

      if(subcontent.length > 0) {
        content.push({
          label:game.i18n.localize('HP.COMPETENCES.CompetencesSorciers'),
          subcontent:subcontent,
        });
      }

      subcontent = [];
      n = 0;

      for(let d of mMoldus) {
        const key = `moldus_${d[0]}`;
        const data = d[1];
        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = data.base.initial+data.base.mod.user+data.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key,
          label:game.i18n.localize(`HP.COMPETENCES.${capitalizeFirstLetter(d[0])}`),
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });
      }

      for(let cD of sConnaissanceMoldu) {
        if(!cD.check) {
          n++;
          continue;
        }

        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = cD.base.initial+cD.base.mod.user+cD.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key:`specialisation_moldus_connaissance_${n}`,
          label:`${localizeScolaire('connaissance')} - ${game.i18n.localize('HP.Moldu')} (${cD.label})`,
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });

        n++;
      }

      n = 0;

      for(let cD of cMoldus) {
        if(!cD.check) {
          n++;
          continue;
        }

        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = cD.base.initial+cD.base.mod.user+cD.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key:`custom_moldus_${n}`,
          label:cD.label,
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });

        n++;
      }

      if(subcontent.length > 0) {
        content.push({
          label:game.i18n.localize('HP.COMPETENCES.CompetencesMoldus'),
          subcontent:subcontent,
        });
      }

      subcontent = [];
      n = 0;

      for(let d of mScolaires) {
        const key = `scolaires_${d[0]}`;
        const data = d[1];
        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = data.base.initial+data.base.mod.user+data.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6 + 1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key,
          label:localizeScolaire(d[0]),
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });
      }

      for(let cD of cScolaires) {
        if(!cD.check) {
          n++;
          continue;
        }

        const roll = new Roll('1D100');
        await roll.evaluate();
        let objective = cD.base.initial+cD.base.mod.user+cD.actuel.progression;
        let inverse = false;
        let success = false;
        let gain = null;
        let gainTooltip = null;
        allRoll.push(roll)

        if(objective >= 90) {
          inverse = true;

          if(roll.total <= intelligence) success = true;
        } else if(roll.total > objective) success = true;

        if(success && !inverse) {
          const gainRoll = new Roll('1D6+1');
          await gainRoll.evaluate();

          allRoll.push(gainRoll);

          gain = gainRoll.total;
          gainTooltip = await gainRoll.getTooltip();
        } else if(success && inverse) gain = 1;

        subcontent.push({
          key:`custom_scolaires_${n}`,
          label:cD.label,
          tooltip:await roll.getTooltip(),
          success:success,
          objective:game.i18n.format(inverse ? "HP.ROLL.VSIntelligence" : "HP.ROLL.VS", {roll:roll.total, objective:inverse ? intelligence : objective}),
          gain:gain ? game.i18n.format(`HP.ROLL.Gain`, {gain}) : null,
          gainvalue:gain,
          gainTooltip
        });

        n++;
      }

      if(subcontent.length > 0) {
        content.push({
          label:game.i18n.localize('HP.COMPETENCES.CompetencesMoldus'),
          subcontent:subcontent,
        });
      }

      let main = {
        header:game.i18n.localize('HP.ROLL.EvolutionCompetence'),
        content,
      }

      let chatData = {
          user:game.user.id,
          speaker: {
              actor: this.actor?.id ?? null,
              token: this.actor?.token ?? null,
              alias: this.actor?.name ?? null,
              scene: this.actor?.token?.parent?.id ?? null
          },
          content:await renderTemplate('systems/harry-potter-jdr/templates/roll/multi-roll.html', main),
          sound: CONFIG.sounds.dice,
          rolls:allRoll,
          rollMode:chatRollMode,
      };

      const msg = await ChatMessage.create(chatData);

      msg.setFlag('harry-potter-jdr', 'roll', true);
      msg.setFlag('harry-potter-jdr', 'multi', true);
    });

    html.find('a.toggleEvolutionCmp').click(async ev => {
      const tgt = $(ev.currentTarget);
      const index = tgt.data('index');
      const value = tgt.data('value');
      const header = tgt.parents(".custom");
      const domain = header.data("domain");
      const newValue = value ? false : true;
      const list = this.actor.system.competences[domain].custom;
      list[index].max.evolution = newValue;

      this.actor.update({[`system.competences.${domain}.custom`]:list})
    });

    html.find('div.baguette span.eqp').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const id = header.data("item-id");
      const item = this.actor.items.get(id);
      const wear = item.system.wear;
      const newValue = wear ? false : true;
      let update = [];

      update.push({
        _id:id,
        'system.wear':newValue,
      });

      if(newValue) {
        for(let itm of this.actor.items.filter(itm => itm.type === 'baguette' && itm._id !== id && itm.system.wear)) {
          update.push({
            _id:itm._id,
            'system.wear':false,
          });
        }
      }

      this.actor.updateEmbeddedDocuments('Item', update);
    });

    html.find('div.balai span.eqp').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const id = header.data("item-id");
      const item = this.actor.items.get(id);
      const wear = item.system.wear;
      const newValue = wear ? false : true;
      let update = [];

      update.push({
        _id:id,
        'system.wear':newValue,
      });

      if(newValue) {
        for(let itm of this.actor.items.filter(itm => itm.type === 'balai' && itm._id !== id && itm.system.wear)) {
          update.push({
            _id:itm._id,
            'system.wear':false,
          });
        }
      }

      this.actor.updateEmbeddedDocuments('Item', update);
    });

    html.find('div.caracteristiques span.roll').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");

      await prepareRollCaracteristique(id, this.actor)
    });

    html.find('section.competences .roll').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data('id');
      await prepareRollSorcierCmp(id, this.actor);
    });

    html.find('.rolldgts').click(async ev => {
      const tgt = $(ev.currentTarget);
      const actor = this.actor;
      prepareRollDegats(actor);
    });

    html.find('div.sortileges .roll').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const label = tgt.data("label");
      await prepareRollSortilege(id.split('_')[1], this.actor);
    });

    html.find('div.sortileges .sendchat').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const label = tgt.data("label");
      const actor = this.actor;
      const items = actor.items;
      const itmSortilege = items.get(id);
      let cibles = [];

      if(itmSortilege.system.cibles.a) cibles.push(`<p title="${game.i18n.localize('HP.Animal')}">${game.i18n.localize('HP.A')}</p>`);
      if(itmSortilege.system.cibles.o) cibles.push(`<p title="${game.i18n.localize('HP.Objet')}">${game.i18n.localize('HP.O')}</p>`);
      if(itmSortilege.system.cibles.p) cibles.push(`<p title="${game.i18n.localize('HP.Personne')}">${game.i18n.localize('HP.P')}</p>`);
      if(itmSortilege.system.cibles.v) cibles.push(`<p title="${game.i18n.localize('HP.Vegetaux')}">${game.i18n.localize('HP.V')}</p>`);

      let malus = `${game.i18n.localize('HP.SORTILEGES.FormuleClassique-short')} : ${itmSortilege.system.malus.fc}%`

      if(itmSortilege.system.malus.fe.has && itmSortilege.system.malus.fe.fc.reduction) {
        malus += `<br/>${game.i18n.localize('HP.SORTILEGES.FormuleExtreme-short')} : ${itmSortilege.system.malus.fe.fc.malus}% / ${itmSortilege.system.malus.fe.malus}%`;
      } else if(itmSortilege.system.malus.fe.has) {
        malus += `<br/>${game.i18n.localize('HP.SORTILEGES.FormuleExtreme-short')} : ${itmSortilege.system.malus.fe.malus}%`
      }

      const sortilege = {
        cibles:cibles.join(' / '),
        niveau:itmSortilege.system.niveau,
        type:localizeScolaire(sortilegeType),
        malus:malus,
        description:itmSortilege.system.effets
      }

      const chatRollMode = game.settings.get("core", "rollMode");

      let main = {
        header:label,
        sortilege
      }

      let chatData = {
          user:game.user.id,
          speaker: {
              actor: actor?.id ?? null,
              token: actor?.token ?? null,
              alias: actor?.name ?? null,
              scene: actor?.token?.parent?.id ?? null
          },
          content:await renderTemplate('systems/harry-potter-jdr/templates/roll/std.html', main),
          sound: CONFIG.sounds.dice,
          rollMode:chatRollMode,
      };

      const msg = await ChatMessage.create(chatData);

      msg.setFlag('harry-potter-jdr', 'roll', true);
    });

    html.find('.fe-appris').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const value = tgt.data("value");
      let result = true;
      if(value) result = false;

      this.actor.items.get(id).update({['system.malus.fe.appris']:result});
    });

    html.find('.apprismaison').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const value = tgt.data("value");
      let result = true;
      if(value) result = false;

      this.actor.items.get(id).update({['system.apprismaison']:result});
    });

    html.find('div.potions .roll').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const label = tgt.data("label");

      await prepareRollPotion(id.split('_')[1], this.actor);
    });

    html.find('div.potions .sendchat').click(async ev => {
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const label = tgt.data("label");
      const actor = this.actor;
      const items = actor.items;
      const itmPotion = items.get(id);

      let cibles = [];

      if(itmPotion.system.cibles.a) cibles.push(`<p title="${game.i18n.localize('HP.Animal')}">${game.i18n.localize('HP.A')}</p>`);
      if(itmPotion.system.cibles.o) cibles.push(`<p title="${game.i18n.localize('HP.Objet')}">${game.i18n.localize('HP.O')}</p>`);
      if(itmPotion.system.cibles.p) cibles.push(`<p title="${game.i18n.localize('HP.Personne')}">${game.i18n.localize('HP.P')}</p>`);
      if(itmPotion.system.cibles.v) cibles.push(`<p title="${game.i18n.localize('HP.Vegetaux')}">${game.i18n.localize('HP.V')}</p>`);

      const dataPotion = {
        cibles:cibles.join(' / '),
        niveau:itmPotion.system.niveau,
        type:localizeScolaire('potion'),
        malus:itmPotion.system.malus,
        ingredients:game.i18n.localize(`HP.${capitalizeFirstLetter(itmPotion.system.ingredients.type)}`),
        listingredients:itmPotion.system.ingredients.liste.join(' / '),
        description:itmPotion.system.effets
      }

      const chatRollMode = game.settings.get("core", "rollMode");

      let main = {
        header:label,
        potion:dataPotion
      }

      let chatData = {
          user:game.user.id,
          speaker: {
              actor: actor?.id ?? null,
              token: actor?.token ?? null,
              alias: actor?.name ?? null,
              scene: actor?.token?.parent?.id ?? null
          },
          content:await renderTemplate('systems/harry-potter-jdr/templates/roll/std.html', main),
          sound: CONFIG.sounds.dice,
          rollMode:chatRollMode,
      };

      const msg = await ChatMessage.create(chatData);

      msg.setFlag('harry-potter-jdr', 'roll', true);
    });

    html.find('div.liste .sendchat').click(async ev => {
      const chatRollMode = game.settings.get("core", "rollMode");
      const tgt = $(ev.currentTarget);
      const id = tgt.data("id");
      const label = tgt.data("label");
      const items = this.actor.items;
      const itm = items.get(id);

      let main = {
        header:label,
        msg:itm.system.particularite,
        class:'justify'
      }

      let chatData = {
          user:game.user.id,
          speaker: {
            actor: this.actor?.id ?? null,
            token: this.actor?.token ?? null,
            alias: this.actor?.name ?? null,
            scene: this.actor?.token?.parent?.id ?? null
          },
          content:await renderTemplate('systems/harry-potter-jdr/templates/roll/msg.html', main),
          sound: CONFIG.sounds.dice,
          rollMode:chatRollMode,
      };

      const msg = await ChatMessage.create(chatData);

      msg.setFlag('harry-potter-jdr', 'hp', true);
    });
  }

  async _prepareCharacterItems(actorData) {
    const actor = actorData.actor;
    const items = actorData.items;
    const effects = actorData.effects;
    const data = this.actor.system;
    const competences = data.competences;
    const cGenerales = competences.generales;
    const cMoldus = competences.moldus;
    const cSorciers = competences.sorciers;
    const cScolaires = competences.scolaires;
    const options = data.options;
    let listCompetencesGenerales = [];
    let listCompetencesMoldus = [];
    let listCompetencesSorciers = [];
    let listCompetencesScolaires = [];
    let avantages = [];
    let desavantages = [];
    let crochepattes = [];
    let coupspouces = [];
    let sortileges = [];
    let potions = [];
    let inventaire = [];
    let baguettes = [];
    let balais = [];

    for (let i of items) {
      const type = i.type;
      const data = i.system;

      switch(type) {
        case "avantage":
          i.system.description = await TextEditor.enrichHTML(i.system.description, {async: true});
          avantages.push(i);
          break;

        case "desavantage":
          i.system.description = await TextEditor.enrichHTML(i.system.description, {async: true});
          desavantages.push(i);
          break;

        case "crochepatte":
          i.system.description = await TextEditor.enrichHTML(i.system.description, {async: true});
          crochepattes.push(i);
          break;

        case "coupspouce":
          i.system.description = await TextEditor.enrichHTML(i.system.description, {async: true});
          coupspouces.push(i);
          break;

        case "sortilege":
          i.system.effets = await TextEditor.enrichHTML(i.system.effets, {async: true});
          sortileges.push(i);
          break;

        case "potion":
          i.system.effets = await TextEditor.enrichHTML(i.system.effets, {async: true});
          potions.push(i);
          break;

        case "objet":
          i.system.particularite = await TextEditor.enrichHTML(i.system.particularite, {async: true});
          inventaire.push(i);
          break;

        case "balai":
          i.system.description = await TextEditor.enrichHTML(i.system.description, {async: true});
          balais.push(i);
          break;

        case "baguette":
          i.system.description = await TextEditor.enrichHTML(i.system.description, {async: true});
          const tra = foundry.utils.mergeObject(CONFIG.HP.communes, CONFIG.HP.particulieres);
          let allData = i;

          allData.system.affinite.label = allData.system.affinite.key ? `${game.i18n.localize(tra[allData.system.affinite.key])} (${allData.system.affinite.value}%)` : '';

          baguettes.push(allData);
          break;
      }
    };

    for (let e of effects) {
      const changes = e.changes;
      const addSpe = changes.filter(itm => itm.key.includes('addspe'));
      const addCustom = changes.filter(itm => itm.key.includes('custom'));
      let existIndex = -1;

      for(let as of addSpe) {
        const split = as.key.split('.');
        const domain = split[1];
        const cmp = split[2];
        existIndex = data.competences[domain][cmp].list.findIndex(itm => itm.origin.includes(`${e.origin}.${as.key}`));

        if(existIndex < 0) {
          let add = data.competences[domain][cmp].list;
          add.push(foundry.utils.mergeObject(data.competences[domain][cmp].modele, {origin:`${e.origin}.${as.key}`, specialisation:as.value, id:foundry.utils.randomID()}));
        } else if(as.value !== data.competences[domain][cmp].list[existIndex].specialisation && existIndex >= 0) {
          data.competences[domain][cmp].list[existIndex].specialisation = as.value;
        }
      }

      for(let ac of addCustom) {
        const split = ac.key.split('.');
        const domain = split[1];
        existIndex = data.competences[domain].custom.findIndex(itm => itm.origin.includes(`${e.origin}.${ac.key}`));

        if(existIndex < 0) {
          let add = data.competences[domain].custom;
          add.push(foundry.utils.mergeObject(data.competences.modele, {origin:`${e.origin}.${ac.key}`, label:ac.value, id:foundry.utils.randomID()}));
        } else if(ac.value !== data.competences[domain].custom[existIndex].specialisation && existIndex >= 0) {
          data.competences[domain].custom[existIndex].label = ac.value;
        }
      }
    };

    listCompetencesGenerales = Object.keys(cGenerales).filter(c => c !== 'modele').map(c => ({
      key: c,
      label: c === 'custom' ? c : game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`),
      specialisation: CONFIG.HP.competences.generales?.[c]?.specialisation,
      check: cGenerales[c].check,
      data: options.maitrisesmax.generales > 0 ? foundry.utils.mergeObject(cGenerales[c], {
        max: {
          evolution: CONFIG.HP.competences.generales?.[c]?.canextend || c === 'custom' ? options.maitrisesmax.generales : 0
        }
      }) : cGenerales[c]
    })).sort((a, b) => {
      if (a.label === 'custom') return 1;
      if (b.label === 'custom') return -1;
      return a.label.localeCompare(b.label);
    });

    listCompetencesMoldus = Object.keys(cMoldus).filter(c => c !== 'modele').map(c => ({
      key: c,
      label: c === 'custom' ? c : game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`),
      specialisation: CONFIG.HP.competences.moldus?.[c]?.specialisation,
      check:cMoldus[c].check,
      data: options.maitrisesmax.moldus > 0 ? foundry.utils.mergeObject(cMoldus[c], {
        max:{
          evolution:CONFIG.HP.competences.moldus?.[c]?.canextend ? options.maitrisesmax.moldus : 0
        }
      }) : cMoldus[c],
    })).sort((a, b) => {
      if (a.label === 'custom') return 1;
      if (b.label === 'custom') return -1;
      return a.label.localeCompare(b.label);
    });

    listCompetencesSorciers = Object.keys(cSorciers).filter(c => c !== 'modele').map(c => ({
      key: c,
      label: c === 'custom' ? c : game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`),
      specialisation: CONFIG.HP.competences.sorciers?.[c]?.specialisation,
      check:cSorciers[c].check,
      data: options.maitrisesmax.sorciers > 0 ? foundry.utils.mergeObject(cSorciers[c], {
        max:{
          evolution:CONFIG.HP.competences.sorciers?.[c]?.canextend ? options.maitrisesmax.sorciers : 0
        }
      }) : cSorciers[c],
    })).sort((a, b) => {
      if (a.label === 'custom') return 1;
      if (b.label === 'custom') return -1;
      return a.label.localeCompare(b.label);
    });

    listCompetencesScolaires = Object.keys(cScolaires).filter(c => c !== 'modele').map(c => ({
      key: c,
      label: c === 'custom' ? c : game.settings.get('harry-potter-jdr', `${c}`) ? game.settings.get('harry-potter-jdr', `${c}`) : game.i18n.localize(`HP.COMPETENCES.${c.charAt(0).toUpperCase() + c.slice(1)}`),
      specialisation: CONFIG.HP.competences.scolaires?.[c]?.specialisation,
      check:cScolaires[c].check,
      data: options.maitrisesmax.scolaires > 0 ? foundry.utils.mergeObject(cScolaires[c], {
        max:{
          evolution:options.maitrisesmax.scolaires
        }
      }) : cScolaires[c],
    })).sort((a, b) => {
      if (a.label === 'custom') return 1;
      if (b.label === 'custom') return -1;
      return a.label.localeCompare(b.label);
    });

    actor.listCompetencesGenerales = listCompetencesGenerales;
    actor.listCompetencesMoldus = listCompetencesMoldus;
    actor.listCompetencesSorciers = listCompetencesSorciers;
    actor.listCompetencesScolaires = listCompetencesScolaires;
    actor.coupspouces = coupspouces;
    actor.avantages = avantages;
    actor.desavantages = desavantages;
    actor.crochespattes = crochepattes;
    actor.sortileges = sortileges;
    actor.potions = potions;
    actor.inventaire = inventaire;
    actor.baguettes = baguettes;
    actor.balais = balais;
  }

  /* -------------------------------------------- */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `${game.i18n.localize(`TYPES.Item.${type}`)}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
      img: getDefaultImg(type)
    };

    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  async _onOptions(ev) {
    const data = this.actor.system;

    const content = await renderTemplate('systems/harry-potter-jdr/templates/dialog/dialog-std-sheet.html', {
      data:[
        {
          key:'select',
          label:"HP.OPTIONS.Scolarise",
          class:'check scolarise',
          list:{
            "true":"HP.Oui",
            "false":"HP.Non",
          },
          value:data?.options?.scolarise ?? false,
        },
        {
          key:'select',
          label:"HP.OPTIONS.Patronus",
          class:'check patronus',
          list:{
            "true":"HP.Oui",
            "false":"HP.Non",
          },
          value:data?.options?.patronus ?? false,
        }
      ]
    });

    let d = new Dialog({
      title: game.i18n.localize("HP.OPTIONS.Label"),
      content: content,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("HP.Sauvegarder"),
          callback: (html) => {
            const scolarise = html.find('label.scolarise select').val();
            const patronus = html.find('label.patronus select').val();

            let update = {};
            update[`system.options.scolarise`] = scolarise;
            update[`system.options.patronus`] = patronus;

            this.actor.update(update)
          }
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("HP.Annuler"),
          callback: () => {}
        }
      },
      render: html => {},
      close: html => {}
     }, {
      classes: ["hp", "sheet", "dialog", "hp", "options", "sorcier"],
     });
     d.render(true);
  }

  /** @inheritdoc */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ( event.target.classList.contains("content-link") ) return;

    // Create drag data
    let dragData;

    // Owned Items
    if ( li.dataset.itemId ) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    // Active Effect
    if ( li.dataset.effectId ) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }


    if(li.classList.contains('roll') || li.classList.contains('rolldgts')) {
      const label = $(li)?.data("label") || "";
      const id = $(li)?.data("id");

      // Create drag data
      dragData = {
        actorId: this.actor.id,
        sceneId: this.actor.isToken ? canvas.scene?.id : null,
        tokenId: this.actor.isToken ? this.actor.token.id : null,
        label:label,
        id:id
      };

      console.warn(dragData);

      if(id.split('_')[0] === 'itm') dragData.img = this.actor.items.get(id.split('_')[1]).img;
    }

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }
}