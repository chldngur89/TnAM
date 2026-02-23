import React, { useState } from 'react';
import { Link } from 'react-router';
import { Clock, LogOut, Edit, BarChart3, Calendar, Menu, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  SlackMessage,
  SlackBlockCard,
  SlackButton,
  SlackDivider,
  SlackField,
  SlackSection,
  SlackActions
} from './SlackComponents';

type ViewState = 'welcome' | 'clockin-confirm' | 'clockout-confirm' | 'already-clockedin' | 'status' | 'weekly' | 'ai-interaction' | 'correction-request';

export function EmployeeView() {
  const [viewState, setViewState] = useState<ViewState>('welcome');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');

  const currentTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const currentDate = '2026년 2월 13일 (금)';

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Slack Header */}
      <div className="bg-[#350d36] text-white px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Menu className="w-5 h-5" />
          <h1 className="font-bold text-lg">출퇴근 도우미</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/flow" className="text-sm hover:underline">플로우 다이어그램</Link>
          <Link to="/manager" className="text-sm hover:underline">관리자 뷰</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          
          {/* Welcome State */}
          {viewState === 'welcome' && (
            <SlackMessage botName="출퇴근 도우미" timestamp="오후 3:24" avatar="🕐">
              <SlackSection 
                title="안녕하세요! 👋" 
                text="출퇴근 관리를 도와드리겠습니다. 아래 버튼을 선택하거나 자연어로 명령해주세요."
              />
              
              <SlackBlockCard>
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-gray-900">{currentTime}</div>
                  <div className="text-sm text-gray-500">{currentDate}</div>
                </div>
                
                <SlackDivider />
                
                <SlackActions>
                  <SlackButton variant="primary" icon={<Clock className="w-4 h-4" />} onClick={() => setViewState('clockin-confirm')}>
                    출근하기
                  </SlackButton>
                  <SlackButton icon={<LogOut className="w-4 h-4" />} onClick={() => setViewState('clockout-confirm')}>
                    퇴근하기
                  </SlackButton>
                  <SlackButton icon={<Edit className="w-4 h-4" />} onClick={() => setViewState('correction-request')}>
                    시간 정정 요청
                  </SlackButton>
                  <SlackButton icon={<BarChart3 className="w-4 h-4" />} onClick={() => setViewState('status')}>
                    오늘 현황 확인
                  </SlackButton>
                  <SlackButton icon={<Calendar className="w-4 h-4" />} onClick={() => setViewState('weekly')}>
                    주간 리포트
                  </SlackButton>
                </SlackActions>
              </SlackBlockCard>

              <SlackSection text="또는 자연어로 말씀해주세요:">
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="예: 오늘 9시 20분에 출근했어요"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#007a5a]"
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  />
                  <SlackButton 
                    variant="primary" 
                    fullWidth={false}
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() => setViewState('ai-interaction')}
                  >
                    전송
                  </SlackButton>
                </div>
              </SlackSection>
            </SlackMessage>
          )}

          {/* Clock In Confirmation */}
          {viewState === 'clockin-confirm' && (
            <SlackMessage botName="출퇴근 도우미" timestamp="오후 3:25" avatar="✅">
              <SlackSection title="출근 기록 완료!" />
              
              <SlackBlockCard>
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                
                <SlackField label="출근 시간" value="08:59" variant="success" />
                <SlackField label="상태" value="정상 출근" variant="success" />
                <SlackField label="비고" value="정시보다 1분 일찍 출근" variant="default" />
                
                <SlackDivider />
                
                <SlackActions>
                  <SlackButton onClick={() => setViewState('welcome')}>
                    돌아가기
                  </SlackButton>
                </SlackActions>
              </SlackBlockCard>
            </SlackMessage>
          )}

          {/* Clock Out Confirmation */}
          {viewState === 'clockout-confirm' && (
            <SlackMessage botName="출퇴근 도우미" timestamp="오후 6:15" avatar="✅">
              <SlackSection title="퇴근 기록 완료!" />
              
              <SlackBlockCard>
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                
                <SlackField label="퇴근 시간" value="18:15" variant="success" />
                <SlackField label="총 근무 시간" value="9시간 16분" variant="default" />
                <SlackField label="초과 근무" value="1시간 16분" variant="warning" />
                <SlackField label="상태" value="근무 종료" variant="success" />
                
                <SlackDivider />
                
                <div className="text-sm text-gray-600 mb-3">
                  오늘도 수고하셨습니다! 😊
                </div>
                
                <SlackActions>
                  <SlackButton onClick={() => setViewState('welcome')}>
                    돌아가기
                  </SlackButton>
                </SlackActions>
              </SlackBlockCard>
            </SlackMessage>
          )}

          {/* Already Clocked In Error */}
          {viewState === 'already-clockedin' && (
            <SlackMessage botName="출퇴근 도우미" timestamp="오후 3:26" avatar="⚠️">
              <SlackSection title="출근 기록 실패" />
              
              <SlackBlockCard>
                <div className="flex items-center justify-center mb-3">
                  <AlertCircle className="w-12 h-12 text-orange-500" />
                </div>
                
                <div className="text-sm text-gray-700 mb-3">
                  이미 오늘 출근 기록이 있습니다.
                </div>
                
                <SlackField label="기존 출근 시간" value="08:59" variant="default" />
                <SlackField label="상태" value="출근 완료" variant="success" />
                
                <SlackDivider />
                
                <SlackActions>
                  <SlackButton onClick={() => setViewState('correction-request')}>
                    시간 정정 요청
                  </SlackButton>
                  <SlackButton onClick={() => setViewState('welcome')}>
                    돌아가기
                  </SlackButton>
                </SlackActions>
              </SlackBlockCard>
            </SlackMessage>
          )}

          {/* Today's Status */}
          {viewState === 'status' && (
            <SlackMessage botName="출퇴근 도우미" timestamp="오후 3:27" avatar="📊">
              <SlackSection title="오늘의 출퇴근 현황" />
              
              <SlackBlockCard>
                <SlackField label="출근 시간" value="08:59" variant="success" />
                <SlackField label="현재 시간" value={currentTime} variant="default" />
                <SlackField label="누적 근무 시간" value="6시간 28분" variant="default" />
                <SlackField label="지각 여부" value="정상" variant="success" />
                <SlackField label="예상 퇴근" value="18:00" variant="default" />
                
                <SlackDivider />
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <p className="text-sm text-blue-800">
                    💡 오늘은 정시 출근하셨습니다. 18시에 퇴근하면 정규 근무 시간을 채우게 됩니다.
                  </p>
                </div>
                
                <SlackActions>
                  <SlackButton onClick={() => setViewState('welcome')}>
                    돌아가기
                  </SlackButton>
                </SlackActions>
              </SlackBlockCard>
            </SlackMessage>
          )}

          {/* Weekly Summary */}
          {viewState === 'weekly' && (
            <SlackMessage botName="출퇴근 도우미" timestamp="오후 3:28" avatar="📅">
              <SlackSection title="이번 주 출퇴근 리포트" text="2월 10일 ~ 2월 14일" />
              
              <SlackBlockCard>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">월요일 (2/10)</span>
                    <span className="text-sm text-green-600">09:00 - 18:05 ✓</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">화요일 (2/11)</span>
                    <span className="text-sm text-orange-600">09:15 - 18:30 ⚠️ 지각</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">수요일 (2/12)</span>
                    <span className="text-sm text-green-600">08:55 - 19:20 ✓</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">목요일 (2/13)</span>
                    <span className="text-sm text-green-600">08:59 - 진행중 ✓</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">금요일 (2/14)</span>
                    <span className="text-sm text-gray-400">예정</span>
                  </div>
                </div>
                
                <SlackDivider />
                
                <SlackField label="총 근무 시간" value="36시간 45분" variant="default" />
                <SlackField label="초과 근무" value="4시간 45분" variant="warning" />
                <SlackField label="지각 횟수" value="1회" variant="warning" />
                <SlackField label="결근 횟수" value="0회" variant="success" />
                
                <SlackActions>
                  <SlackButton onClick={() => setViewState('welcome')}>
                    돌아가기
                  </SlackButton>
                </SlackActions>
              </SlackBlockCard>
            </SlackMessage>
          )}

          {/* AI Interaction */}
          {viewState === 'ai-interaction' && (
            <>
              <SlackMessage botName="김민수" timestamp="오후 3:29" avatar="👤">
                <div className="text-[15px] text-gray-900">
                  {naturalLanguageInput || "오늘 9시 20분에 출근했어요"}
                </div>
              </SlackMessage>
              
              <SlackMessage botName="출퇴근 도우미" timestamp="오후 3:29" avatar="🤖">
                <SlackSection title="AI 분석 중..." />
                
                <SlackBlockCard>
                  <div className="flex items-center gap-2 mb-3 p-2 bg-purple-50 rounded">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-purple-900 font-medium">자연어 명령을 분석했습니다</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">🤔 AI 해석:</div>
                    <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                      "사용자가 오늘 09:20에 출근했다고 보고하고 있습니다. 정규 출근 시간 09:00보다 20분 늦었으므로 지각으로 처리됩니다."
                    </div>
                  </div>
                  
                  <SlackDivider />
                  
                  <SlackField label="출근 시간" value="09:20" variant="warning" />
                  <SlackField label="지각 시간" value="20분" variant="danger" />
                  <SlackField label="상태" value="지각" variant="danger" />
                  <SlackField label="누적 지각 횟수" value="이번주 2회" variant="warning" />
                  
                  <SlackDivider />
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ 이번 주 2회 지각이 기록되었습니다. 정시 출근을 권장합니다.
                    </p>
                  </div>
                  
                  <SlackActions>
                    <SlackButton variant="primary" onClick={() => setViewState('clockin-confirm')}>
                      확인 및 기록
                    </SlackButton>
                    <SlackButton onClick={() => setViewState('correction-request')}>
                      시간 수정
                    </SlackButton>
                    <SlackButton variant="danger" onClick={() => setViewState('welcome')}>
                      취소
                    </SlackButton>
                  </SlackActions>
                </SlackBlockCard>
              </SlackMessage>
            </>
          )}

          {/* Correction Request */}
          {viewState === 'correction-request' && (
            <SlackMessage botName="출퇴근 도우미" timestamp="오후 3:30" avatar="✏️">
              <SlackSection title="시간 정정 요청" text="정정이 필요한 정보를 입력해주세요." />
              
              <SlackBlockCard>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">정정 날짜</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#007a5a]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">정정할 항목</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#007a5a]">
                      <option>출근 시간</option>
                      <option>퇴근 시간</option>
                      <option>둘 다</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">정정 시간</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#007a5a]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">사유</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#007a5a]"
                      rows={3}
                      placeholder="정정이 필요한 사유를 입력해주세요"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <p className="text-sm text-blue-800">
                    💡 정정 요청은 관리자의 승인이 필요합니다. 영업일 기준 1~2일 내에 처리됩니다.
                  </p>
                </div>
                
                <SlackActions>
                  <SlackButton variant="primary">
                    정정 요청 제출
                  </SlackButton>
                  <SlackButton onClick={() => setViewState('welcome')}>
                    취소
                  </SlackButton>
                </SlackActions>
              </SlackBlockCard>
            </SlackMessage>
          )}

        </div>

        {/* Quick Test Buttons */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">테스트 화면 전환</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setViewState('welcome')} className="text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50">환영</button>
            <button onClick={() => setViewState('clockin-confirm')} className="text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50">출근 확인</button>
            <button onClick={() => setViewState('clockout-confirm')} className="text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50">퇴근 확인</button>
            <button onClick={() => setViewState('already-clockedin')} className="text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50">중복 출근 오류</button>
            <button onClick={() => setViewState('status')} className="text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50">오늘 현황</button>
            <button onClick={() => setViewState('weekly')} className="text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50">주간 리포트</button>
            <button onClick={() => setViewState('ai-interaction')} className="text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50">AI 분석</button>
            <button onClick={() => setViewState('correction-request')} className="text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50">정정 요청</button>
          </div>
        </div>
      </div>
    </div>
  );
}
