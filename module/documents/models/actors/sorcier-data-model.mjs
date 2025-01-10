import {listCompetences} from '../../../helpers/models.mjs'
import CaracteristiqueDataModel from '../parts/caracteristique.mjs'
import ValueWithMaxDataModel from '../parts/valueWithMax.mjs'
import ValueDataModel from '../parts/value.mjs'
import DiceDataModel from '../parts/dice.mjs'

export class SorcierDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {SchemaField, EmbeddedDataField, StringField, NumberField, BooleanField, FilePathField, ArrayField, HTMLField} = foundry.data.fields;

        return {
            nom:new StringField({initial:""}),
            sexe:new StringField({initial:""}),
            age:new StringField({initial:""}),
            sang:new StringField({initial:"sangpur"}),
            argent:new StringField({initial:""}),
            historique:new SchemaField({
                scolarite:new StringField({initial:""}),
                maison:new SchemaField({
                    nom:new StringField({initial:""}),
                    img:new FilePathField({categories: ["IMAGE"], initial:"icons/svg/mystery-man.svg"})
                }),
                historique:new HTMLField(),
                taille:new StringField(),
                poids:new StringField(),
                patronus:new HTMLField({}),
                epouvantard:new HTMLField({}),
            }),
            derives:new SchemaField({
                pv:new EmbeddedDataField(ValueWithMaxDataModel),
                fougue:new EmbeddedDataField(ValueWithMaxDataModel),
                idee:new EmbeddedDataField(ValueDataModel),
                chance:new EmbeddedDataField(ValueDataModel),
                degats:new EmbeddedDataField(DiceDataModel),
            }),
            caracteristiques:new SchemaField({
                force:new EmbeddedDataField(CaracteristiqueDataModel),
                constitution:new EmbeddedDataField(CaracteristiqueDataModel),
                taille:new EmbeddedDataField(CaracteristiqueDataModel),
                perception:new EmbeddedDataField(CaracteristiqueDataModel),
                intelligence:new EmbeddedDataField(CaracteristiqueDataModel),
                dexterite:new EmbeddedDataField(CaracteristiqueDataModel),
                apparence:new EmbeddedDataField(CaracteristiqueDataModel),
                pouvoir:new EmbeddedDataField(CaracteristiqueDataModel),
            }),
            competences:new SchemaField(listCompetences()),
            options:new SchemaField({
                scolarise:new BooleanField({initial:true}),
                patronus:new BooleanField({initial:false}),
                modage:new SchemaField({
                    force:new NumberField({initial:0}),
                    constitution:new NumberField({initial:0}),
                    taille:new NumberField({initial:0}),
                    perception:new NumberField({initial:0}),
                    intelligence:new NumberField({initial:0}),
                    dexterite:new NumberField({initial:0}),
                    apparence:new NumberField({initial:0}),
                    pouvoir:new NumberField({initial:0}),
                }),
                maitrisesmax:new SchemaField({
                    generales:new NumberField({initial:0}),
                    moldus:new NumberField({initial:0}),
                    sorciers:new NumberField({initial:0}),
                    scolaires:new NumberField({initial:0}),
                }),
                maitrisesbase:new SchemaField({
                    generales:new NumberField({initial:0}),
                    moldus:new NumberField({initial:0}),
                    sorciers:new NumberField({initial:0}),
                    scolaires:new NumberField({initial:0}),
                }),
                basemaitrise:new StringField({initial:null, nullable:true}),
            }),
            seuils:new SchemaField({
                epicsuccess:new SchemaField({
                    base:new NumberField({initial:5}),
                    mod:new NumberField({initial:0}),
                    total:new NumberField({initial:0}),
                }),
                epicfail:new SchemaField({
                    base:new NumberField({initial:96}),
                    mod:new NumberField({initial:0}),
                    total:new NumberField({initial:0}),
                })
            }),
            initiative:new NumberField({initial:0})
        }
    }

    prepareBaseData() {

    }

    prepareDerivedData() {
        const sang = this.options.basemaitrise ? this.options.basemaitrise : this.sang;
        const sangpur = sang === 'sangpur' ? true : false;
        const sangmele = sang === 'sangmele' ? true : false;
        const nemoldu = sang === 'nemoldu' ? true : false;
        const listCompetences = ['generales', 'moldus', 'sorciers', 'scolaires'];

        for(let c in this.caracteristiques) {
            Object.defineProperty(this.caracteristiques[c].mod, 'age', {
                value: this.options.modage[c],
                writable:true,
                enumerable:true,
                configurable:true
            });

            this.caracteristiques[c].prepareData();
        }

        for(let lC of listCompetences) {
            for(let c in this.competences[lC]) {
                if(c !== 'custom' && (!this.competences[lC][c]?.list ?? undefined)) {
                    const data = this.competences[lC][c];
                    const baseMod = Object.values(data.base.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                    const maxMod = Object.values(data.max.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                    const actuelMod = Object.values(data.actuel.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                    const config = CONFIG.HP.competences[lC][c];

                    switch(lC) {
                        case 'moldus':
                            if(sangpur || sangmele) {
                                Object.defineProperty(data.base, 'initial', {
                                    value: 0,
                                });
                            } else {
                                Object.defineProperty(data.base, 'initial', {
                                    value: config.base,
                                });
                            }
                            break;
                        case 'sorciers':
                            if(nemoldu || sangmele) {
                                Object.defineProperty(data.base, 'initial', {
                                    value: 0,
                                });
                            } else {
                                Object.defineProperty(data.base, 'initial', {
                                    value: config.base,
                                });
                            }
                            break;
                    }

                    Object.defineProperty(data.base, 'divers', {
                        value: baseMod,
                    });

                    Object.defineProperty(data.max, 'divers', {
                        value: maxMod,
                    });

                    Object.defineProperty(data.actuel, 'divers', {
                        value: actuelMod,
                    });

                    Object.defineProperty(data.base, 'total', {
                        value: data.base.initial+data.base.divers+this.options.maitrisesbase[lC],
                    });

                    let maitrisesmax = data.max.initial+data.max.divers;

                    if(lC === 'scolaires') maitrisesmax += this.options.maitrisesmax[lC];
                    else if(config.canextend) maitrisesmax +=  this.options.maitrisesmax[lC];

                    Object.defineProperty(data.max, 'total', {
                        value: lC === 'scolaires' ? Math.min(maitrisesmax, 100) : Math.min(maitrisesmax, 90),
                    });

                    Object.defineProperty(data.actuel, 'total', {
                        value: Math.min(data.base.total+data.actuel.progression+data.actuel.divers, data.max.total),
                    });
                } else if(c === 'custom') {
                    const data = this.competences[lC][c];

                    for(let custom of data) {
                        const baseMod = Object.values(custom.base.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                        const maxMod = Object.values(custom.max.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                        const actuelMod = Object.values(custom.actuel.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

                        Object.defineProperty(custom.base, 'divers', {
                            value: baseMod,
                        });

                        Object.defineProperty(custom.max, 'divers', {
                            value: maxMod,
                        });

                        Object.defineProperty(custom.actuel, 'divers', {
                            value: actuelMod,
                        });

                        Object.defineProperty(custom.base, 'total', {
                            value: custom.base.initial+custom.base.divers+this.options.maitrisesbase[lC],
                        });

                        let maitrisesmax = custom.max.initial+custom.max.divers;

                        if(lC === 'scolaires') maitrisesmax += this.options.maitrisesmax[lC];
                        else if(custom.max.evolution) maitrisesmax +=  this.options.maitrisesmax[lC];

                        Object.defineProperty(custom.max, 'total', {
                            value: lC === 'scolaires' ? Math.min(maitrisesmax, 100) : Math.min(maitrisesmax, 90),
                        });

                        Object.defineProperty(custom.actuel, 'total', {
                            value: Math.min(custom.base.total+custom.actuel.progression+custom.actuel.divers, custom.max.total),
                        });
                    }
                } else {
                    const data = this.competences[lC][c].list;
                    const config = CONFIG.HP.competences[lC][c];

                    for(let specialisation of data) {
                        const baseMod = Object.values(specialisation.base.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                        const maxMod = Object.values(specialisation.max.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                        const actuelMod = Object.values(specialisation.actuel.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

                        switch(lC) {
                            case 'moldus':
                                if(sangpur || sangmele) {
                                    Object.defineProperty(specialisation.base, 'initial', {
                                        value: 0,
                                    });
                                } else {
                                    Object.defineProperty(specialisation.base, 'initial', {
                                        value: config.base,
                                    });
                                }
                                break;
                            case 'sorciers':
                                if(nemoldu || sangmele) {
                                    Object.defineProperty(specialisation.base, 'initial', {
                                        value: 0,
                                    });
                                } else {
                                    Object.defineProperty(specialisation.base, 'initial', {
                                        value: config.base,
                                    });
                                }
                                break;
                        }

                        Object.defineProperty(specialisation.base, 'divers', {
                            value: baseMod,
                        });

                        Object.defineProperty(specialisation.max, 'divers', {
                            value: maxMod,
                        });

                        Object.defineProperty(specialisation.actuel, 'divers', {
                            value: actuelMod,
                        });

                        Object.defineProperty(specialisation.base, 'total', {
                            value: specialisation.base.initial+specialisation.base.divers+this.options.maitrisesbase[lC],
                        });

                        let maitrisesmax = specialisation.max.initial+specialisation.max.divers;

                        if(lC === 'scolaires') maitrisesmax += this.options.maitrisesmax[lC];
                        else if(config.canextend) maitrisesmax +=  this.options.maitrisesmax[lC];

                        Object.defineProperty(specialisation.max, 'total', {
                            value: lC === 'scolaires' ? Math.min(maitrisesmax, 100) : Math.min(maitrisesmax, 90),
                        });

                        Object.defineProperty(specialisation.actuel, 'total', {
                            value: Math.min(specialisation.base.total+specialisation.actuel.progression+specialisation.actuel.divers, specialisation.max.total),
                        });
                    }
                }
            }
        }

        for(let d in this.derives) {
            let base = 0;
            let dice = 0;
            let face = 0;

            switch(d) {
                case 'pv':
                    base += this.caracteristiques.constitution.total;
                    base += this.caracteristiques.taille.total;
                    break;

                case 'idee':
                    base += this.caracteristiques.intelligence.total*5;
                    break;

                case 'fougue':
                    base += 5;
                    break;

                case 'chance':
                    base += this.caracteristiques.pouvoir.total*5;
                    break;

                case 'degats':
                    base = this.caracteristiques.force.total+this.caracteristiques.taille.total

                    if(base >= 25 && base <= 32) {
                        dice += 1;
                        face += 3;
                    } else if(base >= 33 && base <= 40) {
                        dice += 1;
                        face += 6;
                    } else if(base >= 41) {
                        dice += 2;
                        face += 6;
                    }
                    break;
            }

            if(d === 'degats') this.derives[d].prepareData(dice, face);
            else this.derives[d].prepareData(base);
        }

        Object.defineProperty(this.seuils.epicsuccess, 'total', {
            value: this.seuils.epicsuccess.base+this.seuils.epicsuccess.mod,
        });

        Object.defineProperty(this.seuils.epicfail, 'total', {
            value: this.seuils.epicfail.base+this.seuils.epicfail.mod,
        });
    }
}