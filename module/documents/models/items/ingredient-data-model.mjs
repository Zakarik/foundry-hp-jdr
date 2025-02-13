export class IngredientDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {HTMLField, StringField, NumberField} = foundry.data.fields;

        return {
            version:new NumberField({initial:0}),
            rarete:new StringField({initial:"commun", choices:['commun', 'rare', 'rarissime', 'communs', 'rares', 'rarissimes']}),
            description:new HTMLField({initial:""}),
        }
    }

    static migrateData(source) {
        if(source.version == 0) {
            console.warn(source);
            switch(source.rarete) {
                case 'communs':
                    source.rarete = 'commun';
                    break;
                case 'rares':
                    source.rarete = 'rare';
                    break;
                case 'rarissimes':
                    source.rarete = 'rarissime';
                    break;
            }

            source.version = 1;
        }

        return super.migrateData(source);
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}