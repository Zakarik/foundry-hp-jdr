export class PotionDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {SchemaField, StringField, NumberField, BooleanField, ArrayField, HTMLField} = foundry.data.fields;

        return {
            niveau:new NumberField({initial:0}),
            ingredients:new SchemaField({
                type:new StringField({initial:"communs", choices:['communs', 'rares', 'rarissimes']}),
                liste:new ArrayField(new StringField()),
            }),
            cibles:new SchemaField({
                a:new BooleanField({initial:false}),
                o:new BooleanField({initial:false}),
                p:new BooleanField({initial:false}),
                v:new BooleanField({initial:false}),
            }),
            effets:new HTMLField({initial:""}),
            malus:new NumberField({initial:0}),
        }
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}