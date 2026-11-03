"""Browser regressions. Run: python3 -m unittest discover -s tests -v
Requires Python Playwright and Chromium (CHROMIUM_PATH may override its path).
"""
import functools
import http.server
import os
from pathlib import Path
import threading
import unittest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class ClassroomTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'),
            args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self.page = self.browser.new_page(viewport={'width': 1280, 'height': 800})
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        # Expose only the already-created instance; production files stay unchanged.
        source = (ROOT / 'script.js').read_text().replace(
            'new HangulBalloonGame();', 'window.game = new HangulBalloonGame();')
        self.page.route('**/script.js', lambda route: route.fulfill(
            body=source, content_type='application/javascript'))
        self.page.route('https://fonts.googleapis.com/**', lambda route: route.abort())
        self.page.goto(f'http://127.0.0.1:{self.server.server_port}', wait_until='domcontentloaded')
        self.page.evaluate('game.sound.enabled = false')

    def tearDown(self):
        self.page.close()
        self.assertEqual(self.errors, [])

    def start(self, p1=1, p2=None):
        self.page.evaluate('''([p1,p2]) => {
            game.startModal.classList.remove('active');
            if (p2 !== null) { game.setPlayMode('2p'); game.start2PCourse(p1,p2,true); }
            else game.startCourse(p1,true);
        }''', [p1, p2])
        self.page.wait_for_timeout(500)

    def test_courses_and_review_pool(self):
        self.assertEqual(self.page.locator('.course-card-btn').count(), 11)
        self.assertEqual(self.page.locator('.mini-course-btn').count(), 22)
        self.assertEqual(self.page.locator('#p1-course-select option').count(), 11)
        self.assertEqual(self.page.evaluate('buildTargetPool(COURSE_CONFIG[11].vowels).length'), 140)
        self.assertEqual(self.page.evaluate("['ㅑ','ㅕ','ㅛ','ㅠ'].map(v=>combineHangul('ㄱ',v))"), ['갸','겨','교','규'])
        self.start(11, 7)
        self.assertEqual(self.page.locator('#p1-vowel-grid button').count(), 10)
        self.assertEqual(self.page.locator('#p2-vowel-grid button').all_text_contents(), ['ㅣ','ㅑ'])
        self.assertEqual(self.page.evaluate("getComputedStyle(game.lane1.vowelGrid).gridTemplateColumns.split(' ').length"), 5)
        self.assertEqual(self.page.evaluate("getComputedStyle(game.lane1.vowelGrid).gridTemplateRows.split(' ').length"), 2)

    def test_independent_hints_and_mode_persistence(self):
        self.page.locator('#course-setup-2p').evaluate("el => el.style.display='block'")
        self.page.locator('#course-setup-2p [data-player-hint="1"]').click()
        self.start(7, 10)
        self.page.wait_for_timeout(2100)
        self.assertTrue(self.page.locator('#p1-helper-card').evaluate("el=>el.classList.contains('hidden-hint')"))
        self.assertEqual(self.page.locator('#p1-vowel-grid .hint-glow').count(), 0)
        self.assertEqual(self.page.locator('#p2-vowel-grid .hint-glow').count(), 1)
        self.assertTrue(self.page.locator('#hint-btn').is_hidden())
        self.page.locator('#p1-score-box [data-player-hint="1"]').click()
        self.assertEqual(self.page.locator('[data-player-hint="1"][aria-pressed="true"]').count(), 2)
        self.page.locator('#p2-score-box [data-player-hint="2"]').click()
        self.page.evaluate("game.lane2.setCourse(8,true); game.setPlayMode('1p'); game.setPlayMode('2p')")
        self.assertEqual(self.page.evaluate('[game.lane1.isHintEnabled,game.lane2.isHintEnabled]'), [True, False])
        self.assertEqual(self.page.locator('#p2-vowel-grid .hint-glow').count(), 0)

    def test_new_vowels_complete_scoring(self):
        for course in [7, 8, 9, 10]:
            with self.subTest(course=course):
                self.start(course)
                target = self.page.evaluate('game.lane1.activeBalloon.target')
                self.page.locator(f'#p1-consonant-grid [data-consonant="{target["c"]}"]').click()
                self.page.locator(f'#p1-vowel-grid [data-vowel="{target["v"]}"]').click()
                self.page.wait_for_function('game.lane1.stageScore === 10', timeout=7000)
                self.page.wait_for_function('!game.lane1.isFiring', timeout=2000)
                self.assertEqual(self.page.locator('#p1-projectile-layer > *').count(), 0)

    def test_previous_answer_cannot_score_new_course(self):
        self.start(7)
        self.page.evaluate('''() => {const l=game.lane1; l.selectedConsonant=l.activeBalloon.target.c;
            l.selectedVowel=l.activeBalloon.target.v; l.checkCombineAttempt(); l.setCourse(8,true);}''')
        self.page.wait_for_timeout(6000)
        self.assertEqual(self.page.evaluate('game.lane1.stageScore'), 0)
        self.assertFalse(self.page.evaluate('game.lane1.activeBalloon.popped'))
        self.assertFalse(self.page.evaluate('game.lane1.isFiring'))

    def test_course_completion_advances_until_eleven(self):
        self.start(10)
        self.page.evaluate('game.onCourseGoalReached(1)')
        self.assertTrue(self.page.locator('#stage-clear-modal').is_visible())
        self.page.locator('#next-stage-btn').click()
        self.page.wait_for_timeout(500)
        self.assertEqual(self.page.evaluate('game.lane1.courseId'), 11)
        self.page.evaluate('game.onCourseGoalReached(1)')
        self.assertTrue(self.page.locator('#all-clear-modal').is_visible())

    def test_restarting_keeps_one_frame_loop(self):
        self.start()
        self.page.evaluate('''() => {const original=game.gameLoop.bind(game); window.stamps=[];
            game.gameLoop=t=>{stamps.push(t);original(t)};}''')
        for course in [7, 8, 11]:
            self.page.evaluate('(c)=>game.startCourse(c,false)', course)
            self.page.wait_for_timeout(550)
        self.page.evaluate('stamps=[]')
        self.page.wait_for_timeout(500)
        self.assertGreater(self.page.evaluate('stamps.length'), 2)
        self.assertTrue(self.page.evaluate('stamps.length === new Set(stamps).size'))

    def test_review_keyboard_fits_split_screen(self):
        for width, height in [(1920,1080), (1280,800), (1024,768)]:
            with self.subTest(width=width):
                self.page.set_viewport_size({'width':width,'height':height})
                self.start(11,11)
                self.assertTrue(self.page.evaluate('''() => [...document.querySelectorAll('.vowel-btn')].every(b=>{
                    const r=b.getBoundingClientRect(),p=b.parentElement.getBoundingClientRect();
                    return r.width>=32 && r.height>=32 && r.left>=p.left-1 && r.right<=p.right+1 && r.bottom<=p.bottom+1;
                })'''))


if __name__ == '__main__':
    unittest.main()
