const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const OFFICIAL_KEY = {
  1: 'B', 2: 'B', 3: 'D', 4: 'B', 5: 'C', 6: 'A', 7: 'D', 8: 'A', 9: 'A', 10: 'B',
  11: 'A', 12: 'D', 13: 'B', 14: 'A', 15: 'C', 16: 'D', 17: 'A', 18: 'A', 19: 'B', 20: 'C',
  21: 'D', 22: 'A', 23: 'D', 24: 'A', 25: 'B', 26: 'C', 27: 'B', 28: 'D', 29: 'C', 30: 'A',
  31: 'D', 32: 'A', 33: 'A', 34: 'C', 35: 'B', 36: 'D', 37: 'C', 38: 'B', 39: 'D', 40: 'B',
  41: 'C', 42: 'A', 43: 'D', 44: 'A', 45: 'B', 46: 'C', 47: 'C', 48: 'D', 49: 'C', 50: 'C'
};

function uuidToQNum(uuid) {
  const num = parseInt(uuid.replace(/[^0-9]/g, ''), 10);
  return num >= 1 && num <= 50 ? num : null;
}

function formatDuration(ms) {
  if (ms == null || isNaN(ms) || ms < 0) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

async function runReconciliation() {
  const { data: participants } = await supabase.from('participants').select('*').order('created_at', { ascending: true });
  const { data: registrations } = await supabase.from('registrations').select('*');
  const { data: txns } = await supabase.from('payment_transactions').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').order('started_at', { ascending: true });
  const { data: answers } = await supabase.from('quiz_answers').select('*');
  const { data: auditLogs } = await supabase.from('audit_logs').select('*');

  // Mapping structures
  const regMap = {};
  (registrations || []).forEach(r => regMap[r.participant_id] = r);

  const txnMap = {};
  (txns || []).forEach(t => {
    if (!txnMap[t.registration_id]) txnMap[t.registration_id] = [];
    txnMap[t.registration_id].push(t);
  });

  const answersBySession = {};
  (answers || []).forEach(a => {
    if (!answersBySession[a.session_id]) answersBySession[a.session_id] = [];
    answersBySession[a.session_id].push(a);
  });

  const sessionsByParticipant = {};
  (sessions || []).forEach(s => {
    if (!sessionsByParticipant[s.participant_id]) sessionsByParticipant[s.participant_id] = [];
    sessionsByParticipant[s.participant_id].push(s);
  });

  const masterList = [];

  for (const p of participants) {
    const reg = regMap[p.id];
    const userSessions = sessionsByParticipant[p.id] || [];
    const isPaid = reg?.payment_status === 'SUCCESS' || p.status === 'ACTIVE';

    // Check if there are answers for this participant
    let totalAnswersCount = 0;
    let latestSession = userSessions.length > 0 ? userSessions[userSessions.length - 1] : null;

    let correctCount = 0;
    let wrongCount = 0;

    if (latestSession) {
      const sessAnswers = answersBySession[latestSession.id] || [];
      totalAnswersCount = sessAnswers.length;

      sessAnswers.forEach(a => {
        const qNum = uuidToQNum(a.question_id);
        const expected = OFFICIAL_KEY[qNum];
        if (expected === a.selected_option) correctCount++;
        else wrongCount++;
      });
    }

    // Determine Classification Category
    let category = 'NO EVIDENCE OF QUIZ ACTIVITY';
    let makeUpEligibility = 'NO';

    if (!isPaid) {
      category = 'UNPAID / REGISTRATION PENDING';
      makeUpEligibility = 'INELIGIBLE (UNPAID)';
    } else if (latestSession) {
      const startObj = new Date(latestSession.started_at);
      const isBeforeFix = startObj.getTime() < new Date('2026-10-04T10:55:00Z').getTime();

      if (totalAnswersCount > 0) {
        if (latestSession.status === 'SUBMITTED' || latestSession.status === 'EXPIRED') {
          category = 'RECORDED — SCORE AVAILABLE';
          makeUpEligibility = 'COMPLETED (NO MAKE-UP NEEDED)';
        } else {
          category = 'IN_PROGRESS — CURRENTLY ANSWERING';
          makeUpEligibility = 'CURRENTLY ACTIVE';
        }
      } else {
        // 0 answers stored
        if (isBeforeFix) {
          if (latestSession.status === 'SUBMITTED' || latestSession.status === 'EXPIRED') {
            category = 'AFFECTED — ANSWERS LOST';
            makeUpEligibility = 'ELIGIBLE FOR MAKE-UP';
          } else {
            category = 'AFFECTED — STALLED / IN-PROGRESS';
            makeUpEligibility = 'ELIGIBLE FOR MAKE-UP';
          }
        } else {
          // Started after fix but 0 answers (e.g. admin test or just opened)
          if (latestSession.status === 'IN_PROGRESS') {
            category = 'IN_PROGRESS — JUST OPENED';
            makeUpEligibility = 'CURRENTLY ACTIVE';
          } else {
            category = 'SUBMITTED — 0 ANSWERS GIVEN';
            makeUpEligibility = 'REVIEW NEEDED';
          }
        }
      }
    } else {
      // Is paid, but no quiz_session record
      // Check if audit logs or proctoring has any trace
      const hasAuditTrace = (auditLogs || []).some(l => l.entity_id === p.id || JSON.stringify(l.metadata || {}).includes(p.participant_id || p.id));
      if (hasAuditTrace) {
        category = 'SUBMISSION EVIDENCE — DATA LOST';
        makeUpEligibility = 'ELIGIBLE FOR MAKE-UP';
      } else {
        category = 'NO EVIDENCE OF QUIZ ACTIVITY';
        makeUpEligibility = 'NO (DID NOT ATTEMPT)';
      }
    }

    // Timestamps and Duration
    let startIST = '—';
    let submitIST = '—';
    let durationStr = '—';

    if (latestSession) {
      const startObj = new Date(latestSession.started_at);
      startIST = startObj.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

      if (latestSession.submitted_at) {
        const subObj = new Date(latestSession.submitted_at);
        submitIST = subObj.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const ms = subObj.getTime() - startObj.getTime();
        durationStr = formatDuration(ms);
      } else if (latestSession.status === 'EXPIRED') {
        submitIST = new Date(latestSession.expires_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' (Auto-Expired)';
        durationStr = '25m 00s';
      } else {
        submitIST = 'In Progress';
      }
    }

    masterList.push({
      participantId: p.participant_id || 'UNKNOWN',
      name: p.name || 'Unknown',
      phone: p.phone || '—',
      place: p.city || p.district || p.state || '—',
      college: p.college || '—',
      isPaid,
      hasSession: Boolean(latestSession),
      sessionId: latestSession?.id || '—',
      sessionStatus: latestSession?.status || 'NO_SESSION',
      startIST,
      submitIST,
      durationStr,
      answersStored: totalAnswersCount,
      correctCount,
      score: latestSession ? (latestSession.score || correctCount) : 0,
      category,
      makeUpEligibility
    });
  }

  fs.writeFileSync('scripts/master_reconciliation_results.json', JSON.stringify(masterList, null, 2), 'utf8');

  // Print Summary Stats
  console.log('=== MASTER RECONCILIATION SUMMARY ===');
  console.log('Total Registered Participants:', masterList.length);
  const paidList = masterList.filter(m => m.isPaid);
  console.log('Total Payment-Confirmed Participants:', paidList.length);

  const categoryCounts = {};
  paidList.forEach(m => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
  });
  console.log('\nBreakdown of Paid Participants by Status:');
  console.table(categoryCounts);

  const eligibleForMakeUp = paidList.filter(m => m.makeUpEligibility === 'ELIGIBLE FOR MAKE-UP');
  console.log(`\nTotal Eligible for Technical Make-Up: ${eligibleForMakeUp.length}`);
}

runReconciliation();
