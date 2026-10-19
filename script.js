/**
 * 자음과 모음이 만나요! - 지적장애학생 맞춤형 한글 조합 웹게임
 * - 목표 글자: "가, 나, 다, 라, 마, 바, 사, 자, 차, 카, 타, 파, 하"
 * - 1개씩 랜덤으로 천천히 내려오는 풍선
 * - 하단 자음자 + 모음자 조합으로 같은 글자를 만들어 풍선 터트리기
 * - 150점 획득 시 다음 단계 진급 (총 5단계, 최고 난이도도 보통 속도로 제한)
 */

// 13개 목표 글자 데이터 ("가, 나, 다, 라, 마, 바, 사, 자, 차, 카, 타, 파, 하")
const TARGET_LETTERS = [
  { char: '가', c: 'ㄱ', v: 'ㅏ', cName: '기역' },
  { char: '나', c: 'ㄴ', v: 'ㅏ', cName: '니은' },
  { char: '다', c: 'ㄷ', v: 'ㅏ', cName: '디귿' },
  { char: '라', c: 'ㄹ', v: 'ㅏ', cName: '리을' },
  { char: '마', c: 'ㅁ', v: 'ㅏ', cName: '미음' },
  { char: '바', c: 'ㅂ', v: 'ㅏ', cName: '비읍' },
  { char: '사', c: 'ㅅ', v: 'ㅏ', cName: '시옷' },
  { char: '자', c: 'ㅈ', v: 'ㅏ', cName: '지읒' },
  { char: '차', c: 'ㅊ', v: 'ㅏ', cName: '치읓' },
  { char: '카', c: 'ㅋ', v: 'ㅏ', cName: '키읔' },
  { char: '타', c: 'ㅌ', v: 'ㅏ', cName: '티읕' },
  { char: '파', c: 'ㅍ', v: 'ㅏ', cName: '피읖' },
  { char: '하', c: 'ㅎ', v: 'ㅏ', cName: '히읗' }
];

// 하단 자음 키패드 목록 (7x2 그리드 배치를 위해 기본 자음 14개 배치, 목표는 13개 자음)
const CONSONANT_KEYS = [
  { c: 'ㄱ', name: '기역' },
  { c: 'ㄴ', name: '니은' },
  { c: 'ㄷ', name: '디귿' },
  { c: 'ㄹ', name: '리을' },
  { c: 'ㅁ', name: '미음' },
  { c: 'ㅂ', name: '비읍' },
  { c: 'ㅅ', name: '시옷' },
  { c: 'ㅈ', name: '지읒' },
  { c: 'ㅊ', name: '치읓' },
  { c: 'ㅋ', name: '키읔' },
  { c: 'ㅌ', name: '티읕' },
  { c: 'ㅍ', name: '피읖' },
  { c: 'ㅎ', name: '히읗' },
  { c: 'ㅇ', name: '이응' }
];

// 하단 모음 키패드 목록 (ㅏ를 첫 번째로 배치하여 직관적 선택 유도)
const VOWEL_KEYS = [
  { v: 'ㅏ', name: '아' },
  { v: 'ㅓ', name: '어' },
  { v: 'ㅗ', name: '오' },
  { v: 'ㅜ', name: '우' },
  { v: 'ㅡ', name: '으' },
  { v: 'ㅣ', name: '이' }
];

// 유니코드 한글 조합용 테이블
const CHOSUNG_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSUNG_LIST = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];

function combineHangul(chosung, jungsung) {
  const choIdx = CHOSUNG_LIST.indexOf(chosung);
  const jungIdx = JUNGSUNG_LIST.indexOf(jungsung);
  if (choIdx === -1 || jungIdx === -1) return '?';
  const code = 0xAC00 + (choIdx * 21 * 28) + (jungIdx * 28);
  return String.fromCharCode(code);
}

