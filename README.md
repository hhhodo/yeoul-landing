# 여울 YEOUL — 물의 리추얼 랜딩페이지

**Live: https://hhhodo.github.io/yeoul-landing/**

[pintel.co.kr](http://pintel.co.kr/kr/)의 레이아웃 구조(다크 히어로 → 브랜드 소개 → 4노드 원형
프로세스 다이어그램 → 3카드 하이라이트 → 미션+통계 → 뉴스 → 파트너 로고 그리드 → 자료 → 푸터)와
`styles.css`(디자인 토큰) + `CHEATSHEET_18.md`(작성용 단일 참조 요약)의 규칙만 그대로 가져오고,
**텍스트·브랜드·콘텐츠는 전부 가상의 한국어 워터 리추얼 라이프스타일 브랜드 "여울(YEOUL)"로
새로 썼습니다.** Pintel의 실제 카피나 기업 정보는 남아있지 않습니다.

"여울"은 물이 얕고 빠르게 흐르며 맑은 소리를 내는 곳을 뜻하는 순우리말로, 브랜드의 리추얼(데우기 →
담그기 → 머금기 → 흘려보내기)이 물처럼 흐른다는 컨셉을 이름에 담았습니다. Pintel 히어로의 유체
비주얼과 "인지 → 판단 → 실행 → 흐름"으로 이어지는 4노드 다이어그램을, 물의 리추얼을 상징하는 동심원
+ 4노드 구조로 다시 그렸습니다(시그니처 요소).

## 이미지

실제 사진 대신 디자인 키트의 플레이스홀더(`.img`, `#d9d9d9`)로 자리만 표시합니다. 대신 시그니처
비주얼(리추얼 링 다이어그램, 히어로 배경 동심원)은 순수 CSS/인라인 SVG로 직접 제작했습니다.

## 이번 변주(Variant) 설정

첫 줄 코드 주석: `<!-- variant: typo=medium / image=낮음(placeholder) / color=dominant / radius=round / border=borderless -->`

| 축 | 값 | 근거 |
|---|---|---|
| 타이포그래피 태도 | `medium` | 담담하지만 확신 있는 브랜드 톤. 히어로 `--fs-h0`, 섹션 헤드라인 `--fs-h1` — loud(디스플레이급)도 quiet(과묵)도 아닌 중간 |
| 이미지 비중 | `낮음(placeholder)` | 실제 제품 사진 없이 `.img` 플레이스홀더만 사용. 대신 손으로 그린 리추얼 다이어그램이 시각적 밀도를 채움 |
| 컬러 모드 | `dominant` | 저물녘 물빛에서 가져온 단일 딥 틸(`--color-brand:#16302C`) 하나만 사용 — 톤 변형(600/700/tint)만 두고 제2의 색상은 쓰지 않음. 히어로·프로세스·카드·CTA·푸터를 브랜드 컬러 풀블리드로, 텍스트는 흰색/틸 두 톤만 |
| 라운드 | `round` | 카드 `--radius-md`, 히어로 비주얼 프레임 `--radius-lg`, 버튼·배지·아이콘 `--radius-circle` — 리추얼/셀프케어 브랜드의 다정한 인상 |
| 보더 | `borderless` | 하드 라인 대신 배경색 전환과 여백으로만 섹션을 구분. 저널 리스트는 홀수행 배경색 반전으로 구분선을 대체 |

## 참고한 원본과의 차이

- **페이지 이동 요소 전부 제거**: 캐러셀·페이지네이션·이전/다음 버튼 없음. 남긴 액션은 상단 nav(같은
  페이지 스크롤)와 CTA 버튼(같은 페이지 앵커)뿐 — 존재하지 않는 하위 페이지로 연결되지 않습니다.
- **텍스트·콘텐츠 전체를 가상 브랜드로 재작성**: AI 스타트업(에이전틱 AI, 도시 인프라, IR/PR)이던
  원본 구조를, 워터 리추얼 라이프스타일 브랜드(입욕·홈센트·바디 컬렉션, 리추얼 가이드, 스토어 입점,
  브랜드 저널)로 완전히 바꿨습니다. 원본의 "인지 → 판단 → 실행 → 흐름" 기술 워크플로우 다이어그램은
  "데우기 → 담그기 → 머금기 → 흘려보내기" 리추얼 4단계로 재해석했습니다.

## Structure

```
index.html          단일 페이지 (Hero → About → Ritual Flow → Collections → Mission/Stats
                     → Journal → Stockists → Resources → Footer)
css/styles.css       공용 디자인 키트 원본 (토큰·그리드·리셋 — 직접 수정하지 않음)
css/style.css        YEOUL 브랜드 토큰 + 컴포넌트(버튼·카드·리추얼 다이어그램 등)
js/main.js           스크롤 리빌(IntersectionObserver), 통계 카운트업, 모바일 메뉴 토글,
                     reduced-motion 대응
assets/favicon.svg   파비콘(리추얼 링 모티프)
.github/workflows/deploy.yml   GitHub Pages 자동 배포 워크플로우
```

## 로컬 실행

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.
저장소 Settings → Pages → Source가 "GitHub Actions"로 설정되어 있어야 합니다
(워크플로우가 최초 실행 시 자동으로 활성화를 시도합니다).
