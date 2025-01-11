export const registerSystemSettings = async function () {
    const config = CONFIG.HP.competences.scolaires;

    game.settings.registerMenu('harry-potter-jdr', 'renamescolaire', {
		name: 'HP.SETTINGS.RenameCmpTitle',
		hint: 'HP.SETTINGS.RenameCmpHint',
        label: 'HP.SETTINGS.RenameCmp',
		scope: 'world',
		icon: 'fas fa-book',
		type: renameCmpScolaires,
        restricted: true,
        requiresReload: true,
	});

    game.settings.register("harry-potter-jdr", "imgmaison", {
        name: "HP.SETTINGS.ImgMaison",
        hint: "HP.SETTINGS.ImgMaisonHint",
        scope: "world",
        config: true,
        default: true,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("harry-potter-jdr", "pc-initiaux", {
        name: "HP.SETTINGS.PointsCreation",
        hint: "HP.SETTINGS.PointsCreationHint",
        scope: "world",
        config: true,
        default: 6,
        requiresReload: true,
        type: new foundry.data.fields.NumberField({nullable: false, min: 0})
    });

    for(let s in config) {
        game.settings.register('harry-potter-jdr', s, {
            name: '',
            hint: '',
            scope: 'world',
            config: false,
            type: String,
            default: null,
        });

        if(s === 'enchantements') {
            game.settings.register('harry-potter-jdr', `${s}-singulier`, {
                name: '',
                hint: '',
                scope: 'world',
                config: false,
                type: String,
                default: null,
            });

            game.settings.register('harry-potter-jdr', `${s}-abreviation`, {
                name: '',
                hint: '',
                scope: 'world',
                config: false,
                type: String,
                default: null,
            });
        } else if(s === 'metamorphose' || s === 'mauvaisorts') {
            game.settings.register('harry-potter-jdr', `${s}-abreviation`, {
                name: '',
                hint: '',
                scope: 'world',
                config: false,
                type: String,
                default: null,
            });
        }
    }
};

class renameCmpScolaires extends FormApplication {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["hp", "sheet", "dialog", "options"],
			template: 'systems/harry-potter-jdr/templates/dialog/dialog-std-sheet.html',
            width: 500,
		});
	}

    getData() {
        const config = CONFIG.HP.competences.scolaires;
        let data = [];

        for(let s in config) {
            data.push({
                key:'text',
                label:`HP.COMPETENCES.${s.charAt(0).toUpperCase() + s.slice(1)}`,
                class:'check',
                data:s,
                value:game.settings.get('harry-potter-jdr', `${s}`) ? game.settings.get('harry-potter-jdr', `${s}`) : game.i18n.localize(`HP.COMPETENCES.${s.charAt(0).toUpperCase() + s.slice(1)}`),
            });

            if(s === 'enchantements') {
                data.push({
                    key:'text',
                    label:`HP.COMPETENCES.${s.charAt(0).toUpperCase() + s.slice(1)}-singulier-hint`,
                    class:'check',
                    data:`${s}-singulier`,
                    value:game.settings.get('harry-potter-jdr', `${s}-singulier`) ? game.settings.get('harry-potter-jdr', `${s}-singulier`) : game.i18n.localize(`HP.COMPETENCES.${s.charAt(0).toUpperCase() + s.slice(1)}-singulier`),
                });

                data.push({
                    key:'text',
                    label:`HP.COMPETENCES.${s.charAt(0).toUpperCase() + s.slice(1)}-abreviation-hint`,
                    class:'check',
                    data:`${s}-abreviation`,
                    value:game.settings.get('harry-potter-jdr', `${s}-abreviation`) ? game.settings.get('harry-potter-jdr', `${s}-abreviation`) : game.i18n.localize(`HP.COMPETENCES.${s.charAt(0).toUpperCase() + s.slice(1)}-abreviation`),
                });
            } else if(s === 'metamorphose' || s === 'mauvaisorts') {
                data.push({
                    key:'text',
                    label:`HP.COMPETENCES.${s.charAt(0).toUpperCase() + s.slice(1)}-abreviation-hint`,
                    class:'check',
                    data:`${s}-abreviation`,
                    value:game.settings.get('harry-potter-jdr', `${s}-abreviation`) ? game.settings.get('harry-potter-jdr', `${s}-abreviation`) : game.i18n.localize(`HP.COMPETENCES.${s.charAt(0).toUpperCase() + s.slice(1)}-abreviation`),
                });
            }
        }

        data.push({
            key:'btn',
            label:'HP.Reset',
            class:'reset'
        })

        return {
            data,
            buttons:[{
                class:'valide',
                data:'valide',
                icon:'fas fa-check',
                label:'HP.Sauvegarder',
            },
            {
                class:'unvalide',
                data:'unvalide',
                icon:'fas fa-times',
                label:'HP.Annuler',
            }]
        }
    }

    async _updateObject(event, formData) {}

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('button.valide').click(ev => {
            for(let c of html.find('label.check')) {
                const tgt = $(c);
                const cmp = tgt.data('value');
                const value = tgt.find('input').val();

                if(value === game.i18n.localize(`HP.COMPETENCES.${cmp.charAt(0).toUpperCase() + cmp.slice(1)}`)) {
                    game.settings.set('harry-potter-jdr', `${cmp}`, null);
                } else {
                    game.settings.set('harry-potter-jdr', `${cmp}`, value);
                }
            }

            foundry.utils.debouncedReload();

            this.close();
        });

        html.find('button.unvalide').click(ev => {
            this.close();
        });

        html.find('button.reset').click(ev => {
            const config = CONFIG.HP.competences.scolaires;

            for(let s in config) {
                game.settings.set('harry-potter-jdr', `${s}`, null);
            }

            foundry.utils.debouncedReload();

            this.close();
        });
    }
}