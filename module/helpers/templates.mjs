/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
    const base = 'systems/harry-potter-jdr/templates';

    const dialog = [
      `${base}/dialog/dialog-std-sheet.html`,
    ];

    const parts = [
      `${base}/actors/limited-creature-sheet.html`,
      `${base}/actors/limited-sorcier-sheet.html`,
      `${base}/actors/parts/historique.html`,
      `${base}/actors/parts/historique-limited.html`,
      `${base}/actors/parts/competences.html`,
      `${base}/actors/parts/competences-creature.html`,
      `${base}/actors/parts/combat.html`,
      `${base}/actors/parts/sortileges.html`,
      `${base}/actors/parts/potions.html`,
      `${base}/actors/parts/inventaire.html`,
      `${base}/actors/parts/capacites.html`,
      `${base}/items/parts/effets.html`,
      `${base}/compendium/parts/objet.html`,
      `${base}/compendium/parts/arme.html`,
      `${base}/compendium/parts/protection.html`,
      `${base}/compendium/parts/avdv.html`,
      `${base}/compendium/parts/sortilege.html`,
      `${base}/compendium/parts/potion.html`,
      `${base}/compendium/parts/baguette.html`,
      `${base}/compendium/parts/balai.html`,
    ];

    const subparts = [
      `${base}/actors/parts/subparts/competence.html`,
    ]

    const templates = [
      `${base}/roll/msg.html`,
      `${base}/roll/std.html`,
      `${base}/roll/multi-roll.html`,
    ];

    const templatePaths = [].concat(dialog, parts, subparts, templates);

    // Load the template parts
    return loadTemplates(templatePaths);
}