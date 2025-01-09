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
                    result = game.i18n.localize(CONFIG.HP.caracteristiques[label])
                    break;

                case 'competence':
                    result = `${game.i18n.localize(`HP.COMPETENCES.Competence${capitalizeFirstLetter(label.split('_')[1])}`)} : ${localizeScolaire(label.split('_')[2])}`;
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

    Handlebars.registerHelper('cibles', function (object) {
        let ciblesActives = Object.keys(object).filter(key => object[key]).map(key => game.i18n.localize(`HP.${key.toUpperCase()}`));
        let result = ciblesActives.join(' / ');
        return result;
    });

    Handlebars.registerHelper('ingredientstype', function (str) {
        console.warn(str);
        return game.i18n.localize(`HP.${str.charAt(0).toUpperCase() + str.slice(1)}`);
    });

    Handlebars.registerHelper('ingredientsliste', function (ingredients) {
        let result = ingredients.join(' / ');
        return result;
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

}