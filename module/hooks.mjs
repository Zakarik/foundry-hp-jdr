import {
    localizeScolaire,
  } from "./helpers/common.mjs";

export default class HooksHP {
    static async init() {
        //DEBUT GESTION MESSAGES
        Hooks.on("renderChatMessage", (message, html, messageData) => {
            const isRoll = message.getFlag('harry-potter-jdr', 'roll');
            const isMulti = message.getFlag('harry-potter-jdr', 'multi');
            const isHP = message.getFlag('harry-potter-jdr', 'hp');
            const isInitiative = message.getFlag('core', 'initiativeRoll');
            const tgt = $(html);
            let actor = message.speaker;

            console.warn(message);

            if(actor.scene && actor.token) {
                actor = game?.scene?.get(actor.scene)?.tokens?.get(actor.token)?.actor ?? null;
            } else if(actor.actor) {
                actor = game.actors.get(actor.actor);
            } else actor = null;

            if(isRoll && !isMulti) {
                tgt.addClass('hp roll');

                tgt.find('.dice-tooltip').hide();

                tgt.find('.message-content').click(ev => {
                    tgt.find('.dice-tooltip').toggle({
                        complete: () => {}
                    });
                });
            }

            if(isMulti) {
                tgt.addClass('hp roll multi');
                tgt.find('.dice-tooltip').toggle();

                tgt.find('.message-content header.main, .message-content h4, .message-content span.label, .message-content span.objective, .message-content span.result, .message-content span.gain, .message-content div.dice-tooltip').click(ev => {
                    tgt.find('.dice-tooltip').toggle({
                        complete: () => {}
                    });
                });

                tgt.find('.message-content a.gain').click(async ev => {
                    if(!actor) {
                        ui.notifications.error(game.i18n.localize('HP.ERREUR.NoActor'));
                        return;
                    }

                    const chatRollMode = game.settings.get("core", "rollMode");
                    const subtgt = $(ev.currentTarget);
                    const subkey = subtgt.data('key').split('_');
                    const subgain = subtgt.data('gain');
                    const type = subkey[0];
                    const domain = subkey[1];
                    const cmp = subkey[2];
                    const num = subkey[3];
                    let label = '';
                    let origin;
                    let gain;

                    if(type === 'custom') {
                        const custom = actor.system.competences[domain].custom;

                        origin = custom[cmp].actuel.progression;

                        custom[cmp].actuel.progression += parseInt(subgain);
                        actor.update({[`system.competences.${domain}.custom`]:custom});

                        label = custom[cmp].label;
                        custom[cmp].check = false;
                        gain = custom[cmp].actuel.progression;
                    } else if(type === 'specialisation') {
                        const spe = actor.system.competences[domain][cmp].list;

                        origin = spe[num].actuel.progression;

                        spe[num].actuel.progression += parseInt(subgain)
                        spe[num].check = false;
                        actor.update({[`system.competences.${domain}.${cmp}.list`]:spe})

                        if(cmp === 'langueetrangere') label += localizeScolaire('langueetrangere');
                        else if(cmp === 'connaissance' && domain === 'sorciers') label += `${localizeScolaire('connaissance')} - ${game.i18n.localize('HP.Sorcier')}`;
                        else if(cmp === 'connaissance' && domain === 'moldus') label += `${localizeScolaire('connaissance')} - ${game.i18n.localize('HP.Moldu')}`;
                        label += ` (${spe[num].specialisation})`;
                        gain = spe[num].actuel.progression;
                    } else {
                        const std = actor.system.competences[type][domain];
                        std.check = false;

                        origin = std.actuel.progression;

                        std.actuel.progression += parseInt(subgain)
                        actor.update({[`system.competences.${type}.${domain}`]:std})

                        label = localizeScolaire(domain);
                        gain = std.actuel.progression;
                    }

                    let main = {
                        header:label,
                        msg:`${origin} => ${gain}`,
                    }

                    let chatData = {
                        user:game.user.id,
                        speaker: message.speaker,
                        content:await renderTemplate('systems/harry-potter-jdr/templates/roll/msg.html', main),
                        sound: CONFIG.sounds.dice,
                        rollMode:chatRollMode,
                    };

                    const msg = await ChatMessage.create(chatData);

                    msg.setFlag('harry-potter-jdr', 'hp', true);
                });

                if(!message.isOwner && !game.user.isGM) {
                    tgt.find('.message-content a.gain').remove();
                }
            }

            if(isHP) {
                tgt.addClass('hp');
            }

            if(isInitiative) {
                tgt.addClass('hp initiative');
            }
        });
    }
}