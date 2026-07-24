import type { Scenario } from "../types/analysis";

const common = { dueDate: null, status: "suggested" as const };

export const scenarios: Scenario[] = [
  {
    id: "proposal",
    fileAliases: ["call-01", "proposal", "quote", "견적", "제안"],
    title: "01 · 제안서와 견적 요청",
    description: "대학 교육 담당자가 과정안과 견적을 요청한 통화",
    transcript: `[영업담당자] 안녕하세요. 지난번 문의하신 대학 교직원 대상 AX 교육 건으로 연락드렸습니다.
[고객] 네, 내부에서 관심이 있습니다. 비전공자도 따라올 수 있는 과정이면 좋겠고 20명 정도를 생각하고 있어요.
[고객] 다만 이번 분기 예산은 아직 확정되지 않았습니다. 내부 보고할 수 있는 과정안과 인원 기준 견적을 보내주세요.
[영업담당자] 네, 이틀 안에 과정안과 견적을 정리해 보내드리겠습니다.
[고객] 자료를 보고 예산 담당자와 논의한 뒤 다시 연락드릴게요.`,
    result: {
      analysisId: "analysis-001",
      summary: "대학 교육 담당자는 비전공 교직원 약 20명을 위한 AX 교육에 관심이 있으며, 내부 검토용 과정안과 견적을 요청했습니다. 예산은 아직 확정되지 않았습니다.",
      customerNeeds: ["비전공자도 참여 가능한 AX 교육과정", "예상 20명 기준 과정안과 견적"],
      objections: ["이번 분기 예산이 아직 확정되지 않음"],
      promises: [
        { owner: "salesperson", description: "이틀 안에 과정안과 견적 전달" },
        { owner: "customer", description: "자료 검토 후 예산 담당자와 논의" },
      ],
      itemsToVerify: ["정확한 교육 인원", "교육 가능 일정", "예산 집행 가능 항목"],
      salesStage: { code: "proposal_requested", label: "제안서 요청", reason: "고객이 내부 보고용 과정안과 견적을 명시적으로 요청함", confidence: 0.94 },
      recommendedActions: [
        { ...common, id: "p1", label: "대학 맞춤형 교육과정 제안서 작성", instruction: "비전공 교직원 20명 기준으로 목표, 커리큘럼, 운영 방식을 담은 제안서 초안을 작성합니다.", reason: "고객이 내부 보고용 과정안을 요청했습니다.", priority: "high", suggestedTiming: "2영업일 이내", evidence: [{ speaker: "customer", quote: "내부 보고할 수 있는 과정안을 보내주세요." }], requiredInputs: ["예상 교육 인원", "교육 가능 일정"], expectedOutcome: "고객의 내부 검토 착수", executionMode: "draft", confidence: 0.94 },
        { ...common, id: "p2", label: "예상 인원 기준 견적서 작성", instruction: "20명 기준 비용과 인원 변동 시의 조건을 포함해 견적을 준비합니다.", reason: "고객이 인원 기준 견적을 함께 요청했습니다.", priority: "high", suggestedTiming: "2영업일 이내", evidence: [{ speaker: "customer", quote: "인원 기준 견적을 보내주세요." }], requiredInputs: ["교육 단가", "강사 및 운영 비용"], expectedOutcome: "예산 검토에 필요한 금액 범위 확인", executionMode: "draft", confidence: 0.93 },
        { ...common, id: "p3", label: "예산 집행 가능 항목 확인 요청", instruction: "교육비를 집행할 수 있는 예산 항목과 확정 예정일을 고객에게 확인합니다.", reason: "예산이 미확정이라 제안 진행 시점을 판단할 정보가 필요합니다.", priority: "medium", suggestedTiming: "자료 발송 시", evidence: [{ speaker: "customer", quote: "이번 분기 예산은 아직 확정되지 않았습니다." }], requiredInputs: ["고객 예산 담당자 정보"], expectedOutcome: "구매 가능 시점과 예산 제약 파악", executionMode: "research", confidence: 0.88 },
        { ...common, id: "p4", label: "자료 발송 3일 후 후속 통화 등록", instruction: "자료 발송일을 기준으로 3일 뒤 검토 상황을 확인할 후속 연락을 준비합니다.", reason: "고객이 내부 검토 후 회신하기로 했습니다.", priority: "medium", suggestedTiming: "자료 발송 3일 후", evidence: [{ speaker: "customer", quote: "자료를 보고 예산 담당자와 논의한 뒤 다시 연락드릴게요." }], expectedOutcome: "내부 검토 결과와 다음 의사결정 단계 확인", executionMode: "schedule", confidence: 0.86 },
      ],
      warnings: ["예산 확정일과 최종 교육 인원은 통화에서 확인되지 않았습니다."],
      analyzedAt: "2026-07-24T10:00:00+09:00",
    },
  },
  {
    id: "department",
    fileAliases: ["call-02", "department", "it-team", "정보화", "부서"],
    title: "02 · 담당 부서 불일치",
    description: "교육 담당자에게 시스템 도입 권한이 없는 통화",
    transcript: `[영업담당자] 교육 운영과 시스템 도입을 함께 제안드리고 싶습니다.
[고객] 교육 프로그램은 제가 담당하지만 시스템 도입은 저희 부서 권한이 아니에요.
[고객] 정보화 부서나 혁신사업단에서 검토해야 합니다. 담당자를 바로 알려드리기는 어려워요.
[영업담당자] 그러면 전달하기 쉬운 한 장짜리 소개자료를 보내드리겠습니다.
[고객] 네, 교육 제안과 구축 제안은 구분해주시면 내부 전달해보겠습니다.`,
    result: {
      analysisId: "analysis-002",
      summary: "현재 담당자는 교육 프로그램만 담당하며 시스템 도입 의사결정 권한은 없습니다. 정보화 부서 또는 혁신사업단으로 연결되려면 교육·구축 제안을 분리한 소개자료가 필요합니다.",
      customerNeeds: ["내부 전달이 쉬운 짧은 소개자료", "교육과 시스템 구축 제안의 명확한 구분"],
      objections: ["통화 상대에게 시스템 도입 권한이 없음", "연결 대상 담당자가 아직 특정되지 않음"],
      promises: [{ owner: "salesperson", description: "내부 전달용 1페이지 소개자료 전달" }, { owner: "customer", description: "자료 수신 후 관련 부서에 전달 시도" }],
      itemsToVerify: ["정보화 부서 또는 혁신사업단 담당자", "시스템 도입 의사결정 절차"],
      salesStage: { code: "stakeholder_mapping", label: "의사결정자 탐색", reason: "현재 접점이 도입 권한을 가진 부서로 연결되어야 함", confidence: 0.91 },
      recommendedActions: [
        { ...common, id: "d1", label: "정보화 담당 부서 연결 요청", instruction: "현재 담당자에게 정보화 부서 또는 혁신사업단의 적합한 담당자 소개를 정중히 요청합니다.", reason: "현재 통화 상대에게 시스템 도입 권한이 없습니다.", priority: "high", suggestedTiming: "소개자료 발송 시", evidence: [{ speaker: "customer", quote: "정보화 부서나 혁신사업단에서 검토해야 합니다." }], requiredInputs: ["내부 전달용 소개 문구"], expectedOutcome: "시스템 도입 권한이 있는 담당자와 신규 접점 확보", executionMode: "manual", confidence: 0.92 },
        { ...common, id: "d2", label: "시스템 도입 의사결정 구조 확인", instruction: "검토 부서, 예산 부서, 최종 승인자의 역할을 확인할 질문 목록을 준비합니다.", reason: "도입 검토 주체와 승인 절차가 불명확합니다.", priority: "high", suggestedTiming: "다음 접촉 전", evidence: [{ speaker: "customer", quote: "시스템 도입은 저희 부서 권한이 아니에요." }], requiredInputs: ["기관 조직도 또는 공개 부서 정보"], expectedOutcome: "영업 이해관계자 지도 작성", executionMode: "research", confidence: 0.87 },
        { ...common, id: "d3", label: "교육 제안과 구축 제안을 분리하여 준비", instruction: "교육 운영안과 시스템 구축안을 독립적으로 검토할 수 있게 문서 구조를 분리합니다.", reason: "고객이 두 제안의 구분을 명시적으로 요청했습니다.", priority: "medium", suggestedTiming: "3영업일 이내", evidence: [{ speaker: "customer", quote: "교육 제안과 구축 제안은 구분해주시면 좋겠습니다." }], requiredInputs: ["교육 범위", "시스템 구축 범위"], expectedOutcome: "부서별 검토 부담 감소", executionMode: "draft", confidence: 0.95 },
        { ...common, id: "d4", label: "연결받을 담당자에게 전달할 1페이지 소개자료 작성", instruction: "문제, 기대 효과, 도입 범위, 다음 미팅 제안을 한 페이지로 정리합니다.", reason: "현재 담당자가 관련 부서에 전달할 자료를 필요로 합니다.", priority: "medium", suggestedTiming: "2영업일 이내", evidence: [{ speaker: "salesperson", quote: "전달하기 쉬운 한 장짜리 소개자료를 보내드리겠습니다." }], requiredInputs: ["핵심 가치 제안", "유사 도입 사례"], expectedOutcome: "신규 담당자의 초기 관심 확보", executionMode: "draft", confidence: 0.9 },
      ],
      warnings: ["최종 의사결정자와 예산 소유 부서는 아직 확인되지 않았습니다."],
      analyzedAt: "2026-07-24T10:05:00+09:00",
    },
  },
  {
    id: "rejected",
    fileAliases: ["call-03", "reject", "budget", "거절", "예산없음"],
    title: "03 · 현재 도입 거절",
    description: "예산과 운영 여력 부족으로 현재 도입이 어려운 통화",
    transcript: `[고객] 이번 학기는 예산도 없고 신규 교육을 운영할 여력이 없습니다.
[영업담당자] 그러면 이번에는 보류하고 다음 시기를 검토해도 될까요?
[고객] 겨울방학이나 다음 연도라면 다시 볼 수는 있어요. 예산 편성은 보통 10월쯤 시작합니다.
[영업담당자] 부담이 적은 2시간 쇼케이스 자료를 먼저 보내드려도 될까요?
[고객] 자료만 보내주세요. 일정 등록이나 확정은 아직 어렵습니다.`,
    result: {
      analysisId: "analysis-003",
      summary: "고객은 이번 학기 예산과 운영 여력 부족으로 현재 도입을 거절했습니다. 겨울방학 또는 다음 연도 재검토 가능성은 있으며, 예산 편성은 통상 10월에 시작됩니다.",
      customerNeeds: ["운영 부담이 적은 짧은 체험 자료", "차기 예산 주기에 맞춘 재검토"],
      objections: ["현재 학기 예산 없음", "신규 교육 운영 여력 부족"],
      promises: [{ owner: "salesperson", description: "2시간 쇼케이스 자료 전달" }],
      itemsToVerify: ["정확한 10월 예산 편성 일정", "겨울방학 운영 가능 기간"],
      salesStage: { code: "nurture_deferred", label: "장기 보류", reason: "현재 도입은 거절됐지만 차기 검토 가능성이 남아 있음", confidence: 0.96 },
      recommendedActions: [
        { ...common, id: "r1", label: "현재 거절 사유 기록", instruction: "예산 부재와 운영 여력 부족을 구분해 고객 이력에 기록합니다.", reason: "향후 재접촉 시 같은 제안을 반복하지 않기 위해 거절 맥락을 보존해야 합니다.", priority: "high", suggestedTiming: "통화 직후", evidence: [{ speaker: "customer", quote: "이번 학기는 예산도 없고 신규 교육을 운영할 여력이 없습니다." }], expectedOutcome: "재접촉 품질을 위한 정확한 고객 이력 확보", executionMode: "record", confidence: 0.98 },
        { ...common, id: "r2", label: "겨울방학 재접촉 후보로 분류", instruction: "자동 실행 없이 겨울방학 검토 후보 상태로 분류하고 재접촉 전 승인받습니다.", reason: "고객이 겨울방학 재검토 가능성을 언급했습니다.", priority: "medium", suggestedTiming: "겨울방학 계획 수립 전", evidence: [{ speaker: "customer", quote: "겨울방학이나 다음 연도라면 다시 볼 수는 있어요." }], expectedOutcome: "적절한 시점의 영업 재개", executionMode: "record", confidence: 0.9 },
        { ...common, id: "r3", label: "차기 예산 편성 시기 확인", instruction: "10월 예산 편성 시작 시점과 사전 검토 마감일을 확인합니다.", reason: "예산 주기에 맞춰야 다음 연도 제안 가능성이 높아집니다.", priority: "medium", suggestedTiming: "9월 중", evidence: [{ speaker: "customer", quote: "예산 편성은 보통 10월쯤 시작합니다." }], requiredInputs: ["담당 부서의 예산 일정"], expectedOutcome: "차기 제안 제출 시점 확정", executionMode: "research", confidence: 0.89 },
        { ...common, id: "r4", label: "부담이 적은 2시간 쇼케이스 자료 전달", instruction: "도입 확정을 전제로 하지 않는 2시간 쇼케이스 개요와 기대 효과만 전달합니다.", reason: "고객이 자료 수신에는 동의했지만 일정 확정은 원하지 않았습니다.", priority: "low", suggestedTiming: "5영업일 이내", evidence: [{ speaker: "customer", quote: "자료만 보내주세요. 일정 등록이나 확정은 아직 어렵습니다." }], requiredInputs: ["2시간 프로그램 개요"], expectedOutcome: "부담 없는 관계 유지", executionMode: "draft", confidence: 0.93 },
      ],
      warnings: ["고객은 일정 등록이나 교육 확정에 동의하지 않았습니다. 자동 실행하지 마세요."],
      analyzedAt: "2026-07-24T10:10:00+09:00",
    },
  },
  {
    id: "no-actions",
    fileAliases: ["call-04", "wrong-number", "greeting", "인사", "잘못연결"],
    title: "04 · 추천 업무 없음",
    description: "잘못 연결된 전화로 실행할 후속 업무가 없는 대조군",
    transcript: `[영업담당자] 안녕하세요. AX 교육 관련해서 연락드렸습니다.
[상대방] 담당자가 아니고 번호를 잘못 거신 것 같습니다.
[영업담당자] 죄송합니다. 좋은 하루 보내세요.`,
    result: {
      analysisId: "analysis-004",
      summary: "통화가 잘못 연결되어 제품, 교육, 일정 또는 후속 협의에 관한 유효한 영업 대화가 진행되지 않았습니다.",
      customerNeeds: [],
      objections: [],
      promises: [],
      itemsToVerify: [],
      salesStage: { code: "invalid_contact", label: "유효 접점 아님", reason: "상대방이 담당자가 아니며 잘못 연결된 전화임을 명시했습니다.", confidence: 0.99 },
      recommendedActions: [],
      warnings: ["영업 기회로 판단할 만한 정보가 없습니다."],
      analyzedAt: "2026-07-24T10:15:00+09:00",
    },
  },
  {
    id: "many-requests",
    fileAliases: ["call-05", "many", "requests", "다수요청", "종합요청"],
    title: "05 · 다수 요청",
    description: "과정안·견적·일정·사례·라이선스·보안을 동시에 요청한 통화",
    transcript: `[고객] 내부 검토가 이번 주부터 시작됩니다. 과정안과 50명 기준 견적, 9월 가능한 일정, 대학 도입 사례를 함께 주세요.
[고객] 계정 라이선스 정책과 개인정보 처리, 보안 점검 자료도 필요합니다. 교수학습지원센터와 비교과센터가 함께 운영할 수 있는지도 검토해야 합니다.
[영업담당자] 요청 항목을 나누어 담당 부서에 확인한 뒤 검토 순서가 보이도록 정리하겠습니다.`,
    result: {
      analysisId: "analysis-005",
      summary: "고객은 내부 검토를 시작하기 위해 교육과정, 50명 기준 견적, 9월 일정, 대학 도입 사례, 라이선스 정책, 개인정보 처리 기준, 보안 점검 자료와 공동 운영 가능성까지 동시에 요청했습니다.",
      customerNeeds: ["교육과정안", "50명 기준 견적", "9월 교육 일정", "대학 도입 사례", "라이선스 정책", "개인정보 처리 기준", "보안 점검 자료", "공동 운영 가능성"],
      objections: ["여러 부서가 동시에 검토해야 해 자료 누락 시 의사결정이 지연될 수 있음"],
      promises: [{ owner: "salesperson", description: "요청 항목을 담당 부서별로 확인해 정리" }],
      itemsToVerify: ["정확한 검토 마감일", "보안 문서 공개 범위", "라이선스 산정 기준"],
      salesStage: { code: "multi_review", label: "복수 부서 제안 검토", reason: "교육·예산·보안·운영 부서가 함께 검토할 자료를 요청함", confidence: 0.92 },
      recommendedActions: [
        { ...common, id: "m1", label: "50명 기준 교육과정안 작성", instruction: "대상과 인원을 반영한 과정안을 작성합니다.", reason: "고객의 명시적 요청입니다.", priority: "high", suggestedTiming: "2영업일 이내", executionMode: "draft", confidence: 0.94 },
        { ...common, id: "m2", label: "인원 구간별 견적 비교표 작성", instruction: "30명, 50명, 70명 구간별 비용을 비교합니다.", reason: "예산 검토에 기준 금액이 필요합니다.", priority: "high", suggestedTiming: "2영업일 이내", executionMode: "draft", confidence: 0.91 },
        { ...common, id: "m3", label: "9월 강사 및 교육장 가용 일정 확인", instruction: "9월 후보일의 강사와 교육장 가능 여부를 확인합니다.", reason: "고객이 9월 운영을 요청했습니다.", priority: "high", suggestedTiming: "1영업일 이내", executionMode: "schedule", confidence: 0.9 },
        { ...common, id: "m4", label: "대학 도입 사례 3건 선별", instruction: "규모와 대상이 유사한 사례를 선별합니다.", reason: "내부 설득 자료가 필요합니다.", priority: "medium", suggestedTiming: "3영업일 이내", executionMode: "research", confidence: 0.88 },
        { ...common, id: "m5", label: "라이선스 정책 설명자료 준비", instruction: "계정 생성, 기간, 동시 접속 정책을 정리합니다.", reason: "운영 조건 검토 요청이 있었습니다.", priority: "medium", suggestedTiming: "3영업일 이내", executionMode: "draft", confidence: 0.87 },
        { ...common, id: "m6", label: "개인정보 처리 기준 확인", instruction: "수집 항목, 보관 기간, 삭제 절차를 내부 확인합니다.", reason: "개인정보 검토가 필요합니다.", priority: "high", suggestedTiming: "보안 자료 전달 전", executionMode: "research", confidence: 0.9 },
        { ...common, id: "m7", label: "보안 점검 자료 공개 범위 검토", instruction: "외부 공유 가능한 보안 문서와 제한 사항을 확인합니다.", reason: "고객이 보안 점검 자료를 요청했습니다.", priority: "high", suggestedTiming: "2영업일 이내", executionMode: "manual", confidence: 0.89 },
        { ...common, id: "m8", label: "교수학습지원센터와 비교과센터의 공동 운영 가능성 확인", instruction: "두 센터가 역할과 예산을 나누어 공동 운영할 수 있는지 확인 질문을 준비합니다.", reason: "복수 센터의 공동 운영 가능성이 언급되었습니다.", priority: "medium", suggestedTiming: "다음 미팅 전", executionMode: "custom", confidence: 0.77 },
        { ...common, id: "m9", label: "요청 자료 전달 순서와 검토 담당자 맵 작성", instruction: "자료별 검토 부서와 전달 순서를 한 장으로 정리합니다.", reason: "동시 요청이 많아 검토 누락 위험이 있습니다.", priority: "medium", suggestedTiming: "자료 발송 전", executionMode: "custom", confidence: 0.82 },
      ],
      warnings: ["요청 항목이 많아 우선순위와 검토 마감일을 추가 확인해야 합니다."],
      analyzedAt: "2026-07-24T10:20:00+09:00",
    },
  },
  {
    id: "limited-info",
    fileAliases: ["call-06", "limited", "interest", "정보부족", "관심"],
    title: "06 · 정보 부족",
    description: "관심만 표현했고 요구·기한·예산이 없는 단일 업무 대조군",
    transcript: `[고객] AX 교육이 있다는 건 들었습니다. 아직 구체적으로 정한 건 없지만 관심은 있어요.
[영업담당자] 대상이나 시기를 정하시면 다시 안내드리겠습니다.`,
    result: {
      analysisId: "analysis-006",
      summary: "고객은 AX 교육에 관심을 표현했지만 교육 대상, 목적, 인원, 예산, 일정과 의사결정 절차는 아직 정하지 않았습니다.",
      customerNeeds: [],
      objections: [],
      promises: [],
      itemsToVerify: ["교육 검토 목적", "대상과 예상 인원", "검토 시기와 예산 여부"],
      salesStage: { code: null, label: null, reason: "관심 표현 외에 단계 판단에 필요한 정보가 부족합니다.", confidence: 0.22 },
      recommendedActions: [
        { ...common, id: "l1", label: "교육 검토 목적과 대상 확인", instruction: "도입을 전제로 하지 않고 관심 배경, 교육 대상, 예상 인원, 검토 시기를 확인합니다.", reason: "구체적인 제안을 만들 정보가 부족합니다.", priority: "medium", dueDate: null, suggestedTiming: null, evidence: [], requiredInputs: [], executionMode: "manual", confidence: 0.31 },
      ],
      warnings: ["정보가 부족해 제안의 확신도가 낮습니다."],
      analyzedAt: "2026-07-24T10:25:00+09:00",
    },
  },
  {
    id: "analysis-failure",
    fileAliases: ["call-07", "failure", "error", "실패", "오류"],
    title: "07 · 분석 실패",
    description: "Mock 오류와 재시도 화면을 확인하는 시나리오",
    transcript: `[녹취 시스템] 음성 구간을 해석할 수 없습니다.`,
    mockBehavior: "failure",
    result: {
      analysisId: "analysis-007",
      summary: "",
      customerNeeds: [],
      objections: [],
      promises: [],
      itemsToVerify: [],
      salesStage: { code: null, label: null, reason: null, confidence: null },
      recommendedActions: [],
      warnings: [],
      analyzedAt: "2026-07-24T10:30:00+09:00",
    },
  },
  {
    id: "stress",
    fileAliases: ["call-08", "stress", "long", "스트레스", "장문"],
    title: "08 · 스트레스 데이터",
    description: "긴 텍스트·누락값·비정상 신뢰도·알 수 없는 실행 방식 검증",
    transcript: `[고객] 여러 단과대학과 부속기관이 공동으로 참여하는 장기 AX 역량 강화 사업을 검토하고 있습니다. 교수, 직원, 조교, 학생의 요구가 모두 다르고 기존 LMS 및 학사시스템과의 연동도 고려해야 합니다.
[고객] 사업단이 종료된 이후에도 운영할 수 있는 예산 출처, 경쟁 교육사의 과정 구성, 개인정보와 보안, 접근성, 성과 측정 체계를 함께 확인해야 합니다. 아직 확정된 날짜나 예산은 없습니다.`,
    result: {
      analysisId: "analysis-008",
      summary: "고객은 여러 단과대학과 부속기관이 함께 참여하는 장기 AX 역량 강화 사업을 검토하고 있습니다. 참여 대상이 교수, 직원, 조교, 학생으로 다양하고 각 집단의 디지털 숙련도와 교육 목적이 달라 하나의 과정으로 통합하기 어렵습니다. 기존 LMS와 학사시스템 연동, 개인정보와 보안, 접근성, 성과 측정 체계가 동시에 고려되어야 하며, 사업단 종료 이후 운영 재원과 조직별 책임도 아직 정해지지 않았습니다. 현재는 관심과 검토 범위만 확인된 초기 단계로, 날짜와 예산을 사실처럼 확정하지 않고 우선 의사결정 구조와 필수 조건을 확인해야 합니다.",
      customerNeeds: ["교수 대상 과정", "직원 대상 과정", "조교 대상 과정", "학생 대상 과정", "LMS 연동", "학사시스템 연동", "개인정보 보호", "보안 검토", "접근성 확보", "성과 측정 체계", "장기 운영 재원"],
      objections: [],
      promises: [],
      itemsToVerify: [],
      salesStage: { code: "complex_discovery", label: "복수 기관과 사용자 집단의 요구, 기술 연동, 보안, 예산 지속 가능성을 동시에 검증해야 하는 장기 사전 탐색 및 이해관계자 정렬 단계", reason: "요구 범위는 넓지만 예산, 일정, 책임 부서와 의사결정권자가 정해지지 않았습니다.", confidence: 1.7 },
      recommendedActions: [
        { ...common, id: "s1", label: "교수·직원·조교·학생의 서로 다른 교육 목적과 디지털 숙련도를 반영하여 공통 필수 과정과 역할별 선택 과정을 함께 설계하기 위한 요구사항 워크숍의 참여자·질문·산출물 초안을 작성하고 기관별 검토 책임자까지 확인", instruction: "첫 문단에서는 참여 집단별 현재 업무와 AX 활용 목표를 수집합니다.\n\n둘째 문단에서는 공통 역량과 역할별 역량을 분리하고 합의가 필요한 쟁점을 기록합니다.\n\n마지막으로 확정되지 않은 내용은 가정하지 않고 확인 질문으로 남깁니다.", reason: "대상 집단별 목적이 달라 단일 과정 제안 전에 구조화된 탐색이 필요합니다.", priority: "high", dueDate: null, suggestedTiming: null, evidence: [{ speaker: "customer", quote: "여러 단과대학과 부속기관이 공동으로 참여합니다." }, { speaker: "customer", quote: "교수, 직원, 조교, 학생의 요구가 모두 다릅니다." }, { speaker: "customer", quote: "기존 LMS 연동을 고려해야 합니다." }, { speaker: "customer", quote: "학사시스템 연동도 고려해야 합니다." }, { speaker: "customer", quote: "확정된 날짜나 예산은 없습니다." }], requiredInputs: ["참여 기관 목록", "사용자 집단별 예상 인원", "현재 교육 체계", "LMS 제품 및 버전", "학사시스템 연동 방식", "개인정보 처리 기준", "보안 점검표", "접근성 지침", "성과지표 후보", "사업 기간", "운영 조직도"], expectedOutcome: "검증 가능한 요구사항 목록과 이해관계자 합의 범위", executionMode: "workshop_orchestration", confidence: -0.4 },
        { ...common, id: "s2", label: "사업단 종료 후 운영 예산 출처 확인", instruction: "종료 이후 가능한 재원과 편성 주체를 확인합니다.", reason: "장기 운영 가능성을 판단해야 합니다.", priority: "high", executionMode: "research", confidence: null },
        { ...common, id: "s3", label: "고객이 언급한 경쟁 교육사의 과정 구성 조사", instruction: "공개된 범위에서 과정 길이, 대상, 운영 방식을 비교합니다.", reason: "대안 비교 기준이 필요합니다.", priority: "medium", suggestedTiming: "다음 논의 전", executionMode: "research", confidence: 0.72 },
        { ...common, id: "s4", label: "LMS 및 학사시스템 연동 조건 목록화", instruction: "필요 데이터와 인증·권한 조건을 질문 목록으로 정리합니다.", reason: "기술 연동 범위가 미확정입니다.", priority: "high", executionMode: "custom", confidence: 0.8 },
        { ...common, id: "s5", label: "개인정보·보안 공동 검토 참여자 확인", instruction: "법무, 보안, 개인정보 담당자의 참여 필요성을 확인합니다.", reason: "검토 주체가 명확하지 않습니다.", priority: "high", executionMode: "manual", confidence: 0.84 },
        { ...common, id: "s6", label: "교육 접근성 준수 기준 확인", instruction: "자막, 키보드 조작, 색상 대비 등 적용 기준을 확인합니다.", reason: "접근성 요구가 언급되었습니다.", priority: "medium", executionMode: "research", confidence: 0.69 },
        { ...common, id: "s7", label: "성과 측정 지표 후보 정리", instruction: "참여, 학습, 업무 적용 성과를 구분해 후보를 정리합니다.", reason: "성과 체계가 필요합니다.", priority: "medium", executionMode: "draft", confidence: 0.74 },
        { ...common, id: "s8", label: "복수 기관 의사결정 구조 확인", instruction: "검토, 예산, 승인, 운영 책임자를 기관별로 확인합니다.", reason: "책임 조직이 정해지지 않았습니다.", priority: "high", executionMode: "manual", confidence: 0.78 },
      ],
      warnings: ["일부 신뢰도 값과 실행 방식이 의도적으로 비정상인 스트레스 테스트 데이터입니다.", "기한과 예산은 명시되지 않았습니다."],
      analyzedAt: "2026-07-24T10:35:00+09:00",
    },
  },
];
