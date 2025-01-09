export class SortilegeDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
		const {SchemaField, StringField, NumberField, BooleanField, ArrayField, HTMLField} = foundry.data.fields;

        return {
            apprismaison:new BooleanField({initial:false}),
            niveau:new NumberField({initial:0}),
            type:new StringField({initial:"e", choices:['e', 's', 'm']}),
            incantation:new StringField({initial:"-"}),
            cibles:new SchemaField({
                a:new BooleanField({initial:false}),
                o:new BooleanField({initial:false}),
                p:new BooleanField({initial:false}),
                v:new BooleanField({initial:false}),
            }),
            effets:new HTMLField({initial:""}),
            malus:new SchemaField({
                fc:new NumberField({initial:0}),
                fe:new SchemaField({
                    has:new BooleanField({initial:false}),
                    appris:new BooleanField({initial:false}),
                    malus:new NumberField({initial:0}),
                    fc:new SchemaField({
                        reduction:new BooleanField({initial:false}),
                        malus:new NumberField({initial:0})
                    }),
                })
            })
        }
    }

    get fc() {
        let result = this.malus.fe.has && this.malus.fe.appris && this.malus.fe.fc.reduction ? this.malus.fe.fc.malus : this.malus.fc;

        return result;
    }

    get fe() {
        return this.malus.fe.malus;
    }

    prepareBaseData() {}

    prepareDerivedData() {}
}