---
description: >-
  A few steps to help set up the lab with the proper content and to review some
  popup dialogs.
---

# Lab 0 - Setup

Duration: 5 minutes



1. If you have already logged in to your instance, skip to step 2.  If you have not already logged into your instance, get the details from your instructor.
2.  When you log in for the first time (and when you impersonate other users for the first time), you will see a popup dialog box to show how you can work your way.  Click the **Next** button several times until it goes away.  The button name will change to **Got it!**. Go ahead and click **Got it!** to close out the dialog.<br>

    <figure><img src=".gitbook/assets/image (157).png" alt=""><figcaption></figcaption></figure>

    Once you go through those screens, you will be at the _Shared admin dashboard_ workspace.
3.  Click the **Workspaces** menu drop down at the top of the screen and then select the workspace **AI Risk and Compliance Workspace**.<br>

    <figure><img src=".gitbook/assets/image (158).png" alt=""><figcaption></figcaption></figure>


4.  During the import of the Authority Documents and related requirements, some of the source content was duplicated causing issues with the compliance charts.  To resolve this, click on the **List** icon in the far-left part of the screen.  In the **Library** section, click on **Authority documents** (may show abbreviated, depending on your screen and zoom level).<br>

    <figure><img src=".gitbook/assets/image (81).png" alt=""><figcaption></figcaption></figure>


5.  You should now see four Authority document records (if the page does not refresh, in the Library section, click on **Citations** and then click again on **Authority documents**). Next, select the check boxes next to **EU AI Act** and **NIST AI RMF**. Once those two records are selected, click the **Delete (2)** button.<br>

    <figure><img src=".gitbook/assets/image (82).png" alt=""><figcaption></figcaption></figure>


6.  The _Delete_ popup dialog should now be displayed, showing that you will be deleting the two Authority documents and related records.  Click the red **Delete All** button.<br>

    <figure><img src=".gitbook/assets/image (83).png" alt=""><figcaption></figcaption></figure>


7.  Next, run the lab fix script. It prepares the instance so the dashboards, Access map, Value tab and Lab 4 remediation tasks work for the lab personas. First, elevate your role: click your **profile avatar** in the top-right corner, then click **Elevate role**. In the _Elevate role_ dialog, check **security\_admin** and click **Update**.<br>

    <figure><img src=".gitbook/assets/image (214).png" alt="Elevate role dialog with security_admin checked"><figcaption></figcaption></figure>


