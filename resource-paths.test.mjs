import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeResourceUrl,safeResourceUrl,fileNameFromUrl} from './resource-paths.mjs';
test('rutas relativas y subcarpetas funcionan bajo GitHub Pages',()=>{
  const path=normalizeResourceUrl('./archivos/taller/solución 2026.pdf');
  assert.equal(path,'archivos/taller/soluci%C3%B3n%202026.pdf');
  assert.equal(new URL(path,'https://example.org/control/admin.html').pathname,'/control/archivos/taller/soluci%C3%B3n%202026.pdf');
  assert.equal(normalizeResourceUrl(path),path);
  assert.equal(fileNameFromUrl(path),'solución 2026.pdf');
});
test('mantiene URLs externas y rechaza rutas fuera de archivos',()=>{
  assert.equal(normalizeResourceUrl('https://example.org/file.pdf'),'https://example.org/file.pdf');
  for(const path of ['javascript:alert(1)','//other.org/file.pdf','archivos/../admin.html','archivos/%2e%2e/admin.html','archivos/%2fescape.pdf','/archivos/file.pdf','archivos/','archivos/a\\b.pdf']) assert.equal(safeResourceUrl(path),'');
});
