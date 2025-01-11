export class ArmeDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {HTMLField, StringField, BooleanField, SchemaField, NumberField} = foundry.data.fields;

        return {
            wear:new BooleanField({initial:false}),
            prix:new StringField({initial:""}),
            degats:new SchemaField({
                value:new StringField({initial:"1D3"}),
                adddmg:new NumberField({initial:0}),
            }),
            distance:new BooleanField({initial:false}),
            portee:new StringField({initial:""}),
            description:new HTMLField({initial:""}),
        }
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}