export class IngredientDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {HTMLField, StringField, ObjectField} = foundry.data.fields;

        return {
            rarete:new StringField({initial:"communs", choices:['communs', 'rares', 'rarissimes']}),
            description:new HTMLField({initial:""}),
        }
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}