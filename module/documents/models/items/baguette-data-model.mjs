export class BaguetteDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {HTMLField, StringField, BooleanField, ArrayField, SchemaField, NumberField} = foundry.data.fields;

        return {
            wear:new BooleanField({initial:false}),
            description:new HTMLField(),
            visuel:new StringField(),
            bois:new SchemaField({
                name:new StringField(),
                description:new StringField(),
            }),
            taille:new StringField(),
            coeur:new SchemaField({
                name:new StringField(),
                description:new StringField(),
            }),
            affinite:new SchemaField({
                key:new StringField(),
                value:new NumberField({initial:10}),
            }),
        }
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}