import type { Scenario } from "../types/analysis";

const common = { dueDate: null, status: "suggested" as const };

export const scenarios: Scenario[] = [
  {
    id: "proposal",
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
];
