// js/language/api.js: Pure, deterministic language calculation API & state initialization.
// Non-RNG consuming, offline, deterministic inspection.
function clampLanguageSkill(val) {
  if (!Number.isFinite(val)) return 0;
  return Math.max(0, Math.min(100, Math.round(val)));
}

  function getLanguageSkill(s, languageId, mode) {
    if (!s || !s.languageState || !languageId || !mode) return 0;
    const lang = s.languageState.skills?.[languageId];
    if (!lang) return 0;
    return clampLanguageSkill(lang[mode] ?? 0);
  }

  function getLanguageSummaryLevel(s, languageId) {
    if (!s || !s.languageState || !languageId) return 0;
    const lang = s.languageState.skills?.[languageId];
    if (!lang) return 0;
    const avg = ((lang.listen || 0) + (lang.speak || 0) + (lang.read || 0) + (lang.write || 0)) / 4;
    if (avg >= 75) return 3; // 高度・精通
    if (avg >= 45) return 2; // 日常・実務
    if (avg >= 15) return 1; // 片言・初級
    return 0; // 不明・未記録
  }

  function getRepertoireSkill(s, cantId) {
    if (!s || !s.languageState || !cantId) return 0;
    const item = s.languageState.repertoires?.[cantId];
    if (!item) return 0;
    return clampLanguageSkill(item.comprehension ?? 0);
  }

  // Access support is an appointment, not a new language skill. A record
  // without recipient, language, purpose, location and term is never universal.
  function languageSupportApplies(s, record, languageId, mode, purpose = "document") {
    if (!record || !s || !languageId ||
        !["interpreter","helper","translation"].includes(record.kind) ||
        record.languageId !== languageId ||
        record.region !== s.res?.n ||
        !Number.isInteger(record.year) || record.year > s.year ||
        !Number.isInteger(record.expiresYear) || record.expiresYear < s.year ||
        record.purpose !== purpose ||
        !["both",mode].includes(record.mode)) return false;
    if (record.placeId && record.placeId !== s.local?.placeId) return false;
    if (record.areaKey && record.areaKey !== s.community?.key) return false;
    return true;
  }
  function languageHasSupport(s, languageId, mode, purpose, assistance = null, kinds = null) {
    const entries = [...(Array.isArray(s?.languageState?.accessArrangements)
      ? s.languageState.accessArrangements : [])];
    if (assistance && typeof assistance === "object") entries.push(assistance);
    return entries.some(entry =>
      (!Array.isArray(kinds) || kinds.includes(entry.kind)) &&
      languageSupportApplies(s, entry, languageId, mode, purpose));
  }

  function canReadLanguageDocument(s, languageId, difficulty = 40, script = null, assistance = null, purpose = "document") {
    const readSkill = getLanguageSkill(s, languageId, "read");
    let scriptOk = true;
    if (script) {
      const scriptScore = s?.languageState?.scripts?.[script] || 0;
      scriptOk = scriptScore >= difficulty;
    }
    const hasAssistance = languageHasSupport(s, languageId, "read", purpose, assistance);
    const assistanceBonus = hasAssistance ? 25 : 0;
    const effective = readSkill + assistanceBonus;
    const readable = (scriptOk || hasAssistance) && effective >= difficulty;
    return {
      readable,
      effectiveScore: effective,
      neededScore: difficulty,
      mediated: hasAssistance,
      directUnderstanding: readSkill >= difficulty && scriptOk
    };
  }

  function assessCommunication(s, context, assistance = null) {
    // context: object or contextId string from LANGUAGE_CONTEXTS
    let ctx = context;
    if (typeof context === "string" && window.GAME_DATA?.LANGUAGE_CONTEXTS) {
      ctx = window.GAME_DATA.LANGUAGE_CONTEXTS[context] || { primaryLanguageId: "victorian", mode: "listen", difficulty: 40 };
    }
    if (!ctx || typeof ctx !== "object") {
      return { understood: true, status: "understood", directUnderstanding: true, mediated: false, effectiveScore: 100, difficulty: 0 };
    }

    const langId = ctx.primaryLanguageId || "victorian";
    const mode = ctx.mode || "listen";
    const difficulty = Number.isFinite(ctx.difficulty) ? ctx.difficulty : 40;
    const baseSkill = getLanguageSkill(s, langId, mode);

    // 専門レジスター負荷
    let registerPenalty = 0;
    if (ctx.register) {
      const formal = getLanguageSkill(s, langId, "formalRegister");
      if (formal < difficulty) {
        registerPenalty = Math.round((difficulty - formal) * 0.35);
      }
    }

    // 組織符牒・現場隠語
    let cantBonus = 0;
    if (ctx.cantId) {
      const cantScore = getRepertoireSkill(s, ctx.cantId);
      cantBonus = Math.round(cantScore * 0.4);
    }

    // 書記要件
    let scriptOk = true;
    if (ctx.script) {
      const scriptScore = s?.languageState?.scripts?.[ctx.script] || 0;
      scriptOk = scriptScore >= difficulty;
    }

    // 支援・通訳
    const purpose = typeof context === "string" ? context : ctx.purpose || "general-communication";
    const hasAssistance = languageHasSupport(s, langId, mode, purpose, assistance);
    const assistanceBonus = hasAssistance ? 30 : 0;

    const effective = Math.max(0, baseSkill - registerPenalty + cantBonus + assistanceBonus);
    const directOk = baseSkill >= difficulty && scriptOk && registerPenalty <= 10;
    const overallOk = effective >= difficulty && (scriptOk || hasAssistance);

    let status = "blocked";
    if (overallOk) {
      status = "understood";
    } else if (effective >= Math.round(difficulty * 0.6)) {
      status = "partial";
    }

    return {
      understood: overallOk,
      status,
      directUnderstanding: directOk,
      mediated: hasAssistance,
      effectiveScore: effective,
      difficulty
    };
  }

  function ensureLanguageState(s, birth = {}) {
    if (s.languageState && typeof s.languageState === "object" && s.languageState.version === 1) {
      return s.languageState;
    }

    const regionName = s.res?.n || birth.region || "ヴィクトリア";
    const regProfiles = window.GAME_DATA?.REGION_LANGUAGE_PROFILES || {};
    const profile = regProfiles[regionName] || {
      primaryCivicLanguage: "victorian",
      homeDistribution: [{ id: "victorian", weight: 100 }]
    };

    const homeIds = [];
    // ターラー系文化帰属の家庭言語継承
    if (s.culturalIdentity?.affiliation === "ターラー系" || birth.ethnicity === "ターラー系") {
      homeIds.push("taran_heritage");
    } else if (birth.homeLanguageId) {
      homeIds.push(birth.homeLanguageId);
    } else {
      homeIds.push(profile.primaryCivicLanguage || "victorian");
    }

    const firstSocial = profile.primaryCivicLanguage || "victorian";
    const initialSkills = {};

    // 出生時の初期技能（乳幼児は0からスタート。すでに年齢が進んでいる場合は年齢相当値を付与）
    const age = Number.isFinite(s.age) ? s.age : 0;
    const spokenGrowth = Math.min(85, Math.round(age * 12));
    const writtenGrowth = age >= 6 ? Math.min(80, Math.round((age - 5) * 8)) : 0;
    const formalGrowth = age >= 15 ? Math.min(60, Math.round((age - 14) * 5)) : 0;

    for (const hId of homeIds) {
      initialSkills[hId] = {
        listen: spokenGrowth,
        speak: spokenGrowth,
        read: hId === "taran_heritage" ? Math.min(25, writtenGrowth) : writtenGrowth,
        write: hId === "taran_heritage" ? Math.min(15, writtenGrowth) : writtenGrowth,
        formalRegister: Math.min(20, formalGrowth),
        lastUsedYear: s.year || 1077,
        acquisition: ["home"],
        evidence: ["birth-home-context"]
      };
    }

    if (!initialSkills[firstSocial]) {
      const socialExposure = Math.max(0, Math.round(spokenGrowth * 0.7));
      initialSkills[firstSocial] = {
        listen: socialExposure,
        speak: Math.max(0, socialExposure - 10),
        read: writtenGrowth,
        write: writtenGrowth,
        formalRegister: formalGrowth,
        lastUsedYear: s.year || 1077,
        acquisition: ["community"],
        evidence: ["region-civic-context"]
      };
    }

    const scripts = {};
    if (initialSkills[firstSocial]?.read > 0) {
      const reg = window.GAME_DATA?.LANGUAGE_REGISTRY?.[firstSocial];
      if (reg?.scripts?.[0]) {
        scripts[reg.scripts[0]] = initialSkills[firstSocial].read;
      }
    }

    s.languageState = {
      version: 1,
      homeLanguageIds: homeIds,
      firstSocialLanguageId: firstSocial,
      skills: initialSkills,
      scripts,
      repertoires: {},
      milestones: [],
      encounters: [],
      accessArrangements: [],
      initializedYear: s.year || 1077
    };

    return s.languageState;
  }

  function applyLanguageAction(s, action) {
    if (!action || typeof action !== "object") return;
    const ls = ensureLanguageState(s);
    const langId = action.languageId;
    const mode = action.mode;
    const amount = Number.isFinite(action.amount) ? action.amount : 0;

    if (action.type === "learn" && langId) {
      ls.skills[langId] || (ls.skills[langId] = {
        listen: 0,
        speak: 0,
        read: 0,
        write: 0,
        formalRegister: 0,
        lastUsedYear: s.year,
        acquisition: ["study"],
        evidence: []
      });
      const skillEntry = ls.skills[langId];
      skillEntry.lastUsedYear = s.year;
      if (mode && mode in skillEntry) {
        skillEntry[mode] = clampLanguageSkill((skillEntry[mode] || 0) + amount);
      } else {
        // 全般的な学習
        skillEntry.listen = clampLanguageSkill(skillEntry.listen + Math.round(amount * 0.4));
        skillEntry.speak = clampLanguageSkill(skillEntry.speak + Math.round(amount * 0.3));
        skillEntry.read = clampLanguageSkill(skillEntry.read + Math.round(amount * 0.5));
        skillEntry.write = clampLanguageSkill(skillEntry.write + Math.round(amount * 0.4));
      }
    } else if (action.type === "repertoire" && action.cantId) {
      ls.repertoires[action.cantId] || (ls.repertoires[action.cantId] = {
        comprehension: 0,
        usage: 0,
        access: "observed",
        evidence: [],
        lastUsedYear: s.year
      });
      const rep = ls.repertoires[action.cantId];
      rep.comprehension = clampLanguageSkill(rep.comprehension + amount);
      if (action.usageAmount) rep.usage = clampLanguageSkill(rep.usage + action.usageAmount);
      rep.lastUsedYear = s.year;
    } else if (action.type === "support" && action.arrangement) {
      const a = action.arrangement;
      ls.accessArrangements.push({
        year: s.year,
        expiresYear: Number.isInteger(a.expiresYear)
          ? Math.max(s.year, Math.min(s.year + 3, a.expiresYear)) : s.year,
        languageId: a.languageId || langId || null,
        kind: a.kind || "interpreter",
        mode: a.mode || "listen",
        purpose: a.purpose || a.contextId || "unspecified",
        region: s.res?.n || null,
        placeId: s.local?.placeId || null,
        areaKey: s.community?.key || null,
        sourceEventId: TRACE_RESOLUTION?.id || null
      });
      ls.accessArrangements = ls.accessArrangements.slice(-16);
    }

    if (action.encounter) {
      ls.encounters.push({
        year: s.year,
        languageId: langId || null,
        context: action.encounter.context || "daily",
        outcome: action.encounter.outcome || "neutral",
        accentNoticed: Boolean(action.encounter.accentNoticed),
        sourceEventId: TRACE_RESOLUTION?.id || null
      });
      ls.encounters = ls.encounters.slice(-32);
    }
  }

  function advanceAnnualLanguageLearning(s, services, a) {
    if (!s) return;
    const ls = ensureLanguageState(s);
    const regProfiles = window.GAME_DATA?.REGION_LANGUAGE_PROFILES || {};
    const localProfile = regProfiles[s.res?.n] || { primaryCivicLanguage: "victorian" };
    const civicLang = localProfile.primaryCivicLanguage || "victorian";

    if (a <= 5) {
      for (const hId of ls.homeLanguageIds || []) {
        if (!ls.skills[hId]) {
          ls.skills[hId] = { listen: 0, speak: 0, read: 0, write: 0, formalRegister: 0, lastUsedYear: s.year, acquisition: ["home"], evidence: [] };
        }
        ls.skills[hId].listen = clampLanguageSkill(ls.skills[hId].listen + 14);
        ls.skills[hId].speak = clampLanguageSkill(ls.skills[hId].speak + 12);
        ls.skills[hId].lastUsedYear = s.year;
      }
    }

    const isEnrolled = Boolean(s.fl?.sch || s.fl?.uni_enrolled || s.fl?.voc_enrolled || s.fl?.arts_enrolled);
    if (isEnrolled && a >= 6) {
      const formalOffer=s.world?.educationWorld?.offerings?.[s.educationPath?.offeringId],
        confirmed=!!formalOffer?.instructionLanguage?.evidenceRef,
        schoolLang=formalOffer?
          (confirmed?formalOffer.instructionLanguage.languageId:null):
          localProfile.schoolInstruction||civicLang,
        participation=formalOffer?
          (typeof educationAnnualParticipationScale==="function"?
            educationAnnualParticipationScale(s):0):1;
      if(schoolLang && participation>0){
      if (!ls.skills[schoolLang]) {
        ls.skills[schoolLang] = { listen: 0, speak: 0, read: 0, write: 0, formalRegister: 0, lastUsedYear: s.year, acquisition: ["school"], evidence: [] };
      }
      const sk = ls.skills[schoolLang];
      sk.read = clampLanguageSkill(sk.read + 7*participation);
      sk.write = clampLanguageSkill(sk.write + 6*participation);
      sk.listen = clampLanguageSkill(sk.listen + 5*participation);
      sk.speak = clampLanguageSkill(sk.speak + 4*participation);
      if (a >= 14) sk.formalRegister = clampLanguageSkill(sk.formalRegister + 4*participation);
      sk.lastUsedYear = s.year;
      }
    }

    if (civicLang) {
      if (!ls.skills[civicLang]) {
        ls.skills[civicLang] = { listen: 0, speak: 0, read: 0, write: 0, formalRegister: 0, lastUsedYear: s.year, acquisition: ["community"], evidence: [] };
      }
      const csk = ls.skills[civicLang];
      if (csk.listen < 60) csk.listen = clampLanguageSkill(csk.listen + 2);
      if (csk.speak < 50) csk.speak = clampLanguageSkill(csk.speak + 2);
      csk.lastUsedYear = s.year;
    }
  }

  const SCRIPT_DISPLAY_NAMES = Object.freeze({
    victorian_script: "ヴィクトリア文字",
    ursus_script: "ウルサス文字",
    yan_script: "炎国文字",
    leithanien_script: "リターニア音律文字",
    laterano_script: "ラテラーノ典礼文字",
    siracusa_script: "シラクーザ文字",
    iberia_script: "イベリア文字",
    gaul_script: "旧ガリア文字",
    ancient_sarkaz_cuneiform: "古代サルカズ楔形文字",
    kazdel_contemporary: "カズデル現代文字",
    sargon_script: "サルゴン碑銘文字",
    kjerag_script: "イェラグ聖伝文字",
    kazimierz_script: "カジミエーシュ騎士文字",
    higashi_script: "東方文字",
    rim_script: "レム鉱山文字",
    bolivar_script: "ボリバル文字",
    minos_script: "ミノス英雄文字"
  });

  const REPERTOIRE_DISPLAY_NAMES = Object.freeze({
    ursus_mine_jargon: "ウルサス鉱山の現場俗語・スラング",
    siracusa_family_cant: "シラクーザ・ファミリーの符牒",
    columbia_frontier_slang: "クルビア開拓地スラング",
    rhodes_operator_cant: "ロドス艦内オペレーター符牒",
    reunion_combat_signs: "レユニオン戦闘暗号・符牒"
  });

  const ACQUISITION_DISPLAY_NAMES = Object.freeze({
    home: "家庭環境・母語継承",
    community: "地域社会・定住地",
    school: "学校教育・就学",
    study: "独学・学習",
    work: "職場・業務実務"
  });

  function formatLanguageSummaryForProfile(s, services) {
    const escFn = services?.esc || (str => String(str ?? ""));
    if (!s) return escFn("未記録");
    const ls = s.languageState || (typeof ensureLanguageState === "function" ? ensureLanguageState(s) : null);
    if (!ls || !ls.skills) return escFn("未記録");

    const registry = (typeof LANGUAGE_REGISTRY !== "undefined" ? LANGUAGE_REGISTRY : null) || window.GAME_DATA?.LANGUAGE_REGISTRY || {};
    const activeLangs = Object.entries(ls.skills)
      .filter(([_, sk]) => (sk.listen > 0 || sk.speak > 0 || sk.read > 0 || sk.write > 0))
      .sort((a, b) => {
        const aIsHome = (ls.homeLanguageIds || []).includes(a[0]) ? 1 : 0;
        const bIsHome = (ls.homeLanguageIds || []).includes(b[0]) ? 1 : 0;
        if (aIsHome !== bIsHome) return bIsHome - aIsHome;
        const aScore = ((a[1].listen || 0) + (a[1].speak || 0));
        const bScore = ((b[1].listen || 0) + (b[1].speak || 0));
        return bScore - aScore;
      });

    if (!activeLangs.length) {
      return escFn(s.age < 3 ? "言語習得の途上（聞き取り中）" : "日常会話（未記録）");
    }

    const items = activeLangs.map(([id, sk]) => {
      const reg = registry[id];
      const name = reg?.displayName || id;
      const isHome = (ls.homeLanguageIds || []).includes(id);
      const avg = ((sk.listen || 0) + (sk.speak || 0) + (sk.read || 0) + (sk.write || 0)) / 4;
      let lvLabel = "片言";
      if (avg >= 75) lvLabel = "高度・精通";
      else if (avg >= 45) lvLabel = "日常・実務";
      else if (avg < 15) lvLabel = "初歩";

      const tag = isHome ? "母語" : (ls.firstSocialLanguageId === id ? "地域語" : "");
      const desc = tag ? `${lvLabel}／${tag}` : lvLabel;
      return `${name}（${desc}）`;
    });

    return escFn(items.join("、"));
  }

  function formatLanguageMetric(s) {
    if (!s) return null;
    const ls = s.languageState || (typeof ensureLanguageState === "function" ? ensureLanguageState(s) : null);
    if (!ls?.skills) return null;
    const registry = (typeof LANGUAGE_REGISTRY !== "undefined" ? LANGUAGE_REGISTRY : null) || window.GAME_DATA?.LANGUAGE_REGISTRY || {};
    const active = Object.entries(ls.skills)
      .filter(([_, sk]) => ((sk.listen || 0) + (sk.speak || 0) > 0))
      .sort((a, b) => {
        const aHome = (ls.homeLanguageIds || []).includes(a[0]) ? 1 : 0;
        const bHome = (ls.homeLanguageIds || []).includes(b[0]) ? 1 : 0;
        if (aHome !== bHome) return bHome - aHome;
        return ((b[1].listen || 0) + (b[1].speak || 0)) - ((a[1].listen || 0) + (a[1].speak || 0));
      });
    if (!active.length) return null;
    const [topId, topSk] = active[0];
    const name = registry[topId]?.displayName || topId;
    const avg = ((topSk.listen || 0) + (topSk.speak || 0) + (topSk.read || 0) + (topSk.write || 0)) / 4;
    let lv = "片言";
    if (avg >= 75) lv = "精通";
    else if (avg >= 45) lv = "日常";
    else if (avg < 15) lv = "初歩";
    const isHome = (ls.homeLanguageIds || []).includes(topId);
    return `${name}（${lv}${isHome ? "・母語" : ""}）`;
  }

  function formatLanguageLearningDetails(s, services) {
    const escFn = services?.esc || (str => String(str ?? ""));
    if (!s) return `<p class="nt">言語習得の記録はありません。</p>`;
    const ls = s.languageState || (typeof ensureLanguageState === "function" ? ensureLanguageState(s) : null);
    if (!ls || !ls.skills) return `<p class="nt">言語習得の記録はありません。</p>`;

    const registry = (typeof LANGUAGE_REGISTRY !== "undefined" ? LANGUAGE_REGISTRY : null) || window.GAME_DATA?.LANGUAGE_REGISTRY || {};
    const activeLangs = Object.entries(ls.skills)
      .filter(([_, sk]) => (sk.listen > 0 || sk.speak > 0 || sk.read > 0 || sk.write > 0))
      .sort((a, b) => {
        const aIsHome = (ls.homeLanguageIds || []).includes(a[0]) ? 1 : 0;
        const bIsHome = (ls.homeLanguageIds || []).includes(b[0]) ? 1 : 0;
        if (aIsHome !== bIsHome) return bIsHome - aIsHome;
        const aScore = ((a[1].listen || 0) + (a[1].speak || 0) + (a[1].read || 0) + (a[1].write || 0));
        const bScore = ((b[1].listen || 0) + (b[1].speak || 0) + (b[1].read || 0) + (b[1].write || 0));
        return bScore - aScore;
      });

    if (!activeLangs.length) {
      return `<p class="nt">乳幼児期のため、まだ明確な言語表現の記録はありません（家庭での日常的な声に接触しています）。</p>`;
    }

    let html = `<div class="ui-language-roster">`;

    for (const [id, sk] of activeLangs) {
      const reg = registry[id];
      const name = reg?.displayName || id;
      const isHome = (ls.homeLanguageIds || []).includes(id);
      const isCivic = ls.firstSocialLanguageId === id;
      const avg = Math.round(((sk.listen || 0) + (sk.speak || 0) + (sk.read || 0) + (sk.write || 0)) / 4);

      let levelTitle = "片言・初級";
      if (avg >= 75) levelTitle = "高度・精通";
      else if (avg >= 45) levelTitle = "日常・実務";
      else if (avg < 15) levelTitle = "初歩・聞きかじり";

      const tags = [];
      if (isHome) tags.push("母語");
      if (isCivic) tags.push("地域公用言語");
      for (const acq of (sk.acquisition || [])) {
        const acqLabel = ACQUISITION_DISPLAY_NAMES[acq];
        if (acqLabel && !tags.includes(acqLabel)) tags.push(acqLabel);
      }

      const cert = reg?.certainty ? `設定根拠: ${reg.certainty}` : "";
      const notes = reg?.notes ? escFn(reg.notes) : "";

      html += `<div class="ledger ui-language-entry" style="margin-bottom: 12px; padding-bottom: 10px;">`;
      html += `<div style="display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 4px;">`;
      html += `<strong style="font-size: 1.05rem;">${escFn(name)}</strong>`;
      html += `<span class="ui-tag" style="font-weight: 600; padding: 2px 8px; border: 1px solid var(--terminal-line); border-radius: 3px; font-size: 0.82rem;">${escFn(levelTitle)}（総合 ${avg} / 100）</span>`;
      for (const t of tags) {
        html += `<span class="nt" style="padding: 1px 6px; background: rgba(128,128,128,0.12); border-radius: 2px; font-size: 0.78rem;">${escFn(t)}</span>`;
      }
      html += `</div>`;

      html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 6px 12px; font-size: 0.84rem; margin: 6px 0; background: rgba(0,0,0,0.02); padding: 6px 8px; border-radius: 4px;">`;
      html += `<div><span class="nt">聴く (聴解):</span> <strong>${sk.listen ?? 0}</strong> <small class="nt">/100</small></div>`;
      html += `<div><span class="nt">話す (会話):</span> <strong>${sk.speak ?? 0}</strong> <small class="nt">/100</small></div>`;
      html += `<div><span class="nt">読む (読解):</span> <strong>${sk.read ?? 0}</strong> <small class="nt">/100</small></div>`;
      html += `<div><span class="nt">書く (記述):</span> <strong>${sk.write ?? 0}</strong> <small class="nt">/100</small></div>`;
      if (sk.formalRegister > 0) {
        html += `<div><span class="nt">公的・専門語彙:</span> <strong>${sk.formalRegister}</strong> <small class="nt">/100</small></div>`;
      }
      html += `</div>`;

      if (notes || cert) {
        html += `<small class="nt" style="display: block; line-height: 1.5; color: var(--ui-muted);">${notes}${notes && cert ? " " : ""}${cert ? `（${cert}）` : ""}</small>`;
      }
      html += `</div>`;
    }

    const activeScripts = Object.entries(ls.scripts || {}).filter(([_, score]) => score > 0);
    if (activeScripts.length > 0) {
      html += `<div style="margin-top: 14px; border-top: 1px dashed var(--ln); padding-top: 8px;">`;
      html += `<h4 style="margin: 0 0 6px; font-size: 0.92rem;">習得している文字・書記体系</h4>`;
      html += `<ul style="margin: 0; padding-left: 18px; font-size: 0.85rem; line-height: 1.6;">`;
      for (const [scriptId, score] of activeScripts) {
        const sName = SCRIPT_DISPLAY_NAMES[scriptId] || scriptId;
        const sLevel = score >= 70 ? "流暢に筆記・読解可能" : score >= 40 ? "日常文書の読解可能" : "初歩の文字認識";
        html += `<li><strong>${escFn(sName)}</strong>: 習熟度 ${score} / 100 <span class="nt">（${escFn(sLevel)}）</span></li>`;
      }
      html += `</ul></div>`;
    }

    const activeRepertoires = Object.entries(ls.repertoires || {}).filter(([_, rep]) => (rep.comprehension > 0 || rep.usage > 0));
    if (activeRepertoires.length > 0) {
      html += `<div style="margin-top: 14px; border-top: 1px dashed var(--ln); padding-top: 8px;">`;
      html += `<h4 style="margin: 0 0 6px; font-size: 0.92rem;">現場語彙・符牒・スラング</h4>`;
      html += `<ul style="margin: 0; padding-left: 18px; font-size: 0.85rem; line-height: 1.6;">`;
      for (const [cantId, rep] of activeRepertoires) {
        const rName = REPERTOIRE_DISPLAY_NAMES[cantId] || cantId;
        html += `<li><strong>${escFn(rName)}</strong>: 理解度 ${rep.comprehension ?? 0} / 100${rep.usage ? `・使用経験 ${rep.usage} / 100` : ""}</li>`;
      }
      html += `</ul></div>`;
    }

    if (Array.isArray(ls.accessArrangements) && ls.accessArrangements.length > 0) {
      html += `<div style="margin-top: 14px; border-top: 1px dashed var(--ln); padding-top: 8px;">`;
      html += `<h4 style="margin: 0 0 6px; font-size: 0.92rem;">これまでの言語仲介・通訳手配</h4>`;
      html += `<ul style="margin: 0; padding-left: 18px; font-size: 0.84rem; line-height: 1.6;">`;
      for (const arr of ls.accessArrangements.slice(-5).reverse()) {
        const lName = registry[arr.languageId]?.displayName || arr.languageId;
        const kLabel = arr.kind === "interpreter" ? "通訳手配" : arr.kind === "helper" ? "同行補助" : arr.kind;
        const purposeNames = {
          "victoria-office-application": "窓口への応募手続き",
          "columbia-frontier-contract": "契約内容の確認",
          "kazdel-historical-tablet": "古い石板の読解",
          "ursus-mine-team": "鉱山での意思疎通",
          "siracusa-street-alert": "街路での連絡",
          "language-condition": "個別の言語手続き",
          document: "文書の確認"
        };
        const purposeName = purposeNames[arr.purpose] || "手配用途の詳細未記録";
        html += `<li>${arr.year ? `${arr.year}年: ` : ""}${escFn(lName)}における${escFn(kLabel)}（${escFn(purposeName)}・${escFn(arr.region || "場所未記録")}・${escFn(arr.expiresYear ?? arr.year ?? "期限未記録")}年までの手配履歴）</li>`;
      }
      html += `</ul></div>`;
    }

    html += `</div>`;
    return html;
  }