// 5단계 설정 (지적장애학생 배려: 5단계 최고 난이도여도 일반학생 기준 보통 속도 유지)
// fallDurationSeconds: 화면 상단에서 하단까지 내려오는 데 걸리는 시간(초)
const STAGE_CONFIG = {
  1: {
    stage: 1,
    fallDuration: 19.0, // 매우 천천히 (19초)
    speedLabel: '🐢 1단계: 아주 천천히',
    mascotIcon: '🐻',
    encourageMsg: '천천히 내려오는 풍선을 보고 같은 글자를 만들어 봐요!'
  },
  2: {
    stage: 2,
    fallDuration: 16.5, // 천천히 (16.5초)
    speedLabel: '🐥 2단계: 천천히',
    mascotIcon: '🐰',
    encourageMsg: '우와 잘해요! 이번에도 자음과 모음을 합쳐 볼까요?'
  },
  3: {
    stage: 3,
    fallDuration: 14.5, // 여유 있는 보통 속도 (14.5초)
    speedLabel: '🦊 3단계: 산책 걸음',
    mascotIcon: '🦊',
    encourageMsg: '벌써 3단계예요! 풍선 글자를 소리 내어 읽어봐요!'
  },
  4: {
    stage: 4,
    fallDuration: 12.8, // 조금씩 씩씩한 보통 속도 (12.8초)
    speedLabel: '🐶 4단계: 씩씩한 걸음',
    mascotIcon: '🐶',
    encourageMsg: '4단계 도전! 눈을 크게 뜨고 자음자를 찾아봐요!'
  },
  5: {
    stage: 5,
    fallDuration: 11.2, // 최고 단계지만 일반학생 기준 편안한 보통 속도 (11.2초)
    speedLabel: '🌟 5단계: 보통 속도',
    mascotIcon: '🦁',
    encourageMsg: '마지막 5단계예요! 150점을 모으면 한글 박사님!'
  }
};

const POINTS_PER_BALLOON = 10; // 풍선 1개당 10점 (15개 터트리면 150점 달성!)
const STAGE_GOAL_SCORE = 150;  // 단계 통과 점수: 150점

// 풍선 색상 팔레트 (애니메이션 파스텔 & 비비드)
const BALLOON_COLORS = [
  { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%)', knot: '#ee5253', particle: '#ff6b6b' },
  { bg: 'linear-gradient(135deg, #ff9f43 0%, #f368e0 100%)', knot: '#f368e0', particle: '#ff9f43' },
  { bg: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)', knot: '#0abde3', particle: '#48dbfb' },
  { bg: 'linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%)', knot: '#10ac84', particle: '#1dd1a1' },
  { bg: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)', knot: '#6c5ce7', particle: '#a29bfe' },
  { bg: 'linear-gradient(135deg, #feca57 0%, #ff9f43 100%)', knot: '#ff9f43', particle: '#feca57' },
  { bg: 'linear-gradient(135deg, #ff78ae 0%, #ff4d8d 100%)', knot: '#ff4d8d', particle: '#ff78ae' }
];

// ================= 사운드 & 음성 합성 매니저 (Web Audio API + TTS) =================
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 귀여운 마림바/실로폰 버튼 터치음
  playTap(freq = 523.25) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.09);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 자음 + 모음 합체 시 반짝이는 화음
  playCombineSuccess() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99]; // 도-미-솔
    notes.forEach((f, idx) => {
      const now = this.ctx.currentTime + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    });
  }

  // 풍선 팡! 터지는 경쾌한 효과음 + 별 효과음
  playBalloonPop() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1) 화이트 노이즈 팝 사운드
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);

    // 2) 경쾌한 상승 차임벨 (솔 - 도 - 미 - 높은솔)
    const chime = [783.99, 1046.5, 1318.5, 1567.98];
    chime.forEach((freq, i) => {
      const t = now + 0.05 + i * 0.06;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  // 글자가 다를 때 자극적이지 않은 부드러운 '통통' 안내음
  playGentleMismatch() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  // 단계 클리어 축하 팡파레 멜로디
  playStageClearFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, t: 0.0, d: 0.14 },  // 도
      { f: 659.25, t: 0.14, d: 0.14 }, // 미
      { f: 783.99, t: 0.28, d: 0.14 }, // 솔
      { f: 1046.5, t: 0.42, d: 0.32 }, // 높은 도
      { f: 783.99, t: 0.76, d: 0.14 }, // 솔
      { f: 1046.5, t: 0.92, d: 0.55 }  // 높은 도!
    ];

    const base = this.ctx.currentTime;
    melody.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, base + note.t);

      gain.gain.setValueAtTime(0.28, base + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, base + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(base + note.t);
      osc.stop(base + note.t + note.d + 0.02);
    });
  }

  // 한국어 TTS 음성 읽기
  speak(text, rate = 0.92) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      utter.rate = rate;
      utter.pitch = 1.1;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      // TTS 미지원 환경 무시
    }
  }
}

