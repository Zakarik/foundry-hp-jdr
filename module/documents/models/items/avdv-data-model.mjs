export class AvDvDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {NumberField, HTMLField, ArrayField, SchemaField, StringField} = foundry.data.fields;

        return {
            description:new HTMLField({initial:""}),
            cout:new NumberField({initial:0}),
            effets:new ArrayField(new SchemaField({
                key:new StringField({initial:''}),
                value:new StringField({initial:0}),
                mode:new NumberField({initial:CONST.ACTIVE_EFFECT_MODES.ADD}),
            }))
        }
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}