import {
    capitalizeFirstLetter,
    localizeScolaire,
  } from "./common.mjs";
  /**
 * Custom Handlebars for KNIGHT
 */
export const RegisterHandlebars = function () {
    Handlebars.registerHelper('getSang', function () {
        return {
            "sangpur":"HP.SANG.SangPur",
            "sangmele":"HP.SANG.SangMêlé",
            "nemoldu":"HP.SANG.NeMoldu",
        };
    });

    Handlebars.registerHelper('getLocalization', function (path, value) {
        return `HP.${path.toUpperCase()}.${value.charAt(0).toUpperCase() + value.slice(1)}`;
    });

    Handlebars.registerHelper('getBalaiBonusLocalization', function (data) {
        const key = data?.key ?? '';
        const label = data?.label ?? '';
        let result = "";

        if(label) {
            switch(key) {
                case 'caracteristique':
                    result = CONFIG.HP.caracteristiques?.[label] ? game.i18n.localize(CONFIG.HP.caracteristiques[label]) : ''
                    break;

                case 'competence':
                    result = `${game.i18n.localize(`HP.COMPETENCES.Competence${capitalizeFirstLetter(label.split('_')[1])}`)} : ${localizeScolaire(label.split('_')[2])}`;
                    break;

                case 'autre':
                    result = label;
                    break;
            }
        }

        return result;
    });

    Handlebars.registerHelper('getOptions', function (option) {
        return game.settings.get("harry-potter-jdr", option);
    });

    Handlebars.registerHelper('isImpair', function (index) {
        let result = false;

        if(parseInt(index) > 0 && parseInt(index)%2 === 1) result = true;

        return result;
    });

    Handlebars.registerHelper('abreviation', function (string) {
        let translate;
        let result = '';
        if(string === 'e') translate = 'enchantements';
        else if(string === 's') translate = 'mauvaisorts';
        else if(string === 'm') translate = 'metamorphose';

        result = game.settings.get('harry-potter-jdr', `${translate}-abreviation`) ? game.settings.get('harry-potter-jdr', `${translate}-abreviation`) : game.i18n.localize(`HP.COMPETENCES.${translate.charAt(0).toUpperCase() + translate.slice(1)}-abreviation`);

        return result;
    });

    Handlebars.registerHelper('full', function (string) {
        let translate;
        let result = '';
        if(string === 'e') translate = 'enchantements';
        else if(string === 's') translate = 'mauvaisorts';
        else if(string === 'm') translate = 'metamorphose';

        result = game.settings.get('harry-potter-jdr', `${translate}`) ? game.settings.get('harry-potter-jdr', `${translate}`) : game.i18n.localize(`HP.COMPETENCES.${translate.charAt(0).toUpperCase() + translate.slice(1)}`);

        return result;
    });

    Handlebars.registerHelper('cibles', function (object) {
        let ciblesActives = Object.keys(object).filter(key => object[key]).map(key => `<p style='display:contents' title='${key === 'varie' || key === 'potion' ? game.i18n.localize(`HP.${capitalizeFirstLetter(key)}`) : game.i18n.localize(`HP.${key.toUpperCase()}Full`)}'>${key === 'varie' || key === 'potion' ? game.i18n.localize(`HP.${capitalizeFirstLetter(key)}`) : game.i18n.localize(`HP.${key.toUpperCase()}`)}</p>`);
        let result = ciblesActives.join(' / ');
        return result;
    });

    Handlebars.registerHelper('ingredientstype', function (str) {
        let string = '';

        if(str === 'rarissimes_special') string = `HP.RarissimesSpecial`;
        else string = `HP.${str.charAt(0).toUpperCase() + str.slice(1)}`;

        return game.i18n.localize(string);
    });

    Handlebars.registerHelper('ingredientsliste', function (liste, items) {
        let array = [];

        for(let l of liste) {
            const find = items.find(itm => itm._id === l);
            let string = ``;

            string += `<div class='main'>`;
            string += `${find.name}`;
            string += `<div class="hovered">`;
            string += `<span class="rarete"><b>${game.i18n.localize("HP.Rarete")} :</b> ${find.system.rarete}</span>`;
            string += `<div class="description">${find.system.enriched}</div>`;
            string += `</div>`;
            string += `</div>`;

            array.push(string);
        }

        return array.join(' / ');
    });

    Handlebars.registerHelper('textarea', function (string) {
        let result = string ? string
                    .replaceAll('\n', '<br>') : '';
        return result;
    });

    Handlebars.registerHelper('contain', function (string, value) {
        let result = false;

        if(string.includes(value)) result = true;

        return result;
    });

    Handlebars.registerHelper('prepareOptionsEffects', function (object, index) {
        let result = {};

        for(let k in object) {
            if(k.includes('addspe') || k.includes('custom') ) result[`${k}.${index}`] = object[k];
            else result[k] = object[k];
        }

        return result;
    });

    Handlebars.registerHelper('getPage', function (data, page) {
        const startIndex = (page - 1) * 20;
        const endIndex = startIndex + 20;

        return data.slice(startIndex, endIndex);
    });

    Handlebars.registerHelper('numerotation', function (page) {
        return Array.from({length: page}, (_, index) => index + 1);
    });

    Handlebars.registerHelper('length', function (array) {
        return array ? array.length : 0;
    });

    Handlebars.registerHelper('affinite', function (affinite) {
        const communes = CONFIG.HP.communes;
        const particulieres = CONFIG.HP.particulieres;
        let list = {};

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

        return `${list[affinite.key]} ${affinite.value}`;
    });

    Handlebars.registerHelper('ingredientData', function (item, id, data) {
        const itm = item.system.ingredients.items.find(itm => itm._id === id);

        if(!itm) return undefined;

        let result = '';
        switch(data) {
            case 'name':
            case 'img':
            case '_id':
                result = itm[data];
                break

            case 'rarete':
            case 'description':
            case 'enriched':
                result = itm.system[data];
                break
        }

        return result;
    });

    Handlebars.registerHelper('localizeRareteSingular', function (str) {
        let result = '';

        switch(str) {
            case 'communs':
            case 'commun':
                result = game.i18n.localize('HP.Commun');
                break
            case 'rares':
            case 'rare':
                result = game.i18n.localize('HP.Rare');
                break
            case 'rarissimes':
            case 'rarissime':
                result = game.i18n.localize('HP.Rarissime');
                break
        }

        return result;
    });

    Handlebars.registerHelper('ingredientIndex', function (item, id) {
        return item.system.ingredients.items.findIndex(itm => itm._id === id);
    });

    Handlebars.registerHelper('addPourcent', function (str) {
        if(!isNaN(str)) {
            return `${str}%`;
        } else {
            return str;
        }
    });
}