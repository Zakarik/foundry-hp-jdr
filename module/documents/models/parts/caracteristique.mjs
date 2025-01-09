
export default class CaracteristiqueDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
		const {NumberField, ObjectField} = foundry.data.fields;

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
        }
    }

    prepareData() {
        const mod = Object.values(this.mod).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

        Object.defineProperty(this, 'divers', {
            value: mod,
        });

        Object.defineProperty(this, 'total', {
            value: this.base+this.divers,
        });
    }
}