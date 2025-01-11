import {
    capitalizeFirstLetter,
    localizeScolaire,
  } from "./common.mjs";

/**
 * @type {TextEditorEnricherConfig}
 */
export const rolldataHtmlEnricher = {
	pattern: /@ROLL\[(.*?)]/g,
	enricher: enricher,
};

function enricher(text, options) {
    const split = text[1].trim().split('|');
    let replace = String(foundry.utils.getProperty(options.rollData ?? {}, text[1].trim()) ?? text[0]);
    let modifier;
    let label;
    let a;

    switch(split[0]) {
        case 'caracteristique':
            const carac = split?.[1] ?? "";
            modifier = parseInt(split?.[2] ?? 0);
            label = game.i18n.localize(`HP.CARACTERISTIQUES.${capitalizeFirstLetter(carac)}`);

            if(modifier > 0) label += ` + ${modifier}`;
            else if(modifier < 0) label += ` - ${modifier}`;

            a = document.createElement('a');
            a.className = 'inline-roll rollCaracteristique';
            a.setAttribute('data-caracteristique', carac);
            a.setAttribute('data-modifier', modifier);
            a.innerHTML = `<i class="fas fa-dice-d20"></i>${label}`;
            replace = a;
        break

        case 'competence':
            const c = split?.[1] ?? "";
            const cSplit = c.split('_');
            modifier = parseInt(split?.[2] ?? 0);
            label = cSplit[0].includes('familier') || cSplit[0].includes('creature') ? game.i18n.localize(`HP.COMPETENCES.${capitalizeFirstLetter(cSplit?.[1] ?? '')}`) : localizeScolaire(cSplit?.[1] ?? "");

            switch(cSplit[0]) {
                case 'familier':
                    label = `${game.i18n.localize("TYPES.Actor.familier")} : ${label}`
                    break;

                case 'creature':
                    label = `${game.i18n.localize("TYPES.Actor.creature")} : ${label}`
                    break;

                case 'familier/creature':
                    label = `${game.i18n.localize("TYPES.Actor.familier")}/${game.i18n.localize("TYPES.Actor.creature")} : ${label}`
                    break;

                case 'sorcier':
                    label = `${game.i18n.localize("TYPES.Actor.sorcier")} : ${label}`
                    break;
            }

            if(modifier > 0) label += ` + ${modifier}`;
            else if(modifier < 0) label += ` - ${-modifier}`;

            a = document.createElement('a');
            a.className = 'inline-roll rollCompetence';
            a.setAttribute('data-competence', c);
            a.setAttribute('data-modifier', modifier);
            a.innerHTML = `<i class="fas fa-dice-d20"></i>${label}`;
            replace = a;
        break
    }

	return replace;
}
