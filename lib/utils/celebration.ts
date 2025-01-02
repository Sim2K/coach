import confetti from 'canvas-confetti';

export const triggerCelebration = async (times: number = 3) => {
  const count = Math.min(Math.max(times, 2), 5); // Ensure between 2 and 5
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.5,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['star'],
    colors: ['#FFD700', '#FFA500', '#FF4500', '#9370DB', '#4169E1']
  };

  for (let i = 0; i < count; i++) {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      origin: { x: Math.random(), y: Math.random() * 0.5 }
    });
    await new Promise(resolve => setTimeout(resolve, 750)); // Wait between bursts
  }
};
