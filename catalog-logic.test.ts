import test from 'node:test';
import assert from 'node:assert/strict';
import CatalogLogic from './catalog-logic.js';

const {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  normalizeCategories,
  mergeCategoriesFromProducts,
  getCategoryLabel,
  countProductsByCategory,
  addCategory,
  renameCategory,
  moveCategory,
  deleteCategory,
  filterProducts
} = CatalogLogic;

test('normalizeCategories returns default categories when empty or invalid', () => {
  const cats = normalizeCategories(null);
  assert.equal(cats.length, DEFAULT_CATEGORIES.length);
  assert.equal(cats[3].id, 'Alberi');
  assert.equal(cats[3].name, 'Alberi & Rami');
});

test('addCategory validates empty, reserved, duplicate, and adds valid category', () => {
  assert.equal(addCategory(DEFAULT_CATEGORIES, '   ').ok, false);
  assert.equal(addCategory(DEFAULT_CATEGORIES, 'Tutti').ok, false);
  assert.equal(addCategory(DEFAULT_CATEGORIES, 'ghirlande').ok, false);
  assert.equal(addCategory(DEFAULT_CATEGORIES, 'Alberi & Rami').ok, false);

  const res = addCategory(DEFAULT_CATEGORIES, '  Segnaposto  Natalizi ');
  assert.equal(res.ok, true);
  assert.equal(res.categories.length, DEFAULT_CATEGORIES.length + 1);
  assert.deepEqual(res.category, { id: 'Segnaposto Natalizi', name: 'Segnaposto Natalizi' });
});

test('renameCategory updates category name and migrates matching products', () => {
  const res = renameCategory(DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, 'Alberi', 'Alberi Decorati');
  assert.equal(res.ok, true);
  assert.equal(res.updatedProductsCount, 1);
  const migrated = res.products.find(p => p.id === 6);
  assert.equal(migrated.cat, 'Alberi Decorati');
  assert.equal(getCategoryLabel(res.categories, 'Alberi Decorati'), 'Alberi Decorati');
});

test('renameCategory rejects collisions with another category', () => {
  const res = renameCategory(DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, 'Alberi', 'Bouquet');
  assert.equal(res.ok, false);
});

test('moveCategory reorders categories within bounds', () => {
  const movedUp = moveCategory(DEFAULT_CATEGORIES, 'Centrotavola', -1);
  assert.equal(movedUp[0].id, 'Centrotavola');
  assert.equal(movedUp[1].id, 'Ghirlande');

  const unchanged = moveCategory(DEFAULT_CATEGORIES, 'Ghirlande', -1);
  assert.equal(unchanged[0].id, 'Ghirlande');
});

test('deleteCategory requires reassignment when products exist, and reassigns cleanly', () => {
  const emptyAdd = addCategory(DEFAULT_CATEGORIES, 'Vuota');
  const delEmpty = deleteCategory(emptyAdd.categories, DEFAULT_PRODUCTS, 'Vuota');
  assert.equal(delEmpty.ok, true);
  assert.equal(delEmpty.categories.length, DEFAULT_CATEGORIES.length);

  const delWithProducts = deleteCategory(DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, 'Ghirlande');
  assert.equal(delWithProducts.ok, false);
  assert.equal(delWithProducts.requiresReassign, true);
  assert.equal(delWithProducts.assignedCount, 3);

  const delReassigned = deleteCategory(DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, 'Ghirlande', 'Composizioni');
  assert.equal(delReassigned.ok, true);
  assert.equal(delReassigned.reassignedCount, 3);
  assert.equal(delReassigned.categories.some(c => c.id === 'Ghirlande'), false);
  assert.equal(delReassigned.products.filter(p => p.cat === 'Composizioni').length, 5);
});

test('countProductsByCategory and mergeCategoriesFromProducts work accurately', () => {
  const stats = countProductsByCategory(DEFAULT_CATEGORIES, DEFAULT_PRODUCTS);
  assert.equal(stats.total, 9);
  assert.equal(stats.counts.Ghirlande, 3);
  assert.equal(stats.counts.Alberi, 1);

  const importedProducts = [...DEFAULT_PRODUCTS, { id: 99, name: 'Lanterna', cat: 'Lanterne' }];
  const merged = mergeCategoriesFromProducts(DEFAULT_CATEGORIES, importedProducts);
  assert.equal(merged.some(c => c.id === 'Lanterne'), true);
});

test('filterProducts filters by category and search query', () => {
  const filtered = filterProducts(DEFAULT_PRODUCTS, 'Alberi', 'abete');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 6);
});
