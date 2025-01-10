

import {
    capitalizeFirstLetter,
    localizeScolaire,
  } from "./common.mjs";

async function promptRollCaracteristique(state, dispatch, view) {
    const content = await renderTemplate('systems/harry-potter-jdr/templates/dialog/dialog-std-sheet.html', {
    data:[
        {
            key:'select',
            label:"HP.CARACTERISTIQUES.Caracteristique",
            class:'caracteristique',
            data:'',
            list:foundry.utils.mergeObject({"":""}, CONFIG.HP.caracteristiques),
            value:"",
        },
        {
            key:'number',
            label:"HP.ROLL.Modificateur",
            class:'modifier',
            data:'',
            value:0,
        }
    ]
    });

    let d = new Dialog({
    title: game.i18n.localize("HP.TEXTEDITOR.RollCaracteristique"),
    content: content,
    buttons: {
        one: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("HP.Inserer"),
        callback: (html) => {
            const caracteristique = html.find('.caracteristique select').val();
            const modifier = html.find('.modifier input').val();


		    dispatch(state.tr.insertText(`@ROLL[caracteristique|${caracteristique}|${modifier}] `));
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

async function promptRollCompetence(state, dispatch, view) {
    const cmp = CONFIG.HP.competences;
    const cmpFamilier = CONFIG.HP.competencesfamilier;
    const cmpCreature = CONFIG.HP.competencescreatures;
    let list = {};

    for(let m in cmp) {
        let str = `${m}`

        for(let c in cmp[m]) {
            list[`${str}_${c}`] = `${game.i18n.localize("TYPES.Actor.sorcier")} : ${localizeScolaire(c)}`;
        }
    }

    for(let c in cmpFamilier) {
        list[`familier/creature_${c}`] = `${game.i18n.localize("TYPES.Actor.familier")} | ${game.i18n.localize("TYPES.Actor.creature")} : ${game.i18n.localize(`HP.COMPETENCES.${capitalizeFirstLetter(c)}`)}`;
    }

    for(let c in cmpCreature) {
        const exist = cmpFamilier?.[c];
        if(!exist) list[`creature_${c}`] = `${game.i18n.localize("TYPES.Actor.creature")} : ${game.i18n.localize(`HP.COMPETENCES.${capitalizeFirstLetter(c)}`)}`;
    }

    const content = await renderTemplate('systems/harry-potter-jdr/templates/dialog/dialog-std-sheet.html', {
    data:[
        {
            key:'select',
            label:"HP.COMPETENCES.Competence",
            class:'competence left',
            data:'',
            sort:true,
            localize:false,
            list:foundry.utils.mergeObject({"":""}, list),
            value:"",
        },
        {
            key:'number',
            label:"HP.ROLL.Modificateur",
            class:'modifier',
            data:'',
            value:0,
        }
    ]
    });

    let d = new Dialog({
    title: game.i18n.localize("HP.TEXTEDITOR.RollCompetence"),
    content: content,
    buttons: {
        one: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("HP.Inserer"),
        callback: (html) => {
            const competence = html.find('.competence select').val();
            const modifier = html.find('.modifier input').val();

		    dispatch(state.tr.insertText(`@ROLL[competence|${competence}|${modifier}] `));
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

function getTextEditorMenu(menu, config) {
	config['hp.cmd'] = {
		title: 'HP.TEXTEDITOR.Menu',
		icon: `<i class="fas fa-dice-d20" data-tooltip="HP.TEXTEDITOR.Menu"></i>`,
		cssClass: 'right',
		entries: [
			{
				action: 'rollCaracteristique',
				title: 'HP.TEXTEDITOR.RollCaracteristique',
				group: 1,
				cmd: promptRollCaracteristique,
			},
			{
				action: 'rollCompetence',
				title: 'HP.TEXTEDITOR.RollCompetence',
				group: 1,
				cmd: promptRollCompetence,
			}
		],
	};
}

function initialize() {
	Hooks.on('getProseMirrorMenuDropDowns', getTextEditorMenu);
}

export const TextEditorMenu = {
	initialize,
};
