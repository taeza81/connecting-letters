/**
 * 자음과 모음이 만나요! - 지적장애학생 맞춤형 한글 합자 학습 & 전자칠판 2인 게임
 *
 * [핵심 기능]
 * 1. 7단계 체계적 학습 과정:
 *    - 1과정: 모음 'ㅏ' 만나기 (가, 나, 다 ~ 하)
 *    - 2과정: 모음 'ㅓ' 만나기 (거, 너, 더 ~ 허)
 *    - 3과정: 모음 'ㅗ' 만나기 (고, 노, 도 ~ 호)
 *    - 4과정: 모음 'ㅜ' 만나기 (구, 누, 두 ~ 후)
 *    - 5과정: 모음 'ㅡ' 만나기 (그, 느, 드 ~ 흐)
 *    - 6과정: 모음 'ㅣ' 만나기 (기, 니, 디 ~ 히)
 *    - 7과정: 모든 자음(ㄱ~ㅎ) + 모든 모음(ㅏ,ㅓ,ㅗ,ㅜ,ㅡ,ㅣ) 종합 랜덤 게임
 * 2. 전자칠판용 2인 분할 게임 모드 (1인 학습 모드 ↔ 2인 좌·우 분할 모드 실시간 전환)
 * 3. 상용 유아앱 수준의 4단계 슬로우 모션 합자 쇼케이스:
 *    - 세로모음(ㅏ, ㅓ, ㅣ)은 좌·우(초성 좌 + 중성 우) 슬로우 도킹
 *    - 가로모음(ㅗ, ㅜ, ㅡ)은 상·하(초성 상 + 중성 하) 슬로우 도킹
 * 4. 한글 창제원리 자음 음가('그, 느, 드, 르, 므...') + 또렷한 모음 음성('아, 어, 오, 우, 으, 이')
 * 5. 구글 한국어(Google 한국어) TTS 엔진 자동 우선 선택 및 테스트
 * 6. 2초 시간지연(Time Delay) 손가락 시각적 단서 제시
 */

// 14개 기본 자음 키패드 목록 (한글 창제원리 음가 '그, 느, 드, 르, 므...' 적용)
const CONSONANT_KEYS = [
  { c: 'ㄱ', name: '그' },
  { c: 'ㄴ', name: '느' },
  { c: 'ㄷ', name: '드' },
  { c: 'ㄹ', name: '르' },
  { c: 'ㅁ', name: '므' },
  { c: 'ㅂ', name: '브' },
  { c: 'ㅅ', name: '스' },
  { c: 'ㅈ', name: '즈' },
  { c: 'ㅊ', name: '츠' },
  { c: 'ㅋ', name: '크' },
  { c: 'ㅌ', name: '트' },
  { c: 'ㅍ', name: '프' },
  { c: 'ㅎ', name: '흐' },
  { c: 'ㅇ', name: '으' }
];

