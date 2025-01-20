class Toggler {
    constructor() {
      this.toggles = this._load();
      this.togglesSimple = this._loadSimple();
    }

    init(id, html) {
      id = this._cleanId(id);

      html[0].querySelectorAll('.js-toggler').forEach((element, index) => {
        const visible = this.toggles.get(this._getKey(id, index));

        if ('undefined' !== typeof visible) {
          this._getSiblings(element).toggle(visible);
          this._toggleClasses(element.querySelector('i:first-child'), visible);

          if(!visible) {
            $(element.querySelector('div.btn')).toggle({
              complete: () => this._setElementVisibility(id, index, element),
            });
          }
        }

        element.querySelector('i:first-child').addEventListener('click', e => {
          e.preventDefault();

          const target = e.currentTarget;

          this._toggleClasses(target);

          this._getSiblings(element).toggle({
            complete: () => this._setElementVisibility(id, index, element),
          });

          $(element.querySelector('div.btn')).toggle({
            complete: () => this._setElementVisibility(id, index, element),
          });
        });
      });

      html[0].querySelectorAll('.js-simpletoggler').forEach((element, index) => {
        const visible = this.togglesSimple.get(this._getKey(id, index));

        if ('undefined' !== typeof visible) {
          this._getSiblings(element).toggle(visible);
        }

        if(visible) {
            $(element.querySelector('img.options')).attr("src", "systems/harry-potter-jdr/assets/icons/optionWhite.svg");
        }

        element.querySelector('img.options').addEventListener('click', e => {
            e.preventDefault();
            const siblings = this._getSiblings(element);

            if(siblings.length > 0) {
                if($(siblings[0]).is(':visible')) {
                    $(element.querySelector('img.options')).attr("src", "systems/harry-potter-jdr/assets/icons/optionBlack.svg")
                } else {
                    $(element.querySelector('img.options')).attr("src", "systems/harry-potter-jdr/assets/icons/optionWhite.svg")
                }
            }

            siblings.toggle({
                complete: () => this._setElementSimpleVisibility(id, index, element),
            });
        });


      });
    }

    clearForId(id) {
      id = this._cleanId(id);

      this.toggles.forEach((value, key) => {
        if (key.startsWith(id)) {
          this.toggles.delete(key);
        }
      });

      this.togglesSimple.forEach((value, key) => {
        if (key.startsWith(id)) {
          this.togglesSimple.delete(key);
        }
      });

      this._save();
      this._saveSimple();
    }

    clearAll() {
      this.toggles = new Map();
      this.togglesSimple = new Map();

      this._save();
      this._saveSimple();
    }

    _cleanId(id) {
      return id.split('-').pop();
    }

    _getSiblings(element) {
      return $(element).siblings().not('.selected');
    }

    _toggleClasses(element, forcedVisibility) {
      if ('undefined' === typeof forcedVisibility) {
        element.classList.toggle('fa-plus-square');
        element.classList.toggle('fa-minus-square');

        return;
      }

      if (forcedVisibility) {
        element.classList.remove('fa-plus-square');
        element.classList.add('fa-minus-square');
      } else {
        element.classList.add('fa-plus-square');
        element.classList.remove('fa-minus-square');
      }
    }

    _setElementVisibility(id, index, element) {
      const target = this._getToggleTarget(element);

      this.toggles.set(this._getKey(id, index), 'none' !== target.style.display);

      this._save();
    }

    _setElementSimpleVisibility(id, index, element) {
      const target = this._getToggleTarget(element);

      this.togglesSimple.set(this._getKey(id, index), 'none' !== target.style.display);

      this._saveSimple();
    }

    _getToggleTarget(element) {
      return element.nextElementSibling;
    }

    _getKey(id, index) {
      return `${id}-${index}`;
    }

    _save() {
      const dataset = {};

      this.toggles.forEach((value, key) => {
        dataset[key] = value;
      });

      localStorage.setItem('hpjdr.togglers', JSON.stringify(dataset));
    }

    _saveSimple() {
      const dataset = {};

      this.togglesSimple.forEach((value, key) => {
        dataset[key] = value;
      });

      localStorage.setItem('hpjdr.simpletogglers', JSON.stringify(dataset));
    }

    _load() {
      const dataset = localStorage.getItem('hpjdr.togglers');
      if (null === dataset) {
        return new Map();
      }

      const map = new Map();

      for (const [key, value] of Object.entries(JSON.parse(dataset))) {
        map.set(key, value);
      }

      return map;
    }

    _loadSimple() {
      const dataset = localStorage.getItem('hpjdr.simpletogglers');
      if (null === dataset) {
        return new Map();
      }

      const map = new Map();

      for (const [key, value] of Object.entries(JSON.parse(dataset))) {
        map.set(key, value);
      }

      return map;
    }
  }

  export default new Toggler();