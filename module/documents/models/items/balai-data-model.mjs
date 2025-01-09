export class BalaiDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {HTMLField, StringField, BooleanField, ArrayField, SchemaField, NumberField} = foundry.data.fields;

        return {
            wear:new BooleanField({initial:false}),
            description:new HTMLField(),
            visuel:new StringField(),
            marque:new StringField(),
            bonus:new SchemaField({
                cout:new NumberField({initial:0}),
                liste:new ArrayField(
                    new SchemaField({
                        key:new StringField(),
                        label:new StringField(),
                        description:new StringField(),
                        value:new NumberField({initial:0}),
                        cout:new NumberField({initial:0}),
                    }
                )),
            })
        }
    }

    prepareBaseData() {
        const liste = this.bonus.liste;
        let cout = 0;

        for(let b of liste) {
            cout += b.cout;
        }

        Object.defineProperty(this.bonus, 'cout', {
            value: cout,
            writable:true,
            enumerable:true,
            configurable:true
        });
    }

    prepareDerivedData() {}
}