
export function getDefaultImg(type) {
  let img = '';

  switch(type) {
    case "sorcier":
      img = "systems/harry-potter-jdr/assets/icons/sorcier.svg";
      break;

    case "creature":
      img = "systems/harry-potter-jdr/assets/icons/creature.svg";
      break;

    case "familier":
      img = "systems/harry-potter-jdr/assets/icons/familier.svg";
      break;

    case "avantage":
      img = "systems/harry-potter-jdr/assets/icons/avantage.svg";
      break;

    case "desavantage":
      img = "systems/harry-potter-jdr/assets/icons/desavantage.svg";
      break;

    case "crochepatte":
      img = "systems/harry-potter-jdr/assets/icons/crochepatte.svg";
      break;

    case "coupspouce":
      img = "systems/harry-potter-jdr/assets/icons/coupspouce.svg";
      break;

    case "balai":
      img = "systems/harry-potter-jdr/assets/icons/balai.svg";
      break;

    case "baguette":
      img = "systems/harry-potter-jdr/assets/icons/baguette.svg";
      break;

    case "capacite":
      img = "systems/harry-potter-jdr/assets/icons/capacite.svg";
      break;

    case "capacitefamilier":
      img = "systems/harry-potter-jdr/assets/icons/capacitefamilier.svg";
      break;

    case "objet":
      img = "systems/harry-potter-jdr/assets/icons/objet.svg";
      break;

    case "potion":
      img = "systems/harry-potter-jdr/assets/icons/potion.svg";
      break;

    case "sortilege":
      img = "systems/harry-potter-jdr/assets/icons/sortilege.svg";
      break;

    case "arme":
      img = "systems/harry-potter-jdr/assets/icons/arme.svg";
      break;

    case "protection":
      img = "systems/harry-potter-jdr/assets/icons/protection.svg";
      break;
  }

  return img;
}

export function menu(html) {
  $(html.find('nav.tabs a i')).remove();
  $(html.find('nav.tabs a.active')).append(`<i class="fa-solid fa-hexagon-check"></i>`);
  $(html.find('nav.sheet-competences a i')).remove();
  $(html.find('nav.sheet-competences a.active')).append(`<i class="fa-solid fa-hexagon-check"></i>`);
  $(html.find('nav.sheet-historiques a i')).remove();
  $(html.find('nav.sheet-historiques a.active')).append(`<i class="fa-solid fa-hexagon-check"></i>`);
  $(html.find('nav.sheet-capacitessortileges a i')).remove();
  $(html.find('nav.sheet-capacitessortileges a.active')).append(`<i class="fa-solid fa-hexagon-check"></i>`);

  html.find('nav.tabs a').click(ev => {
    const target = $(ev.currentTarget);

    $(html.find('nav.tabs a i')).remove();
    target.append(`<i class="fa-solid fa-hexagon-check"></i>`);
  });

  html.find('nav.sheet-competences a').click(ev => {
    const target = $(ev.currentTarget);

    $(html.find('nav.sheet-competences a i')).remove();
    target.append(`<i class="fa-solid fa-hexagon-check"></i>`);
  });

  html.find('nav.sheet-historiques a').click(ev => {
    const target = $(ev.currentTarget);

    $(html.find('nav.sheet-historiques a i')).remove();
    target.append(`<i class="fa-solid fa-hexagon-check"></i>`);
  });

  html.find('nav.sheet-capacitessortileges a').click(ev => {
    const target = $(ev.currentTarget);

    $(html.find('nav.sheet-capacitessortileges a i')).remove();
    target.append(`<i class="fa-solid fa-hexagon-check"></i>`);
  });
}

export async function confirmationDialog(type='delete', label='') {
  let title = label ? label : game.i18n.localize("HP.Confirmation");
  let content = '';

  switch(type) {
    case 'delete':
      content = game.i18n.localize("HP.ConfirmationSuppression");
      break;
  }

  const confirmation = await Dialog.confirm({
    title:title,
    content:content,
    render: (html) => {
      $(html[0]).parents("div.dialog").addClass('hp')
    }
  });

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        confirmation
      );
    }, 0);
  });
};

export async function rollDialog(title, data=[]) {
  return new Promise(async (resolve) => {
    const content = await renderTemplate('systems/harry-potter-jdr/templates/dialog/dialog-std-sheet.html', {
      data:data
    });

    let d = await new Dialog({
      title: title,
      content: content,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("HP.ROLL.Jet"),
          callback: (html) => {
            resolve(html);
          }
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("HP.Annuler"),
          callback: () => {
            resolve(undefined)
          }
        }
      },
      default: "one",
      render: html => {
        html.find('.onlychoice').click(async ev => {
          const tgt = $(ev.currentTarget);
          const value = tgt.data('value').split('/');

          tgt.addClass('check');
          tgt.parents('.btnWithIconAndNumber').addClass('check');
          tgt.find('i').addClass('fa-check');
          tgt.find('i').removeClass('fa-xmark');

          for(let n = 0;n < value[1];n++) {
            const cHtml = html.find(`.onlychoice${n}`);

            if(n === value[0]-1) continue;
            else {
              cHtml.removeClass('check');
              cHtml.parents('.btnWithIconAndNumber').removeClass('check');
              cHtml.find('i').removeClass('fa-check');
              cHtml.find('i').addClass('fa-xmark');
            }
          }
        });
      },
      close: html => {}
    }, {
      classes: ["hp", "sheet", "dialog", "hp", "roll"],
    });
    d.render(true);
  });
}