// 6개 기본 모음 키패드 목록 (결합 방향: right = 우측 결합, bottom = 하단 결합)
const VOWEL_KEYS = [
  { v: 'ㅏ', name: '아', dockType: 'right' },
  { v: 'ㅓ', name: '어', dockType: 'right' },
  { v: 'ㅗ', name: '오', dockType: 'bottom' },
  { v: 'ㅜ', name: '우', dockType: 'bottom' },
  { v: 'ㅡ', name: '으', dockType: 'bottom' },
  { v: 'ㅣ', name: '이', dockType: 'right' }
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

// 특정 모음 배열로 가능한 모든 목표 글자 리스트 생성
function buildTargetPool(vowelsArray) {
  const pool = [];
  vowelsArray.forEach((vChar) => {
    const vObj = VOWEL_KEYS.find((k) => k.v === vChar) || { v: vChar, name: vChar, dockType: 'right' };
    CONSONANT_KEYS.forEach((cObj) => {
      pool.push({
        char: combineHangul(cObj.c, vObj.v),
        c: cObj.c,
        v: vObj.v,
        cName: cObj.name,
        vName: vObj.name,
        dockType: vObj.dockType
      });
    });
  });
  return pool;
}

// 7가지 학습 과정 구성 (모음 1개씩 6과정 + 전체 랜덤 종합 과정)
const COURSE_CONFIG = {
  1: {
    id: 1,
    icon: '🌱',
    shortTitle: "1과정 'ㅏ'",
    fullTitle: "1과정: 모음 'ㅏ' 만나기",
    desc: "'ㅏ' 모음과 자음자를 합쳐 가, 나, 다 ~ 하 글자를 만들어요!",
    vowels: ['ㅏ']
  },
  2: {
    id: 2,
    icon: '🌿',
    shortTitle: "2과정 'ㅓ'",
    fullTitle: "2과정: 모음 'ㅓ' 만나기",
    desc: "'ㅓ' 모음과 자음자를 합쳐 거, 너, 더 ~ 허 글자를 만들어요!",
    vowels: ['ㅓ']
  },
  3: {
    id: 3,
    icon: '🌷',
    shortTitle: "3과정 'ㅗ'",
    fullTitle: "3과정: 모음 'ㅗ' 만나기",
    desc: "'ㅗ' 모음과 자음자를 위·아래로 합쳐 고, 노, 도 ~ 호 글자를 만들어요!",
    vowels: ['ㅗ']
  },
  4: {
    id: 4,
    icon: '🌻',
    shortTitle: "4과정 'ㅜ'",
    fullTitle: "4과정: 모음 'ㅜ' 만나기",
    desc: "'ㅜ' 모음과 자음자를 위·아래로 합쳐 구, 누, 두 ~ 후 글자를 만들어요!",
    vowels: ['ㅜ']
  },
  5: {
    id: 5,
    icon: '🍎',
    shortTitle: "5과정 'ㅡ'",
    fullTitle: "5과정: 모음 'ㅡ' 만나기",
    desc: "'ㅡ' 모음과 자음자를 위·아래로 합쳐 그, 느, 드 ~ 흐 글자를 만들어요!",
    vowels: ['ㅡ']
  },
  6: {
    id: 6,
    icon: '🌈',
    shortTitle: "6과정 'ㅣ'",
    fullTitle: "6과정: 모음 'ㅣ' 만나기",
    desc: "'ㅣ' 모음과 자음자를 합쳐 기, 니, 디 ~ 히 글자를 만들어요!",
    vowels: ['ㅣ']
  },
  7: {
    id: 7,
    icon: '👑',
    shortTitle: '7과정 종합 랜덤',
    fullTitle: '7과정: 모든 자음 + 모음 랜덤 게임',
    desc: '모든 자음자(ㄱ~ㅎ)와 모든 모음자(ㅏ, ㅓ, ㅗ, ㅜ, ㅡ, ㅣ)를 골고루 합쳐 봐요!',
    vowels: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ']
  }
};

// 풍선 하강 속도 프리셋 (교사가 수업 중 클릭하여 실시간 변경 가능)
const SPEED_PRESETS = [
  { id: 1, fallDuration: 19.0, label: '🐢 속도: 아주 천천히' },
  { id: 2, fallDuration: 15.0, label: '🐥 속도: 천천히' },
  { id: 3, fallDuration: 11.8, label: '🦊 속도: 보통 속도' }
];

const POINTS_PER_BALLOON = 10; // 풍선 1개당 10점
const STAGE_GOAL_SCORE = 150;  // 과정 통과 목표 점수: 150점
const HINT_DELAY_MS = 2000;    // 힌트 모드 켜졌을 때 손가락 시각적 단서 시간지연 (2초)

// 풍선 색상 팔레트
const BALLOON_COLORS = [
  { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%)', knot: '#ee5253', particle: '#ff6b6b' },
  { bg: 'linear-gradient(135deg, #ff9f43 0%, #f368e0 100%)', knot: '#f368e0', particle: '#ff9f43' },
  { bg: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)', knot: '#0abde3', particle: '#48dbfb' },
  { bg: 'linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%)', knot: '#10ac84', particle: '#1dd1a1' },
  { bg: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)', knot: '#6c5ce7', particle: '#a29bfe' },
  { bg: 'linear-gradient(135deg, #feca57 0%, #ff9f43 100%)', knot: '#ff9f43', particle: '#feca57' },
  { bg: 'linear-gradient(135deg, #ff78ae 0%, #ff4d8d 100%)', knot: '#ff4d8d', particle: '#ff78ae' }
];

// ================= 사운드 & 음성 합성 매니저 (Web Audio API + 구글 한국어 TTS) =================
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.voices = [];
    this.koreanVoices = [];
    this.selectedVoice = null;
    this.onVoicesLoadedCallback = null;
    this.initVoices();
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

  initVoices(onLoaded = null) {
    if (onLoaded) {
      this.onVoicesLoadedCallback = onLoaded;
    }
    if (!('speechSynthesis' in window)) return;

    const load = () => {
      this.voices = window.speechSynthesis.getVoices() || [];
      this.koreanVoices = this.voices.filter((v) => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        return lang.includes('ko') || lang.includes('kr') || name.includes('korean') || name.includes('한국');
      });

      // 구글 한국어(Google Korean) 엔진을 최우선으로 정렬
      this.koreanVoices.sort((a, b) => {
        const aGoogle = a.name.includes('Google') || a.name.includes('구글');
        const bGoogle = b.name.includes('Google') || b.name.includes('구글');
        if (aGoogle && !bGoogle) return -1;
        if (!aGoogle && bGoogle) return 1;
        return 0;
      });

      const savedName = localStorage.getItem('hangul_game_tts_voice');
      if (savedName) {
        this.selectedVoice = this.koreanVoices.find((v) => v.name === savedName) || null;
      }
      if (!this.selectedVoice && this.koreanVoices.length > 0) {
        this.selectedVoice = this.koreanVoices[0];
      }

      if (this.onVoicesLoadedCallback) {
        this.onVoicesLoadedCallback(this.koreanVoices, this.selectedVoice);
      }
    };

    load();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => load();
    }
  }

  setVoiceByName(name) {
    if (!name) return;
    const found = this.koreanVoices.find((v) => v.name === name);
    if (found) {
      this.selectedVoice = found;
      try {
        localStorage.setItem('hangul_game_tts_voice', found.name);
      } catch (e) {}
    }
  }

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

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playLiftOffChime() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [392.0, 523.25];
    notes.forEach((f, idx) => {
      const now = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.06, now + 0.16);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    });
  }

  playSlowMergeSlide() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77];
    scale.forEach((f, idx) => {
      const now = this.ctx.currentTime + idx * 0.145;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  playCombineSuccess() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99];
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

  playBalloonPop() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
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
    noiseGain.gain.setValueAtTime(0.42, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);

    const chime = [783.99, 1046.5, 1318.5, 1567.98];
    chime.forEach((freq, i) => {
      const t = now + 0.05 + i * 0.06;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

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

  playStageClearFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, t: 0.0, d: 0.14 },
      { f: 659.25, t: 0.14, d: 0.14 },
      { f: 783.99, t: 0.28, d: 0.14 },
      { f: 1046.5, t: 0.42, d: 0.32 },
      { f: 783.99, t: 0.76, d: 0.14 },
      { f: 1046.5, t: 0.92, d: 0.55 }
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

  speak(text, rate = 0.9, onEnd = null) {
    if (!this.enabled || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      utter.rate = rate;
      utter.pitch = 1.04;
      if (this.selectedVoice) {
        utter.voice = this.selectedVoice;
      }
      if (onEnd) {
        utter.onend = () => onEnd();
        utter.onerror = () => onEnd();
      }
      window.speechSynthesis.speak(utter);
    } catch (e) {
      if (onEnd) onEnd();
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
      p.vy += 0.18;
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

// ================= 개별 플레이어 레인 컨트롤러 (1P / 2P 각각 독립 동작) =================
class PlayerLane {
  constructor(playerIndex, prefix, game) {
    this.playerIndex = playerIndex; // 1 또는 2
    this.prefix = prefix;           // 'p1' 또는 'p2'
    this.game = game;

    this.courseId = 1;              // 플레이어 개별 학습 과정 (1~7)
    this.stageScore = 0;
    this.totalScore = 0;
    this.selectedConsonant = null;
    this.selectedVowel = null;
    this.activeBalloon = null;
    this.letterDeck = [];
    this.isFiring = false;

    this.hintDelayTimer = null;
    this.hintCueVisible = false;

    this.fusionElements = [];
    this.fusionTimers = [];
    this.fusionTrailInterval = null;

    this.cacheDOM();
    this.buildKeyboards();
    this.bindEvents();
  }

  cacheDOM() {
    this.laneEl = document.getElementById(`player-lane-${this.playerIndex}`);
    this.scoreBox = document.getElementById(`${this.prefix}-score-box`);
    this.courseSelect = document.getElementById(`${this.prefix}-course-select`);
    this.stageScoreEl = document.getElementById(`${this.prefix}-stage-score`);
    this.totalScoreEl = document.getElementById(`${this.prefix}-total-score`);
    this.progressTrack = document.getElementById(`${this.prefix}-progress-track`);
    this.progressFill = document.getElementById(`${this.prefix}-progress-fill`);

    this.playArea = document.getElementById(`${this.prefix}-play-area`);
    this.helperCard = document.getElementById(`${this.prefix}-helper-card`);
    this.helperTargetChar = document.getElementById(`${this.prefix}-helper-target-char`);
    this.helperC = document.getElementById(`${this.prefix}-helper-c`);
    this.helperV = document.getElementById(`${this.prefix}-helper-v`);

    this.balloonStage = document.getElementById(`${this.prefix}-balloon-stage`);
    this.projectileLayer = document.getElementById(`${this.prefix}-projectile-layer`);

    this.consonantGrid = document.getElementById(`${this.prefix}-consonant-grid`);
    this.vowelGrid = document.getElementById(`${this.prefix}-vowel-grid`);
    this.clearBtn = document.getElementById(`${this.prefix}-clear-btn`);
  }

  buildKeyboards() {
    this.consonantGrid.innerHTML = '';
    this.consonantButtons = {};
    CONSONANT_KEYS.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'key-btn consonant-btn';
      btn.textContent = item.c;
      btn.dataset.consonant = item.c;
      btn.setAttribute('aria-label', `${this.playerIndex}번 플레이어 자음 ${item.name}`);
      btn.addEventListener('click', () => this.onSelectConsonant(item));
      this.consonantGrid.appendChild(btn);
      this.consonantButtons[item.c] = btn;
    });

    this.vowelGrid.innerHTML = '';
    this.vowelButtons = {};
    VOWEL_KEYS.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'key-btn vowel-btn';
      btn.textContent = item.v;
      btn.dataset.vowel = item.v;
      btn.setAttribute('aria-label', `${this.playerIndex}번 플레이어 모음 ${item.name}`);
      btn.addEventListener('click', () => this.onSelectVowel(item));
      this.vowelGrid.appendChild(btn);
      this.vowelButtons[item.v] = btn;
    });
  }

  bindEvents() {
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.game.sound.playTap(392.0);
        this.resetSelection();
        this.startHintCueTimer(HINT_DELAY_MS);
      });
    }

    // 2인 모드 시 각 학생별 실시간 학습 과정 변경 드롭다운
    if (this.courseSelect) {
      this.courseSelect.addEventListener('change', (e) => {
        const newCourseId = Number(e.target.value);
        this.game.sound.playTap(587.33);
        this.setCourse(newCourseId, true);
      });
    }
  }

  // 개별 플레이어 학습 과정 설정 및 실시간 풍선 교체
  setCourse(courseId, spawnImmediately = true) {
    const newCourseId = Number(courseId) || 1;
    const isChanged = this.courseId !== newCourseId;
    this.courseId = newCourseId;

    if (this.courseSelect) {
      this.courseSelect.value = String(this.courseId);
    }

    if (isChanged) {
      this.stageScore = 0;
    }
    this.letterDeck = [];
    this.resetSelection();

    // 1인 모드일 경우 상단 메인 HUD 코스 선택 드롭다운 및 아이콘도 동기화
    if (this.game.playMode === '1p' && this.playerIndex === 1) {
      this.game.currentCourse = this.courseId;
      this.game.updateCourseUI();
    } else if (this.game.playMode === '2p') {
      if (this.playerIndex === 1) this.game.startCourseP1_2P = this.courseId;
      if (this.playerIndex === 2) this.game.startCourseP2_2P = this.courseId;
    }

    this.updateScoreUI();

    // 게임 진행 중 과정 변경 시: 즉시 기존 풍선을 새 과정 목표 글자 풍선으로 교체
    if (this.game.isPlaying && spawnImmediately) {
      const courseCfg = COURSE_CONFIG[this.courseId] || COURSE_CONFIG[1];
      const who = this.game.playMode === '2p' ? `${this.playerIndex}번 친구 ` : '';
      this.game.sound.speak(`${who}${courseCfg.shortTitle} 시작!`, 0.95);
      this.clearActiveBalloon();
      this.spawnSingleBalloon(true);
    }
  }

  // 플레이어의 개별 학습 과정(1~7과정)에 맞는 글자 풀에서 셔플 추출
  getNextTargetLetter() {
    if (this.letterDeck.length === 0) {
      const courseCfg = COURSE_CONFIG[this.courseId] || COURSE_CONFIG[1];
      this.letterDeck = buildTargetPool(courseCfg.vowels);
      for (let i = this.letterDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.letterDeck[i], this.letterDeck[j]] = [this.letterDeck[j], this.letterDeck[i]];
      }
    }
    return this.letterDeck.pop();
  }

  resetForNewCourse(resetTotal = false) {
    this.stageScore = 0;
    if (resetTotal) {
      this.totalScore = 0;
    }
    this.letterDeck = [];
    this.isFiring = false;
    this.resetSelection();
    this.clearActiveBalloon();
    if (this.courseSelect) {
      this.courseSelect.value = String(this.courseId);
    }
    this.updateScoreUI();
  }

  updateScoreUI() {
    const pct = Math.min(100, (this.stageScore / STAGE_GOAL_SCORE) * 100);
    if (this.stageScoreEl) this.stageScoreEl.textContent = this.stageScore;
    if (this.totalScoreEl) this.totalScoreEl.textContent = this.totalScore;
    if (this.progressFill) this.progressFill.style.width = `${pct}%`;

    // 1인 모드일 경우 상단 메인 HUD 점수바도 동기화
    if (this.playerIndex === 1) {
      this.game.syncMainHUDScore(this.stageScore, this.totalScore, pct);
    }
    this.game.sync2PBannerScores();
  }

  spawnSingleBalloon(speakAnnouncement = true) {
    if (!this.game.isPlaying || this.activeBalloon) return;

    const target = this.getNextTargetLetter();
    const colorTheme = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];

    // 우측 힌트 카드와 겹치지 않는 가로 범위(25% ~ 56%)
    const baseX = 25 + Math.random() * 31;

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

    wrapper.addEventListener('click', () => {
      this.game.sound.playTap(587.33);
      this.game.sound.speak(target.char, 0.9);
    });

    this.balloonStage.appendChild(wrapper);

    this.activeBalloon = {
      el: wrapper,
      target,
      colorTheme,
      baseX,
      xPercent: baseX,
      elapsed: 0,
      amp: 3.0 + Math.random() * 1.8,
      freq: 0.38 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      progress: 0,
      popped: false
    };

    // 우측 힌트 도우미 카드 업데이트
    this.helperTargetChar.textContent = target.char;
    this.helperC.textContent = target.c;
    this.helperV.textContent = target.v;

    // 2초 시간지연 후 손가락 힌트 표시
    this.startHintCueTimer(HINT_DELAY_MS);

    if (speakAnnouncement) {
      this.game.sound.speak(`${target.char}`, 0.95);
    }
  }

  updateBalloonFrame(dt, fallDuration) {
    if (!this.activeBalloon || this.activeBalloon.popped) return;

    const b = this.activeBalloon;
    b.elapsed += dt;
    b.progress += dt / fallDuration;

    const topPercent = -28 + b.progress * 133;
    b.el.style.top = `${topPercent}%`;

    const gentleDrift = Math.sin(b.elapsed * b.freq + b.phase) * b.amp;
    b.xPercent = Math.max(18, Math.min(66, b.baseX + gentleDrift));
    b.el.style.left = `${b.xPercent}%`;

    if (b.progress >= 1.0) {
      this.clearActiveBalloon();
      this.resetSelection();
      this.spawnSingleBalloon(this.game.playMode === '1p' || this.playerIndex === 1);
    }
  }

  clearHintCueTimer() {
    if (this.hintDelayTimer) {
      clearTimeout(this.hintDelayTimer);
      this.hintDelayTimer = null;
    }
    this.hintCueVisible = false;
  }

  startHintCueTimer(delayMs = HINT_DELAY_MS) {
    this.clearHintCueTimer();
    this.updateHintHighlights();
    if (!this.game.hintEnabled || !this.activeBalloon) return;

    this.hintDelayTimer = setTimeout(() => {
      this.hintDelayTimer = null;
      if (this.game.isPlaying && this.game.hintEnabled && this.activeBalloon && !this.activeBalloon.popped) {
        this.hintCueVisible = true;
        this.updateHintHighlights();
      }
    }, delayMs);
  }

  updateHintHighlights() {
    Object.values(this.consonantButtons).forEach((b) => b.classList.remove('hint-glow'));
    Object.values(this.vowelButtons).forEach((b) => b.classList.remove('hint-glow'));

    this.helperCard.classList.toggle('hidden-hint', !this.game.hintEnabled);
    if (!this.game.hintEnabled || !this.activeBalloon || !this.hintCueVisible) return;

    const target = this.activeBalloon.target;
    if (this.selectedConsonant !== target.c && this.consonantButtons[target.c]) {
      this.consonantButtons[target.c].classList.add('hint-glow');
    }
    if (this.selectedVowel !== target.v && this.vowelButtons[target.v]) {
      this.vowelButtons[target.v].classList.add('hint-glow');
    }
  }

  clearFusionStage() {
    if (this.fusionTimers && this.fusionTimers.length > 0) {
      this.fusionTimers.forEach((t) => clearTimeout(t));
      this.fusionTimers = [];
    }
    if (this.fusionTrailInterval) {
      clearInterval(this.fusionTrailInterval);
      this.fusionTrailInterval = null;
    }
    if (this.fusionElements && this.fusionElements.length > 0) {
      this.fusionElements.forEach((el) => {
        if (el && el.parentNode) el.remove();
      });
      this.fusionElements = [];
    }
  }

  clearActiveBalloon() {
    this.clearHintCueTimer();
    this.clearFusionStage();
    if (this.activeBalloon && this.activeBalloon.el) {
      this.activeBalloon.el.remove();
    }
    this.activeBalloon = null;
  }

  resetSelection() {
    this.selectedConsonant = null;
    this.selectedVowel = null;
    this.isFiring = false;
    Object.values(this.consonantButtons).forEach((b) => b.classList.remove('selected'));
    Object.values(this.vowelButtons).forEach((b) => b.classList.remove('selected'));
    this.updateHintHighlights();
  }

  onSelectConsonant(item) {
    if (!this.game.isPlaying || this.game.isPaused || this.isFiring) return;

    this.selectedConsonant = item.c;
    this.game.sound.playTap(523.25);
    this.game.sound.speak(item.name, 1.0);

    Object.values(this.consonantButtons).forEach((b) => b.classList.remove('selected'));
    if (this.consonantButtons[item.c]) {
      this.consonantButtons[item.c].classList.add('selected');
    }

    this.updateHintHighlights();
    this.checkCombineAttempt();
  }

  onSelectVowel(item) {
    if (!this.game.isPlaying || this.game.isPaused || this.isFiring) return;

    this.selectedVowel = item.v;
    this.game.sound.playTap(659.25);
    this.game.sound.speak(item.name, 0.88);

    Object.values(this.vowelButtons).forEach((b) => b.classList.remove('selected'));
    if (this.vowelButtons[item.v]) {
      this.vowelButtons[item.v].classList.add('selected');
    }

    this.updateHintHighlights();
    this.checkCombineAttempt();
  }

  checkCombineAttempt() {
    if (!this.selectedConsonant || !this.selectedVowel || !this.activeBalloon || this.isFiring) {
      return;
    }

    const combined = combineHangul(this.selectedConsonant, this.selectedVowel);
    const target = this.activeBalloon.target;

    if (combined === target.char) {
      this.isFiring = true;
      const cChosen = this.selectedConsonant;
      const vChosen = this.selectedVowel;
      setTimeout(() => {
        this.animateCombineAndPop(cChosen, vChosen, combined);
      }, 550);
    } else {
      this.isFiring = true;
      setTimeout(() => {
        this.game.sound.playGentleMismatch();
        this.game.sound.speak(`${combined}! 풍선 글자는 ${target.char}예요. 다시 골라볼까요?`, 0.92);

        const cBtn = this.consonantButtons[this.selectedConsonant];
        const vBtn = this.vowelButtons[this.selectedVowel];
        [cBtn, vBtn].forEach((btn) => {
          if (btn) {
            btn.style.animation = 'none';
            void btn.offsetWidth;
            btn.style.animation = 'buttonShake 0.4s ease-in-out';
          }
        });

        setTimeout(() => {
          [cBtn, vBtn].forEach((btn) => {
            if (btn) btn.style.animation = '';
          });
          this.resetSelection();
          this.startHintCueTimer(HINT_DELAY_MS);
        }, 700);
      }, 550);
    }
  }

  // ================= 4단계 슬로우 모션 합자 쇼케이스 (우측 모음 좌·우 결합 / 하단 모음 상·하 결합 지원) =================
  animateCombineAndPop(c, v, combinedChar) {
    if (!this.activeBalloon || this.activeBalloon.popped) return;
    const balloonObj = this.activeBalloon;
    balloonObj.popped = true;
    this.isFiring = true;

    this.clearFusionStage();
    this.fusionElements = [];
    this.fusionTimers = [];

    if (balloonObj.el) {
      balloonObj.el.classList.add('waiting-hit');
    }

    const cBtn = this.consonantButtons[c];
    const vBtn = this.vowelButtons[v];
    const laneRect = this.laneEl.getBoundingClientRect();
    const playRect = this.playArea.getBoundingClientRect();

    const cRect = cBtn
      ? cBtn.getBoundingClientRect()
      : { left: laneRect.left + laneRect.width * 0.3, top: laneRect.bottom - 60, width: 50, height: 50 };
    const vRect = vBtn
      ? vBtn.getBoundingClientRect()
      : { left: laneRect.left + laneRect.width * 0.7, top: laneRect.bottom - 60, width: 50, height: 50 };

    const startC_X = (cRect.left - laneRect.left) + cRect.width / 2;
    const startC_Y = (cRect.top - laneRect.top) + cRect.height / 2;
    const startV_X = (vRect.left - laneRect.left) + vRect.width / 2;
    const startV_Y = (vRect.top - laneRect.top) + vRect.height / 2;

    const stageCenterX = laneRect.width * 0.5;
    const stageCenterY = (playRect.top - laneRect.top) + playRect.height * 0.62;
    const charCenterY = stageCenterY + 15;

    const sideGapX = Math.min(128, Math.max(68, laneRect.width * 0.14));
    const dockOffsetX = Math.min(30, Math.max(18, laneRect.width * 0.032));
    const dockOffsetY = Math.min(26, Math.max(16, laneRect.height * 0.028));

    // 모음 결합 유형 확인 (ㅏ,ㅓ,ㅣ = 'right' 좌우 결합 / ㅗ,ㅜ,ㅡ = 'bottom' 상하 결합)
    const vInfo = VOWEL_KEYS.find((k) => k.v === v);
    const isBottomVowel = vInfo && vInfo.dockType === 'bottom';

    const spotlight = document.createElement('div');
    spotlight.className = 'fusion-spotlight';
    spotlight.style.left = `${stageCenterX}px`;
    spotlight.style.top = `${stageCenterY}px`;
    this.laneEl.appendChild(spotlight);

    const fusionBoard = document.createElement('div');
    fusionBoard.className = 'fusion-stage-board';
    fusionBoard.style.left = `${stageCenterX}px`;
    fusionBoard.style.top = `${stageCenterY}px`;
    fusionBoard.innerHTML = `
      <div class="fusion-equation-pill">
        <span class="eq-c">${c}</span>
        <span class="eq-op">+</span>
        <span class="eq-v">${v}</span>
        <span class="eq-op">=</span>
        <span class="eq-res">?</span>
      </div>
      <div class="fusion-char-stage">
        <div class="fusion-shockwave"></div>
        <div class="fusion-complete-char">${combinedChar}</div>
      </div>
    `;
    this.laneEl.appendChild(fusionBoard);

    const plusBadge = document.createElement('div');
    plusBadge.className = 'fusion-plus-badge';
    plusBadge.textContent = '+';
    plusBadge.style.left = `${stageCenterX}px`;
    plusBadge.style.top = `${charCenterY}px`;
    this.laneEl.appendChild(plusBadge);

    const cTile = document.createElement('div');
    cTile.className = 'anim-pop-tile consonant-tile';
    cTile.textContent = c;
    cTile.style.left = `${startC_X}px`;
    cTile.style.top = `${startC_Y}px`;
    this.laneEl.appendChild(cTile);

    const vTile = document.createElement('div');
    vTile.className = 'anim-pop-tile vowel-tile';
    vTile.textContent = v;
    vTile.style.left = `${startV_X}px`;
    vTile.style.top = `${startV_Y}px`;
    this.laneEl.appendChild(vTile);

    this.fusionElements.push(spotlight, fusionBoard, plusBadge, cTile, vTile);

    // ▶ [1단계: 0.0초 ~ 0.95초] 키패드에서 떠올라 좌·우에 나란히 정렬
    this.game.sound.playLiftOffChime();
    requestAnimationFrame(() => {
      spotlight.classList.add('active');
      cTile.style.left = `${stageCenterX - sideGapX}px`;
      cTile.style.top = `${charCenterY}px`;
      cTile.style.transform = 'translate(-50%, -50%) scale(1.05)';

      vTile.style.left = `${stageCenterX + sideGapX}px`;
      vTile.style.top = `${charCenterY}px`;
      vTile.style.transform = 'translate(-50%, -50%) scale(1.05)';

      plusBadge.classList.add('visible');
    });

    // ▶ [2단계: 0.95초 ~ 2.25초] 슬로우 모션 결합 (ㅏ/ㅓ/ㅣ는 좌·우 결합, ㅗ/ㅜ/ㅡ는 상·하 결합!)
    const tDock = setTimeout(() => {
      if (!this.game.isPlaying) return;
      this.game.sound.playSlowMergeSlide();

      plusBadge.classList.remove('visible');
      plusBadge.classList.add('dissolve');
      fusionBoard.classList.add('active');

      cTile.classList.add('slow-docking');
      vTile.classList.add('slow-docking');

      if (isBottomVowel) {
        // 가로모음(ㅗ, ㅜ, ㅡ): 자음은 위쪽(초성), 모음은 아래쪽(중성)으로 천천히 도킹
        cTile.style.left = `${stageCenterX}px`;
        cTile.style.top = `${charCenterY - dockOffsetY}px`;
        cTile.style.transform = 'translate(-50%, -50%) scale(1.12)';

        vTile.style.left = `${stageCenterX}px`;
        vTile.style.top = `${charCenterY + dockOffsetY}px`;
        vTile.style.transform = 'translate(-50%, -50%) scale(1.12)';
      } else {
        // 세로모음(ㅏ, ㅓ, ㅣ): 자음은 왼쪽(초성), 모음은 오른쪽(중성)으로 천천히 도킹
        cTile.style.left = `${stageCenterX - dockOffsetX}px`;
        cTile.style.top = `${charCenterY}px`;
        cTile.style.transform = 'translate(-50%, -50%) scale(1.16)';

        vTile.style.left = `${stageCenterX + dockOffsetX}px`;
        vTile.style.top = `${charCenterY}px`;
        vTile.style.transform = 'translate(-50%, -50%) scale(1.16)';
      }
    }, 950);
    this.fusionTimers.push(tDock);

    // ▶ [3단계: 2.30초 ~ 3.55초] 완성 글자 탄생 & 수식('ㄱ + ㅗ = 고') 완성 쇼케이스
    const tComplete = setTimeout(() => {
      if (!this.game.isPlaying) return;

      cTile.classList.add('merged-fade');
      vTile.classList.add('merged-fade');
      fusionBoard.classList.add('completed');

      const eqRes = fusionBoard.querySelector('.eq-res');
      if (eqRes) {
        eqRes.textContent = combinedChar;
        eqRes.classList.add('revealed');
      }

      const canvasRect = this.game.fx.canvas.getBoundingClientRect();
      const burstX = laneRect.left - canvasRect.left + stageCenterX;
      const burstY = laneRect.top - canvasRect.top + stageCenterY;
      this.game.fx.burst(burstX, burstY, 22);

      this.game.sound.playCombineSuccess();
      this.game.sound.speak(combinedChar, 0.88);
    }, 2300);
    this.fusionTimers.push(tComplete);

    // ▶ [4단계: 3.55초 ~ 4.40초] 완성된 합자 보드가 별빛 꼬리를 남기며 목표 풍선으로 날아가 팡!
    const tFly = setTimeout(() => {
      if (!this.game.isPlaying) return;

      spotlight.classList.remove('active');
      const bRect = balloonObj.el.getBoundingClientRect();
      const targetX = (bRect.left - laneRect.left) + bRect.width / 2;
      const targetY = (bRect.top - laneRect.top) + bRect.height * 0.42;

      fusionBoard.classList.add('flying-to-balloon');
      fusionBoard.style.left = `${targetX}px`;
      fusionBoard.style.top = `${targetY}px`;

      const canvasRect = this.game.fx.canvas.getBoundingClientRect();
      let step = 0;
      this.fusionTrailInterval = setInterval(() => {
        step++;
        if (step > 5 || !this.game.isPlaying) {
          clearInterval(this.fusionTrailInterval);
          this.fusionTrailInterval = null;
          return;
        }
        const curRect = fusionBoard.getBoundingClientRect();
        const tx = (curRect.left - canvasRect.left) + curRect.width / 2;
        const ty = (curRect.top - canvasRect.top) + curRect.height / 2;
        this.game.fx.burst(tx, ty, 5);
      }, 120);

      const tPop = setTimeout(() => {
        this.clearFusionStage();
        this.popBalloon(balloonObj);
      }, 840);
      this.fusionTimers.push(tPop);
    }, 3550);
    this.fusionTimers.push(tFly);
  }

  triggerEnergyBarImpact() {
    // 2인 모드일 때는 각 레인의 상단 점수바 임팩트, 1인 모드일 때는 상단 메인 HUD 점수바 임팩트
    const is1P = this.game.playMode === '1p';
    const boxEl = is1P ? this.game.hud1PScoreBox : this.scoreBox;
    const trackEl = is1P ? this.game.hud1PProgressTrack : this.progressTrack;
    const fillEl = is1P ? this.game.hud1PProgressFill : this.progressFill;
    const numEl = is1P ? this.game.hud1PStageScoreEl : this.stageScoreEl;

    if (boxEl) {
      boxEl.classList.remove('impact');
      void boxEl.offsetWidth;
      boxEl.classList.add('impact');
    }
    if (trackEl) {
      trackEl.classList.remove('impact');
      void trackEl.offsetWidth;
      trackEl.classList.add('impact');
    }
    if (fillEl) {
      fillEl.classList.remove('impact');
      void fillEl.offsetWidth;
      fillEl.classList.add('impact');
    }
    if (numEl) {
      numEl.classList.remove('pop');
      void numEl.offsetWidth;
      numEl.classList.add('pop');
    }

    if (fillEl && this.game.fx) {
      const fillRect = fillEl.getBoundingClientRect();
      const canvasRect = this.game.fx.canvas.getBoundingClientRect();
      const sparkX = fillRect.right - canvasRect.left;
      const sparkY = (fillRect.top + fillRect.bottom) / 2 - canvasRect.top;
      this.game.fx.burst(sparkX, sparkY, 16);
    }

    setTimeout(() => {
      if (boxEl) boxEl.classList.remove('impact');
      if (trackEl) trackEl.classList.remove('impact');
      if (fillEl) fillEl.classList.remove('impact');
      if (numEl) numEl.classList.remove('pop');
    }, 800);
  }

  popBalloon(balloonObj) {
    this.game.sound.playBalloonPop();
    this.game.sound.speak(`${balloonObj.target.char}! 참 잘했어요!`, 1.0);

    const canvasRect = this.game.fx.canvas.getBoundingClientRect();
    const balloonRect = balloonObj.el.getBoundingClientRect();
    const burstX = balloonRect.left - canvasRect.left + balloonRect.width / 2;
    const burstY = balloonRect.top - canvasRect.top + balloonRect.height * 0.42;
    this.game.fx.burst(burstX, burstY, 38);

    balloonObj.el.classList.add('popping');

    this.stageScore += POINTS_PER_BALLOON;
    this.totalScore += POINTS_PER_BALLOON;
    this.updateScoreUI();
    this.triggerEnergyBarImpact();

    setTimeout(() => {
      this.clearActiveBalloon();
      this.resetSelection();

      if (this.stageScore >= STAGE_GOAL_SCORE) {
        this.game.onCourseGoalReached(this.playerIndex);
      } else {
        this.spawnSingleBalloon(true);
      }
    }, 550);
  }
}

