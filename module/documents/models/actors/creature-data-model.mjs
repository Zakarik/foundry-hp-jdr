import {listCompetencesCreature} from '../../../helpers/models.mjs'
import CaracteristiqueDataModel from '../parts/caracteristique.mjs'
import ValueWithMaxDataModel from '../parts/valueWithMax.mjs'
import ValueDataModel from '../parts/value.mjs'

export class CreatureDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {SchemaField, EmbeddedDataField, StringField, NumberField, BooleanField, ObjectField, ArrayField, HTMLField} = foundry.data.fields;

        return {
            nom:new StringField({initial:""}),
            description:new HTMLField({initial:""}),
            lien:new StringField({initial:""}),
            derives:new SchemaField({
                pv:new EmbeddedDataField(ValueWithMaxDataModel),
                idee:new EmbeddedDataField(ValueDataModel),
                chance:new EmbeddedDataField(ValueDataModel),
                armure:new EmbeddedDataField(ValueDataModel),
                mouvement:new EmbeddedDataField(ValueDataModel),
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
            combat:new ArrayField(new SchemaField({
                id:new StringField({initial:""}),
                attaque:new NumberField({initial:0}),
                degats:new StringField({initial:'1'}),
                label:new StringField({initial:''}),
            })),
            competences:new SchemaField(listCompetencesCreature()),
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
        const cmp = CONFIG.HP.competencescreatures;

        for(let c in this.caracteristiques) {
            this.caracteristiques[c].prepareData();
        }

        for(let c in cmp) {
            const data = this.competences[c];

            if(data?.list) {
                for(let l of data.list) {
                    const actuelMod = Object.values(l.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

                    Object.defineProperty(l, 'divers', {
                        value: actuelMod,
                    });

                    Object.defineProperty(l, 'total', {
                        value: l.base+l.divers,
                    });
                }
            } else {
                const actuelMod = Object.values(data.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

                Object.defineProperty(data, 'divers', {
                    value: actuelMod,
                });

                Object.defineProperty(data, 'total', {
                    value: data.base+data.divers,
                });
            }

        }

        for(let custom of this.competences.custom) {
            const actuelMod = Object.values(custom.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

            Object.defineProperty(custom, 'divers', {
                value: actuelMod,
            });

            Object.defineProperty(custom, 'total', {
                value: custom.base+custom.divers,
            });
        }

        let armure = 0;

        for(let p of this.parent.items.filter(itm => itm.type === 'protection' && itm.system.armure > 0 && itm.system.wear)) {
            armure += p.system.armure;
        }

        Object.defineProperty(this.derives.armure.mod, 'protection', {
            value: armure,
            writable:true,
            enumerable:true,
            configurable:true
        });

        for(let d in this.derives) {
            if(d === 'pv') {
                const mod = Object.values(this.derives[d].mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

                Object.defineProperty(this.derives[d], 'divers', {
                    value: mod,
                });

                Object.defineProperty(this.derives[d], 'max', {
                    value: this.derives[d].base+this.derives[d].divers,
                });

                if(this.actuel > this.max) {
                    Object.defineProperty(this.derives[d], 'actuel', {
                        value: this.derives[d].max,
                    });
                }
            } else {
                const mod = Object.values(this.derives[d].mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

                Object.defineProperty(this.derives[d], 'divers', {
                    value: mod,
                });

                Object.defineProperty(this.derives[d], 'total', {
                    value: this.derives[d].base+this.derives[d].divers,
                });
            }
        }

        Object.defineProperty(this.seuils.epicsuccess, 'total', {
            value: this.seuils.epicsuccess.base+this.seuils.epicsuccess.mod,
        });

        Object.defineProperty(this.seuils.epicfail, 'total', {
            value: this.seuils.epicfail.base+this.seuils.epicfail.mod,
        });
    }
}