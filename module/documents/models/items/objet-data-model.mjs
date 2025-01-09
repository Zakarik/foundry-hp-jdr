export class ObjetDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {HTMLField} = foundry.data.fields;

        return {
            particularite:new HTMLField({initial:""}),
        }
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}