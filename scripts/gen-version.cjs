/**
 * package.json 의 "version" 을 앱 JS 상수(appVersion.generated.ts)로 주입한다.
 * → 버전 관리 지점을 package.json 한 곳으로 통일(APP_VERSION 손으로 올리는 실수 방지).
 *
 * 실행: npm run gen:version  (postinstall 에서 자동 실행 + Codemagic 빌드에서 npm install 시 자동)
 * 절대 빌드를 깨지 않도록 어떤 오류든 exit 0.
 */
const fs = require('fs');
const path = require('path');

try {
  const pkg = require(path.join(__dirname, '..', 'package.json'));
  const version = String(pkg.version || '1.0.0');
  const out = path.join(__dirname, '..', 'src', 'infrastructure', 'config', 'appVersion.generated.ts');
  const content =
    '// 자동 생성 파일 — 직접 수정 금지. 값은 package.json "version" 에서 온다.\n' +
    '// 갱신: npm run gen:version (postinstall / Codemagic 빌드에서 자동 실행)\n' +
    `export const GENERATED_APP_VERSION = '${version}';\n`;
  const prev = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (prev !== content) {
    fs.writeFileSync(out, content);
    console.log('[gen-version] APP_VERSION =', version);
  }
} catch (e) {
  console.warn('[gen-version] skipped:', e && e.message);
}
process.exit(0);
