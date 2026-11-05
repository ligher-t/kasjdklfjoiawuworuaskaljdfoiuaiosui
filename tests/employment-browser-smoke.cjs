'use strict';
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const fixture = () => {
  document.addEventListener('DOMContentLoaded', () => {
    let stage = 'startup', handlerError;
    window.addEventListener('error', event => { handlerError = event.message; });
    const expect = (condition, message) => { if (!condition) throw Error(message); };
    const one = selector => {
      const element = document.querySelector(selector);
      expect(element && !element.disabled && element.getAttribute('aria-disabled') !== 'true' &&
        element.getClientRects().length, 'Unavailable: ' + selector +
        ' (exists=' + !!element + ', disabled=' + element?.disabled + ', rects=' + element?.getClientRects().length + ')');
      return element;
    };
    try {
      born({seed:20261105,by:1077,region:'クルビア'});
      S.age=24;S.year=S.by+S.age;S.mo=2;S.job=0;S.fl.sch=0;
      S.educationDecision=null;S.educationPath=null;
      // Let the production render advance the locality to the fixture year.
      // Otherwise that first render expires the fixture's newly inserted vacancy.
      rd();
      const area=occupationAreaSnapshot(S), world=S.world.occupationWorld;
      const siteId='browser-site', positionId='browser-position', openingId='browser-opening', employerId='browser-employer';
      world.employers[employerId]={employerId,organizationKey:null};
      world.sites[siteId]={siteId,employerId,areaId:area.areaId,status:'open',lastYear:S.year,positionIds:[positionId]};
      world.positions[positionId]={positionId,siteId,jobId:2,capacity:1,aggregateOccupiedSlots:0,
        identifiedOccupiedSlots:0,reservedSlots:0,vacancyCount:1,openingIds:[openingId]};
      world.openings[openingId]={openingId,siteId,positionId,employerId,areaId:area.areaId,
        kind:'general-public',status:'open',slots:1,validFromYear:S.year};
      area.siteIds=[siteId];
      rd();
      openLifeLedger('work');
      stage = 'inquire';
      expect(!document.querySelector('#employment-opening-0'),'Unknown offer must be hidden');
      const inquiry=one('#employment-inquire');
      inquiry.focus();
      inquiry.click();
      expect(document.activeElement.id==='employment-inquire','Inquiry must restore focus after re-render');
      expect(!currentPlayerEmployment(S),'Inquiry must leave employment unchanged');
      expect(employmentKnownOpenings(S).some(row=>row.openingId===openingId && row.isCurrentArea),
        'Inquiry must record the current opening');
      stage = 'decline';
      one('#employment-opening-0').click();
      expect(document.activeElement.id==='mt' && S.ev?.id==='work_known_opening_review','Offer must open and focus its choice sheet');
      one('#mc button:nth-child(2)').click();
      expect(!S.ev && !currentPlayerEmployment(S) && world.openings[openingId].slots===1,'Decline must preserve vacancy');
      S.mo++;
      rd();
      openLifeLedger('work');
      stage = 'accept';
      one('#employment-opening-0').click();
      one('#mc button:first-child').click();
      expect(!S.ev && currentPlayerEmployment(S)?.siteId===siteId && world.openings[openingId].slots===0,'Acceptance must start work and consume the vacancy');
      document.documentElement.dataset.employmentSmoke='passed';
    } catch (error) {
      document.documentElement.dataset.employmentSmoke=stage + ': ' + error.message +
        (handlerError ? ' / ' + handlerError : '');
    }
  });
};

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'terra-employment-browser-'));
try {
  const documentPath = path.join(temporary, 'employment.html');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
    .replace(/<head[^>]*>/, match => match + '<base href="' + pathToFileURL(root + path.sep).href + '">')
    .replace('</body>', '<script>(' + fixture.toString() + ')();</script></body>');
  fs.writeFileSync(documentPath, html);
  const browser = spawnSync(process.env.TERRA_TEST_CHROMIUM || 'google-chrome', [
    '--headless', '--disable-dev-shm-usage', '--no-sandbox', '--no-first-run', '--disable-background-networking',
    '--window-size=1024,900', '--user-data-dir=' + path.join(temporary, 'profile'),
    '--dump-dom', pathToFileURL(documentPath).href
  ], { encoding:'utf8', timeout:30000, maxBuffer:8*1024*1024 });
  if (browser.error) throw browser.error;
  assert.equal(browser.status, 0, browser.stderr);
  assert.equal(browser.stdout.match(/data-employment-smoke="([^"]+)"/)?.[1], 'passed');
  console.log('Chromium employment desk, focus, decline and acceptance PASS');
} finally {
  fs.rmSync(temporary, { recursive:true, force:true, maxRetries:4 });
}
