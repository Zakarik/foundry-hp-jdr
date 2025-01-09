export const listCompetences = () => {
    const {SchemaField, StringField, NumberField, ObjectField, ArrayField, BooleanField} = foundry.data.fields;
    const listCategorie = CONFIG.HP.competences;

    let competences = {};

    for(let n1 in listCategorie) {
        let listCompetence = {};

        for(let n2 in listCategorie[n1]) {
            const dataCompetence = listCategorie[n1][n2];

            let cmpField = {};

            let baseField = {
                initial:new NumberField({initial:dataCompetence.base}),
                mod:new ObjectField({
                    initial:{
                        user:0,
                        temp:0,
                    }
                }),
                divers:new NumberField({initial:0}),
                total:new NumberField({initial:0})
            };

            let maxField = {
                initial:new NumberField({initial:dataCompetence.max}),
                mod:new ObjectField({
                    initial:{
                        user:0,
                        temp:0,
                    }
                }),
                divers:new NumberField({initial:0}),
                total:new NumberField({initial:0}),
            };

            let main;

            cmpField.base = new SchemaField(baseField);
            cmpField.max = new SchemaField(maxField);
            cmpField.actuel = new SchemaField({
                total:new NumberField({initial:0}),
                mod:new ObjectField({
                    initial:{
                        user:0,
                        temp:0,
                    }
                }),
                divers:new NumberField({initial:0}),
                progression:new NumberField({initial:0})
            });

            cmpField.check = new BooleanField({initial:false});

            if(dataCompetence.specialisation) {
                main = {};

                cmpField.specialisation = new StringField({initial:""});
                cmpField.origin = new StringField({initial:""})
                cmpField.id = new StringField({initial:""})
                main.list = new ArrayField(
                    new SchemaField(cmpField)
                )
                main.modele = new SchemaField({
                    id:new StringField({initial:""}),
                    base:new SchemaField({
                        initial:new NumberField({initial:dataCompetence.base}),
                        mod:new ObjectField({
                            initial:{
                                user:0,
                                temp:0,
                            }
                        }),
                        divers:new NumberField({initial:0}),
                        total:new NumberField({initial:dataCompetence.base})
                    }),
                    max:new SchemaField({
                        initial:new NumberField({initial:dataCompetence.max}),
                        mod:new ObjectField({
                            initial:{
                                user:0,
                                temp:0,
                            }
                        }),
                        divers:new NumberField({initial:0}),
                        total:new NumberField({initial:dataCompetence.max}),
                    }),
                    actuel:new SchemaField({
                        total:new NumberField({initial:dataCompetence.base}),
                        mod:new ObjectField({
                            initial:{
                                user:0,
                                temp:0,
                            }
                        }),
                        divers:new NumberField({initial:0}),
                        progression:new NumberField({initial:0})
                    }),
                    check:new BooleanField({initial:false}),
                    specialisation:new StringField({initial:""}),
                    origin:new StringField({initial:""})
                })
            } else main = cmpField;

            listCompetence[n2] = new SchemaField(main);
        }

        listCompetence.custom = new ArrayField(
            new SchemaField({
                id:new StringField({initial:""}),
                label:new StringField({initial:""}),
                base:new SchemaField({
                    total:new NumberField({initial:0}),
                    initial:new NumberField({initial:0}),
                    divers:new NumberField({initial:0}),
                    mod:new ObjectField({
                        initial:{
                          user:0,
                          temp:0,
                        }
                    })
                }),
                max:new SchemaField({
                    total:new NumberField({initial:0}),
                    initial:new NumberField({initial:0}),
                    divers:new NumberField({initial:0}),
                    mod:new ObjectField({
                        initial:{
                          user:0,
                          temp:0,
                        }
                    }),
                    evolution:new BooleanField({initial:false}),
                }),
                actuel:new SchemaField({
                    total:new NumberField({initial:0}),
                    mod:new ObjectField({
                        initial:{
                            user:0,
                            temp:0,
                        }
                    }),
                    divers:new NumberField({initial:0}),
                    progression:new NumberField({initial:0})
                }),
                check:new BooleanField({initial:false}),
                origin:new StringField({initial:""}),
            })
        )

        competences[n1] = new SchemaField(listCompetence)
        competences.modele = new SchemaField({
            id:new StringField({initial:""}),
            label:new StringField({initial:""}),
            base:new SchemaField({
                total:new NumberField({initial:0}),
                initial:new NumberField({initial:0}),
                divers:new NumberField({initial:0}),
                mod:new ObjectField({
                    initial:{
                      user:0,
                      temp:0,
                    }
                })
            }),
            max:new SchemaField({
                total:new NumberField({initial:0}),
                initial:new NumberField({initial:0}),
                divers:new NumberField({initial:0}),
                mod:new ObjectField({
                    initial:{
                      user:0,
                      temp:0,
                    }
                }),
                evolution:new BooleanField({initial:false}),
            }),
            actuel:new SchemaField({
                total:new NumberField({initial:0}),
                mod:new ObjectField({
                    initial:{
                        user:0,
                        temp:0,
                    }
                }),
                divers:new NumberField({initial:0}),
                progression:new NumberField({initial:0})
            }),
            check:new BooleanField({initial:false}),
            origin:new StringField({initial:""}),
        });
    }

    return competences;
}

export const listCompetencesFamilier = () => {
    const {SchemaField, StringField, NumberField, ObjectField, ArrayField, BooleanField} = foundry.data.fields;
    const listCompetence = CONFIG.HP.competencescreatures;

    let competences = {};

    for(let c in listCompetence) {
        competences[c] = new SchemaField({
            total:new NumberField({initial:0}),
            mod:new ObjectField({
                initial:{
                    user:0,
                    temp:0,
                }
            }),
            divers:new NumberField({initial:0}),
            base:new NumberField({initial:0}),
        });
    }

    competences.custom = new ArrayField(new SchemaField({
        id:new StringField({initial:""}),
        origin:new StringField({initial:""}),
        label:new StringField({initial:""}),
        total:new NumberField({initial:0}),
        mod:new ObjectField({
            initial:{
                user:0,
                temp:0,
            }
        }),
        divers:new NumberField({initial:0}),
        base:new NumberField({initial:0})
    }));

    competences.modele = new SchemaField({
        id:new StringField({initial:""}),
        origin:new StringField({initial:""}),
        label:new StringField({initial:""}),
        total:new NumberField({initial:0}),
        mod:new ObjectField({
            initial:{
                user:0,
                temp:0,
            }
        }),
        divers:new NumberField({initial:0}),
        base:new NumberField({initial:0})
    });

    return competences;
}