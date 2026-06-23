import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePoints } from '../../contexts/PointsContext';
import { useMathBoss } from '../../contexts/MathBossContext';
import type { AttackType } from '../../contexts/MathBossContext';
import { MATH_BOSSES, MINECRAFT_BOSSES, PVZ_BOSSES, TANK_BOSSES, MATH_BOSS_COST, MINECRAFT_BOSS_COST, PLAYER_MAX_HEARTS } from '../../types';
import type { HiddenTheme } from '../../types';
import BossAvatar from '../../components/BossAvatar';
import HeroAvatar from '../../components/HeroAvatar';
import styles from '../../styles/MathBoss.module.css';

type AnswerState = 'input' | 'correct' | 'wrong' | 'choosing' | 'wrongFeedback';
type AnimPhase = 'idle' | 'playerAttack' | 'bossHurt' | 'bossDefeat' | 'bossAttack' | 'playerHurt' | 'playerDefeat' | 'bossEntrance' | 'shadowStrike' | 'risingDragon';

// Boss专属弹幕颜色
const BOSS_PROJ_COLORS: Record<string, string> = {
  skeleton: '#4ADE80', bat: '#A855F7', treant: '#84CC16', knight: '#60A5FA',
  golem: '#F97316', spirit: '#22D3EE', dragon: '#EF4444', frostlord: '#93C5FD',
  thunderbeast: '#A78BFA', demonlord: '#DC2626',
  zombie: '#7BC74D', mc_skeleton: '#E5E7EB', creeper: '#81C784', enderman: '#8B5CF6',
  blaze: '#FBBF24', wither: '#6B7280', ender_dragon: '#EC4899',
  pvz_basic: '#9ACD32', pvz_cone: '#FFA500', pvz_bucket: '#A9A9A9', pvz_disco: '#FF69B4',
  pvz_football: '#DC143C', pvz_gargantuar: '#D2691E', pvz_zomboss: '#8B00FF',
  tank_darkbear: '#EF4444', tank_xiaozha: '#A855F7', tank_sherman: '#60A5FA', tank_xiaoban: '#22D3EE',
  tank_xiaolv: '#4ADE80', tank_zhuguli: '#F59E0B', tank_dahu: '#F97316',
};

// 技能信息
const SKILL_INFO: Record<string, { name: string; icon: string; damage: number; desc: string }> = {
  normal: { name: '普通攻击', icon: '⚔️', damage: 1, desc: '-1❤️' },
  shadowStrike: { name: '暗影突刺', icon: '🌑', damage: 2, desc: '-2❤️ 消耗连击' },
  risingDragon: { name: '升龙斩', icon: '🐉', damage: 3, desc: '-3❤️ 消耗连击' },
};