// ================= 폭죽 & 별 파티클 이펙트 매니저 =================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  // 풍선 터질 때 별과 색종이 조각 폭발
  burst(x, y, count = 34) {
    const colors = ['#ff5d8f', '#ffd166', '#06d6a0', '#118ab2', '#a855f7', '#f97316', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 3 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        decay: 0.014 + Math.random() * 0.012,
        shape: i % 3 === 0 ? 'star' : 'circle'
      });
    }
  }

  // 단계 클리어 시 화면 전체 축하 폭죽
  celebrationFireworks() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const spots = [
      { x: w * 0.22, y: h * 0.35 },
      { x: w * 0.5, y: h * 0.25 },
      { x: w * 0.78, y: h * 0.35 },
      { x: w * 0.35, y: h * 0.5 },
      { x: w * 0.65, y: h * 0.5 }
    ];
    spots.forEach((pos, idx) => {
      setTimeout(() => {
        this.burst(pos.x, pos.y, 42);
      }, idx * 220);
    });
  }

  drawStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const px = x + Math.cos(outerAngle) * r;
      const py = y + Math.sin(outerAngle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // 중력
      p.rotation += p.vRot;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        this.drawStar(this.ctx, p.x, p.y, p.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ================= 메인 게임 컨트롤러 =================
class HangulBalloonGame {
  constructor() {
    this.sound = new SoundManager();
    this.fx = new ParticleSystem(document.getElementById('fx-canvas'));

    // 상태 변수
    this.currentStage = 1;
    this.stageScore = 0;
    this.totalScore = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.hintEnabled = true;
    this.autoFire = true;

    // 현재 선택된 자음/모음
    this.selectedConsonant = null;
    this.selectedVowel = null;

    // 현재 내려오고 있는 풍선 정보 (1개씩 내려옴)
    this.activeBalloon = null;
    this.letterDeck = [];
    this.lastFrameTime = 0;
    this.isFiring = false;

    this.cacheDOM();
    this.buildKeyboards();
    this.bindEvents();
  }

  cacheDOM() {
    this.stageText = document.getElementById('stage-text');
    this.stageDots = document.getElementById('stage-dots');
    this.speedIndicator = document.getElementById('speed-indicator');
    this.stageScoreEl = document.getElementById('stage-score');
    this.totalScoreEl = document.getElementById('total-score');
    this.progressFill = document.getElementById('score-progress-fill');

    this.hintBtn = document.getElementById('hint-btn');
    this.soundBtn = document.getElementById('sound-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');
    this.homeBtn = document.getElementById('home-btn');

    this.helperCard = document.getElementById('target-helper-card');
    this.helperTargetChar = document.getElementById('helper-target-char');
    this.helperC = document.getElementById('helper-c');
    this.helperV = document.getElementById('helper-v');

    this.playArea = document.getElementById('play-area');
    this.balloonStage = document.getElementById('balloon-stage');
    this.projectileLayer = document.getElementById('projectile-layer');

    this.combineStation = document.getElementById('combine-station');
    this.slotConsonant = document.getElementById('slot-consonant');
    this.slotVowel = document.getElementById('slot-vowel');
    this.selectedConsonantEl = document.getElementById('selected-consonant');
    this.selectedVowelEl = document.getElementById('selected-vowel');
    this.combinedCharEl = document.getElementById('combined-char');
    this.launchBtn = document.getElementById('launch-btn');
    this.clearBtn = document.getElementById('clear-btn');

    this.consonantGrid = document.getElementById('consonant-grid');
    this.vowelGrid = document.getElementById('vowel-grid');

    this.startModal = document.getElementById('start-modal');
    this.stageClearModal = document.getElementById('stage-clear-modal');
    this.allClearModal = document.getElementById('all-clear-modal');

    this.autoFireCheck = document.getElementById('auto-fire-check');
    this.fullscreenStartCheck = document.getElementById('fullscreen-start-check');
    this.startGameBtn = document.getElementById('start-game-btn');
    this.nextStageBtn = document.getElementById('next-stage-btn');
    this.restartGameBtn = document.getElementById('restart-game-btn');

    this.clearStageBadge = document.getElementById('clear-stage-badge');
    this.clearTitle = document.getElementById('clear-title');
    this.clearDesc = document.getElementById('clear-desc');
    this.finalTotalScore = document.getElementById('final-total-score');
  }

  buildKeyboards() {
    // 자음 버튼 생성
    this.consonantGrid.innerHTML = '';
    this.consonantButtons = {};
    CONSONANT_KEYS.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'key-btn consonant-btn';
      btn.textContent = item.c;
      btn.dataset.consonant = item.c;
      btn.setAttribute('aria-label', `자음 ${item.name}`);
      btn.addEventListener('click', () => this.onSelectConsonant(item));
      this.consonantGrid.appendChild(btn);
      this.consonantButtons[item.c] = btn;
    });

    // 모음 버튼 생성
    this.vowelGrid.innerHTML = '';
    this.vowelButtons = {};
    VOWEL_KEYS.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'key-btn vowel-btn';
      btn.textContent = item.v;
      btn.dataset.vowel = item.v;
      btn.setAttribute('aria-label', `모음 ${item.name}`);
      btn.addEventListener('click', () => this.onSelectVowel(item));
      this.vowelGrid.appendChild(btn);
      this.vowelButtons[item.v] = btn;
    });
  }

  // 전체화면 여부 확인
  isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }

  // 전체화면 진입 (태블릿 가로모드 잠금 지원 시 함께 요청)
  enterFullscreen() {
    const docEl = document.documentElement;
    const req =
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.msRequestFullscreen;
    if (req && !this.isFullscreen()) {
      Promise.resolve(req.call(docEl))
        .then(() => {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        })
        .catch(() => {});
    }
  }

  // 전체화면 해제
  exitFullscreen() {
    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen;
    if (exit && this.isFullscreen()) {
      Promise.resolve(exit.call(document)).catch(() => {});
    }
  }

  toggleFullscreen() {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  updateFullscreenBtnUI() {
    if (!this.fullscreenBtn) return;
    const active = this.isFullscreen();
    this.fullscreenBtn.classList.toggle('active', active);
    this.fullscreenBtn.innerHTML = active
      ? '🗗 <span>전체화면 종료</span>'
      : '⛶ <span>전체화면</span>';
    setTimeout(() => this.fx.resize(), 100);
  }

  bindEvents() {
    this.startGameBtn.addEventListener('click', () => {
      this.autoFire = this.autoFireCheck.checked;
      // 기본값으로 체크된 전체화면 모드로 자동 진입
      if (!this.fullscreenStartCheck || this.fullscreenStartCheck.checked) {
        this.enterFullscreen();
      }
      this.sound.initContext();
      this.sound.playTap(659.25);
      this.startModal.classList.remove('active');
      this.startNewGame();
    });

    this.nextStageBtn.addEventListener('click', () => {
      this.sound.playTap(659.25);
      this.stageClearModal.classList.remove('active');
      this.startStage(this.currentStage + 1);
    });

    this.restartGameBtn.addEventListener('click', () => {
      this.sound.playTap(659.25);
      this.allClearModal.classList.remove('active');
      this.startNewGame();
    });

    this.launchBtn.addEventListener('click', () => {
      this.tryLaunchCombinedChar();
    });

    this.clearBtn.addEventListener('click', () => {
      this.sound.playTap(392.0);
      this.resetSelection();
    });

    this.hintBtn.addEventListener('click', () => {
      this.hintEnabled = !this.hintEnabled;
      this.hintBtn.classList.toggle('active', this.hintEnabled);
      this.hintBtn.innerHTML = this.hintEnabled ? '💡 <span>힌트 켜짐</span>' : '💡 <span>힌트 꺼짐</span>';
      this.helperCard.classList.toggle('hidden-hint', !this.hintEnabled);
      this.updateHintHighlights();
    });

    this.soundBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.soundBtn.classList.toggle('active', this.sound.enabled);
      this.soundBtn.innerHTML = this.sound.enabled ? '🔊 <span>소리 켜짐</span>' : '🔇 <span>소리 꺼짐</span>';
    });

    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => {
        this.sound.playTap(587.33);
        this.toggleFullscreen();
      });
    }

    document.addEventListener('fullscreenchange', () => this.updateFullscreenBtnUI());
    document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenBtnUI());

    this.homeBtn.addEventListener('click', () => {
      this.isPlaying = false;
      this.clearActiveBalloon();
      this.stageClearModal.classList.remove('active');
      this.allClearModal.classList.remove('active');
      this.startModal.classList.add('active');
    });
  }

  // 중복 없이 골고루 나오도록 셔플 덱 구성
  getNextTargetLetter() {
    if (this.letterDeck.length === 0) {
      this.letterDeck = [...TARGET_LETTERS];
      for (let i = this.letterDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.letterDeck[i], this.letterDeck[j]] = [this.letterDeck[j], this.letterDeck[i]];
      }
    }
    return this.letterDeck.pop();
  }

  startNewGame() {
    this.totalScore = 0;
    this.letterDeck = [];
    this.startStage(1);
  }

  startStage(stageNum) {
    this.currentStage = stageNum;
    this.stageScore = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this.isFiring = false;

    this.resetSelection();
    this.clearActiveBalloon();
    this.updateHUD();

    // 첫 풍선 생성
    setTimeout(() => {
      if (this.isPlaying) {
        this.spawnSingleBalloon();
        this.lastFrameTime = performance.now();
        requestAnimationFrame((ts) => this.gameLoop(ts));
      }
    }, 450);
  }

  updateHUD() {
    const cfg = STAGE_CONFIG[this.currentStage];
    this.stageText.textContent = `${this.currentStage}단계`;
    this.speedIndicator.textContent = cfg.speedLabel;

    // 단계 도트 표시
    const dots = this.stageDots.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx < this.currentStage);
    });

    this.stageScoreEl.textContent = this.stageScore;
    this.totalScoreEl.textContent = this.totalScore;

    const pct = Math.min(100, (this.stageScore / STAGE_GOAL_SCORE) * 100);
    this.progressFill.style.width = `${pct}%`;
  }

  // 풍선 1개 생성 (화면 상단에서 바람을 타고 천천히 내려옴)
  spawnSingleBalloon() {
    if (!this.isPlaying || this.activeBalloon) return;

    const target = this.getNextTargetLetter();
    const colorTheme = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];

    // 중앙 영역(30% ~ 58%) 사이에서 기준 가로 위치 설정 (우측 힌트 카드와 겹치지 않도록)
    const baseX = 30 + Math.random() * 28;

    const wrapper = document.createElement('div');
    wrapper.className = 'balloon-wrapper';
    wrapper.style.left = `${baseX}%`;
    wrapper.style.top = `-28%`;

    wrapper.innerHTML = `
      <div class="balloon-sway">
        <div class="balloon-body" style="background: ${colorTheme.bg};">
          <span class="sparkle sp-left" aria-hidden="true">✨</span>
          <span class="sparkle sp-right" aria-hidden="true">✨</span>
          <div class="balloon-char-focus">
            <span class="balloon-char">${target.char}</span>
          </div>
        </div>
        <div class="balloon-knot" style="background: ${colorTheme.knot};"></div>
        <div class="balloon-string"></div>
      </div>
    `;

    // 풍선을 터치하면 글자 소리를 다시 들려줌
    wrapper.addEventListener('click', () => {
      this.sound.playTap(587.33);
      this.sound.speak(target.char, 0.9);
    });

    this.balloonStage.appendChild(wrapper);

    // 글자 인지를 방해하지 않는 아주 완만하고 느린 실바람 파라미터
    this.activeBalloon = {
      el: wrapper,
      target,
      colorTheme,
      baseX,
      xPercent: baseX,
      elapsed: 0,
      amp: 3.2 + Math.random() * 1.8,          // 좌우 이동 폭을 3.2% ~ 5%로 좁혀 시선 추적 부담 최소화
      freq: 0.38 + Math.random() * 0.12,       // 아주 천천히 부드럽게 유영하는 주기
      phase: Math.random() * Math.PI * 2,
      progress: 0, // 0.0 (상단 진입) ~ 1.0 (땅 아래로 완전히 사라짐)
      popped: false
    };

    // 우측 도우미 카드 업데이트
    this.helperTargetChar.textContent = target.char;
    this.helperC.textContent = target.c;
    this.helperV.textContent = target.v;

    // 힌트 하이라이트 갱신
    this.updateHintHighlights();

    // 새 풍선 글자 음성 안내
    this.sound.speak(`${target.char}`, 0.95);
  }

  clearActiveBalloon() {
    if (this.activeBalloon && this.activeBalloon.el) {
      this.activeBalloon.el.remove();
    }
    this.activeBalloon = null;
  }

  // 매 프레임마다 풍선을 잔잔한 실바람에 태워 안정적으로 아래로 이동
  gameLoop(timestamp) {
    if (!this.isPlaying) return;

    const dt = Math.min(0.1, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    if (!this.isPaused && this.activeBalloon && !this.activeBalloon.popped) {
      const b = this.activeBalloon;
      const cfg = STAGE_CONFIG[this.currentStage];

      b.elapsed += dt;
      b.progress += dt / cfg.fallDuration;

      // 상단 -28% 에서 땅 아래 105% 까지 일정하고 안정적인 속도로 하강
      const topPercent = -28 + b.progress * 133;
      b.el.style.top = `${topPercent}%`;

      // 글자가 기울어지지 않고 수평을 유지한 채 아주 완만한 곡선으로만 살짝 유영
      const gentleDrift = Math.sin(b.elapsed * b.freq + b.phase) * b.amp;
      b.xPercent = Math.max(18, Math.min(68, b.baseX + gentleDrift));
      b.el.style.left = `${b.xPercent}%`;

      // 풍선이 땅 아래까지 완전히 내려가서 시야에서 사라지면 제거 후 다음 풍선 출현
      if (b.progress >= 1.0) {
        this.clearActiveBalloon();
        this.resetSelection();
        this.spawnSingleBalloon();
      }
    }

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  // 자음 버튼 선택 시
  onSelectConsonant(item) {
    if (!this.isPlaying || this.isFiring) return;

    this.selectedConsonant = item.c;
    this.sound.playTap(523.25);
    this.sound.speak(item.name, 1.05);

    // UI 선택 표시
    Object.values(this.consonantButtons).forEach((b) => b.classList.remove('selected'));
    if (this.consonantButtons[item.c]) {
      this.consonantButtons[item.c].classList.add('selected');
    }

    this.updateCombinePreview();
  }

  // 모음 버튼 선택 시
  onSelectVowel(item) {
    if (!this.isPlaying || this.isFiring) return;

    this.selectedVowel = item.v;
    this.sound.playTap(659.25);
    this.sound.speak(item.name, 1.05);

    // UI 선택 표시
    Object.values(this.vowelButtons).forEach((b) => b.classList.remove('selected'));
    if (this.vowelButtons[item.v]) {
      this.vowelButtons[item.v].classList.add('selected');
    }

    this.updateCombinePreview();
  }

  // 자음 + 모음 조합 창 업데이트
  updateCombinePreview() {
    this.selectedConsonantEl.textContent = this.selectedConsonant || '?';
    this.selectedVowelEl.textContent = this.selectedVowel || '?';

    this.slotConsonant.classList.toggle('filled', !!this.selectedConsonant);
    this.slotVowel.classList.toggle('filled', !!this.selectedVowel);

    this.updateHintHighlights();

    if (this.selectedConsonant && this.selectedVowel) {
      const combined = combineHangul(this.selectedConsonant, this.selectedVowel);
      this.combinedCharEl.textContent = combined;
      this.launchBtn.disabled = false;
      this.sound.playCombineSuccess();

      // 자동 발사 옵션이 켜져 있으면 자음+모음 완성 즉시 발사!
      if (this.autoFire) {
        this.isFiring = true;
        setTimeout(() => {
          this.tryLaunchCombinedChar();
        }, 320);
      }
    } else {
      this.combinedCharEl.textContent = '?';
      this.launchBtn.disabled = true;
    }
  }

  // 힌트 모드가 켜져 있을 때 목표 자음/모음 버튼에 친절한 반짝임 표시
  updateHintHighlights() {
    Object.values(this.consonantButtons).forEach((b) => b.classList.remove('hint-glow'));
    Object.values(this.vowelButtons).forEach((b) => b.classList.remove('hint-glow'));

    if (!this.hintEnabled || !this.activeBalloon) return;

    const target = this.activeBalloon.target;
    if (this.selectedConsonant !== target.c && this.consonantButtons[target.c]) {
      this.consonantButtons[target.c].classList.add('hint-glow');
    }
    if (this.selectedVowel !== target.v && this.vowelButtons[target.v]) {
      this.vowelButtons[target.v].classList.add('hint-glow');
    }
  }

  resetSelection() {
    this.selectedConsonant = null;
    this.selectedVowel = null;
    this.isFiring = false;
    Object.values(this.consonantButtons).forEach((b) => b.classList.remove('selected'));
    Object.values(this.vowelButtons).forEach((b) => b.classList.remove('selected'));
    this.updateCombinePreview();
  }

  // 완성된 글자로 풍선 터트리기 시도
  tryLaunchCombinedChar() {
    if (!this.selectedConsonant || !this.selectedVowel || !this.activeBalloon) {
      this.isFiring = false;
      return;
    }

    const combined = combineHangul(this.selectedConsonant, this.selectedVowel);
    const target = this.activeBalloon.target;

    if (combined === target.char) {
      // 정답! 마법 별 투사체를 풍선으로 발사하여 터트리기
      this.shootStarAtBalloon(combined);
    } else {
      // 오답일 때: 부드러운 격려 메시지와 함께 안내
      this.sound.playGentleMismatch();
      this.sound.speak(`${combined}! 풍선 글자는 ${target.char}예요. 다시 골라볼까요?`, 0.95);
      this.combineStation.classList.remove('shake');
      void this.combineStation.offsetWidth;
      this.combineStation.classList.add('shake');

      setTimeout(() => {
        this.resetSelection();
      }, 500);
    }
  }

  shootStarAtBalloon(charText) {
    if (!this.activeBalloon) return;
    const balloonObj = this.activeBalloon;
    balloonObj.popped = true;

    // 발사 시작 위치 (하단 중앙) 및 목표 풍선 위치 계산
    const playRect = this.playArea.getBoundingClientRect();
    const balloonRect = balloonObj.el.getBoundingClientRect();

    const startX = playRect.width * 0.5;
    const startY = playRect.height * 0.95;

    const endX = balloonRect.left - playRect.left + balloonRect.width / 2;
    const endY = balloonRect.top - playRect.top + balloonRect.height * 0.42;

    const star = document.createElement('div');
    star.className = 'magic-star-shot';
    star.textContent = charText;
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    this.projectileLayer.appendChild(star);

    // 다음 프레임에 풍선 위치로 날아가기
    requestAnimationFrame(() => {
      star.style.left = `${endX}px`;
      star.style.top = `${endY}px`;
      star.style.transform = 'translate(-50%, -50%) scale(1.25)';
    });

    // 도착 후 풍선 팡!
    setTimeout(() => {
      star.remove();
      this.popBalloon(balloonObj, endX, endY);
    }, 330);
  }

  popBalloon(balloonObj, x, y) {
    // 효과음 & 음성 칭찬
    this.sound.playBalloonPop();
    this.sound.speak(`${balloonObj.target.char}! 참 잘했어요!`, 1.0);

    // 캔버스 기준 좌표로 변환하여 정확한 풍선 위치에서 파티클 폭발
    const canvasRect = this.fx.canvas.getBoundingClientRect();
    const balloonRect = balloonObj.el.getBoundingClientRect();
    const burstX = balloonRect.left - canvasRect.left + balloonRect.width / 2;
    const burstY = balloonRect.top - canvasRect.top + balloonRect.height * 0.42;
    this.fx.burst(burstX, burstY, 38);

    // 풍선 팝 애니메이션
    balloonObj.el.classList.add('popping');

    // +30점 플로팅 텍스트 표시
    const scorePop = document.createElement('div');
    scorePop.className = 'floating-score';
    scorePop.textContent = `+${POINTS_PER_BALLOON}점! 🎉`;
    scorePop.style.left = `${x}px`;
    scorePop.style.top = `${y}px`;
    this.projectileLayer.appendChild(scorePop);
    setTimeout(() => scorePop.remove(), 950);

    // 점수 증가
    this.stageScore += POINTS_PER_BALLOON;
    this.totalScore += POINTS_PER_BALLOON;
    this.updateHUD();

    setTimeout(() => {
      this.clearActiveBalloon();
      this.resetSelection();

      // 150점 달성 여부 확인
      if (this.stageScore >= STAGE_GOAL_SCORE) {
        this.onStageClear();
      } else {
        this.spawnSingleBalloon();
      }
    }, 550);
  }

  onStageClear() {
    this.isPaused = true;
    this.sound.playStageClearFanfare();
    this.fx.celebrationFireworks();

    if (this.currentStage < 5) {
      // 1~4단계 클리어 모달 표시
      this.clearStageBadge.textContent = `${this.currentStage}단계 성공!`;
      this.clearTitle.textContent = `우와! 150점을 모두 모았어요! 🎉`;
      this.clearDesc.innerHTML = `
        <b>${this.currentStage}단계</b>의 글자 풍선을 모두 멋지게 터트렸어요!<br />
        이제 <b>${this.currentStage + 1}단계</b>로 넘어가 볼까요?
      `;
      this.stageClearModal.classList.add('active');
      this.sound.speak(`${this.currentStage}단계 성공! 우와, 백오십 점을 모두 모았어요! 다음 단계로 출발해 볼까요?`, 0.95);
    } else {
      // 5단계 최종 클리어!
      this.isPlaying = false;
      this.finalTotalScore.textContent = `${this.totalScore}점`;
      this.allClearModal.classList.add('active');
      this.sound.speak(`오단계 모두 성공! 축하합니다! 모든 글자 풍선을 멋지게 터트렸어요!`, 0.95);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new HangulBalloonGame();
});
