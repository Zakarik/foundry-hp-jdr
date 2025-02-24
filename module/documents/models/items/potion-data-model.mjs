import {
    getDefaultImg,
  } from "../../../helpers/common.mjs";

export class PotionDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {SchemaField, StringField, NumberField, BooleanField, ArrayField, HTMLField, FilePathField} = foundry.data.fields;

        return {
            version:new NumberField({initial:0}),
            niveau:new NumberField({initial:0}),
            ingredients:new SchemaField({
                type:new StringField({initial:"communs", choices:['communs', 'rares', 'rarissimes', 'rarissimes_special', 'special', 'varie']}),
                items:new ArrayField(new SchemaField({
                    _id:new StringField({initial:""}),
                    name:new StringField({initial:""}),
                    img:new FilePathField({categories: ["IMAGE"]}),
                    system:new SchemaField({
                        rarete:new StringField({initial:"communs", choices:['commun', 'rare', 'rarissime', 'communs', 'rares', 'rarissimes']}),
                        description:new HTMLField({initial:""}),
                        enriched:new HTMLField({initial:""}),
                    }),
                })),
                liste:new ArrayField(new StringField()),
            }),
            cibles:new SchemaField({
                a:new BooleanField({initial:false}),
                o:new BooleanField({initial:false}),
                p:new BooleanField({initial:false}),
                v:new BooleanField({initial:false}),
                potion:new BooleanField({initial:false}),
                varie:new BooleanField({initial:false}),
            }),
            effets:new HTMLField({initial:""}),
            malus:new StringField({initial:"0"}),
        }
    }

    static migrateData(source) {
        const ingredients = source.ingredients;

        if(source.version == 0) {
            for(let i in ingredients.liste) {
                const id = foundry.utils.randomID();

                ingredients.items.push({
                    _id:id,
                    name:ingredients.liste[i],
                    img:getDefaultImg('ingredient'),
                    system:{
                        rarete:"communs",
                        description:""
                    }
                })

                ingredients.liste[i] = id;
                source.version = 1;
            }
        }

        return super.migrateData(source);
    }

    prepareBaseData() {
        let liste = [];

        for(let i of this.ingredients.items) {
            liste.push(i._id);
        }

        Object.defineProperty(this.ingredients, 'liste', {
            value: liste,
            writable:true,
            enumerable:true,
            configurable:true
        });
    }

    prepareDerivedData() {}
}