export default function MathBossPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { balance: pointBalance, refreshBalance } = usePoints();
  const {
    phase, gameMode, currentBossIndex, currentQuestion,
    bossHearts, playerHearts, bossesDefeated,
    comboCount, maxCombo, reward,
    todayPlayCount, todayBestScore,
    hiddenUnlocked, hiddenTheme, unlockedSkins, equippedSkin, equipSkin, hiddenTodayPlayCount,
    startGame, checkAnswer, applyAttack, advanceToNextBoss, fetchNextQuestion, finishGame, resetGame,
    refreshStatus, refreshHiddenStatus, refreshSkins,
  } = useMathBoss();

  const [inputValue, setInputValue] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('input');
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle');
  const [showCombo, setShowCombo] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [screenEffect, setScreenEffect] = useState<string | null>(null);
  const [showScreenFlash, setShowScreenFlash] = useState(false);
  const [lostHeartIndex, setLostHeartIndex] = useState(-1);
  const [prevPlayerHearts, setPrevPlayerHearts] = useState(PLAYER_MAX_HEARTS);
  const [correctAnswer, setCorrectAnswer] = useState<number | string | null>(null);
  const [showDefeatBurst, setShowDefeatBurst] = useState(false);
  const [defeatedBossName, setDefeatedBossName] = useState('');
  const [showUnlockCelebration, setShowUnlockCelebration] = useState(false);
  const [isFinishing] = useState(false);
  // 技能选择
  const [availableSkills, setAvailableSkills] = useState<AttackType[]>([]);
  const [lastDamage, setLastDamage] = useState(1);
  // 浮动伤害数字
  const [floatingDmg, setFloatingDmg] = useState<{value: number; color: string; x: number; y: number; isCritical: boolean; slideRight?: boolean} | null>(null);
  // Boss专属受击颜色
  const [bossHitColor, setBossHitColor] = useState('#EF4444');
  // 命中爆炸特效
  const [hitExplosion, setHitExplosion] = useState<{ side: 'boss' | 'player'; color: string } | null>(null);
  // Boss出场标题卡
  const [showBossTitleCard, setShowBossTitleCard] = useState(false);
  // 技能分步特效
  const [skillEffects, setSkillEffects] = useState<string[]>([]);

  const bossArray = gameMode === 'hidden'
    ? (hiddenTheme === 'pvz' ? PVZ_BOSSES : hiddenTheme === 'tank' ? TANK_BOSSES : MINECRAFT_BOSSES)
    : MATH_BOSSES;

  useEffect(() => {
    if (user) {
      refreshBalance(user.id);
      refreshStatus(user.id);
      refreshHiddenStatus(user.id);
      refreshSkins(user.id);
    }
  }, [user, refreshBalance, refreshStatus, refreshHiddenStatus, refreshSkins]);

  // 切换Boss时重置
  useEffect(() => {
    setInputValue('');
    setAnswerState('input');
    setShowCombo(false);
    setShowFlash(false);
    setCorrectAnswer(null);
    setShowDefeatBurst(false);
    setAvailableSkills([]);
    if (phase === 'playing') {
      setAnimPhase('bossEntrance');
      setShowBossTitleCard(true);
      setTimeout(() => setAnimPhase('idle'), 1300);
      setTimeout(() => setShowBossTitleCard(false), 1200);
    } else {
      setAnimPhase('idle');
    }
  }, [currentBossIndex]);

  // 追踪玩家心丢失
  useEffect(() => {
    if (playerHearts < prevPlayerHearts) {
      setLostHeartIndex(playerHearts);
      setTimeout(() => setLostHeartIndex(-1), 600);
    }
    setPrevPlayerHearts(playerHearts);
  }, [playerHearts, prevPlayerHearts]);

  // ===== 普通模式：数字输入 =====
  const handleNumClick = useCallback((num: number) => {
    if (answerState !== 'input') return;
    setInputValue(prev => {
      const next = prev + String(num);
      if (next.length > 3) return prev;
      return next;
    });
  }, [answerState]);

  const handleDelete = useCallback(() => {
    if (answerState !== 'input') return;
    setInputValue(prev => prev.slice(0, -1));
  }, [answerState]);

  // ===== 确认答案 =====
  const handleConfirm = useCallback(() => {
    if (answerState !== 'input' || !inputValue || animPhase !== 'idle' || isFinishing) return;
    const numAnswer = parseInt(inputValue, 10);

    const result = checkAnswer(numAnswer);
    setCorrectAnswer(result.correctAnswer);

    if (!result.isCorrect) {
      // 答错：显示反馈，等待用户点确认
      const isGameOver = result.gameOver;
      setAnswerState(isGameOver ? 'wrong' : 'wrongFeedback');
      setAnimPhase('bossAttack');
      setScreenEffect('shakeLight');

      // Boss攻击浮动伤害
      const isHardBoss = gameMode !== 'hidden' && currentBossIndex >= 7;
      const heartLoss = isHardBoss ? 2 : 1;
      const boss = bossArray[currentBossIndex];
      const projColor = BOSS_PROJ_COLORS[boss?.icon ?? ''] || '#EF4444';
      setBossHitColor(projColor);
      setFloatingDmg({ value: heartLoss, color: projColor, x: 30, y: 40, isCritical: false, slideRight: true });
      setTimeout(() => setFloatingDmg(null), 1000);
      setTimeout(() => {
        setAnimPhase('playerHurt');
        setHitExplosion({ side: 'player', color: projColor });
        setTimeout(() => { setScreenEffect(null); setHitExplosion(null); }, 600);
      }, 400);

      if (isGameOver) {
        setTimeout(() => {
          setAnimPhase('playerDefeat');
          setTimeout(() => {
            if (user) finishGame(user.id);
          }, 1000);
        }, 800);
      }
      // 不再自动跳题，等待 handleWrongConfirm
      return;
    }

    // 答对 — 先显示"正确"
    setAnswerState('correct');

    // 有技能可选？
    const hasSkills = result.availableSkills.length > 1;
    if (hasSkills) {
      // 显示技能选择
      setAvailableSkills(result.availableSkills);
      setAnswerState('choosing');
    } else {
      // 直接普通攻击
      doAttack('normal');
    }
  }, [answerState, inputValue, animPhase, isFinishing, user, checkAnswer, fetchNextQuestion, finishGame]);

  // ===== 选择技能后执行攻击 =====
  const handleSkillChoice = useCallback((type: AttackType) => {
    setAvailableSkills([]);
    doAttack(type);
  }, []);

  const doAttack = useCallback((type: AttackType) => {
    const atkResult = applyAttack(type);
    setLastDamage(atkResult.damage);
    const boss = bossArray[currentBossIndex];
    const projColor = BOSS_PROJ_COLORS[boss.icon] || boss.color;

    // Boss受击颜色
    setBossHitColor(projColor);

    // 浮动伤害数字
    setFloatingDmg({ value: atkResult.damage, color: type === 'normal' ? '#FFD700' : type === 'shadowStrike' ? '#A855F7' : '#EF4444', x: 65, y: 30, isCritical: type !== 'normal' });
    setTimeout(() => setFloatingDmg(null), 800);

    // 动画阶段
    if (type === 'shadowStrike') {
      setAnimPhase('shadowStrike');
      // 暗影突刺分步特效
      setSkillEffects(['vignette']);
      setTimeout(() => setSkillEffects(['vignette', 'charge']), 150);
      setTimeout(() => setSkillEffects(['vignette', 'dash']), 450);
      setTimeout(() => setSkillEffects(['crossSlash']), 750);
      setTimeout(() => { setShowFlash(true); setSkillEffects([]); }, 950);
      setTimeout(() => setShowFlash(false), 1150);
      setScreenEffect('shakeMedium');
      setTimeout(() => setScreenEffect(null), 400);
    } else if (type === 'risingDragon') {
      setAnimPhase('risingDragon');
      // 升龙斩分步特效
      setSkillEffects(['vignette']);
      setScreenEffect('shakeLight');
      setTimeout(() => setScreenEffect(null), 200);
      setTimeout(() => setSkillEffects(['vignette', 'charge']), 200);
      setTimeout(() => setSkillEffects(['launch']), 500);
      setTimeout(() => { setSkillEffects(['fireRain']); setScreenEffect('shakeVertical'); }, 850);
      setTimeout(() => setScreenEffect(null), 400);
      setTimeout(() => { setShowFlash(true); setSkillEffects([]); }, 1150);
      setTimeout(() => setShowFlash(false), 1350);
    } else {
      setAnimPhase('playerAttack');
      setScreenEffect('shakeLight');
      setTimeout(() => setScreenEffect(null), 300);
    }

    setTimeout(() => {
      setAnimPhase('bossHurt');
      // 命中爆炸特效
      const hitColor = type === 'shadowStrike' ? '#A855F7' : type === 'risingDragon' ? '#EF4444' : '#FFD700';
      setHitExplosion({ side: 'boss', color: hitColor });
      setTimeout(() => setHitExplosion(null), 800);
    }, 500);

    // 连击/技能特效
    setTimeout(() => {
      if (type === 'normal' && comboCount + 1 >= 2) setShowCombo(true);
      if (type === 'shadowStrike' || type === 'risingDragon') {
        // skillEffects handles flash
      }
    }, 600);

    if (atkResult.bossDefeated) {
      setTimeout(() => setAnimPhase('bossDefeat'), 1000);
      setTimeout(() => {
        // 白屏闪光
        setShowScreenFlash(true);
        setTimeout(() => setShowScreenFlash(false), 250);
      }, 1050);
      setTimeout(() => {
        setShowDefeatBurst(true);
        setDefeatedBossName(boss.name);
        setScreenEffect('shakeHeavy');
        setTimeout(() => setScreenEffect(null), 500);
      }, 1300);
      setTimeout(() => {
        setShowDefeatBurst(false);
        setAnimPhase('idle');
        setAnswerState('input');
        setInputValue('');
        setSkillEffects([]);
        if (atkResult.allBossesCleared) {
          if (user) finishGame(user.id).then(res => {
            if (res?.unlockedHidden) setShowUnlockCelebration(true);
          });
        } else {
          advanceToNextBoss();
          fetchNextQuestion();
        }
      }, 2200);
    } else {
      setTimeout(() => {
        setAnimPhase('idle');
        setAnswerState('input');
        setInputValue('');
        setSkillEffects([]);
        fetchNextQuestion();
      }, 1100);
    }
  }, [applyAttack, bossArray, currentBossIndex, comboCount, user, advanceToNextBoss, fetchNextQuestion, finishGame]);

  // ===== 答错后点确认进入下一题 =====
  const handleWrongConfirm = useCallback(() => {
    setAnimPhase('idle');
    setAnswerState('input');
    setInputValue('');
    fetchNextQuestion();
  }, [fetchNextQuestion]);
  const handleStartGame = useCallback(async () => {
    if (!user) return;
    const result = await startGame(user.id, 'normal');
    if (!result.success) alert(result.error || '开始挑战失败');
  }, [user, startGame]);

  const handleStartHiddenGame = useCallback(async (theme: HiddenTheme = 'minecraft') => {
    if (!user) return;
    const result = await startGame(user.id, 'hidden', theme);
    if (!result.success) alert(result.error || '开始挑战失败');
  }, [user, startGame]);

  const handlePlayAgain = useCallback(() => {
    setShowUnlockCelebration(false);
    resetGame();
  }, [resetGame]);

  const handleGoHome = useCallback(() => {
    resetGame();
    navigate('/student/dashboard');
  }, [resetGame, navigate]);

  // ===== 渲染：空闲 =====
  const renderIdle = () => {
    const canAfford = pointBalance >= MATH_BOSS_COST;
    const todayRemaining = Math.max(0, 2 - todayPlayCount);
    const hiddenRemaining = Math.max(0, 2 - hiddenTodayPlayCount);

    return (
      <>
        <div className={styles.statusCard}>
          <div className={styles.statusItem}>
            <div className={styles.statusValue}>{todayRemaining}</div>
            <div className={styles.statusLabel}>今日剩余</div>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusValue}>{todayBestScore}/10</div>
            <div className={styles.statusLabel}>最佳成绩</div>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusValue}>⭐{pointBalance}</div>
            <div className={styles.statusLabel}>我的积分</div>
          </div>
        </div>

        <div className={styles.bossGrid}>
          {MATH_BOSSES.map((boss, i) => (
            <div key={i} className={`${styles.bossCell} ${styles.locked}`}>
              <span className={styles.bossCellIndex}>{i + 1}</span>
              <BossAvatar icon={boss.icon} color={boss.color} glowColor={boss.glowColor} size={48} />
              <span className={styles.bossName}>{boss.name}</span>
              <span className={styles.bossCellHearts}>{'❤️'.repeat(boss.hearts)}</span>
            </div>
          ))}
        </div>