// ================= 메인 게임 & 교사용 컨트롤러 =================
class HangulBalloonGame {
  constructor() {
    this.sound = new SoundManager();
    this.fx = new ParticleSystem(document.getElementById('fx-canvas'));

    this.currentCourse = 1;     // 1인 모드 학습 과정 (1 ~ 7과정)
    this.startCourse1P = 1;     // 시작 화면 1P 선택 과정
    this.startCourseP1_2P = 1;  // 시작 화면 2P 모드 1번 친구 선택 과정
    this.startCourseP2_2P = 1;  // 시작 화면 2P 모드 2번 친구 선택 과정

    this.playMode = '1p';       // '1p' (1인 학습) | '2p' (전자칠판 2인 분할)
    this.speedIndex = 0;        // 0: 아주 천천히, 1: 천천히, 2: 보통 속도

    this.isPlaying = false;
    this.isPaused = false;
    this.hintEnabled = true;
    this.lastFrameTime = 0;

    this.cacheDOM();
    this.lane1 = new PlayerLane(1, 'p1', this);
    this.lane2 = new PlayerLane(2, 'p2', this);

    this.initTTSVoiceSelector();
    this.bindEvents();
    this.updateModeUI();
    this.updateCourseUI();
  }

  cacheDOM() {
    this.gameContainer = document.getElementById('game-container');
    this.lanesWrapper = document.getElementById('lanes-wrapper');

    this.courseBadgeIcon = document.getElementById('course-badge-icon');
    this.hudCourseSelect = document.getElementById('hud-course-select');
    this.hud1PCourseBadge = document.getElementById('hud-1p-course-badge');
    this.hud2PCourseBadge = document.getElementById('hud-2p-course-badge');
    this.speedIndicator = document.getElementById('speed-indicator');

    this.hud1PScoreBox = document.getElementById('hud-1p-score-box');
    this.hudCourseTitle = document.getElementById('hud-course-title');
    this.hud1PStageScoreEl = document.getElementById('stage-score');
    this.hud1PTotalScoreEl = document.getElementById('total-score');
    this.hud1PProgressTrack = document.getElementById('hud-1p-progress-track');
    this.hud1PProgressFill = document.getElementById('score-progress-fill');

    this.hud2PBanner = document.getElementById('hud-2p-banner');
    this.hudP1Score = document.getElementById('hud-p1-score');
    this.hudP2Score = document.getElementById('hud-p2-score');

    this.modeToggleBtn = document.getElementById('mode-toggle-btn');
    this.hintBtn = document.getElementById('hint-btn');
    this.soundBtn = document.getElementById('sound-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');
    this.homeBtn = document.getElementById('home-btn');

    this.startModal = document.getElementById('start-modal');
    this.stageClearModal = document.getElementById('stage-clear-modal');
    this.allClearModal = document.getElementById('all-clear-modal');

    this.selectMode1PBtn = document.getElementById('select-mode-1p');
    this.selectMode2PBtn = document.getElementById('select-mode-2p');
    this.courseSetup1P = document.getElementById('course-setup-1p');
    this.courseSetup2P = document.getElementById('course-setup-2p');

    this.startCourseGrid = document.getElementById('start-course-grid');
    this.courseCardBtns = this.startCourseGrid
      ? Array.from(this.startCourseGrid.querySelectorAll('.course-card-btn'))
      : [];

    this.miniCourseBtns = document.querySelectorAll('.mini-course-btn');

    this.fullscreenStartCheck = document.getElementById('fullscreen-start-check');
    this.ttsVoiceSelect = document.getElementById('tts-voice-select');
    this.ttsTestBtn = document.getElementById('tts-test-btn');

    this.startGameBtn = document.getElementById('start-game-btn');
    this.nextStageBtn = document.getElementById('next-stage-btn');
    this.replayCourseBtn = document.getElementById('replay-course-btn');
    this.restartGameBtn = document.getElementById('restart-game-btn');
    this.chooseOtherCourseBtn = document.getElementById('choose-other-course-btn');

    this.clearStageBadge = document.getElementById('clear-stage-badge');
    this.clearTitle = document.getElementById('clear-title');
    this.clearDesc = document.getElementById('clear-desc');

    this.finalClearBadge = document.getElementById('final-clear-badge');
    this.finalClearTitle = document.getElementById('final-clear-title');
    this.finalClearDesc = document.getElementById('final-clear-desc');
    this.finalTotalScore = document.getElementById('final-total-score');
  }

