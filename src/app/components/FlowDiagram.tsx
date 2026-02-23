import React from 'react';
import { Link } from 'react-router';
import { Menu, ArrowRight, CheckCircle, XCircle, AlertCircle, Database, Bot, MessageSquare } from 'lucide-react';

export function FlowDiagram() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-[#350d36] text-white px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Menu className="w-5 h-5" />
          <h1 className="font-bold text-lg">시스템 플로우 다이어그램</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm hover:underline">직원 뷰</Link>
          <Link to="/manager" className="text-sm hover:underline">관리자 뷰</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        
        {/* Main Flow */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">주요 시스템 흐름</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Step 1: User */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1. 사용자</h3>
              <p className="text-sm text-gray-600">Slack에서 명령 입력</p>
              <div className="mt-2 text-xs text-gray-500">
                • /attendance<br/>
                • 버튼 클릭<br/>
                • 자연어 입력
              </div>
            </div>

            <ArrowRight className="w-8 h-8 text-gray-400 flex-shrink-0" />

            {/* Step 2: Slack App */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
                  <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
                  <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
                  <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2. Slack 앱</h3>
              <p className="text-sm text-gray-600">요청 수신 및 라우팅</p>
              <div className="mt-2 text-xs text-gray-500">
                • 이벤트 수신<br/>
                • 명령 파싱<br/>
                • Block Kit 렌더링
              </div>
            </div>

            <ArrowRight className="w-8 h-8 text-gray-400 flex-shrink-0" />

            {/* Step 3: AI Engine */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">3. AI 엔진</h3>
              <p className="text-sm text-gray-600">자연어 처리 및 분석</p>
              <div className="mt-2 text-xs text-gray-500">
                • NLP 분석<br/>
                • 의도 파악<br/>
                • 데이터 추출
              </div>
            </div>

            <ArrowRight className="w-8 h-8 text-gray-400 flex-shrink-0" />

            {/* Step 4: Database */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Database className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">4. 데이터베이스</h3>
              <p className="text-sm text-gray-600">데이터 저장 및 조회</p>
              <div className="mt-2 text-xs text-gray-500">
                • 출퇴근 기록<br/>
                • 사용자 정보<br/>
                • 통계 데이터
              </div>
            </div>

            <ArrowRight className="w-8 h-8 text-gray-400 flex-shrink-0" />

            {/* Step 5: Response */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">5. Slack 응답</h3>
              <p className="text-sm text-gray-600">결과 전송</p>
              <div className="mt-2 text-xs text-gray-500">
                • 결과 포맷팅<br/>
                • Block Kit UI<br/>
                • 사용자 알림
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Flows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Clock In Flow */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              출근 기록 흐름
            </h3>
            <div className="space-y-3">
              <FlowStep number="1" title="사용자가 '출근하기' 버튼 클릭" />
              <FlowStep number="2" title="Slack 앱이 현재 시간 확인" />
              <FlowStep number="3" title="DB에서 오늘 출근 기록 조회" />
              <FlowStep number="4" title="중복 체크 (이미 출근했는지)" success />
              <FlowStep number="5" title="출근 시간 기록 저장" />
              <FlowStep number="6" title="지각 여부 판단 (09:00 기준)" />
              <FlowStep number="7" title="확인 메시지 전송" success />
            </div>
          </div>

          {/* AI Natural Language Flow */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              AI 자연어 처리 흐름
            </h3>
            <div className="space-y-3">
              <FlowStep number="1" title="사용자가 자연어 입력" />
              <FlowStep number="2" title="텍스트를 AI 엔진으로 전송" />
              <FlowStep number="3" title="NLP로 의도 분석" />
              <FlowStep number="4" title="시간, 날짜 등 엔티티 추출" success />
              <FlowStep number="5" title="명령 타입 분류 (출근/퇴근/정정)" />
              <FlowStep number="6" title="확신도 계산 및 검증" />
              <FlowStep number="7" title="사용자에게 확인 요청" success />
            </div>
          </div>

        </div>

        {/* Edge Cases */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">엣지 케이스 및 예외 처리</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <EdgeCase
              type="error"
              title="중복 출근 시도"
              description="이미 오늘 출근 기록이 있을 때"
              solution="기존 출근 시간을 보여주고 정정 요청 옵션 제공"
            />

            <EdgeCase
              type="warning"
              title="정규 시간 외 퇴근"
              description="근무 시간이 너무 짧거나 길 때"
              solution="확인 메시지와 함께 초과/부족 근무 시간 알림"
            />

            <EdgeCase
              type="info"
              title="애매한 자연어 입력"
              description="AI가 의도를 명확히 파악하지 못할 때"
              solution="해석된 내용을 보여주고 사용자 확인 요청"
            />

            <EdgeCase
              type="warning"
              title="과거 날짜 기록"
              description="이미 지난 날짜에 대한 기록 요청"
              solution="관리자 승인이 필요한 정정 요청으로 전환"
            />

            <EdgeCase
              type="error"
              title="휴가 기간 출근 시도"
              description="휴가로 등록된 날짜에 출근 기록 시도"
              solution="휴가 상태 안내 및 취소 옵션 제공"
            />

            <EdgeCase
              type="info"
              title="네트워크 오류"
              description="DB 연결 실패 또는 API 타임아웃"
              solution="재시도 옵션과 함께 오류 메시지 표시"
            />

            <EdgeCase
              type="warning"
              title="시간대 불일치"
              description="사용자 위치와 회사 시간대가 다를 때"
              solution="회사 기준 시간으로 자동 변환 및 안내"
            />

            <EdgeCase
              type="info"
              title="동시 다중 요청"
              description="짧은 시간 내 여러 출퇴근 요청"
              solution="트랜잭션 락으로 순차 처리, 중복 방지"
            />

          </div>
        </div>

        {/* Alternative Flows */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">대안 흐름 (Alternative Flows)</h3>
          
          <div className="space-y-4">
            
            <AlternativeFlow
              title="관리자 승인 경로"
              steps={[
                "직원이 시간 정정 요청 제출",
                "관리자에게 Slack DM으로 승인 요청 알림",
                "관리자가 승인/거부 버튼 클릭",
                "결과를 직원에게 알림",
                "승인 시 DB 업데이트"
              ]}
            />

            <AlternativeFlow
              title="음성 명령 처리"
              steps={[
                "사용자가 음성 메시지로 명령 전송",
                "Slack의 음성 텍스트 변환 사용",
                "변환된 텍스트를 AI 엔진으로 전달",
                "일반 자연어 처리 흐름과 동일하게 진행"
              ]}
            />

            <AlternativeFlow
              title="일괄 업로드 (관리자)"
              steps={[
                "관리자가 CSV 파일 업로드",
                "파일 형식 및 데이터 검증",
                "각 행을 개별 레코드로 파싱",
                "DB에 일괄 삽입",
                "성공/실패 요약 리포트 생성"
              ]}
            />

            <AlternativeFlow
              title="자동 퇴근 처리"
              steps={[
                "매일 자정에 배치 작업 실행",
                "퇴근 기록이 없는 직원 탐색",
                "마지막 활동 시간 또는 기본 퇴근 시간으로 자동 기록",
                "익일 아침 알림 발송"
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  );
}

// Helper Components

interface FlowStepProps {
  number: string;
  title: string;
  success?: boolean;
}

function FlowStep({ number, title, success }: FlowStepProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
        success ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {number}
      </div>
      <p className="text-sm text-gray-700">{title}</p>
    </div>
  );
}

interface EdgeCaseProps {
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  solution: string;
}

function EdgeCase({ type, title, description, solution }: EdgeCaseProps) {
  const typeConfig = {
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    warning: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    info: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-2 mb-2">
        <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <div className="ml-7 text-xs text-gray-700 mt-2">
        <span className="font-medium">해결:</span> {solution}
      </div>
    </div>
  );
}

interface AlternativeFlowProps {
  title: string;
  steps: string[];
}

function AlternativeFlow({ title, steps }: AlternativeFlowProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 text-xs font-medium">
              {index + 1}
            </div>
            <p className="text-sm text-gray-700 pt-0.5">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
