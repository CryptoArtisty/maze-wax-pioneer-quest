
export class GlobalTimerService {
  private static instance: GlobalTimerService;
  
  // Game starts at app launch time for simplicity in demo
  // In production, this would be synchronized with server time
  private gameStartTime: number;
  private readonly CLAIM_PHASE_DURATION = 10; // 10 seconds
  private readonly PLAY_PHASE_DURATION = 120; // 120 seconds (2 minutes)
  private readonly TOTAL_ROUND_DURATION = this.CLAIM_PHASE_DURATION + this.PLAY_PHASE_DURATION;
  private readonly DAILY_RESET_DURATION = 24 * 60 * 60; // 24 hours in seconds

  private constructor() {
    // Initialize game start time from localStorage or current time
    const savedStartTime = localStorage.getItem('pyrameme-global-start-time');
    if (savedStartTime) {
      this.gameStartTime = parseInt(savedStartTime);
    } else {
      this.gameStartTime = Date.now();
      localStorage.setItem('pyrameme-global-start-time', this.gameStartTime.toString());
    }
    
    console.log('Global timer initialized. Game started at:', new Date(this.gameStartTime));
  }

  static getInstance(): GlobalTimerService {
    if (!GlobalTimerService.instance) {
      GlobalTimerService.instance = new GlobalTimerService();
    }
    return GlobalTimerService.instance;
  }

  getCurrentGameState() {
    const now = Date.now();
    const elapsedTime = Math.floor((now - this.gameStartTime) / 1000); // seconds since game start
    
    // Calculate daily cycles
    const timeInCurrentDay = elapsedTime % this.DAILY_RESET_DURATION;
    const currentRound = Math.floor(timeInCurrentDay / this.TOTAL_ROUND_DURATION) + 1;
    const timeInCurrentRound = timeInCurrentDay % this.TOTAL_ROUND_DURATION;
    
    if (timeInCurrentRound < this.CLAIM_PHASE_DURATION) {
      // Claim phase
      const remainingTime = this.CLAIM_PHASE_DURATION - timeInCurrentRound;
      return {
        phase: 'claim' as const,
        timeRemaining: remainingTime,
        roundNumber: currentRound,
        canJoinNow: true
      };
    } else {
      // Play phase
      const playElapsed = timeInCurrentRound - this.CLAIM_PHASE_DURATION;
      const remainingTime = this.PLAY_PHASE_DURATION - playElapsed;
      return {
        phase: 'play' as const,
        timeRemaining: remainingTime,
        roundNumber: currentRound,
        canJoinNow: false
      };
    }
  }

  getTimeUntilNextClaimPhase(): number {
    const currentState = this.getCurrentGameState();
    if (currentState.phase === 'claim') {
      return 0; // Already in claim phase
    }
    return currentState.timeRemaining; // Time until next claim phase
  }

  // Reset the global timer (for testing purposes)
  resetGlobalTimer() {
    this.gameStartTime = Date.now();
    localStorage.setItem('pyrameme-global-start-time', this.gameStartTime.toString());
  }
}

export const globalTimer = GlobalTimerService.getInstance();
