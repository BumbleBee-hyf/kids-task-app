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

const PARTICLE_COLORS = ['#FFD700', '#FF8C42', '#FB7185', '#4ADE80', '#60A5FA', '#A78BFA', '#FBBF24'];

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
    hiddenUnlocked, hiddenTheme, unlockedSkins, equippedSkin, equipSkin, hiddenTodayPlayCount, hiddenTodayBestScore,
    startGame, checkAnswer, applyAttack, advanceToNextBoss, fetchNextQuestion, finishGame, resetGame,
    refreshStatus, refreshHiddenStatus, refreshSkins,
  } = useMathBoss();

  const [inputValue, setInputValue] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('input');
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle');
  const [showCombo, setShowCombo] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [lostHeartIndex, setLostHeartIndex] = useState(-1);
  const [prevPlayerHearts, setPrevPlayerHearts] = useState(PLAYER_MAX_HEARTS);
  const [correctAnswer, setCorrectAnswer] = useState<number | string | null>(null);
  const [showDefeatBurst, setShowDefeatBurst] = useState(false);
  const [defeatedBossName, setDefeatedBossName] = useState('');
  const [showUnlockCelebration, setShowUnlockCelebration] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  // 技能选择
  const [availableSkills, setAvailableSkills] = useState<AttackType[]>([]);
  const [lastDamage, setLastDamage] = useState(1);
  // 浮动伤害数字
  const [floatingDmg, setFloatingDmg] = useState<{value: number; color: string; x: number; y: number} | null>(null);
  // Boss专属受击颜色
  const [bossHitColor, setBossHitColor] = useState('#EF4444');

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
      setTimeout(() => setAnimPhase('idle'), 800);
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
      setShakeScreen(true);

      // Boss攻击浮动伤害
      const isHardBoss = !isHidden && currentBossIndex >= 7;
      const heartLoss = isHardBoss ? 2 : 1;
      const projColor = BOSS_PROJ_COLORS[currentQuestion?.icon ?? ''] || '#EF4444';
      setBossHitColor(projColor);
      setFloatingDmg({ value: heartLoss, color: projColor, x: 30, y: 40 });
      setTimeout(() => setFloatingDmg(null), 1000);
      setTimeout(() => {
        setAnimPhase('playerHurt');
        setTimeout(() => setShakeScreen(false), 300);
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
    setFloatingDmg({ value: atkResult.damage, color: type === 'normal' ? '#FFD700' : type === 'shadowStrike' ? '#A855F7' : '#EF4444', x: 65, y: 30 });
    setTimeout(() => setFloatingDmg(null), 800);

    // 动画阶段
    if (type === 'shadowStrike') {
      setAnimPhase('shadowStrike');
    } else if (type === 'risingDragon') {
      setAnimPhase('risingDragon');
    } else {
      setAnimPhase('playerAttack');
    }

    setTimeout(() => setAnimPhase('bossHurt'), 500);

    // 连击/技能特效
    setTimeout(() => {
      if (type === 'normal' && comboCount + 1 >= 2) setShowCombo(true);
      if (type === 'shadowStrike' || type === 'risingDragon') {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 800);
      }
    }, 600);

    if (atkResult.bossDefeated) {
      setTimeout(() => setAnimPhase('bossDefeat'), 1000);
      setTimeout(() => {
        setShowDefeatBurst(true);
        setDefeatedBossName(boss.name);
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 400);
      }, 1300);
      setTimeout(() => {
        setShowDefeatBurst(false);
        setAnimPhase('idle');
        setAnswerState('input');
        setInputValue('');
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

        {/* 隐藏关卡传送门 — 三个主题 */}
        {hiddenUnlocked && (
          <div className={styles.hiddenPortalSection}>
            <div className={styles.hiddenPortalDivider}>
              <span className={styles.hiddenPortalDividerLine} />
              <span className={styles.hiddenPortalDividerText}>??? 隐藏区域 ???</span>
              <span className={styles.hiddenPortalDividerLine} />
            </div>
            <div className={styles.themeCards}>
              {/* 我的世界 */}
              <div className={styles.themeCard}>
                <div className={styles.themeGlow} />
                <div className={styles.themeTitle}>🌀 我的世界</div>
                <div className={styles.themeBossPreview}>
                  {MINECRAFT_BOSSES.map((b, i) => (
                    <div key={i} className={styles.themeBossIcon}>
                      <BossAvatar icon={b.icon} color={b.color} glowColor={b.glowColor} size={24} />
                    </div>
                  ))}
                </div>
                <button className={styles.themeBtn} onClick={() => handleStartHiddenGame('minecraft')} disabled={!canAfford || hiddenRemaining <= 0}>
                  🌌 进入
                </button>
              </div>
              {/* 植物大战僵尸 */}
              <div className={styles.themeCard}>
                <div className={styles.themeGlow} />
                <div className={styles.themeTitle}>🌻 植物大战僵尸</div>
                <div className={styles.themeBossPreview}>
                  {PVZ_BOSSES.map((b, i) => (
                    <div key={i} className={styles.themeBossIcon}>
                      <BossAvatar icon={b.icon} color={b.color} glowColor={b.glowColor} size={24} />
                    </div>
                  ))}
                </div>
                <button className={styles.themeBtnPvz} onClick={() => handleStartHiddenGame('pvz')} disabled={!canAfford || hiddenRemaining <= 0}>
                  🧟 进入
                </button>
              </div>
              {/* 超级坦克 */}
              <div className={styles.themeCard}>
                <div className={styles.themeGlow} />
                <div className={styles.themeTitle}>🔫 超能装甲兵团</div>
                <div className={styles.themeBossPreview}>
                  {TANK_BOSSES.map((b, i) => (
                    <div key={i} className={styles.themeBossIcon}>
                      <BossAvatar icon={b.icon} color={b.color} glowColor={b.glowColor} size={24} />
                    </div>
                  ))}
                </div>
                <button className={styles.themeBtnTank} onClick={() => handleStartHiddenGame('tank')} disabled={!canAfford || hiddenRemaining <= 0}>
                  💥 进入
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
        )}
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

        {/* 连击显示 */}
        <div className={styles.comboBar}>
          <span className={`${styles.comboIndicator} ${comboCount >= 5 ? styles.combo5 : comboCount >= 3 ? styles.combo3 : ''}`}>
            🔥 {comboCount} 连击
          </span>
        </div>

        {/* 战斗舞台 */}
        <div className={`${styles.battleStage} ${shakeScreen ? styles.shake : ''}`}>
          {/* 技能闪光 */}
          {isSkillAnim && <div className={`${styles.comboFlash} ${styles.skillFlash}`} />}
          {showFlash && <div className={styles.comboFlash} />}

          {/* 浮动伤害数字 */}
          {floatingDmg && (
            <div className={styles.floatingDmg} style={{ left: `${floatingDmg.x}%`, top: `${floatingDmg.y}%`, color: floatingDmg.color }}>
              -{floatingDmg.value}
            </div>
          )}

          {/* Boss受击闪光 — 颜色匹配Boss */}
          {animPhase === 'bossHurt' && (
            <div className={styles.bossHitFlash} style={{ background: `radial-gradient(circle, ${bossHitColor}44, transparent 70%)` }} />
          )}

          {/* 连击特效 */}
          {showCombo && comboCount >= 2 && !isChoosing && (
            <div className={styles.comboDisplay}>
              <div className={`${styles.comboText} ${comboCount >= 5 ? styles.superCombo : comboCount >= 3 ? styles.greatCombo : ''}`}>
                {comboCount >= 5 ? '🔥 超连击！' : comboCount >= 3 ? '⚡ 大连击！' : `🔥 ${comboCount}连击！`}
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

          {showPlayerProjectile && !isSkillAnim && (
            <div className={`${styles.projectile} ${styles.playerAttack}`}>⚔️</div>
          )}

          {showBossProjectile && (
            <div className={`${styles.projectile} ${styles.bossAttack}`} style={{ fontSize: boss.hearts >= 4 ? 28 : boss.hearts >= 3 ? 22 : 18 }}>
              {boss.attackEffect || '💥'}
            </div>
          )}

          <div className={styles.vsDivider}>VS</div>

          {/* 击杀爆炸特效 — Boss主题色 */}
          {showDefeatBurst && (
            <div className={styles.defeatBurst}>
              <div className={styles.defeatBurstFlash} style={{ background: `radial-gradient(circle, ${boss.glowColor}88, transparent 60%)` }} />
              <div className={styles.defeatBurstRing} style={{ borderColor: boss.glowColor }} />
              {[boss.color, boss.glowColor, '#FFD700', '#FF8C42', '#FB7185', '#4ADE80', '#60A5FA'].map((color, i) => (
                <div
                  key={i}
                  className={styles.defeatParticle}
                  style={{
                    background: color,
                    left: '50%',
                    top: '50%',
                    '--px': `${(Math.cos(i * 0.9) * 50 + (i % 2 ? 20 : -20)).toFixed(0)}px`,
                    '--py': `${(Math.sin(i * 0.9) * 50 + (i % 3 ? 15 : -25)).toFixed(0)}px`,
                    animationDelay: `${(i * 0.03).toFixed(2)}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}

          {showDefeatBurst && (
            <div className={styles.defeatText}>
              <div className={styles.defeatKOLabel}>💥 击败{defeatedBossName}！</div>
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
              <div className={`${styles.bossAvatar} ${bossAnimClass}`}>
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
                    className={`${styles.heart} ${i >= currentBossHearts ? styles.lost : ''}`}
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
              <button className={styles.resultBtnHome} onClick={handleGoHome}>
                🏠 返回首页
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