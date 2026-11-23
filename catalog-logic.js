(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CatalogLogic = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const STORAGE_KEYS = {
    PRODUCTS: 'bf_products_2026',
    CATEGORIES: 'bf_categories_2026',
    CART: 'bf_cart_2026'
  };

  const DEFAULT_CATEGORIES = [
    { id: 'Ghirlande', name: 'Ghirlande' },
    { id: 'Centrotavola', name: 'Centrotavola' },
    { id: 'Bouquet', name: 'Bouquet' },
    { id: 'Alberi', name: 'Alberi & Rami' },
    { id: 'Composizioni', name: 'Composizioni' }
  ];

  const DEFAULT_PRODUCTS = [
    {
      id: 1, name: 'Ghirlanda Classica Rossa', cat: 'Ghirlande', tag: 'BESTSELLER',
      desc: 'Ghirlanda in pino fresco con bacche rosse, pigne dorate e nastro in velluto. Diametro ø 40 cm.',
      price: '€ 45', oldPrice: '€ 55', rating: '4.9', emoji: '🎄', status: 'available', img: null, tone: 'tone-1'
    },
    {
      id: 2, name: 'Centrotavola Natalizio Gold', cat: 'Centrotavola', tag: 'IDEA REGALO',
      desc: 'Composizione con rami di abete, cinnamomo, stelle di natale bianche e candela profumata.',
      price: '€ 38', oldPrice: '€ 48', rating: '4.8', emoji: '🕯️', status: 'available', img: null, tone: 'tone-3'
    },
    {
      id: 3, name: 'Bouquet Rosso & Bianco', cat: 'Bouquet', tag: 'PREFERITO',
      desc: 'Bouquet invernale con amarilli rossi, rami di bacche bianche e foglie di agrifoglio. Su ordinazione.',
      price: '€ 55', oldPrice: '€ 68', rating: '4.9', emoji: '🌹', status: 'available', img: null, tone: 'tone-2'
    },
    {
      id: 4, name: 'Ghirlanda Moderna Minimal', cat: 'Ghirlande', tag: 'NOVITÀ',
      desc: 'Ghirlanda boho con cotone essiccato, eucalipto, pigne naturali e fiocco in juta. Ø 35 cm.',
      price: '€ 40', oldPrice: '€ 50', rating: '4.7', emoji: '🌿', status: 'available', img: null, tone: 'tone-1'
    },
    {
      id: 5, name: 'Composizione Candela Natale', cat: 'Composizioni', tag: 'IDEA REGALO',
      desc: 'Base in muschio con tre candele avvolte in abete, agrifoglio e rametti di eucalipto.',
      price: '€ 32', oldPrice: '€ 42', rating: '4.8', emoji: '🕯️', status: 'limited', img: null, tone: 'tone-3'
    },
    {
      id: 6, name: 'Ramo di Abete Decorato', cat: 'Alberi', tag: 'BESTSELLER',
      desc: 'Ramo singolo di abete naturale decorato con luci led, palline e nastri. Altezza 80 cm.',
      price: '€ 28', oldPrice: '€ 35', rating: '4.9', emoji: '🌲', status: 'available', img: null, tone: 'tone-1'
    },
    {
      id: 7, name: 'Stella di Natale XXL', cat: 'Composizioni', tag: 'NOVITÀ',
      desc: 'Stella di natale in grande formato (ø 25 cm) avvolta in carta kraft decorata con nastro dorato.',
      price: '€ 22', oldPrice: '€ 28', rating: '4.8', emoji: '🌺', status: 'available', img: null, tone: 'tone-2'
    },
    {
      id: 8, name: 'Centrotavola Rustico', cat: 'Centrotavola', tag: 'PREFERITO',
      desc: 'Base di tronchetto con muschio, pigne, stelle di anice, cannella e fiori secchi.',
      price: '€ 35', oldPrice: '€ 45', rating: '4.9', emoji: '🍂', status: 'available', img: null, tone: 'tone-3'
    },
    {
      id: 9, name: 'Ghirlanda Secca & Profumata', cat: 'Ghirlande', tag: 'ESAURITO',
      desc: 'Ghirlanda di fiori secchi, lavanda, anice, cannella e agrumi essiccati. Ø 30 cm.',
      price: '€ 36', oldPrice: '€ 44', rating: '4.7', emoji: '🌸', status: 'sold', img: null, tone: 'tone-2'
    }
  ];

  function cloneDefaults(arr) {
    return arr.map(function (item) {
      return Object.assign({}, item);
    });
  }

  function normalizeCategories(raw) {
    if (!Array.isArray(raw) || raw.length === 0) {
      return cloneDefaults(DEFAULT_CATEGORIES);
    }
    var seen = new Set();
    var result = [];
    for (var i = 0; i < raw.length; i++) {
      var item = raw[i];
      var id = '';
      var name = '';
      if (typeof item === 'string') {
        id = item.trim();
        name = id;
      } else if (item && typeof item === 'object') {
        id = String(item.id || item.name || '').trim();
        name = String(item.name || item.id || '').trim();
      }
      if (!id || !name) continue;
      var key = id.toLowerCase();
      if (key === 'tutti' || seen.has(key)) continue;
      seen.add(key);
      result.push({ id: id, name: name });
    }
    return result.length ? result : cloneDefaults(DEFAULT_CATEGORIES);
  }

  function mergeCategoriesFromProducts(categories, products) {
    var list = normalizeCategories(categories);
    if (!Array.isArray(products)) return list;
    var seenIds = new Set(list.map(function (c) { return c.id.toLowerCase(); }));
    var seenNames = new Set(list.map(function (c) { return c.name.toLowerCase(); }));
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var cat = p && p.cat ? String(p.cat).trim() : '';
      if (!cat) continue;
      var lower = cat.toLowerCase();
      if (lower === 'tutti' || seenIds.has(lower) || seenNames.has(lower)) continue;
      seenIds.add(lower);
      seenNames.add(lower);
      list.push({ id: cat, name: cat });
    }
    return list;
  }

  function getCategoryLabel(categories, catId) {
    if (!catId) return 'Altro';
    var list = normalizeCategories(categories);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === catId || list[i].name === catId) {
        return list[i].name;
      }
    }
    return catId;
  }

  function countProductsByCategory(categories, products) {
    var list = normalizeCategories(categories);
    var prods = Array.isArray(products) ? products : [];
    var counts = {};
    for (var i = 0; i < list.length; i++) {
      counts[list[i].id] = 0;
    }
    var uncategorized = 0;
    for (var j = 0; j < prods.length; j++) {
      var p = prods[j];
      var cat = p && p.cat ? String(p.cat) : '';
      if (Object.prototype.hasOwnProperty.call(counts, cat)) {
        counts[cat] += 1;
      } else {
        uncategorized += 1;
      }
    }
    return {
      total: prods.length,
      counts: counts,
      uncategorized: uncategorized
    };
  }

  function addCategory(categories, rawName) {
    var list = normalizeCategories(categories);
    var name = String(rawName || '').trim().replace(/\s+/g, ' ');
    if (!name) {
      return { ok: false, error: 'Inserisci il nome della categoria.' };
    }
    if (name.length > 40) {
      return { ok: false, error: 'Il nome può contenere al massimo 40 caratteri.' };
    }
    var lower = name.toLowerCase();
    if (lower === 'tutti') {
      return { ok: false, error: 'Il nome "Tutti" è riservato.' };
    }
    for (var i = 0; i < list.length; i++) {
      if (list[i].id.toLowerCase() === lower || list[i].name.toLowerCase() === lower) {
        return { ok: false, error: 'Esiste già una categoria con questo nome.' };
      }
    }
    var newCat = { id: name, name: name };
    return {
      ok: true,
      category: newCat,
      categories: list.concat([newCat])
    };
  }

  function renameCategory(categories, products, targetId, rawNewName) {
    var list = normalizeCategories(categories);
    var prods = Array.isArray(products) ? products.slice() : [];
    var newName = String(rawNewName || '').trim().replace(/\s+/g, ' ');
    if (!newName) {
      return { ok: false, error: 'Il nome della categoria non può essere vuoto.' };
    }
    if (newName.length > 40) {
      return { ok: false, error: 'Il nome può contenere al massimo 40 caratteri.' };
    }
    var lower = newName.toLowerCase();
    if (lower === 'tutti') {
      return { ok: false, error: 'Il nome "Tutti" è riservato.' };
    }
    var targetIdx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === targetId) {
        targetIdx = i;
      } else if (list[i].id.toLowerCase() === lower || list[i].name.toLowerCase() === lower) {
        return { ok: false, error: 'Esiste già un\'altra categoria con questo nome.' };
      }
    }
    if (targetIdx === -1) {
      return { ok: false, error: 'Categoria non trovata.' };
    }
    var oldCat = list[targetIdx];
    var newId = newName;
    var nextCategories = list.map(function (c, idx) {
      return idx === targetIdx ? { id: newId, name: newName } : c;
    });
    var updatedProductsCount = 0;
    var nextProducts = prods.map(function (p) {
      if (p && p.cat === oldCat.id) {
        updatedProductsCount += 1;
        return Object.assign({}, p, { cat: newId });
      }
      return p;
    });
    return {
      ok: true,
      categories: nextCategories,
      products: nextProducts,
      category: { id: newId, name: newName },
      updatedProductsCount: updatedProductsCount
    };
  }

  function moveCategory(categories, targetId, direction) {
    var list = normalizeCategories(categories);
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === targetId) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return list;
    var targetIdx = idx + (direction < 0 ? -1 : 1);
    if (targetIdx < 0 || targetIdx >= list.length) return list;
    var copy = list.slice();
    var tmp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = tmp;
    return copy;
  }

  function deleteCategory(categories, products, targetId, reassignToId) {
    var list = normalizeCategories(categories);
    var prods = Array.isArray(products) ? products.slice() : [];
    if (list.length <= 1) {
      return { ok: false, error: 'Deve rimanere almeno una categoria nel catalogo.' };
    }
    var exists = list.some(function (c) { return c.id === targetId; });
    if (!exists) {
      return { ok: false, error: 'Categoria non trovata.' };
    }
    var remaining = list.filter(function (c) { return c.id !== targetId; });
    var assignedCount = 0;
    for (var i = 0; i < prods.length; i++) {
      if (prods[i] && prods[i].cat === targetId) assignedCount += 1;
    }
    if (assignedCount > 0) {
      if (!reassignToId || reassignToId === targetId) {
        return {
          ok: false,
          requiresReassign: true,
          assignedCount: assignedCount,
          error: 'Questa categoria contiene articoli. Seleziona dove spostarli prima di eliminarla.'
        };
      }
      var validTarget = remaining.some(function (c) { return c.id === reassignToId; });
      if (!validTarget) {
        return { ok: false, error: 'Categoria di destinazione non valida.' };
      }
    }
    var reassignedCount = 0;
    var nextProducts = prods.map(function (p) {
      if (p && p.cat === targetId) {
        reassignedCount += 1;
        return Object.assign({}, p, { cat: reassignToId });
      }
      return p;
    });
    return {
      ok: true,
      categories: remaining,
      products: nextProducts,
      reassignedCount: reassignedCount
    };
  }

  function filterProducts(products, selectedCat, searchQuery) {
    var prods = Array.isArray(products) ? products : [];
    var cat = selectedCat || 'tutti';
    var q = String(searchQuery || '').toLowerCase().trim();
    return prods.filter(function (p) {
      if (!p) return false;
      var matchCat = cat === 'tutti' || p.cat === cat;
      var matchSearch = !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.desc && p.desc.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }

  return {
    STORAGE_KEYS: STORAGE_KEYS,
    DEFAULT_CATEGORIES: DEFAULT_CATEGORIES,
    DEFAULT_PRODUCTS: DEFAULT_PRODUCTS,
    normalizeCategories: normalizeCategories,
    mergeCategoriesFromProducts: mergeCategoriesFromProducts,
    getCategoryLabel: getCategoryLabel,
    countProductsByCategory: countProductsByCategory,
    addCategory: addCategory,
    renameCategory: renameCategory,
    moveCategory: moveCategory,
    deleteCategory: deleteCategory,
    filterProducts: filterProducts
  };
}));
