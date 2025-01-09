
export default class ValueWithMaxDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
		const {NumberField, ObjectField} = foundry.data.fields;

        return {
            base:new NumberField({initial:0}),
            divers:new NumberField({initial:0}),
            actuel:new NumberField({initial:0}),
            max:new NumberField({initial:0}),
            mod:new ObjectField({
                initial:{
                  user:0,
                  temp:0,
                }
            }),
        }
    }

    prepareData(base) {
        const mod = Object.values(this.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

        Object.defineProperty(this, 'base', {
            value: base,
        });

        Object.defineProperty(this, 'divers', {
            value: mod,
        });

        Object.defineProperty(this, 'max', {
            value: this.base+this.divers,
        });

        if(this.actuel > this.max) {
            Object.defineProperty(this, 'actuel', {
                value: this.max,
            });
        }
    }
}