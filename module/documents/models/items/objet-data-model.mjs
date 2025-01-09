export class ObjetDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {HTMLField, StringField} = foundry.data.fields;

        return {
            prix:new StringField({initial:""}),
            particularite:new HTMLField({initial:""}),
        }
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}