8.  Copy the entire script below (use the copy icon in the top-right corner of the code block).

    ```javascript
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
    //  6. Risk classification score: publishes the Inherent Assessment, then the RAM "Automated risk classification for AI system" (both ship as Draft)
    //     Runs through a scoped (sn_risk_advanced) Fix Script it creates and keeps. NOTE: native RAM publish deletes this RAM's simulated assessments.
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
      var RAM = {ram:'6a6b8078ff61f610c920ffffffffff82', ia:'4d8c4cb0ffe1f610c920ffffffffff7b', name:'Automated risk classification for AI system', scope:'sn_risk_advanced', fix:'AICT lab fix - RAM publisher v1', set:'AICT lab fix - publish AI risk RAM'};
      var G = 'sn_ai_governance_asset_governance_details', M = 'sn_ent_ai_system_subcomponent_m2m';
      var actions = [], blockers = [], notes = [], done = [], ramCapture = {status:'NA', lines:[]};

      function p(s) { gs.print(s); }
      function isTrue(v) { return String(v) === 'true' || String(v) === '1'; }
      function cnt(t, q) { var a = new GlideAggregate(t); a.addEncodedQuery(q); a.addAggregate('COUNT'); a.query(); return a.next() ? parseInt(a.getAggregate('COUNT'), 10) : 0; }
      function one(t, q) { var g = new GlideRecord(t); g.addEncodedQuery(q); g.setLimit(2); g.query(); if (!g.next()) return null; var id = g.getUniqueValue(); if (g.next()) throw 'Ambiguous ' + t + ' ' + q; var r = new GlideRecord(t); r.get(id); return r; }
      function act(stage, label, fn) { actions.push({stage:stage, label:label, fn:fn}); }
      function stage(name, fn) { try { fn(); } catch (e) { blockers.push(name + ': preflight error ' + e); } }
      function classifyVerify(v) {
        var keys = ['ramPublished', 'iaPublished', 'aleneIndicatorRead', 'aleneClosureRead', 'aleneSummaryReportView', 'joshNewButton'], failed = [], unverified = [];
        keys.forEach(function (k) { if (v[k] === false) failed.push(k); else if (v[k] !== true) unverified.push(k); });
        return {status: failed.length ? 'FAILED_VERIFICATION' : unverified.length ? 'NOT_VERIFIED' : 'FIXED', failed: failed, unverified: unverified};
      }
      // Checked before any write: only availability of the API (not its behavior) can be known here.
      function canRestoreApp() { return typeof gs.setCurrentApplicationId !== 'undefined'; }
      // Put the user's application back as well as the update set (withAppSet restores only the update set), then verify both.
      function restoreSelections() {
        var err = '';
        if (String(gs.getCurrentApplicationId()) !== original.app) { try { gs.setCurrentApplicationId(original.app); } catch (e) { err = String(e); } }
        var appBack = String(gs.getCurrentApplicationId()) === original.app, setBack = String(gs.getUser().getPreference('sys_update_set')) === original.set;
        if (!appBack || !setBack) throw 'FATAL: could not restore your selections (application ' + (appBack ? 'ok' : 'NOT restored to ' + original.app) + ', update set ' + (setBack ? 'ok' : 'NOT restored to ' + original.set) + (err ? '; ' + err : '') + '). Reselect them in the pickers.';
      }
      // rows: [{name, set, setName, updated}] update-xml rows for the expected record names; only rows updated at/after `since` count as this run's.
      function captureStatus(expected, rows, targetId, since) {
        var lines = [], bad = 0;
        expected.forEach(function (name) {
          // an update-set row is updated in place when the same record changes again, so freshness is sys_updated_on, never sys_created_on
          var mine = rows.filter(function (r) { return r.name === name && String(r.updated) >= String(since); });
          if (!mine.length) { bad++; lines.push('missing: ' + name); }
          else if (mine.some(function (r) { return r.set === targetId; })) lines.push('target: ' + name);
          else { bad++; lines.push('elsewhere: ' + name + ' -> ' + mine.map(function (r) { return r.setName; }).join(', ')); }
        });
        return {status: !expected.length ? 'NA' : bad ? 'INCOMPLETE' : 'COMPLETE', lines: lines};
      }
      function govState(id) { var g = one(G, 'asset=' + id); return g ? {gov:isTrue(g.getValue('governed')), ev:g.getDisplayValue('evaluation_status')} : null; }

      // ===================== PREFLIGHT (read-only) =====================
      var INSTANCE = String(gs.getProperty('instance_name'));
      var scopeName = String(gs.getCurrentScopeName());
      if (scopeName !== 'global' && scopeName !== 'rhino.global') blockers.push('context: run in Global scope (now ' + scopeName + ')');
      if (!gs.hasRole('admin')) blockers.push('context: needs the admin role');
      // Remember the current update set so it can be put back; if none, fall back to Global Default.
      var original = {set:String(gs.getUser().getPreference('sys_update_set') || ''), app:String(gs.getCurrentApplicationId())};
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

      // Risk classification score stays empty while the RAM and its Inherent Assessment are Draft (state 1).
      // Both tables belong to scope sn_risk_advanced, which refuses writes from Global (cross-scope policy). Same pattern as
      // lab Script 07: Global creates a Fix Script owned by sn_risk_advanced and runs it with GlideScopedEvaluator.
      // That scoped code mirrors the two native Publish actions in order: Inherent Assessment first, then the RAM.
      // The publisher Fix Script is retained (never deleted). Native RAM publish deletes simulated assessments of this RAM.
      function ramPublisher() {
        function need(ok, s) { if (!ok) throw new Error(s); }
        function load(table, id) { var r = new GlideRecord(table); need(r.get(id), 'Record missing: ' + table + '/' + id); return r; }
        function save(r, expected) {
          var result = r.update(), back = load(r.getTableName(), String(r.getUniqueValue()));
          need(result && String(back.getValue('state')) === expected, 'Update unconfirmed: ' + r.getUniqueValue());
          return back;
        }
        var scope = String(gs.getCurrentScopeName());
        need(scope === 'sn_risk_advanced' || scope === 'rhino.sn_risk_advanced', 'Evaluator scope mismatch: ' + scope);
        var ia = load('sn_risk_advanced_inherent_assessment', '4d8c4cb0ffe1f610c920ffffffffff7b');
        var ram = load('sn_risk_advanced_risk_assessment_methodology', '6a6b8078ff61f610c920ffffffffff82');
        need(String(ia.getValue('risk_assessment_methodology')) === String(ram.getUniqueValue()), 'IA parent mismatch');
        need(String(ram.getValue('name')) === 'Automated risk classification for AI system', 'RAM name mismatch');
        var is = String(ia.getValue('state')), rs = String(ram.getValue('state'));
        need((is === '1' || is === '2') && (rs === '1' || rs === '2'), 'Unexpected state');
        need(!(rs === '2' && is === '1'), 'Published RAM has Draft IA');
        if (is === '2' && rs === '2') return 'ALREADY_PUBLISHED';
        need(ia.canWrite() && ram.canWrite(), 'Record ACL denies write');
        if (is === '1') {
          ia = save(ia, '1'); // native Publish saves before validating
          need(new sn_risk_advanced.AssessmentTypeUtils().validateInherentAssessment(ia) == true, 'IA validation rejected');
          ia.setValue('state', '2'); save(ia, '2');
        }
        ram = load('sn_risk_advanced_risk_assessment_methodology', String(ram.getUniqueValue()));
        need(String(ram.getValue('state')) === '1', 'RAM changed concurrently');
        var util = new sn_risk_advanced.RiskAssessmentMethodologyUtils(), validation = util.validateRAM(ram);
        // native validateRAM leaves value unset on success; only an explicit false rejects
        need(validation && typeof validation === 'object', 'Unexpected RAM validator response');
        need(!(validation.value == false), 'RAM validation failed: ' + JSON.stringify(validation));
        var license = util.validateLicense(ram);
        need(license && license.isValid == true, 'License validation failed: ' + JSON.stringify(license));
        new sn_risk_advanced.RiskAssessmentUtils().deleteAllSimulatedAssessments(String(ram.getUniqueValue()));
        ram.setValue('state', '2'); save(ram, '2');
        return 'PUBLISHED';
      }
      stage('ram', function () {
        var ram = new GlideRecord('sn_risk_advanced_risk_assessment_methodology');
        if (!ram.get(RAM.ram) || ram.getValue('name') !== RAM.name) { blockers.push('ram: "' + RAM.name + '" missing or different'); return; }
        var ia = new GlideRecord('sn_risk_advanced_inherent_assessment');
        if (!ia.get(RAM.ia) || String(ia.getValue('risk_assessment_methodology')) !== RAM.ram) { blockers.push('ram: Inherent Assessment missing or not linked to the RAM'); return; }
        var ramState = String(ram.getValue('state')), iaState = String(ia.getValue('state'));
        if (ramState === '2' && iaState === '2') { notes.push('SKIP ram already published'); return; }
        if (['1', '2'].indexOf(ramState) < 0 || ['1', '2'].indexOf(iaState) < 0) { blockers.push('ram: unexpected state (RAM ' + ramState + ', Inherent Assessment ' + iaState + '); expected Draft or Published'); return; }
        if (ramState === '2' && iaState === '1') { blockers.push('ram: RAM is Published but its Inherent Assessment is Draft; not a state this script handles'); return; }
        if (!canRestoreApp()) { blockers.push('ram: gs.setCurrentApplicationId is not available, so the application selection could not be restored after the publish'); return; }
        var sc = new GlideRecord('sys_scope');
        if (!sc.get('scope', RAM.scope) || !isTrue(sc.getValue('active'))) { blockers.push('ram: scope ' + RAM.scope + ' missing or inactive'); return; }
        var scopeId = sc.getUniqueValue(), body = '(' + ramPublisher.toString() + ')();';
        var fix = one('sys_script_fix', 'name=' + RAM.fix + '^sys_scope=' + scopeId); // throws (-> blocker) if duplicated
        if (fix) { if (String(fix.getValue('script')) !== body) { blockers.push('ram: existing publisher "' + RAM.fix + '" differs from this script; refusing to overwrite'); return; } }
        else { var probe = new GlideRecord('sys_script_fix'); probe.initialize(); if (!probe.canCreate()) { blockers.push('ram: cannot create the scoped publisher Fix Script'); return; } }
        act('ram', 'publish Inherent Assessment, then RAM, of ' + RAM.name + ' (scoped ' + RAM.scope + ' publisher; also deletes simulated assessments, as native Publish does)', function () {
          var t0 = new GlideDateTime().getValue(), created = false, publisherId = '', out = '';
          // Update-set selection only decides where changes are captured; execution scope still comes from GlideScopedEvaluator.
          var setId = '', failure = null;
          try { setId = withAppSet(scopeId, RAM.set, function () {
            var f = one('sys_script_fix', 'name=' + RAM.fix + '^sys_scope=' + scopeId);
            if (!f) {
              f = new GlideRecord('sys_script_fix'); f.initialize(); f.setValue('name', RAM.fix); f.setValue('sys_scope', scopeId); f.setValue('script', body);
              var id = String(f.insert() || ''); if (!id || !f.get(id)) throw 'scoped publisher creation unconfirmed';
              created = true;
            }
            publisherId = f.getUniqueValue();
            if (String(f.getValue('sys_scope')) !== scopeId || String(f.getValue('script')) !== body) throw 'persisted publisher scope/script mismatch; NOT executing';
            out = String(new GlideScopedEvaluator().evaluateScript(f, 'script', null));
            if (out !== 'PUBLISHED' && out !== 'ALREADY_PUBLISHED') throw 'scoped publisher result unconfirmed: ' + out;
            var r1 = new GlideRecord('sn_risk_advanced_risk_assessment_methodology'), i1 = new GlideRecord('sn_risk_advanced_inherent_assessment');
            if (!r1.get(RAM.ram) || !i1.get(RAM.ia) || String(r1.getValue('state')) !== '2' || String(i1.getValue('state')) !== '2') throw 'RAM/Inherent Assessment not both Published after publisher run (' + out + ')';
          }); } catch (e) { failure = e; }
          // Restore the application even when the publish failed (withAppSet rethrows before it could), keeping both errors.
          var restoreErr = ''; try { restoreSelections(); } catch (e2) { restoreErr = String(e2); }
          if (failure) throw restoreErr ? String(failure) + ' | ' + restoreErr : failure;
          if (restoreErr) throw restoreErr;
          // Report where the platform captured the changes. Elsewhere or missing = capture incomplete, even though publication succeeded.
          var expected = [];
          if (out === 'PUBLISHED') {
            if (iaState === '1') expected.push('sn_risk_advanced_inherent_assessment_' + RAM.ia);
            if (ramState === '1') expected.push('sn_risk_advanced_risk_assessment_methodology_' + RAM.ram);
          }
          if (created) expected.push('sys_script_fix_' + publisherId);
          var rows = [];
          if (expected.length) {
            var x = new GlideRecord('sys_update_xml'); x.addQuery('name', 'IN', expected.join(',')); x.query();
            while (x.next()) rows.push({name:String(x.getValue('name')), set:String(x.getValue('update_set')), setName:String(x.getDisplayValue('update_set')), updated:String(x.getValue('sys_updated_on'))});
          }
          ramCapture = captureStatus(expected, rows, setId, t0);
          ramCapture.lines.forEach(function (l) { p('  CAPTURE ' + ramCapture.status + ' [' + RAM.set + ']: ' + l); });
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
        return id;
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
      if (!actions.length) { p('  Nothing to write; running verification only.'); verifyAndReport(); return; }
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

      verifyAndReport();

      // ===================== VERIFY (read-only; after all writes, or alone when nothing needed fixing) =====================
      function verifyAndReport() {
      // Each check is a boolean, or stays undefined if it could not run. classifyVerify turns that into the verdict:
      // any false -> FAILED_VERIFICATION; none false but some undefined -> NOT_VERIFIED; all true -> FIXED.
      var v = {}, joshIssue = 'none (no active Josh issue yet)';
      var me = String(gs.getUserID()), imp = new GlideImpersonate();
      try {
        var rr = new GlideRecord('sn_risk_advanced_risk_assessment_methodology'), ii = new GlideRecord('sn_risk_advanced_inherent_assessment');
        v.ramPublished = rr.get(RAM.ram) && String(rr.getValue('state')) === '2';
        v.iaPublished = ii.get(RAM.ia) && String(ii.getValue('state')) === '2';
        imp.impersonate(ALENE);
        v.aleneIndicatorRead = !!new GlideRecordSecure('pa_indicators').get('18e6aeadff8922100c02ffffffffffe5');
        v.aleneClosureRead = !!new GlideRecordSecure('pa_indicators').get('d797a66afffb66108a46ffffffffff07');
        v.aleneSummaryReportView = !!GlideSecurityManager.get().hasRightsTo('record/sn_value_tasks_closed_summary/report_view', null);
        imp.impersonate(JOSH);
        var issue = new GlideRecord('sn_grc_issue'); issue.addQuery('active', true); issue.addQuery('assigned_to', JOSH); issue.orderByDesc('sys_created_on'); issue.setLimit(1); issue.query();
        if (issue.next()) { var task = new GlideRecord('sn_grc_task'); task.initialize(); v.joshNewButton = !!new sn_grc.IssueUtilsWS().showOrHideRemediationTaskNewButton(task, issue); joshIssue = String(issue.getValue('number')); }
      } catch (e) { v.error = String(e); }
      finally { imp.impersonate(me); }
      p('  VERIFY ' + JSON.stringify(v) + ' (Josh issue: ' + joshIssue + ')');
      var verdict = classifyVerify(v);
      var capNote = ramCapture.status === 'INCOMPLETE' ? ' CAPTURE INCOMPLETE (publication succeeded, but not all changes are in the target update set; do not treat as export-ready, see CAPTURE lines above).' : '';
      if (verdict.status === 'FAILED_VERIFICATION') p('RESULT: FAILED_VERIFICATION. ' + done.length + ' write(s) applied, but these checks are false: ' + verdict.failed.join(', ') + (verdict.unverified.length ? '; could not check: ' + verdict.unverified.join(', ') : '') + '. Send this output for review.' + capNote);
      else if (verdict.status === 'NOT_VERIFIED') p('RESULT: NOT_VERIFIED. ' + done.length + ' write(s) applied. Could not check: ' + verdict.unverified.join(', ') + (v.error ? ' (error: ' + v.error + ')' : '') + '. Verify these in the UI before calling it fixed.' + capNote);
      else if (!done.length) p('RESULT: NOTHING TO FIX. Nothing needed writing and every check passed.' + capNote);
      else p('RESULT: FIXED ' + done.length + ' item(s). Now check in the UI: as Alene, Risk & compliance Datasets chart, Security & privacy Access map, Overview/Value with no Access Restricted; as Josh, NEW button on a Lab 4 issue.' + capNote);
      }
    })();
    ```

9.  Click **All**, type **Scripts - Background** in the filter, and open it. Paste the script into the _Run script_ box, make sure **in scope** is set to **global**, and click **Run script** **once**. Wait a few seconds for the output; do not click it again.
10. You have completed the setup and the compliance charts will now show correctly.
