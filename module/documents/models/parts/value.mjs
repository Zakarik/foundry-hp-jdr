
export default class ValueDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
		const {NumberField, ObjectField, BooleanField} = foundry.data.fields;

        return {
            base:new NumberField({initial:0}),
            divers:new NumberField({initial:0}),
            total:new NumberField({initial:0}),
            mod:new ObjectField({
                initial:{
                  user:0,
                  temp:0,
                }
            }),
            pourcentage:new BooleanField({initial:false})
        }
    }

    prepareData(base, pourcentage=false) {
        const mod = Object.values(this.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

        Object.defineProperty(this, 'base', {
            value: base,
        });

        Object.defineProperty(this, 'divers', {
            value: mod,
        });

        Object.defineProperty(this, 'total', {
            value: this.base+this.divers,
        });

        Object.defineProperty(this, 'pourcentage', {
            value: pourcentage,
        });
    }
}