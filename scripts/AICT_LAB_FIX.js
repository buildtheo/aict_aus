// AICT pre-lab FIX. One Background Script: checks everything, then fixes everything.
// Run after the ICE build: Scripts - Background, scope Global, as admin with security_admin elevated.
// Any instance. Safe to re-run: already-fixed items are skipped.
// All-or-nothing preflight: if ANY blocker is found, NOTHING is written.
// Stops at the first write it cannot confirm. Your update-set selection is restored.
// Click Run ONCE. If two runs overlap, re-run once more: it removes any duplicate rows.
//
// Fixes:
//  1. Governance for 8 lab assets -> Risk & compliance Datasets chart, Security & privacy Access map
//  2. Josh Warner sn_grc.business_user -> Lab 4 Remediation tasks NEW button
//  3. Deploy orphan role link (missing child role) removed
//  4. ai_steward -> sn_doc.admin link removed -> Deploy AI Asset Task flow can create the task
//     NOTE: removes document-template admin from ALL stewards
//  5. Value access: Engine pa_indicators inheritance + 3 ai_steward ACL roles -> Overview/Value Access Restricted
//     NOTE: gives every steward report_view on ALL indicators. Metrics stay zero/empty (data, not access).
// Not fixed here: Value metric data, already-failed Deploy flows, Josh end-to-end task creation.
var DRY = false; // true = report the plan only, write nothing

