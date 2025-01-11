export class ProtectionDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {HTMLField, StringField, BooleanField, NumberField} = foundry.data.fields;

        return {
            wear:new BooleanField({initial:false}),
            prix:new StringField({initial:""}),
            armure:new NumberField({initial:0}),
            bouclier:new BooleanField({initial:false}),
            description:new HTMLField({initial:""}),
        }
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}