/**
 * Irradiant Energy — lead register.
 *
 * A Google Apps Script web app bound to one Google Sheet. The website's server posts each enquiry
 * here after the sales alert email has gone (src/lib/leads/sheet.ts in the website repository), and
 * this script writes it as one row. Setup, step by step: README.md next to this file.
 *
 * What it accepts: a POST whose body is JSON —
 *   { "token": "…", "action": "append", "row": { "Reference": "IE-7K3QX2", "Name": "…", … } }
 *   { "token": "…", "action": "email", "reference": "IE-7K3QX2", "email": "…" }
 * and it answers JSON: { "ok": true } or { "ok": false, "error": "<short code>" }.
 *
 * Safety rules it keeps:
 * - The token must match the Script Property TOKEN (compared in constant time), or nothing happens.
 *   The token lives only in Script Properties and in the website's server settings, never here.
 * - One writer at a time (LockService), so two enquiries in the same second cannot collide.
 * - Any value that begins with = + - @ (or a tab or line break) gets a leading apostrophe, which
 *   Sheets reads as "this is text" and does not display, so a cell can never run as a formula. The
 *   phone number (+91…) is the everyday case; a hostile name such as =HYPERLINK(…) is the reason.
 *   Everything else is left for Sheets to read normally, so dates sort as dates.
 * - A repeat of the same Reference updates that row instead of adding a second one.
 * - Status and Notes belong to the sales team: a new row starts as "New", and the script never
 *   overwrites either afterwards.
 * - It keeps nothing else: no logging of the enquiry, no copies, no emails.
 *
 * These rules are unit-tested in the website repository (src/lib/leads/sheet-script.test.ts), which
 * runs this file in Node against a stand-in for the Sheet. Edit both together.
 */

/** The columns, in order. Change the wording here and in src/lib/leads/sheet.ts together. */
var HEADERS = [
  'Received (IST)',
  'Reference',
  'Form',
  'Language',
  'Name',
  'Phone',
  'Email',
  'PIN code',
  'Property',
  'Monthly bill',
  'Sanctioned load (kW)',
  'Estimated system (kWp)',
  'WhatsApp OK',
  'Source',
  'Medium',
  'Campaign',
  'Landing page',
  'Enquiry page',
  'Status',
  'Notes',
];

/** Written by the team, never by the website. */
var TEAM_COLUMNS = ['Status', 'Notes'];

/** The tab the leads go to. Created on first use if it does not exist. */
var SHEET_NAME = 'Leads';

/** Longest value written into one cell; the website sends far less. */
var MAX_CELL = 500;

/** A lead reference as the website mints it: IE- and six characters. */
var REFERENCE_RE = /^IE-[A-HJ-NP-Z2-9]{6}$/;

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return reply_({ ok: false, error: 'bad-json' });
  }
  if (!body || typeof body !== 'object') return reply_({ ok: false, error: 'bad-json' });

  var expected = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!expected || !sameToken_(String(body.token || ''), expected)) {
    return reply_({ ok: false, error: 'unauthorized' });
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return reply_({ ok: false, error: 'busy' });
  try {
    var sheet = leadsSheet_();
    var columns = ensureHeaders_(sheet);
    if (body.action === 'append') return reply_(upsertRow_(sheet, columns, body.row));
    if (body.action === 'email') return reply_(addEmail_(sheet, columns, body.reference, body.email));
    return reply_({ ok: false, error: 'bad-action' });
  } catch (err) {
    return reply_({ ok: false, error: 'script-error' });
  } finally {
    lock.releaseLock();
  }
}

/** Constant-time comparison: the time taken does not reveal how much of a guess was right. */
function sameToken_(given, expected) {
  var length = Math.max(given.length, expected.length);
  var diff = given.length ^ expected.length;
  for (var i = 0; i < length; i++) {
    diff |= (given.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function leadsSheet_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  return book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
}

/**
 * Writes the header row on first use and adds any missing column at the end. Returns a map from
 * column name to its 1-based position, read from the sheet itself — so the team may reorder,
 * widen or colour the columns, and even insert their own, without breaking anything.
 */
function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  var width = Math.max(sheet.getLastColumn(), 1);
  var present = sheet.getRange(1, 1, 1, width).getValues()[0].map(String);
  HEADERS.forEach(function (name) {
    if (present.indexOf(name) === -1) {
      present.push(name);
      sheet.getRange(1, present.length).setValue(name).setFontWeight('bold');
    }
  });
  var columns = {};
  present.forEach(function (name, index) {
    if (name) columns[name] = index + 1;
  });
  return columns;
}

/** Text that a spreadsheet will never read as a formula. */
function safeCell_(value) {
  var text = value === null || value === undefined ? '' : String(value);
  if (text.length > MAX_CELL) text = text.slice(0, MAX_CELL);
  return /^[=+\-@\t\r\n]/.test(text) ? "'" + text : text;
}

/** The 1-based row whose Reference is `reference`, or 0. */
function findRow_(sheet, columns, reference) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, columns['Reference'], last - 1, 1).getValues();
  for (var i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]).replace(/^'/, '') === reference) return i + 2;
  }
  return 0;
}

function upsertRow_(sheet, columns, row) {
  if (!row || typeof row !== 'object') return { ok: false, error: 'bad-row' };
  var reference = String(row['Reference'] || '');
  if (!REFERENCE_RE.test(reference)) return { ok: false, error: 'bad-reference' };

  var existing = findRow_(sheet, columns, reference);

  if (existing) {
    // A repeat (the website's retry): rewrite only the website's own cells. Reading the whole row
    // back and writing it again would turn the team's text into formulas (getValues drops the
    // apostrophe) and replace any formula of theirs with its value, so their cells are not touched.
    HEADERS.forEach(function (name) {
      if (TEAM_COLUMNS.indexOf(name) !== -1) return;
      if (!Object.prototype.hasOwnProperty.call(row, name)) return;
      sheet.getRange(existing, columns[name]).setValue(safeCell_(row[name]));
    });
    return { ok: true, updated: true };
  }

  var cells = new Array(sheet.getLastColumn()).fill('');
  HEADERS.forEach(function (name) {
    if (TEAM_COLUMNS.indexOf(name) !== -1) return;
    if (!Object.prototype.hasOwnProperty.call(row, name)) return;
    cells[columns[name] - 1] = safeCell_(row[name]);
  });
  cells[columns['Status'] - 1] = 'New';
  sheet.appendRow(cells);
  return { ok: true, updated: false };
}

/**
 * The popup's second step: the visitor asked for their breakdown by email. Fills the Email of the
 * row with this reference — only when it is empty, so an address already on the row is never
 * replaced by a request that merely quotes the reference.
 */
function addEmail_(sheet, columns, reference, email) {
  reference = String(reference || '');
  email = String(email || '');
  if (!REFERENCE_RE.test(reference)) return { ok: false, error: 'bad-reference' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { ok: false, error: 'bad-email' };
  var row = findRow_(sheet, columns, reference);
  if (!row) return { ok: false, error: 'not-found' };
  var cell = sheet.getRange(row, columns['Email']);
  var current = String(cell.getValue()).replace(/^'/, '');
  if (current && current.toLowerCase() !== email.toLowerCase()) return { ok: false, error: 'email-set' };
  cell.setValue(safeCell_(email));
  return { ok: true };
}

function reply_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