(function () {
  var ENGINE = 'be830175ff2022108896ffffffffffdd', STEWARD = '4d26237a1b005210e8f1a935604bcb6d';
  var JOSH = '4ea1659d1b75301050f2c84b234bcb4a', ALENE = 'be82abf03710200044e0bfc8bcbe5d1c';
  var ORPHAN = {edge:'1045cb8577711110d90f76c64b5a990a', child:'d19cea5453e220101f34ddeeff7b123e', app:'9aa0eddcc70c2010d302670f6ec260c4', set:'AICT lab fix - orphan deployment role'};
  var DOCADMIN = {edge:'20ac3cd79310c71099faf16b2803d638', set:'AICT lab fix - deployment admin conflict'};
  var ACLS = [['c1d2e3f4a5b6789012345678abcd0002','sn_value_tasks_closed_summary','read'],
              ['c1d2e3f4a5b6789012345678abcd0004','sn_value_tasks_closed_summary','report_view'],
              ['4aa5959843131110563cd5bbdab8f202','pa_indicators','report_view']];
  var ASSETS = [
    ['3e59ea0b61a02a10f877f526aa2a4ac3','SAP Customer information 1.0','alm_ai_dataset_digital_asset','','High'],
    ['014622c361a02a10f877f526aa2a4a8e','Intuit Employee financial data 1.0','alm_ai_dataset_digital_asset','','Medium'],
    ['a15b080eeb03921068f4fb4cbad0cd93','Customer data','alm_ai_dataset_digital_asset','','Low'],
    ['ab1c0c4eeb03921068f4fb4cbad0cdb0','Customer purchase history','alm_ai_dataset_digital_asset','','Low'],
    ['04f441abe87a47107f440da7c62f71eb','Problems investigation AI agent','alm_ai_system_digital_asset','sn_aia_agent',''],
    ['d6728e2be8b2c7107f440da7c62f71d8','Optimize GRC issue resolution','alm_ai_system_digital_asset','sn_aia_usecase',''],
    ['9262462be8b2c7107f440da7c62f7177','Remediation tasks AI agent','alm_ai_system_digital_asset','sn_aia_agent',''],
    ['44728a2be8b2c7107f440da7c62f7127','Issue action plan AI agent','alm_ai_system_digital_asset','sn_aia_agent','']
  ];
  var G = 'sn_ai_governance_asset_governance_details', M = 'sn_ent_ai_system_subcomponent_m2m';
  var actions = [], blockers = [], notes = [], done = [];

  function p(s) { gs.print(s); }
  function isTrue(v) { return String(v) === 'true' || String(v) === '1'; }
  function cnt(t, q) { var a = new GlideAggregate(t); a.addEncodedQuery(q); a.addAggregate('COUNT'); a.query(); return a.next() ? parseInt(a.getAggregate('COUNT'), 10) : 0; }
  function one(t, q) { var g = new GlideRecord(t); g.addEncodedQuery(q); g.setLimit(2); g.query(); if (!g.next()) return null; var id = g.getUniqueValue(); if (g.next()) throw 'Ambiguous ' + t + ' ' + q; var r = new GlideRecord(t); r.get(id); return r; }
  function act(stage, label, fn) { actions.push({stage:stage, label:label, fn:fn}); }
  function stage(name, fn) { try { fn(); } catch (e) { blockers.push(name + ': preflight error ' + e); } }
  function govState(id) { var g = one(G, 'asset=' + id); return g ? {gov:isTrue(g.getValue('governed')), ev:g.getDisplayValue('evaluation_status')} : null; }

  // ===================== PREFLIGHT (read-only) =====================
  var INSTANCE = String(gs.getProperty('instance_name'));
  var scopeName = String(gs.getCurrentScopeName());
  if (scopeName !== 'global' && scopeName !== 'rhino.global') blockers.push('context: run in Global scope (now ' + scopeName + ')');
  if (!gs.hasRole('admin')) blockers.push('context: needs the admin role');
  // Remember the current update set so it can be put back; if none, fall back to Global Default.
  var original = {set:String(gs.getUser().getPreference('sys_update_set') || '')};
  if (!original.set) { var dflt = one('sys_update_set', 'name=Default^application=global'); if (dflt) original.set = dflt.getUniqueValue(); }
  if (!original.set) blockers.push('context: no current or Global Default update set found to restore to');

  stage('governance', function () {
    if (!new sn_ai_governance.AICTLicenseUtil().isAICTEnterpriseLicensed()) { blockers.push('governance: AI Control Tower not enterprise licensed'); return; }
    ASSETS.forEach(function (t) {
      var a = new GlideRecord('alm_ai_digital_asset');
      if (!a.get(t[0]) || a.getValue('display_name') !== t[1] || a.getValue('sys_class_name') !== t[2]) { blockers.push('governance: ' + t[1] + ' missing or different'); return; }
      if (['32','38'].indexOf(a.getValue('install_status')) > -1) { blockers.push('governance: ' + t[1] + ' install_status excluded'); return; }
      if (cnt(G, 'asset=' + t[0]) !== 1) { blockers.push('governance: ' + t[1] + ' governance rows != 1'); return; }
      var g = one(G, 'asset=' + t[0]);
      if (t[3]) {
        var r = new GlideRecord(t[3]);
        if (a.getValue('servicenow_ref_table') !== t[3] || !r.get(a.getValue('servicenow_ref_id'))) { blockers.push('governance: ' + t[1] + ' reference missing'); return; }
        if (a.getValue('source_system')) { blockers.push('governance: ' + t[1] + ' source_system not empty'); return; }
        var sub = t[3] === 'sn_aia_usecase' ? 'alm_ai_system_digital_asset' : 'sn_ent_ai_tool';
        if (cnt(M, 'ai_system=' + t[0] + '^ai_subcomponent_reference_table=' + sub) < 2) { blockers.push('governance: ' + t[1] + ' map topology <2 children'); return; }
      } else if (g.getDisplayValue('risk_score') !== t[4]) { blockers.push('governance: ' + t[1] + ' risk ' + g.getDisplayValue('risk_score') + ' != ' + t[4]); return; }
      var s = govState(t[0]);
      if (s.gov && s.ev === 'Enabled') { notes.push('SKIP governance ' + t[1]); return; }
      if (s.gov) { blockers.push('governance: ' + t[1] + ' governed but evaluation not Enabled'); return; }
      act('governance', 'govern ' + t[1], function () {
        var thrown = '';
        try { new sn_ai_governance.AssetGovernanceStatusUtilSNC().setAssetGovernanceStatus(t[0], true); } catch (e) { thrown = String(e); }
        var after = govState(t[0]);
        if (thrown || !after || !after.gov || after.ev !== 'Enabled') throw 'governance ' + t[1] + ' unconfirmed (error=' + thrown + ' state=' + JSON.stringify(after) + ')';
      });
    });
  });

  stage('josh', function () {
    var u = new GlideRecord('sys_user'); if (!u.get(JOSH) || u.getValue('name') !== 'Josh Warner') { blockers.push('josh: user missing or different'); return; }
    var role = one('sys_user_role', 'name=sn_grc.business_user'); if (!role) { blockers.push('josh: sn_grc.business_user missing'); return; }
    var q = 'user=' + JOSH + '^role=' + role.getUniqueValue();
    if (cnt('sys_user_has_role', q) >= 1) { notes.push('SKIP josh role present'); return; }
    act('josh', 'grant Josh sn_grc.business_user', function () {
      if (cnt('sys_user_has_role', q) >= 1) return; // another run just granted it
      var g = new GlideRecord('sys_user_has_role'); g.initialize(); g.setValue('user', JOSH); g.setValue('role', role.getUniqueValue());
      var id = '', err = ''; try { id = String(g.insert() || ''); } catch (e) { err = String(e); }
      if (err || !id || !new GlideRecord('sys_user_has_role').get(id)) throw 'Josh role grant unconfirmed (error=' + err + ')';
    });
  });

  function edgeStage(name, cfg, check) {
    stage(name, function () {
      var e = new GlideRecord('sys_user_role_contains');
      if (!e.get(cfg.edge)) { notes.push('SKIP ' + name + ' link absent'); return; }
      var why = check(e); if (why) { blockers.push(name + ': ' + why); return; }
      var app = cfg.app || String(e.getValue('sys_scope'));
      act(name, 'remove ' + name + ' link ' + cfg.edge, function () {
        withAppSet(app, cfg.set, function () {
          var del = false, err = ''; try { del = !!e.deleteRecord(); } catch (x) { err = String(x); }
          var still = new GlideRecord('sys_user_role_contains').get(cfg.edge);
          if (err || !del || still) throw name + ' delete unconfirmed (error=' + err + ')';
        });
      });
    });
  }
  edgeStage('deployOrphan', ORPHAN, function (e) {
    if (new GlideRecord('sys_user_role').get(ORPHAN.child)) return 'child role exists; not the orphan defect';
    if (String(e.getValue('contains')) !== ORPHAN.child || String(e.getValue('sys_scope')) !== ORPHAN.app) return 'link identity changed';
    return '';
  });
  edgeStage('docAdmin', DOCADMIN, function (e) {
    var par = new GlideRecord('sys_user_role'), ch = new GlideRecord('sys_user_role');
    if (!par.get(e.getValue('role')) || par.getValue('name') !== 'sn_ai_governance.ai_steward') return 'parent role is not ai_steward';
    if (!ch.get(e.getValue('contains')) || ch.getValue('name') !== 'sn_doc.admin') return 'child role is not sn_doc.admin';
    return '';
  });

  stage('value', function () {
    var s = new GlideRecord('sys_scope');
    if (!s.get(ENGINE) || s.getValue('scope') !== 'sn_value_engine' || !isTrue(s.getValue('scoped_administration'))) { blockers.push('value: Value Engine scope missing or different'); return; }
    if (String(gs.getProperty('glide.security.scoped_administration.honor_global_acl')) !== 'true') { blockers.push('value: honor_global_acl is not true'); return; }
    var r = new GlideRecord('sys_user_role'); if (!r.get(STEWARD) || r.getValue('name') !== 'sn_ai_governance.ai_steward') { blockers.push('value: ai_steward role missing'); return; }
    if (cnt('sys_security_acl', 'active=true^sys_scope=' + ENGINE + '^nameINpa_indicators,pa_indicators_definition')) { blockers.push('value: Engine has its own indicator ACLs; inheritance would not apply'); return; }
    var iq = 'table=pa_indicators^sys_scope=' + ENGINE;
    if (cnt('sys_scoped_admin_acl_inheritance', iq) >= 1) notes.push('SKIP value inheritance present');
    else act('value', 'create Engine pa_indicators inheritance', function () {
      withAppSet(ENGINE, 'AICT lab fix - Value indicator inheritance', function () {
        if (cnt('sys_scoped_admin_acl_inheritance', iq) >= 1) return; // another run just created it
        var row = new GlideRecord('sys_scoped_admin_acl_inheritance'); row.newRecord();
        if (String(row.getValue('sys_scope')) !== ENGINE) throw 'new inheritance row did not default to Value Engine scope';
        row.setValue('table', 'pa_indicators');
        var id = '', err = ''; try { id = String(row.insert() || ''); } catch (e) { err = String(e); }
        if (err || !id || !new GlideRecord('sys_scoped_admin_acl_inheritance').get(id)) throw 'inheritance insert unconfirmed (error=' + err + ')';
      });
    });
    ACLS.forEach(function (t) {
      var a = new GlideRecord('sys_security_acl');
      if (!a.get(t[0]) || a.getValue('name') !== t[1] || a.getDisplayValue('operation') !== t[2] || !isTrue(a.getValue('active'))) { blockers.push('value: ACL ' + t[1] + '.' + t[2] + ' missing or different'); return; }
      var rq = 'sys_security_acl=' + t[0] + '^sys_user_role=' + STEWARD, n = cnt('sys_security_acl_role', rq);
      if (n === 1) { notes.push('SKIP value ' + t[1] + '.' + t[2] + ' role present'); return; }
      if (n > 1) { // identical duplicates (e.g. two runs at once): keep the oldest, access is unchanged
        act('value', 'remove ' + (n - 1) + ' duplicate ai_steward row(s) on ' + t[1] + '.' + t[2], function () {
          withAppSet('global', 'AICT lab fix - Value access roles', function () {
            var d = new GlideRecord('sys_security_acl_role'); d.addEncodedQuery(rq); d.orderBy('sys_created_on'); d.query(); d.next();
            while (d.next()) { if (!d.deleteRecord()) throw 'duplicate delete refused ' + d.getUniqueValue(); }
            if (cnt('sys_security_acl_role', rq) !== 1) throw 'duplicate cleanup unconfirmed on ' + t[1] + '.' + t[2];
          });
        });
        return;
      }
      act('value', 'add ai_steward to ' + t[1] + '.' + t[2], function () {
        withAppSet('global', 'AICT lab fix - Value access roles', function () {
          if (cnt('sys_security_acl_role', rq) >= 1) return; // another run just added it
          var m = new GlideRecord('sys_security_acl_role'); m.newRecord(); m.setValue('sys_security_acl', t[0]); m.setValue('sys_user_role', STEWARD);
          var id = '', err = ''; try { id = String(m.insert() || ''); } catch (e) { err = String(e); }
          if (err || !id || !new GlideRecord('sys_security_acl_role').get(id)) throw 'ACL role ' + t[1] + '.' + t[2] + ' unconfirmed (error=' + err + ')';
        });
      });
    });
  });

  // ===================== update-set helper =====================
  function withAppSet(appId, name, fn) {
    var set = one('sys_update_set', 'name=' + name + '^application=' + appId), id;
    if (set) { if (set.getValue('state') !== 'in progress') throw 'update set "' + name + '" is not in progress'; id = set.getUniqueValue(); }
    else { set = new GlideRecord('sys_update_set'); set.initialize(); set.setValue('name', name); set.setValue('application', appId); set.setValue('state', 'in progress'); id = String(set.insert() || ''); if (!id) throw 'could not create update set "' + name + '"'; }
    var failure = null;
    try {
      new GlideUpdateSet().set(id);
      if (String(gs.getCurrentApplicationId()) !== appId) throw 'could not select application ' + appId;
      fn();
    } catch (e) { failure = e; }
    // restore the user's original selection; a failed restore stops everything
    new GlideUpdateSet().set(original.set);
    if (String(gs.getUser().getPreference('sys_update_set')) !== original.set)
      throw 'FATAL: could not restore your update set (' + original.set + '). Reselect it in the picker.';
    if (failure) throw failure;
  }

  // ===================== REPORT + APPLY =====================
  p('AICT LAB FIX on ' + INSTANCE + (DRY ? ' (DRY: no writes)' : ''));
  notes.forEach(function (n) { p('  ' + n); });
  actions.forEach(function (a) { p('  TODO ' + a.stage + ': ' + a.label); });
  if (blockers.length) {
    blockers.forEach(function (b) { p('  BLOCKER ' + b); });
    p('RESULT: NOT RUN. ' + blockers.length + ' blocker(s). Nothing was written. Fix the blockers and run again.');
    return;
  }
  if (!actions.length) { p('RESULT: NOTHING TO FIX. All items already fixed.'); return; }
  if (DRY) { p('RESULT: DRY. ' + actions.length + ' fix(es) would run. Set DRY=false to apply.'); return; }

  for (var i = 0; i < actions.length; i++) {
    try { actions[i].fn(); done.push(actions[i].label); p('  OK ' + actions[i].label); }
    catch (e) {
      p('  STOPPED at: ' + actions[i].label + ' -> ' + e);
      p('  Done before stop: ' + JSON.stringify(done));
      p('  Not attempted: ' + JSON.stringify(actions.slice(i + 1).map(function (a) { return a.label; })));
      p('RESULT: STOPPED. Do not re-run blindly; send this output for review.');
      return;
    }
  }

  // ===================== VERIFY (read-only, after all writes) =====================
  var v = {};
  var me = String(gs.getUserID()), imp = new GlideImpersonate();
  try {
    imp.impersonate(ALENE);
    v.aleneIndicatorRead = new GlideRecordSecure('pa_indicators').get('18e6aeadff8922100c02ffffffffffe5');
    v.aleneClosureRead = new GlideRecordSecure('pa_indicators').get('d797a66afffb66108a46ffffffffff07');
    v.aleneSummaryReportView = GlideSecurityManager.get().hasRightsTo('record/sn_value_tasks_closed_summary/report_view', null);
    imp.impersonate(JOSH);
    var issue = new GlideRecord('sn_grc_issue'); issue.addQuery('active', true); issue.addQuery('assigned_to', JOSH); issue.orderByDesc('sys_created_on'); issue.setLimit(1); issue.query();
    if (issue.next()) { var task = new GlideRecord('sn_grc_task'); task.initialize(); v.joshNewButton = !!new sn_grc.IssueUtilsWS().showOrHideRemediationTaskNewButton(task, issue) + ' on ' + issue.getValue('number'); }
    else v.joshNewButton = 'no active Josh issue yet';
  } catch (e) { v.error = String(e); }
  finally { imp.impersonate(me); }
  p('  VERIFY ' + JSON.stringify(v));
  p('RESULT: FIXED ' + done.length + ' item(s). Now check in the UI: as Alene, Risk & compliance Datasets chart, Security & privacy Access map, Overview/Value with no Access Restricted; as Josh, NEW button on a Lab 4 issue.');
})();
