
export default class DiceDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
		const {NumberField, ObjectField, StringField, SchemaField} = foundry.data.fields;

        return {
            base:new SchemaField({
                dice:new NumberField({initial:0}),
                face:new NumberField({initial:0}),
                complet:new StringField({initial:''})
            }),
            divers:new SchemaField({
                dice:new NumberField({initial:0}),
                face:new NumberField({initial:0})
            }),
            total:new StringField({initial:""}),
            mod:new SchemaField({
                dice:new ObjectField({
                    initial:{
                      user:0,
                      temp:0,
                    }
                }),
                face:new ObjectField({
                    initial:{
                      user:0,
                      temp:0,
                    }
                }),
            })
        }
    }

    prepareData(dice, face) {
        const modDice = Object.values(this.mod.dice).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
        const modFace = Object.values(this.mod.face).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
        
        Object.defineProperty(this.base, 'dice', {
            value: dice,
        });

        Object.defineProperty(this.base, 'face', {
            value: face,
        });
        
        const baseDice = this.base.dice;
        const baseFace = this.base.face;
        let baseComplet = 0;

        if(baseDice !== 0) baseComplet = `+${baseDice}D${baseFace}`;        

        Object.defineProperty(this.base, 'complet', {
            value: baseComplet,
        });

        Object.defineProperty(this.divers, 'dice', {
            value: modDice,
        });

        Object.defineProperty(this.divers, 'face', {
            value: modFace,
        });

        const diceComplet = baseDice+this.divers.dice;
        const faceComplet = baseFace+this.divers.face;
        let complet = 0;

        if(diceComplet !== 0) complet = `+${diceComplet}D${faceComplet}`;

        Object.defineProperty(this, 'total', {
            value: complet,
        });
    }
}