{/* 皮肤选择 */}
        {unlockedSkins.length > 0 && (
          <div className={styles.skinPanel}>
            <div className={styles.skinPanelTitle}>🎨 变身皮肤（替换你的战斗形象）</div>
            <div className={styles.skinGrid}>
              <button
                className={`${styles.skinCard} ${!equippedSkin ? styles.skinActive : ''}`}
                onClick={() => equipSkin(null)}
              >
                <div className={styles.skinPreview}>🧑</div>
                <span className={styles.skinLabel}>小勇士</span>
              </button>
              {unlockedSkins.map(skin => {
                const allBosses = [...MINECRAFT_BOSSES, ...PVZ_BOSSES, ...TANK_BOSSES];
                const bossDef = allBosses.find(b => b.icon === skin.bossIcon);
                if (!bossDef) return null;
                return (
                  <button
                    key={skin.id}
                    className={`${styles.skinCard} ${equippedSkin === skin.bossIcon ? styles.skinActive : ''}`}
                    onClick={() => equipSkin(skin.bossIcon)}
                  >
                    <BossAvatar icon={bossDef.icon} color={bossDef.color} glowColor={bossDef.glowColor} size={36} />
                    <span className={styles.skinLabel}>{bossDef.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          className={styles.startBtn}
          onClick={handleStartGame}
          disabled={!canAfford || todayRemaining <= 0}
        >
          ⚔️ 开始挑战
        </button>
        <div className={styles.startCost}>
          {todayRemaining <= 0
            ? '今天已挑战2次，明天再来吧！'
            : canAfford
              ? `消耗 ${MATH_BOSS_COST} 积分入场 · 今日还剩${todayRemaining}次`
              : `积分不足（需要 ${MATH_BOSS_COST} 积分）`
          }
        </div>

        {/* 隐藏关卡传送门 — 当天随机分配一个主题 */}
        {hiddenUnlocked && (() => {
          const themeBosses = hiddenTheme === 'pvz' ? PVZ_BOSSES : hiddenTheme === 'tank' ? TANK_BOSSES : MINECRAFT_BOSSES;
          const themeLabel = hiddenTheme === 'pvz' ? '🌻 植物大战僵尸' : hiddenTheme === 'tank' ? '🔫 超能装甲兵团' : '🌀 我的世界';
          const themeIcon = hiddenTheme === 'pvz' ? '🧟' : hiddenTheme === 'tank' ? '💥' : '🌌';
          return (
            <div className={styles.hiddenPortalSection}>
              <div className={styles.hiddenPortalDivider}>
                <span className={styles.hiddenPortalDividerLine} />
                <span className={styles.hiddenPortalDividerText}>??? 今日隐藏区域 ???</span>
                <span className={styles.hiddenPortalDividerLine} />
              </div>
              <div className={styles.themeCards}>
                <div className={styles.themeCard}>
                  <div className={styles.themeGlow} />
                  <div className={styles.themeTitle}>{themeLabel}</div>
                  <div className={styles.themeBossPreview}>
                    {themeBosses.map((b, i) => (
                      <div key={i} className={styles.themeBossIcon}>
                        <BossAvatar icon={b.icon} color={b.color} glowColor={b.glowColor} size={24} />
                      </div>
                    ))}
                  </div>
                  <button
                    className={hiddenTheme === 'pvz' ? styles.themeBtnPvz : hiddenTheme === 'tank' ? styles.themeBtnTank : styles.themeBtn}
                    onClick={() => handleStartHiddenGame(hiddenTheme)}
                    disabled={!canAfford || hiddenRemaining <= 0}
                  >
                    {themeIcon} 进入
                  </button>
                </div>
              </div>
              <div className={styles.startCost}>
                {hiddenRemaining <= 0
                  ? '隐藏关卡今天已挑战2次'
                  : canAfford
                    ? `消耗 ${MINECRAFT_BOSS_COST} 积分入场 · 隐藏还剩${hiddenRemaining}次`
                    : `积分不足（需要 ${MINECRAFT_BOSS_COST} 积分）`
                }
              </div>
            </div>
          );
        })()}
      </>
    );
  };

  // ===== 渲染：战斗中 =====
  const renderPlaying = () => {
    const boss = bossArray[currentBossIndex];
    const question = currentQuestion;
    if (!boss || !question) return null;

    const isHidden = gameMode === 'hidden';
    const isCorrect = answerState === 'correct';
    const isWrong = answerState === 'wrong' || answerState === 'wrongFeedback';
    const isChoosing = answerState === 'choosing';
    const currentBossHearts = bossHearts[currentBossIndex] ?? boss.hearts;

    const playerAnimClass =
      animPhase === 'playerAttack' || animPhase === 'shadowStrike' || animPhase === 'risingDragon' ? styles.attackRight :
      animPhase === 'playerHurt' ? styles.hurt :
      '';

    const bossAnimClass =
      animPhase === 'bossHurt' ? styles.hit :
      animPhase === 'bossAttack' ? styles.attackLeft :
      animPhase === 'bossDefeat' ? styles.dying :
      animPhase === 'bossEntrance' ? styles.entrance :
      '';

    const showPlayerProjectile = animPhase === 'playerAttack' || animPhase === 'shadowStrike' || animPhase === 'risingDragon';
    const showBossProjectile = animPhase === 'bossAttack';

    // 技能特效
    const isSkillAnim = animPhase === 'shadowStrike' || animPhase === 'risingDragon';

    return (
      <div className={`${styles.battleZone} ${isHidden ? styles.hiddenBattle : ''}`}>
        {/* 进度条 */}
        <div className={styles.progressBar}>
          {bossArray.map((_, i) => (
            <div
              key={i}
              className={`${styles.progressDot} ${
                i < currentBossIndex
                  ? (bossHearts[i] <= 0 ? styles.done : styles.fail)
                  : i === currentBossIndex
                    ? styles.active
                    : ''
              }`}
            />
          ))}
        </div>

        {/* 连击显示 + 退出 */}
        <div className={styles.comboBar}>
          <span className={`${styles.comboIndicator} ${comboCount >= 5 ? styles.combo5 : comboCount >= 3 ? styles.combo3 : ''}`}>
            🔥 {comboCount} 连击
          </span>
          <button className={styles.quitBtn} onClick={handleGoHome}>✕ 退出</button>
        </div>

        {/* 战斗舞台 */}
        <div className={`${styles.battleStage} ${screenEffect ? styles[screenEffect] : ''}`}>
          {/* 氛围粒子 — 使用Boss主题色 */}
          {[
            { x: '8%', bottom: '10%', dur: '7s', sway: '5s', delay: '0s', size: '3px', opacity: 0.15 },
            { x: '25%', bottom: '20%', dur: '9s', sway: '4s', delay: '1.2s', size: '2px', opacity: 0.1 },
            { x: '42%', bottom: '5%', dur: '6s', sway: '6s', delay: '0.5s', size: '4px', opacity: 0.2 },
            { x: '58%', bottom: '15%', dur: '8s', sway: '3.5s', delay: '2s', size: '2px', opacity: 0.12 },
            { x: '75%', bottom: '8%', dur: '10s', sway: '5s', delay: '0.8s', size: '3px', opacity: 0.18 },
            { x: '90%', bottom: '25%', dur: '7.5s', sway: '4.5s', delay: '1.5s', size: '2px', opacity: 0.1 },
            { x: '15%', bottom: '30%', dur: '11s', sway: '3s', delay: '3s', size: '3px', opacity: 0.08 },
            { x: '65%', bottom: '12%', dur: '8.5s', sway: '5.5s', delay: '2.5s', size: '2px', opacity: 0.12 },
          ].map((p, i) => (
            <div
              key={`amb-${i}`}
              className={styles.ambientParticle}
              style={{
                left: p.x,
                bottom: p.bottom,
                '--ambient-duration': p.dur,
                '--ambient-sway-duration': p.sway,
                '--ambient-delay': p.delay,
                '--ambient-size': p.size,
                '--ambient-opacity': p.opacity,
                '--ambient-color': `${boss.glowColor}99`,
              } as React.CSSProperties}
            />
          ))}
          {/* 能量波 */}
          {[
            { delay: '0s', dur: '9s' },
            { delay: '4.5s', dur: '11s' },
          ].map((w, i) => (
            <div
              key={`wave-${i}`}
              className={styles.ambientWave}
              style={{
                '--ambient-delay': w.delay,
                '--ambient-wave-duration': w.dur,
                '--ambient-color': `${boss.glowColor}40`,
              } as React.CSSProperties}
            />
          ))}

          {/* 连击边缘发光 */}
          {comboCount >= 2 && (
            <div className={`${styles.comboEdgeGlow} ${comboCount >= 7 ? styles.combo7 : comboCount >= 5 ? styles.combo5 : comboCount >= 3 ? styles.combo3 : ''}`} />
          )}

          {/* 技能闪光 */}
          {isSkillAnim && <div className={`${styles.comboFlash} ${styles.skillFlash}`} />}
          {showFlash && <div className={styles.comboFlash} />}

          {/* 浮动伤害数字 — 暴击弹出+逐位动画 */}
          {floatingDmg && (
            <div
              className={`${styles.floatingDmg} ${floatingDmg.isCritical ? styles.floatingDmgCrit : ''} ${floatingDmg.slideRight ? styles.floatingDmgSlideRight : ''}`}
              style={{ left: `${floatingDmg.x}%`, top: `${floatingDmg.y}%`, color: floatingDmg.color }}
            >
              {floatingDmg.isCritical ? (
                String(floatingDmg.value).split('').map((digit, i) => (
                  <span key={i} className={styles.floatingDmgDigit} style={{ animationDelay: `${i * 0.05}s` }}>
                    {digit}
                  </span>
                ))
              ) : (
                `-${floatingDmg.value}`
              )}
            </div>
          )}

          {/* Boss受击闪光 — 颜色匹配Boss */}
          {animPhase === 'bossHurt' && (
            <div className={styles.bossHitFlash} style={{ background: `radial-gradient(circle, ${bossHitColor}44, transparent 70%)` }} />
          )}

          {/* 命中爆炸特效 — 冲击波+火花+闪光 */}
          {hitExplosion && (
            <div className={`${styles.hitExplosion} ${hitExplosion.side === 'boss' ? styles.bossSide : styles.playerSide}`}>
              <div className={styles.impactRing} style={{ borderColor: hitExplosion.color }} />
              <div className={styles.impactFlash} style={{ boxShadow: `0 0 20px ${hitExplosion.color}` }} />
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const dist = 30 + (i % 3) * 15;
                return (
                  <div
                    key={i}
                    className={styles.impactSpark}
                    style={{
                      background: hitExplosion.color,
                      '--spark-x': `${Math.cos(angle) * dist}px`,
                      '--spark-y': `${Math.sin(angle) * dist}px`,
                      animationDelay: `${i * 0.02}s`,
                    } as React.CSSProperties}
                  />
                );
              })}
            </div>
          )}

          {/* 连击特效 */}
          {showCombo && comboCount >= 2 && !isChoosing && (
            <div className={styles.comboDisplay}>
              <div className={`${styles.comboText} ${comboCount >= 7 ? styles.comboCrazy : comboCount >= 5 ? styles.superCombo : comboCount >= 3 ? styles.greatCombo : ''} ${comboCount >= 5 ? styles.comboTextShake : ''}`}>
                {comboCount >= 7 ? '🔥🔥🔥 疯狂连击！' : comboCount >= 5 ? '🔥 超连击！' : comboCount >= 3 ? '⚡ 大连击！' : `🔥 ${comboCount}连击！`}
              </div>
            </div>
          )}

          {/* 技能动画覆盖层 */}
          {isSkillAnim && (
            <div className={`${styles.skillOverlay} ${animPhase === 'shadowStrike' ? styles.shadowOverlay : styles.dragonOverlay}`}>
              <div className={styles.skillSlash}>
                {animPhase === 'shadowStrike' ? '🌑⚔️🌑' : '🐉🔥🐉'}
              </div>
              <div className={styles.skillName}>
                {animPhase === 'shadowStrike' ? '暗影突刺！' : '升龙斩！'}
              </div>
            </div>
          )}

          {/* 技能分步特效 */}
          {skillEffects.includes('vignette') && (
            <div className={`${styles.skillVignette} ${animPhase === 'shadowStrike' ? styles.shadow : styles.dragon}`} />
          )}
          {skillEffects.includes('charge') && (
            <div className={`${styles.skillCharge} ${animPhase === 'shadowStrike' ? styles.shadow : styles.dragon}`} />
          )}
          {skillEffects.includes('dash') && (
            <div className={styles.dashTrail} />
          )}
          {skillEffects.includes('crossSlash') && (
            <>
              <div className={`${styles.slashLine} ${styles.slash1}`} style={{ background: `linear-gradient(90deg, transparent, #A78BFA, #7C3AED)`, boxShadow: `0 0 10px #A78BFA` }} />
              <div className={`${styles.slashLine} ${styles.slash2}`} style={{ background: `linear-gradient(90deg, transparent, #A78BFA, #7C3AED)`, boxShadow: `0 0 10px #A78BFA` }} />
            </>
          )}
          {skillEffects.includes('launch') && (
            <div className={styles.skillLaunch} />
          )}
          {skillEffects.includes('fireRain') && (
            <>
              {[
                { left: 24, top: 8, fall: 72, color: '#FCD34D', glow: '#FCD34D' },
                { left: 38, top: 15, fall: 85, color: '#EF4444', glow: '#EF4444' },
                { left: 52, top: 6, fall: 68, color: '#F97316', glow: '#EF4444' },
                { left: 65, top: 12, fall: 90, color: '#FCD34D', glow: '#FCD34D' },
                { left: 30, top: 18, fall: 75, color: '#EF4444', glow: '#EF4444' },
                { left: 48, top: 10, fall: 82, color: '#F97316', glow: '#EF4444' },
                { left: 58, top: 22, fall: 65, color: '#FCD34D', glow: '#FCD34D' },
                { left: 72, top: 8, fall: 78, color: '#F97316', glow: '#EF4444' },
                { left: 35, top: 14, fall: 88, color: '#EF4444', glow: '#EF4444' },
                { left: 44, top: 5, fall: 70, color: '#FCD34D', glow: '#FCD34D' },
              ].map((p, i) => (
                <div
                  key={`fire-${i}`}
                  className={styles.fireRainParticle}
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    background: p.color,
                    boxShadow: `0 0 6px ${p.glow}`,
                    '--fire-fall': `${p.fall}px`,
                    animationDelay: `${i * 0.04}s`,
                  } as React.CSSProperties}
                />
              ))}
            </>
          )}

          {/* 玩家弹幕 — 斩击轨迹 */}
          {showPlayerProjectile && !isSkillAnim && (
            <div className={styles.slashTrail} />
          )}

          {/* 技能弹幕 — 能量球 */}
          {showPlayerProjectile && isSkillAnim && (
            <div className={`${styles.energyProjectile} ${animPhase === 'shadowStrike' ? styles.shadow : styles.dragon}`} />
          )}

          {/* Boss弹幕 — Boss主题色轨迹 */}
          {showBossProjectile && (
            <div
              className={styles.bossSlashTrail}
              style={{
                background: `linear-gradient(270deg, transparent, ${boss.color}, ${boss.glowColor})`,
                boxShadow: `0 0 12px ${boss.glowColor}80, 0 0 24px ${boss.color}40, -8px 0 8px ${boss.color}30, -16px 0 6px ${boss.color}15`,
              }}
            >
              <span style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)', fontSize: boss.hearts >= 4 ? 20 : boss.hearts >= 3 ? 16 : 14 }}>
                {boss.attackEffect || '💥'}
              </span>
            </div>
          )}

          <div className={styles.vsDivider}>VS</div>

          {/* Boss出场蓄力特效 */}
          {animPhase === 'bossEntrance' && (
            <div className={styles.bossEntranceGather}>
              {Array.from({ length: 6 }, (_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const dist = 40;
                return (
                  <div
                    key={i}
                    className={styles.bossEntranceOrb}
                    style={{
                      background: boss.glowColor,
                      boxShadow: `0 0 8px ${boss.glowColor}`,
                      top: '50%',
                      left: '50%',
                      '--orb-start-x': `${Math.cos(angle) * dist}px`,
                      '--orb-start-y': `${Math.sin(angle) * dist}px`,
                      animationDelay: `${i * 0.05}s`,
                    } as React.CSSProperties}
                  />
                );
              })}
            </div>
          )}

          {/* Boss出场标题卡 */}
          {showBossTitleCard && (
            <div className={styles.bossTitleCard}>
              <div className={styles.bossTitleName}>{boss.name}</div>
              <div className={`${styles.bossTitleDiff} ${styles[boss.difficulty]}`}>
                {boss.difficulty === 'easy' ? '★ 简单' : boss.difficulty === 'medium' ? '★★ 中等' : '★★★ 困难'}
              </div>
            </div>
          )}

          {/* Boss出场VS闪光 */}
          {animPhase === 'bossEntrance' && (
            <div className={styles.vsFlashEffect}>VS</div>
          )}

          {/* 击杀爆炸特效 — 史诗级 */}
          {showDefeatBurst && (
            <div className={styles.defeatBurst}>
              <div className={styles.defeatBurstFlash} style={{ background: `radial-gradient(circle, ${boss.glowColor}88, transparent 60%)` }} />
              <div className={styles.defeatBurstRing} style={{ borderColor: boss.glowColor }} />
              {/* 第一波粒子 — Boss主题色 */}
              {[boss.color, boss.glowColor, '#FFD700', '#FF8C42', '#FB7185', '#4ADE80', '#60A5FA', '#A78BFA', '#22D3EE', '#F97316', '#FBBF24', '#EF4444'].map((color, i) => (
                <div
                  key={`p1-${i}`}
                  className={styles.defeatParticle}
                  style={{
                    background: color,
                    left: '50%',
                    top: '50%',
                    '--px': `${(Math.cos(i * 0.52) * 60 + (i % 2 ? 25 : -25)).toFixed(0)}px`,
                    '--py': `${(Math.sin(i * 0.52) * 60 + (i % 3 ? 20 : -30)).toFixed(0)}px`,
                    animationDelay: `${(i * 0.025).toFixed(3)}s`,
                  } as React.CSSProperties}
                />
              ))}
              {/* 第二波粒子 — 更远 */}
              {['#FFD700', '#FF8C42', '#FB7185', '#4ADE80', '#60A5FA', '#A78BFA', '#FBBF24', '#F97316'].map((color, i) => (
                <div
                  key={`p2-${i}`}
                  className={styles.defeatParticle}
                  style={{
                    background: color,
                    left: '50%',
                    top: '50%',
                    '--px': `${(Math.cos(i * 0.8 + 1) * 80 + (i % 2 ? 30 : -30)).toFixed(0)}px`,
                    '--py': `${(Math.sin(i * 0.8 + 1) * 80 + (i % 3 ? 25 : -35)).toFixed(0)}px`,
                    animationDelay: `${(0.12 + i * 0.03).toFixed(3)}s`,
                  } as React.CSSProperties}
                />
              ))}
              {/* 第三波粒子 — 金色余波 */}
              {['#FFD700', '#FBBF24', '#FF8C42', '#F59E0B', '#FFD700', '#FBBF24'].map((color, i) => (
                <div
                  key={`p3-${i}`}
                  className={styles.defeatParticle}
                  style={{
                    background: color,
                    left: '50%',
                    top: '50%',
                    '--px': `${(Math.cos(i * 1.05 + 2) * 40).toFixed(0)}px`,
                    '--py': `${(Math.sin(i * 1.05 + 2) * 40 - 20).toFixed(0)}px`,
                    animationDelay: `${(0.25 + i * 0.04).toFixed(3)}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}

          {/* Boss碎片特效 */}
          {showDefeatBurst && Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 50 + (i % 3) * 20;
            return (
              <div
                key={`frag-${i}`}
                className={styles.bossFragment}
                style={{
                  background: i % 2 === 0 ? boss.color : boss.glowColor,
                  right: '18%',
                  top: '45%',
                  '--frag-x': `${Math.cos(angle) * dist}px`,
                  '--frag-y': `${Math.sin(angle) * dist}px`,
                  '--frag-rot': `${180 + i * 30}deg`,
                  animationDelay: `${(i * 0.02).toFixed(2)}s`,
                  boxShadow: `0 0 6px ${boss.glowColor}`,
                } as React.CSSProperties}
              />
            );
          })}

          {/* 能量光柱 */}
          {showDefeatBurst && (
            <div
              className={styles.energyPillar}
              style={{
                background: `linear-gradient(180deg, transparent, ${boss.glowColor}40, ${boss.color}80, ${boss.glowColor}40, transparent)`,
                boxShadow: `0 0 30px ${boss.glowColor}60`,
              }}
            />
          )}

          {/* 屏幕闪白 */}
          {showScreenFlash && <div className={styles.screenFlash} />}

          {/* 华丽击杀文字 */}
          {showDefeatBurst && (
            <div className={styles.defeatTextGrand}>
              <div className={styles.defeatGrandLabel}>💥 击败{defeatedBossName}！</div>
              <div className={styles.defeatGrandSub}>+{lastDamage} ❤️</div>
            </div>
          )}

          {/* 战斗双方 */}
          <div className={styles.battleArena}>
            <div className={styles.playerSide}>
              {equippedSkin && (() => {
                const allBosses = [...MINECRAFT_BOSSES, ...PVZ_BOSSES, ...TANK_BOSSES];
                const skinBoss = allBosses.find(b => b.icon === equippedSkin);
                if (!skinBoss) return <HeroAvatar size={52} className={styles.playerAvatar} animClass={playerAnimClass} />;
                return (
                  <div className={`${styles.playerAvatar} ${playerAnimClass}`}>
                    <BossAvatar icon={skinBoss.icon} color={skinBoss.color} glowColor={skinBoss.glowColor} size={52} />
                  </div>
                );
              })()}
              {!equippedSkin && <HeroAvatar size={52} className={styles.playerAvatar} animClass={playerAnimClass} />}
              <div className={styles.playerNameTag}>{equippedSkin ? (() => {
                const allBosses = [...MINECRAFT_BOSSES, ...PVZ_BOSSES, ...TANK_BOSSES];
                const skinBoss = allBosses.find(b => b.icon === equippedSkin);
                return skinBoss ? skinBoss.name : '小勇士';
              })() : '小勇士'}</div>
              <div className={styles.heartsBar}>
                {Array.from({ length: PLAYER_MAX_HEARTS }, (_, i) => (
                  <span
                    key={i}
                    className={`${styles.heart} ${i >= playerHearts ? styles.lost : ''} ${i === lostHeartIndex ? styles.justLost : ''}`}
                  >
                    {i < playerHearts ? '❤️' : '🖤'}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.bossSide}>
              <div className={`${styles.bossAvatar} ${bossAnimClass} ${currentBossHearts === 1 && boss.difficulty === 'hard' ? styles.enragedBoss : ''}`}>
                <BossAvatar icon={boss.icon} color={boss.color} glowColor={boss.glowColor} size={56} />
              </div>
              <div className={styles.bossNameTag}>
                {boss.name}
                <span className={`${styles.bossDiffTag} ${styles[boss.difficulty]}`} style={{ marginLeft: 4 }}>
                  {boss.difficulty === 'easy' ? '简单' : boss.difficulty === 'medium' ? '中等' : '困难'}
                </span>
              </div>
              <div className={styles.heartsBar}>
                {Array.from({ length: boss.hearts }, (_, i) => (
                  <span
                    key={i}
                    className={`${styles.heart} ${i >= currentBossHearts ? styles.lost : ''} ${i === currentBossHearts - 1 && currentBossHearts === 1 ? styles.lastHeart : ''}`}
                  >
                    {i < currentBossHearts ? '❤️' : '🖤'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 题目区域 */}
        {isHidden ? (
          <div className={styles.questionCard}>
            <div className={styles.questionExpression}>
              {question.blank === 'a' ? (
                <span className={`${styles.answerDisplay} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}>
                  {inputValue || '?'}
                </span>
              ) : (
                <span className={styles.answerGiven}>{question.a}</span>
              )}
              <span className={styles.operator}>{question.operator}</span>
              {question.blank === 'b' ? (
                <span className={`${styles.answerDisplay} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}>
                  {inputValue || '?'}
                </span>
              ) : (
                <span className={styles.answerGiven}>{question.b}</span>
              )}
              <span className={styles.equals}>=</span>
              <span className={styles.answerGiven}>
                {question.result ?? (question.answer ?? '?')}
              </span>
            </div>
            {isCorrect && !isChoosing && <div className={`${styles.feedbackText} ${styles.correct}`}>✅ 击中了！-{lastDamage}❤️</div>}
            {isWrong && (
              <>
                <div className={`${styles.feedbackText} ${styles.wrong}`}>
                  ❌ 被反击了！正确答案是 {correctAnswer}
                </div>
                {answerState === 'wrongFeedback' && (
                  <button className={styles.wrongConfirmBtn} onClick={handleWrongConfirm}>
                    知道了 👍
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className={styles.questionCard}>
            <div className={styles.questionExpression}>
              {question.a}
              <span className={styles.operator}>{question.operator}</span>
              {question.b}
              <span className={styles.equals}>=</span>
              <span className={`${styles.answerDisplay} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}>
                {inputValue || '?'}
              </span>
            </div>
            {isCorrect && !isChoosing && <div className={`${styles.feedbackText} ${styles.correct}`}>✅ 击中了！-{lastDamage}❤️</div>}
            {isWrong && (
              <>
                <div className={`${styles.feedbackText} ${styles.wrong}`}>
                  ❌ 被反击了！正确答案是 {correctAnswer}
                </div>
                {answerState === 'wrongFeedback' && (
                  <button className={styles.wrongConfirmBtn} onClick={handleWrongConfirm}>
                    知道了 👍
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* 技能选择面板 */}
        {isChoosing && availableSkills.length > 1 && (
          <div className={styles.skillPanel}>
            <div className={styles.skillPanelTitle}>选择攻击方式</div>
            <div className={styles.skillButtons}>
              {availableSkills.map(skillType => {
                const info = SKILL_INFO[skillType];
                return (
                  <button
                    key={skillType}
                    className={`${styles.skillBtn} ${styles[skillType]}`}
                    onClick={() => handleSkillChoice(skillType)}
                  >
                    <span className={styles.skillBtnIcon}>{info.icon}</span>
                    <span className={styles.skillBtnName}>{info.name}</span>
                    <span className={styles.skillBtnDesc}>{info.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 输入区域 */}
        {(answerState === 'input' || isChoosing) && (
          <div className={styles.numpad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button key={n} className={styles.numpadBtn} onClick={() => handleNumClick(n)}>
                {n}
              </button>
            ))}
            <button className={`${styles.numpadBtn} ${styles.delete}`} onClick={handleDelete}>
              ⌫
            </button>
            <button className={styles.numpadBtn} onClick={() => handleNumClick(0)}>0</button>
            <button
              className={`${styles.numpadBtn} ${styles.confirm}`}
              onClick={handleConfirm}
              disabled={!inputValue}
            >
              ✓
            </button>
          </div>
        )}
      </div>
    );
  };

  // ===== 渲染：结算 =====
  const renderResult = () => {
    const allDefeated = bossesDefeated === bossArray.length;
    const isHidden = gameMode === 'hidden';
    const emoji = allDefeated ? '🏆' : bossesDefeated >= 7 ? '🎉' : bossesDefeated >= 5 ? '💪' : bossesDefeated >= 3 ? '🌟' : '📚';
    const title = allDefeated ? '完美通关！' : bossesDefeated >= 7 ? '非常厉害！' : bossesDefeated >= 5 ? '还不错！' : bossesDefeated >= 3 ? '初露锋芒！' : '继续加油！';

    return (
      <div className={styles.resultOverlay}>
        <div className={`${styles.resultCard} ${isHidden ? styles.hiddenResultCard : ''} ${showUnlockCelebration ? styles.unlockResultCard : ''}`}>
          {showUnlockCelebration && (
            <div className={styles.unlockCelebration}>
              <div className={styles.unlockGlow} />
              <div className={styles.unlockTitle}>🌀 传送门已开启！</div>
              <div className={styles.unlockSubtitle}>我的世界隐藏关卡已解锁</div>
              <div className={styles.unlockBossIcons}>
                {MINECRAFT_BOSSES.map((boss, i) => (
                  <div key={i} className={styles.unlockBossIcon}>
                    <BossAvatar icon={boss.icon} color={boss.color} glowColor={boss.glowColor} size={32} />
                  </div>
                ))}
              </div>
              <button className={styles.unlockEnterBtn} onClick={() => { setShowUnlockCelebration(false); resetGame(); setTimeout(() => handleStartHiddenGame('minecraft'), 100); }}>
                🌌 立即进入传送门
              </button>
            </div>
          )}

          <span className={styles.resultEmoji}>{emoji}</span>
          <div className={styles.resultTitle}>{title}</div>
          {isHidden && <div className={styles.hiddenResultTag}>{hiddenTheme === 'pvz' ? '🌻 植物大战僵尸' : hiddenTheme === 'tank' ? '🔫 超能装甲兵团' : '🌀 我的世界'}</div>}

          <div className={styles.resultStats}>
            <div className={styles.resultStat}>
              <div className={`${styles.resultStatValue} ${styles.green}`}>{bossesDefeated}/{bossArray.length}</div>
              <div className={styles.resultStatLabel}>击败Boss</div>
            </div>
            <div className={styles.resultStat}>
              <div className={styles.resultStatValue}>⭐{reward}</div>
              <div className={styles.resultStatLabel}>获得积分</div>
            </div>
            <div className={styles.resultStat}>
              <div className={`${styles.resultStatValue} ${styles.red}`}>🔥{maxCombo}</div>
              <div className={styles.resultStatLabel}>最大连击</div>
            </div>
          </div>

          <div className={styles.resultBossList}>
            {bossArray.map((boss, i) => (
              <div
                key={i}
                className={`${styles.resultBossItem} ${bossHearts[i] <= 0 ? styles.win : ''}`}
              >
                {bossHearts[i] <= 0 ? '✅' : '❌'}
                <span className={styles.resultBossMini}>{boss.name}</span>
              </div>
            ))}
          </div>

          {!showUnlockCelebration && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className={styles.resultBtn} onClick={handlePlayAgain} style={{ flex: 1 }}>
                🔄 再来一次
              </button>
              <button className={styles.resultBtnHome} onClick={handleGoHome} style={{ flex: 1 }}>
                🏠 退出
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.bossPage}>
      <header className={styles.bossHeader}>
        <h1 className={styles.bossTitle}>
          <span className={styles.bossTitleIcon}>⚔️</span>
          {gameMode === 'hidden' ? '隐藏关卡' : '数学打怪'}
        </h1>
        {gameMode === 'hidden' && (
          <div className={styles.hiddenModeTag}>
            {hiddenTheme === 'pvz' ? '🌻 植物大战僵尸' : hiddenTheme === 'tank' ? '🔫 超能装甲兵团' : '🌀 我的世界'}
          </div>
        )}
      </header>

      {phase === 'idle' && renderIdle()}
      {phase === 'playing' && renderPlaying()}
      {phase === 'result' && renderResult()}
    </div>
  );
}