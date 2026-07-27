# 회계사 시험 준비 대시보드

CPA 수험에 자주 쓰는 사이트를 한 곳에 모아둔 개인용 링크 대시보드입니다.

**바로가기:** https://goldie-ui.github.io/cpa-dashboard/

## 기능

- 카드 클릭 시 새 탭으로 이동
- ⭐ 즐겨찾기 고정 (브라우저에 저장)
- 검색으로 즉시 필터링
- 시험일 D-day 카운터
- 라이트/다크 모드 자동 전환

## 사이트 추가·수정 방법

`index.html` 안의 `DATA` 배열만 고치면 됩니다.

```js
{ title:"분류 이름", items:[
  {name:"사이트 이름", url:"https://example.com", desc:"설명"},
]},
```

수정 후 커밋하면 1분 내로 반영됩니다.

```bash
git add index.html && git commit -m "링크 수정" && git push
```