  initTTSVoiceSelector() {
    const renderVoiceOptions = (voices, selectedVoice) => {
      if (!this.ttsVoiceSelect) return;
      this.ttsVoiceSelect.innerHTML = '';

      if (!voices || voices.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '🔊 기본 한국어 음성 (시스템 기본)';
        this.ttsVoiceSelect.appendChild(opt);
        return;
      }

      voices.forEach((v) => {
        const opt = document.createElement('option');
        opt.value = v.name;
        const isGoogle = v.name.includes('Google') || v.name.includes('구글');

        let cleanName = v.name.replace(/한국의/g, '한국어');
        if (isGoogle) {
          opt.textContent = `⭐ Google 한국어 (구글 권장)`;
        } else {
          opt.textContent = `🔊 ${cleanName}`;
        }

        if (selectedVoice && v.name === selectedVoice.name) {
          opt.selected = true;
        }
        this.ttsVoiceSelect.appendChild(opt);
      });
    };

    this.sound.initVoices((voices, selectedVoice) => {
      renderVoiceOptions(voices, selectedVoice);
    });

    if (this.ttsVoiceSelect) {
      this.ttsVoiceSelect.addEventListener('change', (e) => {
        this.sound.setVoiceByName(e.target.value);
      });
    }

    if (this.ttsTestBtn) {
      this.ttsTestBtn.addEventListener('click', () => {
        this.sound.initContext();
        this.sound.playTap(659.25);
        this.sound.speak('안녕하세요! 자음과 모음이 만나요!', 0.9);
      });
    }
  }

  isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }

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

  setPlayMode(mode) {
    this.playMode = mode === '2p' ? '2p' : '1p';
    this.updateModeUI();
    if (this.isPlaying) {
      if (this.playMode === '1p') {
        this.lane2.clearActiveBalloon();
        this.lane1.setCourse(this.currentCourse, false);
        this.lane1.updateScoreUI();
      } else {
        this.lane1.setCourse(this.startCourseP1_2P, false);
        this.lane2.setCourse(this.startCourseP2_2P, false);
        this.lane2.resetForNewCourse(false);
        this.lane2.spawnSingleBalloon(false);
      }
    }
  }

  updateModeUI() {
    const is2P = this.playMode === '2p';
    this.lanesWrapper.classList.toggle('mode-2p', is2P);
    this.lanesWrapper.classList.toggle('mode-1p', !is2P);

    if (this.hud1PScoreBox) this.hud1PScoreBox.style.display = is2P ? 'none' : 'flex';
    if (this.hud2PBanner) this.hud2PBanner.style.display = is2P ? 'flex' : 'none';

    if (this.hud1PCourseBadge) this.hud1PCourseBadge.style.display = is2P ? 'none' : 'flex';
    if (this.hud2PCourseBadge) this.hud2PCourseBadge.style.display = is2P ? 'flex' : 'none';

    if (this.courseSetup1P) this.courseSetup1P.style.display = is2P ? 'none' : 'flex';
    if (this.courseSetup2P) this.courseSetup2P.style.display = is2P ? 'flex' : 'none';

    if (this.modeToggleBtn) {
      this.modeToggleBtn.classList.toggle('active', is2P);
      this.modeToggleBtn.innerHTML = is2P
        ? '👥 <span>2인 전자칠판</span>'
        : '👤 <span>1인 모드</span>';
    }

    if (this.selectMode1PBtn) this.selectMode1PBtn.classList.toggle('active', !is2P);
    if (this.selectMode2PBtn) this.selectMode2PBtn.classList.toggle('active', is2P);
  }

  setCourseSelection(courseId) {
    this.currentCourse = Number(courseId) || 1;
    this.startCourse1P = this.currentCourse;
    this.updateCourseUI();
  }

  updateCourseUI() {
    const cfg = COURSE_CONFIG[this.currentCourse] || COURSE_CONFIG[1];
    if (this.courseBadgeIcon) this.courseBadgeIcon.textContent = cfg.icon;
    if (this.hudCourseSelect) this.hudCourseSelect.value = String(cfg.id);
    if (this.hudCourseTitle) this.hudCourseTitle.textContent = `🎯 ${cfg.shortTitle} 점수`;

    this.courseCardBtns.forEach((btn) => {
      const cId = Number(btn.dataset.course);
      btn.classList.toggle('active', cId === cfg.id);
    });
  }

  cycleSpeedPreset() {
    this.speedIndex = (this.speedIndex + 1) % SPEED_PRESETS.length;
    const preset = SPEED_PRESETS[this.speedIndex];
    if (this.speedIndicator) {
      this.speedIndicator.textContent = preset.label;
    }
    this.sound.speak(`풍선 속도: ${preset.label.replace(/^.*?속도:\s*/, '')}`, 1.0);
  }

  syncMainHUDScore(stageScore, totalScore, pct) {
    if (this.hud1PStageScoreEl) this.hud1PStageScoreEl.textContent = stageScore;
    if (this.hud1PTotalScoreEl) this.hud1PTotalScoreEl.textContent = totalScore;
    if (this.hud1PProgressFill) this.hud1PProgressFill.style.width = `${pct}%`;
  }

  sync2PBannerScores() {
    if (this.hudP1Score) this.hudP1Score.textContent = this.lane1 ? this.lane1.stageScore : 0;
    if (this.hudP2Score) this.hudP2Score.textContent = this.lane2 ? this.lane2.stageScore : 0;
  }

  bindEvents() {
    // 시작 모달: 1인 / 2인 모드 카드 선택
    if (this.selectMode1PBtn) {
      this.selectMode1PBtn.addEventListener('click', () => {
        this.sound.playTap(523.25);
        this.setPlayMode('1p');
      });
    }
    if (this.selectMode2PBtn) {
      this.selectMode2PBtn.addEventListener('click', () => {
        this.sound.playTap(587.33);
        this.setPlayMode('2p');
      });
    }

    // 시작 모달: 1인 모드 7가지 학습 과정 카드 선택
    this.courseCardBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sound.playTap(659.25);
        const cId = Number(btn.dataset.course);
        this.setCourseSelection(cId);
      });
    });

    // 시작 모달: 2인 전자칠판 모드 학생별(1번 친구, 2번 친구) 개별 맞춤 과정 선택
    if (this.miniCourseBtns) {
      this.miniCourseBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const p = btn.dataset.player; // '1' or '2'
          const cId = Number(btn.dataset.course);
          this.sound.playTap(p === '1' ? 523.25 : 659.25);
          if (p === '1') {
            this.startCourseP1_2P = cId;
            document.querySelectorAll('.mini-course-btn[data-player="1"]').forEach((b) => {
              b.classList.toggle('active', Number(b.dataset.course) === cId);
            });
          } else if (p === '2') {
            this.startCourseP2_2P = cId;
            document.querySelectorAll('.mini-course-btn[data-player="2"]').forEach((b) => {
              b.classList.toggle('active', Number(b.dataset.course) === cId);
            });
          }
        });
      });
    }

    // 게임 시작 버튼
    this.startGameBtn.addEventListener('click', () => {
      if (!this.fullscreenStartCheck || this.fullscreenStartCheck.checked) {
        this.enterFullscreen();
      }
      this.sound.initContext();
      this.sound.playTap(659.25);
      this.startModal.classList.remove('active');
      if (this.playMode === '1p') {
        this.startCourse(this.startCourse1P, true);
      } else {
        this.start2PCourse(this.startCourseP1_2P, this.startCourseP2_2P, true);
      }
    });

    // 상단 HUD 과정 변경 드롭다운 (1인 모드 시 실시간 코스 변경)
    if (this.hudCourseSelect) {
      this.hudCourseSelect.addEventListener('change', (e) => {
        this.sound.playTap(587.33);
        const newCourse = Number(e.target.value);
        this.setCourseSelection(newCourse);
        if (this.isPlaying && this.playMode === '1p') {
          this.lane1.setCourse(newCourse, true);
        }
      });
    }

    // 상단 HUD 풍선 속도 조절 버튼
    if (this.speedIndicator) {
      this.speedIndicator.addEventListener('click', () => {
        this.sound.playTap(523.25);
        this.cycleSpeedPreset();
      });
    }

    // 상단 HUD 1인/2인 전환 버튼
    if (this.modeToggleBtn) {
      this.modeToggleBtn.addEventListener('click', () => {
        this.sound.playTap(587.33);
        this.setPlayMode(this.playMode === '1p' ? '2p' : '1p');
      });
    }

    // 다음 학습 과정으로 진행
    this.nextStageBtn.addEventListener('click', () => {
      this.sound.playTap(659.25);
      this.stageClearModal.classList.remove('active');
      if (this.playMode === '1p') {
        const nextCourse = Math.min(7, this.lane1.courseId + 1);
        this.setCourseSelection(nextCourse);
        this.startCourse(nextCourse, false);
      } else {
        // 2인 모드: 150점에 도달한 학생의 과정을 1단계 상승
        const p1Next = Math.min(7, this.lane1.stageScore >= STAGE_GOAL_SCORE ? this.lane1.courseId + 1 : this.lane1.courseId);
        const p2Next = Math.min(7, this.lane2.stageScore >= STAGE_GOAL_SCORE ? this.lane2.courseId + 1 : this.lane2.courseId);
        this.start2PCourse(p1Next, p2Next, false);
      }
    });

    // 현재 과정 다시 하기
    if (this.replayCourseBtn) {
      this.replayCourseBtn.addEventListener('click', () => {
        this.sound.playTap(523.25);
        this.stageClearModal.classList.remove('active');
        if (this.playMode === '1p') {
          this.startCourse(this.lane1.courseId, false);
        } else {
          this.start2PCourse(this.lane1.courseId, this.lane2.courseId, false);
        }
      });
    }

    // 최종 클리어 모달: 다시 놀기
    this.restartGameBtn.addEventListener('click', () => {
      this.sound.playTap(659.25);
      this.allClearModal.classList.remove('active');
      if (this.playMode === '1p') {
        this.startCourse(this.lane1.courseId, false);
      } else {
        this.start2PCourse(this.lane1.courseId, this.lane2.courseId, false);
      }
    });

    // 최종 클리어 모달: 다른 과정 고르기 (시작 모달 열기)
    if (this.chooseOtherCourseBtn) {
      this.chooseOtherCourseBtn.addEventListener('click', () => {
        this.sound.playTap(523.25);
        this.isPlaying = false;
        this.lane1.clearActiveBalloon();
        this.lane2.clearActiveBalloon();
        this.allClearModal.classList.remove('active');
        this.startModal.classList.add('active');
      });
    }

    // 힌트 토글
    this.hintBtn.addEventListener('click', () => {
      this.hintEnabled = !this.hintEnabled;
      this.hintBtn.classList.toggle('active', this.hintEnabled);
      this.hintBtn.innerHTML = this.hintEnabled ? '💡 <span>힌트 켜짐</span>' : '💡 <span>힌트 꺼짐</span>';

      [this.lane1, this.lane2].forEach((lane) => {
        if (this.hintEnabled) {
          lane.startHintCueTimer(HINT_DELAY_MS);
        } else {
          lane.clearHintCueTimer();
          lane.updateHintHighlights();
        }
      });
    });

    // 소리 토글
    this.soundBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.soundBtn.classList.toggle('active', this.sound.enabled);
      this.soundBtn.innerHTML = this.sound.enabled ? '🔊 <span>소리 켜짐</span>' : '🔇 <span>소리 꺼짐</span>';
    });

    // 전체화면 토글
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => {
        this.sound.playTap(587.33);
        this.toggleFullscreen();
      });
    }

    document.addEventListener('fullscreenchange', () => this.updateFullscreenBtnUI());
    document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenBtnUI());

    // 홈으로 이동
    this.homeBtn.addEventListener('click', () => {
      this.sound.playTap(523.25);
      this.isPlaying = false;
      this.lane1.clearActiveBalloon();
      this.lane2.clearActiveBalloon();
      this.stageClearModal.classList.remove('active');
      this.allClearModal.classList.remove('active');
      this.startModal.classList.add('active');
    });
  }

  // 1인 모드 코스 시작
  startCourse(courseId, resetTotal = false) {
    this.currentCourse = Number(courseId) || 1;
    this.startCourse1P = this.currentCourse;
    this.isPlaying = true;
    this.isPaused = false;

    this.updateCourseUI();
    this.updateModeUI();

    this.lane1.setCourse(this.currentCourse, false);
    this.lane1.resetForNewCourse(resetTotal);
    this.lane2.clearActiveBalloon();

    const preset = SPEED_PRESETS[this.speedIndex];
    if (this.speedIndicator) {
      this.speedIndicator.textContent = preset.label;
    }

    setTimeout(() => {
      if (!this.isPlaying) return;
      this.lane1.spawnSingleBalloon(true);
      this.lastFrameTime = performance.now();
      requestAnimationFrame((ts) => this.gameLoop(ts));
    }, 450);
  }

  // 전자칠판 2인 분할 모드 개별 과정 코스 시작
  start2PCourse(courseP1, courseP2, resetTotal = false) {
    this.isPlaying = true;
    this.isPaused = false;

    this.startCourseP1_2P = Number(courseP1) || 1;
    this.startCourseP2_2P = Number(courseP2) || 1;

    this.updateModeUI();

    this.lane1.setCourse(this.startCourseP1_2P, false);
    this.lane1.resetForNewCourse(resetTotal);

    this.lane2.setCourse(this.startCourseP2_2P, false);
    this.lane2.resetForNewCourse(resetTotal);

    const preset = SPEED_PRESETS[this.speedIndex];
    if (this.speedIndicator) {
      this.speedIndicator.textContent = preset.label;
    }

    setTimeout(() => {
      if (!this.isPlaying) return;
      this.lane1.spawnSingleBalloon(true);
      this.lane2.spawnSingleBalloon(false);
      this.lastFrameTime = performance.now();
      requestAnimationFrame((ts) => this.gameLoop(ts));
    }, 450);
  }

  gameLoop(timestamp) {
    if (!this.isPlaying) return;

    const dt = Math.min(0.1, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    if (!this.isPaused) {
      const fallDuration = SPEED_PRESETS[this.speedIndex].fallDuration;
      this.lane1.updateBalloonFrame(dt, fallDuration);
      if (this.playMode === '2p') {
        this.lane2.updateBalloonFrame(dt, fallDuration);
      }
    }

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  // 플레이어가 150점 목표를 달성했을 때 호출 (1P / 2P 개별 과정 반영)
  onCourseGoalReached(winnerPlayerIndex) {
    if (this.isPaused) return;
    this.isPaused = true;

    this.lane1.clearActiveBalloon();
    this.lane2.clearActiveBalloon();

    this.sound.playStageClearFanfare();
    this.fx.celebrationFireworks();

    const is2P = this.playMode === '2p';

    if (!is2P) {
      const curCfg = COURSE_CONFIG[this.lane1.courseId] || COURSE_CONFIG[1];
      if (this.lane1.courseId < 7) {
        const nextCfg = COURSE_CONFIG[this.lane1.courseId + 1];
        this.clearStageBadge.textContent = `${curCfg.shortTitle} 성공!`;
        this.clearTitle.textContent = `우와! ${curCfg.shortTitle} 150점을 모두 모았어요! 🎉`;
        this.clearDesc.innerHTML = `
          ${curCfg.desc}<br />
          이제 다음 과정인 <b>${nextCfg.fullTitle}</b>로 넘어가 볼까요?
        `;
        this.sound.speak(`${curCfg.shortTitle} 성공! 백오십 점을 모두 모았어요! 다음 과정으로 출발해 볼까요?`, 0.95);
        this.stageClearModal.classList.add('active');
      } else {
        // 7과정(종합 랜덤) 클리어!
        this.isPlaying = false;
        this.finalClearBadge.textContent = '모든 학습 과정 마스터!';
        this.finalClearTitle.textContent = '축하합니다! 한글 합자 박사님 탄생! 🎉';
        this.finalTotalScore.textContent = `${this.lane1.totalScore}점`;
        this.sound.speak(`모든 학습 과정 성공! 축하합니다! 모든 글자 풍선을 멋지게 터트렸어요!`, 0.95);
        this.allClearModal.classList.add('active');
      }
    } else {
      // 2인 전자칠판 모드: 학생별 과정 수준 독립 반영
      const winnerLane = winnerPlayerIndex === 1 ? this.lane1 : this.lane2;
      const curCfg = COURSE_CONFIG[winnerLane.courseId] || COURSE_CONFIG[1];

      if (winnerLane.courseId >= 7) {
        this.isPlaying = false;
        this.finalClearBadge.textContent = '전자칠판 2인 종합 게임 성공!';
        this.finalClearTitle.textContent = `🏆 ${winnerPlayerIndex}번 친구 150점 달성! 두 친구 모두 한글 박사님! 🎉`;
        this.finalTotalScore.textContent = `1번 친구 ${this.lane1.stageScore}점 / 2번 친구 ${this.lane2.stageScore}점`;
        this.sound.speak(`종합 랜덤 과정 성공! ${winnerPlayerIndex}번 친구 백오십 점 달성! 두 친구 모두 참 잘했어요!`, 0.95);
        this.allClearModal.classList.add('active');
      } else {
        this.clearStageBadge.textContent = `${winnerPlayerIndex}번 친구 150점 달성!`;
        this.clearTitle.textContent = `🎉 ${winnerPlayerIndex}번 친구 목표 달성! 모두 아주 잘했어요!`;
        this.clearDesc.innerHTML = `
          🟦 1번 친구: <b>${COURSE_CONFIG[this.lane1.courseId].shortTitle} (${this.lane1.stageScore}점)</b><br />
          🟥 2번 친구: <b>${COURSE_CONFIG[this.lane2.courseId].shortTitle} (${this.lane2.stageScore}점)</b><br />
          두 친구의 학습 수준에 맞추어 다음 과정으로 즐겁게 전진해 볼까요?
        `;
        this.sound.speak(`${winnerPlayerIndex}번 친구 백오십 점 달성! 두 친구 모두 참 잘했어요! 다음 과정으로 출발해 볼까요?`, 0.95);
        this.stageClearModal.classList.add('active');
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new HangulBalloonGame();
});
