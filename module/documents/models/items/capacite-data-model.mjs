export class CapaciteDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {HTMLField, StringField, BooleanField, ArrayField, SchemaField, NumberField} = foundry.data.fields;

        return {
            description:new HTMLField(),
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