export async function doRoll(actor, data) {
  const chatRollMode = game.settings.get("core", "rollMode");
  const label = data?.label ?? '';
  const tags = data?.tags ?? [];
  const bonus = data?.bonus ?? [];
  const sortilege = data?.sortilege ?? {};
  const potion = data?.potion ?? {};
  const dataDgts = data?.degats ?? {};
  const epicsuccess = actor.system.seuils.epicsuccess.total;
  const epicfail = actor.system.seuils.epicfail.total;
  let degats = {};
  let total = data?.total ?? 0;
  let result = '';
  let rolls = [];
  //RESULT ROLL :
  // 0 = Fail
  // 1 = Succès
  // 2 = Maladresse
  // 3 = Succès critique
  let resultRoll = -1;
  let rollTotal;
  total += bonus.reduce((acc, curr) => acc + curr.value, 0);

  const roll = new Roll('1D100');
  await roll.evaluate();
  rollTotal = roll.total;

  rolls.push(roll);

  if(rollTotal <= epicsuccess) {
    result = game.i18n.localize('HP.ROLL.SuccessCritique');
    resultRoll = 3;
  }
  else if(rollTotal >= epicfail) {
    result = game.i18n.localize('HP.ROLL.EpicFail');
    resultRoll = 2;
  }
  else if(rollTotal <= total) {
    result = game.i18n.localize('HP.ROLL.Success');
    resultRoll = 1;
  }
  else if(rollTotal > total) {
    result = game.i18n.localize('HP.ROLL.Fail');
    resultRoll = 0;
  }

  let main = {
    header:label,
    tooltip:await roll.getTooltip(),
    tags,
    label:game.i18n.format("HP.ROLL.VS", {roll:roll.total, objective:total}),
    result:result,
    success:resultRoll === 3 || resultRoll === 1 ? true : false,
  }

  if(!foundry.utils.isEmpty(sortilege)) main.sortilege = sortilege;
  if(!foundry.utils.isEmpty(potion)) main.potion = potion;
  if(!foundry.utils.isEmpty(dataDgts)) {
    console.warn(dataDgts);
    if (/^\d{1,2}d\d{1,2}$/i.test(dataDgts.value)) {
      degats.base = dataDgts.value;
      if(dataDgts.bonus != '0') {
        dataDgts.value += ` + ${dataDgts.bonus}`;
        degats.bonus = dataDgts.bonus;
      }

      const rollDgts = new Roll(dataDgts.value);
      await rollDgts.evaluate();

      degats.value = rollDgts.total;
      degats.tooltip = await rollDgts.getTooltip();
      rolls.push(rollDgts);
    } else {
      if(dataDgts.bonus) {
        if (/^\d{1,2}d\d{1,2}$/i.test(dataDgts.bonus)) {
          const rollDgts = new Roll(`${dataDgts.bonus} + ${dataDgts.value}`);
          await rollDgts.evaluate();

          degats.base = dataDgts.value;
          degats.bonus = dataDgts.bonus;

          degats.value = rollDgts.total;
          degats.tooltip = await rollDgts.getTooltip();
          rolls.push(rollDgts);
        } else {
          degats.value = parseInt(dataDgts.value)+parseInt(dataDgts.bonus);
          degats.base = dataDgts.value;
          degats.bonus = dataDgts.bonus;
        }
      }
    }

    main.degats = degats;
  }

  let chatData = {
      user:game.user.id,
      speaker: {
          actor: actor?.id ?? null,
          token: actor?.token ?? null,
          alias: actor?.name ?? null,
          scene: actor?.token?.parent?.id ?? null
      },
      content:await renderTemplate('systems/harry-potter-jdr/templates/roll/std.html', main),
      sound: CONFIG.sounds.dice,
      rolls:rolls,
      rollMode:chatRollMode,
  };

  const msg = await ChatMessage.create(chatData);

  msg.setFlag('harry-potter-jdr', 'roll', true);
  msg.setFlag('harry-potter-jdr', 'resultRoll', resultRoll);

  return {
    chatData:main,
    resultRoll
  }
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function localizeScolaire(string) {
  const isSetting = CONFIG.HP.competences.scolaires?.[string] ? game.settings?.get('harry-potter-jdr', string) : false;

  return isSetting ? game.settings.get('harry-potter-jdr', string) : game.i18n.localize(`HP.COMPETENCES.${capitalizeFirstLetter(string)}`)
}

export async function prepareRollSorcierCmp(id, actor, modifier=0) {
  const key = id.split('_');
  const items = actor.items;
  const balai = items.find(itm => itm.system.wear && itm.type === 'balai');
  const baguette = items.find(itm => itm.system.wear && itm.type === 'baguette');
  const content = [];
  let label = '';
  let total = 0;
  let fKey = '';
  let data = {};
  let update = {};

  switch(key[0]) {
    case 'specialisation':
      fKey = 'specialisation';
      data = actor.system.competences[key[1]][key[2]].list.find(itm => itm.id === key[3]);
      label = data.specialisation;
      break;

    case 'custom':
      fKey = 'custom';
      data = actor.system.competences[key[1]].custom.find(itm => itm.id === key[2]);
      label = data.label;
      break;

    default:
      fKey = key[1];
      data = actor.system.competences[key[0]][key[1]];
      label = localizeScolaire(key[1]);
      break;
  }
  total = data.actuel.total;

  content.push(
  {
    key:'number',
    label:"HP.ROLL.Modificateur",
    class:'mod bonus',
    data:game.i18n.localize("HP.ROLL.Modificateur"),
    value:modifier,
  });

  if(baguette) {
    const affinite = baguette.system.affinite;

    if(affinite.key) {
      const splitKey = affinite.key.split('_');

      if(splitKey[0] === 'competence' && splitKey[1] === fKey) {
        content.push({
          key:'numberWithCheck',
          label:"HP.ROLL.AffiniteBaguette",
          class:'baguette bonus',
          data:game.i18n.localize("HP.ROLL.AffiniteBaguette"),
          value:affinite.value,
        })
      }
    }
  }

  if(balai) {
    const toFind = fKey === 'specialisation' ? `competences_${key[1]}_${key[2]}` : `competences_${key[0]}_${key[1]}`;
    const bonus = balai.system.bonus.liste.filter(itm => itm.key === 'competence' && itm.label === toFind);

    for(let b of bonus) {
      content.push({
        key:'numberWithCheck',
        label:"HP.ROLL.BonusBalai",
        class:'balai bonus',
        data:game.i18n.localize("HP.ROLL.BonusBalai"),
        value:b.value,
      })
    }
  }

  const dialog = await rollDialog(`${label} : ${game.i18n.localize('HP.ROLL.Modificateurs')}`, content);

  if(!dialog) return;
  const findBonus = dialog.find('.bonus');
  const tags = [];
  const bonus = [];

  for(let b of findBonus) {
    const dB = $(b);

    if(dB.hasClass("numberWithCheck")) {
      if(!dB.find('input').is(':checked')) continue;

      const dBV = parseInt(dB.find('.score').text());

      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    } else {
      const dBV = parseInt(dB.find('input').val());
      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    }
  }

  const roll = await doRoll(actor, {label, total, bonus, tags})

  if(roll.resultRoll === 3) {
    switch(key[0]) {
      case 'specialisation':
        data[key[3]].check = true;
        update[`system.competences.${key[1]}.${key[2]}.list`] = data;
        break;

      case 'custom':
        data[key[2]].check = true;
        update[`system.competences.${key[1]}.custom`] = data;
        break;

      default:
        data.check = true;
        update[`system.competences.${key[0]}.${key[1]}`] = data;
        break;
    }

    this.actor.update(update);
  }
}

export async function prepareRollCreatureCmp(id, actor, modifier=0) {
  const key = id.split('_');
  const content = [];
  let label = '';
  let data;
  let total = 0;

  switch(key[0]) {
    case 'specialisation':
      data = actor.system.competences[key[1]].list.find(itm => itm.id === key[2]);
      total = data.total;
      label = data.specialisation;
      break;

    case 'custom':
      data = actor.system.competences.custom.find(itm => itm.id === key[1]);
      total = data.total;
      label = data.label;
      break;

    default:
      data = actor.system.competences[key[0]];
      total = data.total;
      label = localizeScolaire(key[0]);
      break;
  }

  content.push(
  {
    key:'number',
    label:"HP.ROLL.Modificateur",
    class:'mod bonus',
    data:game.i18n.localize("HP.ROLL.Modificateur"),
    value:modifier,
  });

  const dialog = await rollDialog(`${label} : ${game.i18n.localize('HP.ROLL.Modificateurs')}`, content);

  if(!dialog) return;
  const findBonus = dialog.find('.bonus');
  const tags = [];
  const bonus = [];

  for(let b of findBonus) {
    const dB = $(b);

    if(dB.hasClass("numberWithCheck")) {
      if(!dB.find('input').is(':checked')) continue;

      const dBV = parseInt(dB.find('.score').text());

      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    } else {
      const dBV = parseInt(dB.find('input').val());
      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    }
  }

  const roll = await doRoll(actor, {label, total, bonus, tags})
}

export async function prepareRollCaracteristique(id, actor, modifier=0) {
  const items = actor.items;
  const balai = items.find(itm => itm.system.wear && itm.type === 'balai');
  const baguette = items.find(itm => itm.system.wear && itm.type === 'baguette');
  const content = [];
  const split = id.split('_');
  const key = split[1];
  const data = actor.system.caracteristiques[key];
  const label = game.i18n.localize(`HP.CARACTERISTIQUES.${capitalizeFirstLetter(key)}`);
  let total = data.total;;

  content.push({
    key:'number',
    label:"HP.ROLL.Multiplicateur",
    class:'multi',
    data:game.i18n.localize("HP.ROLL.Multiplicateur"),
    value:3,
    min:1,
    max:5,
  },
  {
    key:'number',
    label:"HP.ROLL.Modificateur",
    class:'mod bonus',
    data:game.i18n.localize("HP.ROLL.Modificateur"),
    value:modifier,
  });

  if(baguette) {
    const affinite = baguette.system.affinite;

    if(affinite.key) {
      const splitKey = affinite.key.split('_');

      if(splitKey[0] === 'caracteristique' && splitKey[1] === key) {
        content.push({
          key:'numberWithCheck',
          label:"HP.ROLL.AffiniteBaguette",
          class:'baguette bonus',
          data:game.i18n.localize("HP.ROLL.AffiniteBaguette"),
          value:affinite.value,
        })
      }
    }
  }

  if(balai) {
    const bonus = balai.system.bonus.liste.filter(itm => itm.key === 'caracteristique' && itm.label === `${key}`);

    for(let b of bonus) {
      content.push({
        key:'numberWithCheck',
        label:"HP.ROLL.BonusBalai",
        class:'balai bonus',
        data:game.i18n.localize("HP.ROLL.BonusBalai"),
        value:b.value,
      })
    }
  }

  const dialog = await rollDialog(`${label} : ${game.i18n.localize('HP.ROLL.Modificateurs')}`, content);

  if(!dialog) return;
  const findBonus = dialog.find('.bonus');
  const tags = [];
  const bonus = [];
  const multi = parseInt(dialog.find('.multi input').val());

  total *= multi;
  tags.push({
    label:game.i18n.localize("HP.ROLL.Multiplicateur"),
    value:`x${multi}`
  });

  for(let b of findBonus) {
    const dB = $(b);

    if(dB.hasClass("numberWithCheck")) {
      if(!dB.find('input').is(':checked')) continue;

      const dBV = parseInt(dB.find('.score').text());

      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    } else {
      const dBV = parseInt(dB.find('input').val());
      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    }
  }

  await doRoll(actor, {label, total, bonus, tags})
}

export async function prepareRollSortilege(id, actor) {
  const items = actor.items;
  const itmSortilege = items.get(id);
  const balai = items.find(itm => itm.system.wear && itm.type === 'balai');
  const baguette = items.find(itm => itm.system.wear && itm.type === 'baguette');
  const content = [];
  const enchantements = actor.system.competences.scolaires.enchantements.actuel.total;
  const mauvaisorts = actor.system.competences.scolaires.mauvaisorts.actuel.total;
  const metamorphose = actor.system.competences.scolaires.metamorphose.actuel.total;
  const pouvoir = actor.system.caracteristiques.pouvoir.total*3;
  const sortilegeType = {e:'enchantements', s:'mauvaisorts', m:'metamorphose'}[itmSortilege.system.type];
  const label = itmSortilege.name;
  let data = {};
  let update = {};
  let total = 0;

  switch(sortilegeType) {
    case 'enchantements':
      total = enchantements
      break;

    case 'mauvaisorts':
      total = mauvaisorts
      break;

    case 'metamorphose':
      total = metamorphose
      break;
  }

  content.push(
    {
      key:'btnWithIconAndNumber',
      label:`HP.SORTILEGES.FormuleClassique`,
      mainclass:'FC check fs17',
      class:'btnFC check fs17 onlychoice onlychoice0',
      value:'1/2',
      icon:`fa-solid fa-check`,
      number:-itmSortilege.system.fc,
      max:0
  });

  if(itmSortilege.system.malus.fe.has && itmSortilege.system.malus.fe.appris) {
    content.push(
      {
        key:'btnWithIconAndNumber',
        label:`HP.SORTILEGES.FormuleExtreme`,
        mainclass:'FE fs17',
        class:'btnFE fs17 onlychoice onlychoice1',
        value:'2/2',
        icon:`fa-solid fa-xmark`,
        number:-itmSortilege.system.fe,
        max:0
      });
  }

  content.push({
    key:'number',
    label:"HP.ROLL.Modificateur",
    class:'mod bonus',
    data:game.i18n.localize("HP.ROLL.Modificateur"),
    value:0,
  })

  if(baguette) {
    const affinite = baguette.system.affinite;

    if(affinite.key) {
      const splitKey = affinite.key.split('_');

      if(splitKey[0] === 'competence' && splitKey[1] === sortilegeType) {
        content.push({
          key:'numberWithCheck',
          label:"HP.ROLL.AffiniteBaguette",
          class:'baguette bonus',
          data:game.i18n.localize("HP.ROLL.AffiniteBaguette"),
          value:affinite.value,
        })
      }
    }
  }

  if(balai) {
    const bonus = balai.system.bonus.liste.filter(itm => itm.key === 'competence' && itm.label === `competences_scolaires_${sortilegeType}`);

    for(let b of bonus) {
      content.push({
        key:'numberWithCheck',
        label:"HP.ROLL.BonusBalai",
        class:'balai bonus',
        data:game.i18n.localize("HP.ROLL.BonusBalai"),
        value:b.value,
      })
    }
  }

  const dialog = await rollDialog(`${label} : ${game.i18n.localize('HP.ROLL.Modificateurs')}`, content);

  if(!dialog) return;
  const findBonus = dialog.find('.bonus');
  const findFC = dialog.find('.FC.check');
  const findFE = dialog.find('.FE.check');
  const tags = [];
  const bonus = [];

  if(pouvoir > total && itmSortilege.system.apprismaison) {
    total = pouvoir;

    tags.push({
      label:game.i18n.localize(`HP.SORTILEGES.PouvoirUtilise`),
      value:''
    });
  }

  if(findFC.length > 0) {
    tags.push({
      label:game.i18n.localize(`HP.SORTILEGES.FormuleClassique`),
      value:parseInt(findFC.find('input').val())
    });

    bonus.push({
      label:game.i18n.localize(`HP.SORTILEGES.FormuleClassique`),
      value:parseInt(findFC.find('input').val())
    })
  }

  if(findFE.length > 0) {
    bonus.push({
      label:game.i18n.localize(`HP.SORTILEGES.FormuleExtreme`),
      value:parseInt(findFE.find('input').val())
    })

    tags.push({
      label:game.i18n.localize(`HP.SORTILEGES.FormuleExtreme`),
      value:parseInt(findFE.find('input').val())
    })
  }

  for(let b of findBonus) {
    const dB = $(b);

    if(dB.hasClass("numberWithCheck")) {
      if(!dB.find('input').is(':checked')) continue;

      const dBV = parseInt(dB.find('.score').text());

      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    } else {
      const dBV = parseInt(dB.find('input').val());
      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    }
  }

  let cibles = [];

  if(itmSortilege.system.cibles.a) cibles.push(`<p title="${game.i18n.localize('HP.Animal')}">${game.i18n.localize('HP.A')}</p>`);
  if(itmSortilege.system.cibles.o) cibles.push(`<p title="${game.i18n.localize('HP.Objet')}">${game.i18n.localize('HP.O')}</p>`);
  if(itmSortilege.system.cibles.p) cibles.push(`<p title="${game.i18n.localize('HP.Personne')}">${game.i18n.localize('HP.P')}</p>`);
  if(itmSortilege.system.cibles.v) cibles.push(`<p title="${game.i18n.localize('HP.Vegetaux')}">${game.i18n.localize('HP.V')}</p>`);

  let malus = `${game.i18n.localize('HP.SORTILEGES.FormuleClassique-short')} : ${itmSortilege.system.malus.fc}%`

  if(itmSortilege.system.malus.fe.has && itmSortilege.system.malus.fe.fc.reduction) {
    malus += `<br/>${game.i18n.localize('HP.SORTILEGES.FormuleExtreme-short')} : ${itmSortilege.system.malus.fe.fc.malus}% / ${itmSortilege.system.malus.fe.malus}%`;
  } else if(itmSortilege.system.malus.fe.has) {
    malus += `<br/>${game.i18n.localize('HP.SORTILEGES.FormuleExtreme-short')} : ${itmSortilege.system.malus.fe.malus}%`
  }

  const sortilege = {
    cibles:cibles.join(' / '),
    niveau:itmSortilege.system.niveau,
    type:localizeScolaire(sortilegeType),
    malus:malus,
    description:await enrichDescription(itmSortilege)
  }

  const roll = await doRoll(actor, {label, total, bonus, tags, sortilege})

  if(roll.resultRoll === 3) {
    const data = actor.system.competences.scolaires[sortilegeType];
    data.check = true;

    update[`system.competences.scolaires.${sortilegeType}`] = data;
    console.warn(update);

    actor.update(update);
  }
}

export async function prepareRollSortilegeCreature(id, actor) {
  const items = actor.items;
  const itmSortilege = items.get(id);
  const balai = items.find(itm => itm.system.wear && itm.type === 'balai');
  const baguette = items.find(itm => itm.system.wear && itm.type === 'baguette');
  const content = [];
  const pouvoir = actor.system.caracteristiques.pouvoir.total*3;
  const sortilegeType = {e:'enchantements', s:'mauvaisorts', m:'metamorphose'}[itmSortilege.system.type];
  const label = itmSortilege.name;
  let update = {};
  let total = pouvoir;

  content.push(
    {
      key:'btnWithIconAndNumber',
      label:`HP.SORTILEGES.FormuleClassique`,
      mainclass:'FC check fs17',
      class:'btnFC check fs17 onlychoice onlychoice0',
      value:'1/2',
      icon:`fa-solid fa-check`,
      number:-itmSortilege.system.fc,
      max:0
  });

  if(itmSortilege.system.malus.fe.has && itmSortilege.system.malus.fe.appris) {
    content.push(
      {
        key:'btnWithIconAndNumber',
        label:`HP.SORTILEGES.FormuleExtreme`,
        mainclass:'FE fs17',
        class:'btnFE fs17 onlychoice onlychoice1',
        value:'2/2',
        icon:`fa-solid fa-xmark`,
        number:-itmSortilege.system.fe,
        max:0
      });
  }

  content.push({
    key:'number',
    label:"HP.ROLL.Modificateur",
    class:'mod bonus',
    data:game.i18n.localize("HP.ROLL.Modificateur"),
    value:0,
  })

  if(baguette) {
    const affinite = baguette.system.affinite;

    if(affinite.key) {
      const splitKey = affinite.key.split('_');

      if(splitKey[0] === 'competence' && splitKey[1] === sortilegeType) {
        content.push({
          key:'numberWithCheck',
          label:"HP.ROLL.AffiniteBaguette",
          class:'baguette bonus',
          data:game.i18n.localize("HP.ROLL.AffiniteBaguette"),
          value:affinite.value,
        })
      }
    }
  }

  if(balai) {
    const bonus = balai.system.bonus.liste.filter(itm => itm.key === 'competence' && itm.label === `competences_scolaires_${sortilegeType}`);

    for(let b of bonus) {
      content.push({
        key:'numberWithCheck',
        label:"HP.ROLL.BonusBalai",
        class:'balai bonus',
        data:game.i18n.localize("HP.ROLL.BonusBalai"),
        value:b.value,
      })
    }
  }

  const dialog = await rollDialog(`${label} : ${game.i18n.localize('HP.ROLL.Modificateurs')}`, content);

  if(!dialog) return;
  const findBonus = dialog.find('.bonus');
  const findFC = dialog.find('.FC.check');
  const findFE = dialog.find('.FE.check');
  const tags = [];
  const bonus = [];

  tags.push({
    label:game.i18n.localize(`HP.SORTILEGES.PouvoirUtilise`),
    value:''
  });

  if(findFC.length > 0) {
    tags.push({
      label:game.i18n.localize(`HP.SORTILEGES.FormuleClassique`),
      value:parseInt(findFC.find('input').val())
    });

    bonus.push({
      label:game.i18n.localize(`HP.SORTILEGES.FormuleClassique`),
      value:parseInt(findFC.find('input').val())
    })
  }

  if(findFE.length > 0) {
    bonus.push({
      label:game.i18n.localize(`HP.SORTILEGES.FormuleExtreme`),
      value:parseInt(findFE.find('input').val())
    })

    tags.push({
      label:game.i18n.localize(`HP.SORTILEGES.FormuleExtreme`),
      value:parseInt(findFE.find('input').val())
    })
  }

  for(let b of findBonus) {
    const dB = $(b);

    if(dB.hasClass("numberWithCheck")) {
      if(!dB.find('input').is(':checked')) continue;

      const dBV = parseInt(dB.find('.score').text());

      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    } else {
      const dBV = parseInt(dB.find('input').val());
      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    }
  }

  let cibles = [];

  if(itmSortilege.system.cibles.a) cibles.push(`<p title="${game.i18n.localize('HP.Animal')}">${game.i18n.localize('HP.A')}</p>`);
  if(itmSortilege.system.cibles.o) cibles.push(`<p title="${game.i18n.localize('HP.Objet')}">${game.i18n.localize('HP.O')}</p>`);
  if(itmSortilege.system.cibles.p) cibles.push(`<p title="${game.i18n.localize('HP.Personne')}">${game.i18n.localize('HP.P')}</p>`);
  if(itmSortilege.system.cibles.v) cibles.push(`<p title="${game.i18n.localize('HP.Vegetaux')}">${game.i18n.localize('HP.V')}</p>`);

  let malus = `${game.i18n.localize('HP.SORTILEGES.FormuleClassique-short')} : ${itmSortilege.system.malus.fc}%`

  if(itmSortilege.system.malus.fe.has && itmSortilege.system.malus.fe.fc.reduction) {
    malus += `<br/>${game.i18n.localize('HP.SORTILEGES.FormuleExtreme-short')} : ${itmSortilege.system.malus.fe.fc.malus}% / ${itmSortilege.system.malus.fe.malus}%`;
  } else if(itmSortilege.system.malus.fe.has) {
    malus += `<br/>${game.i18n.localize('HP.SORTILEGES.FormuleExtreme-short')} : ${itmSortilege.system.malus.fe.malus}%`
  }

  const sortilege = {
    cibles:cibles.join(' / '),
    niveau:itmSortilege.system.niveau,
    type:localizeScolaire(sortilegeType),
    malus:malus,
    description:await enrichDescription(itmSortilege)
  }

  const roll = await doRoll(actor, {label, total, bonus, tags, sortilege})

  if(roll.resultRoll === 3) {
    const data = actor.system.competences.scolaires[sortilegeType];
    data.check = true;

    update[`system.competences.scolaires.${sortilegeType}`] = data;
    console.warn(update);

    actor.update(update);
  }
}

export async function prepareRollPotion(id, actor) {
  const items = actor.items;
  const itmPotion = items.get(id);
  const balai = items.find(itm => itm.system.wear && itm.type === 'balai');
  const baguette = items.find(itm => itm.system.wear && itm.type === 'baguette');
  const content = [];
  const potion = actor.system.competences.scolaires.potion.actuel.total;
  const label = itmPotion.name;
  let data = {};
  let update = {};
  let total = 0;

  content.push({
    key:'number',
    label:"HP.ROLL.Modificateur",
    class:'mod bonus',
    data:game.i18n.localize("HP.ROLL.Modificateur"),
    value:0,
  })

  if(baguette) {
    const affinite = baguette.system.affinite;

    if(affinite.key) {
      const splitKey = affinite.key.split('_');

      if(splitKey[0] === 'competence' && splitKey[1] === 'potion') {
        content.push({
          key:'numberWithCheck',
          label:"HP.ROLL.AffiniteBaguette",
          class:'baguette bonus',
          data:game.i18n.localize("HP.ROLL.AffiniteBaguette"),
          value:affinite.value,
        })
      }
    }
  }

  if(balai) {
    const bonus = balai.system.bonus.liste.filter(itm => itm.key === 'competence' && itm.label === `competences_scolaires_potion`);

    for(let b of bonus) {
      content.push({
        key:'numberWithCheck',
        label:"HP.ROLL.BonusBalai",
        class:'balai bonus',
        data:game.i18n.localize("HP.ROLL.BonusBalai"),
        value:b.value,
      })
    }
  }

  const dialog = await rollDialog(`${label} : ${game.i18n.localize('HP.ROLL.Modificateurs')}`, content);

  if(!dialog) return;
  const findBonus = dialog.find('.bonus');
  const tags = [];
  const bonus = [];

  total = potion;
  total -= itmPotion.system.malus;

  for(let b of findBonus) {
    const dB = $(b);

    if(dB.hasClass("numberWithCheck")) {
      if(!dB.find('input').is(':checked')) continue;

      const dBV = parseInt(dB.find('.score').text());

      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    } else {
      const dBV = parseInt(dB.find('input').val());
      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    }
  }

  let cibles = [];

  if(itmPotion.system.cibles.a) cibles.push(`<p title="${game.i18n.localize('HP.Animal')}">${game.i18n.localize('HP.A')}</p>`);
  if(itmPotion.system.cibles.o) cibles.push(`<p title="${game.i18n.localize('HP.Objet')}">${game.i18n.localize('HP.O')}</p>`);
  if(itmPotion.system.cibles.p) cibles.push(`<p title="${game.i18n.localize('HP.Personne')}">${game.i18n.localize('HP.P')}</p>`);
  if(itmPotion.system.cibles.v) cibles.push(`<p title="${game.i18n.localize('HP.Vegetaux')}">${game.i18n.localize('HP.V')}</p>`);

  const dataPotion = {
    cibles:cibles.join(' / '),
    niveau:itmPotion.system.niveau,
    type:localizeScolaire('potion'),
    malus:itmPotion.system.malus,
    ingredients:game.i18n.localize(`HP.${capitalizeFirstLetter(itmPotion.system.ingredients.type)}`),
    listingredients:itmPotion.system.ingredients.liste.join(' / '),
    description:await enrichDescription(itmPotion),
  }

  const roll = await doRoll(actor, {label, total, bonus, tags, potion:dataPotion})

  if(roll.resultRoll === 3) {
    const data = actor.system.competences.scolaires.potion;
    data.check = true;

    update[`system.competences.scolaires.potion`] = data;

    actor.update(update);
  }
}

export async function prepareRollDegats(actor, id=null) {
  const chatRollMode = game.settings.get("core", "rollMode");
  const value = actor?.system?.derives?.degats?.total ?? '0';
  let label = game.i18n.localize('HP.DERIVES.Degats');
  let base;
  let multi;
  let wpn;

  if(id) {
    const items = actor.items;
    wpn = items.get(id);

    label = wpn.name;
    base = wpn.system.degats.value;
    multi = wpn.system.degats.adddmg;
  }
  let formula;

  if(!base) formula = value;
  else formula = base;

  if(multi && value !== '0') formula += ` + (${value}*${multi})`;

  let roll = {total:formula}

  if(formula != '0') {
    roll = new Roll(formula);
    await roll.evaluate();
  }

  let main = {
    header:label,
    label:` ${roll.total} `,
  }

  if(formula != '0') main.tooltip = await roll.getTooltip();

  if(wpn) {
    main.arme = {};
    main.arme.degats = wpn.system.degats.value;
    main.arme.description = await enrichDescription(wpn);

    if(wpn.system.distance) {
      main.arme.distance = true;
      main.arme.portee = wpn.system.portee;
    }
  }

  let chatData = {
      user:game.user.id,
      speaker: {
          actor: actor?.id ?? null,
          token: actor?.token ?? null,
          alias: actor?.name ?? null,
          scene: actor?.token?.parent?.id ?? null
      },
      content:await renderTemplate('systems/harry-potter-jdr/templates/roll/std.html', main),
      sound: CONFIG.sounds.dice,
      rollMode:chatRollMode,
  };

  if(formula != '0') chatData.rolls = [roll];

  console.warn(chatData);

  const msg = await ChatMessage.create(chatData);

  msg.setFlag('harry-potter-jdr', 'roll', true);
}

export async function prepareRollCombat(id, actor) {
  const key = id.split('_')[1];
  const content = [];
  const data = actor.system.combat.find(itm => itm.id === key);
  const label = data.label;
  let total = data.attaque;
  let degats = {
    value:data.degats,
    bonus:0
  }

  content.push(
  {
    key:'number',
    label:"HP.ROLL.Modificateur",
    class:'mod bonus',
    data:game.i18n.localize("HP.ROLL.Modificateur"),
    value:0,
  },
  {
    key:'text',
    label:"HP.ROLL.ModificateurDegats",
    class:'mod degats',
    value:0,
  });

  const dialog = await rollDialog(`${label} : ${game.i18n.localize('HP.ROLL.Modificateurs')}`, content);

  if(!dialog) return;
  const findBonus = dialog.find('.bonus');
  const findDegats = dialog.find('.degats input').val();
  const tags = [];
  const bonus = [];

  for(let b of findBonus) {
    const dB = $(b);

    if(dB.hasClass("numberWithCheck")) {
      if(!dB.find('input').is(':checked')) continue;

      const dBV = parseInt(dB.find('.score').text());

      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    } else {
      const dBV = parseInt(dB.find('input').val());
      if(dBV === 0) continue;

      bonus.push({
        label:dB.data("value"),
        value:dBV
      });

      tags.push({
        label:dB.data("value"),
        value:dBV
      });
    }
  }

  if(findDegats) {
    tags.push({
      label:game.i18n.localize("HP.ROLL.ModificateurDegats"),
      value:findDegats
    });

    degats.bonus = findDegats;
  }

  const roll = await doRoll(actor, {label, total, bonus, tags, degats})
}

export function splitArrayInHalf(array) {
  const midIndex = Math.ceil(array.length / 2);
  return [array.slice(0, midIndex), array.slice(midIndex)];
}

export async function enrichItems(items) {
  const listDescription = ["avantage", "desavantage", "coupspouce", "crochepatte", "capacite", "arme", "protection"];
  const listEffets = ["potion", "sortilege"];

  for(let d of items) {
    if(listDescription.includes(d.type)) {
      d.enriched = await TextEditor.enrichHTML(d.system.description);
    } else if(listEffets.includes(d.type)) {
      d.enriched = await TextEditor.enrichHTML(d.system.effets);
    } else if(d.type === 'objet') {
      d.enriched = await TextEditor.enrichHTML(d.system.particularite);
    }
  }
}

export async function enrichDescription(item) {
  const listDescription = ["avantage", "desavantage", "coupspouce", "crochepatte", "capacite", "arme", "protection"];
  const listEffets = ["potion", "sortilege"];
  let enriched = "";

  if(listDescription.includes(item.type)) {
    enriched = await TextEditor.enrichHTML(item.system.description);
  } else if(listEffets.includes(item.type)) {
    enriched = await TextEditor.enrichHTML(item.system.effets);
  } else if(item.type === 'objet') {
    enriched = await TextEditor.enrichHTML(item.system.particularite);
  }

  return enriched;
}