import { LayoutGroup, motion } from 'framer-motion';
import { useState } from 'react';
import { useCake } from '../../lib/cake';
import { CakeDecorator } from './CakeDecorator';
import { CandleWishScene } from './CandleWishScene';

/** Scene 2: decorate the cake, then make a wish. */
export function CakeScene({ onWishMade, onDecorated }: { onWishMade: () => void; onDecorated: () => void }) {
  const cake = useCake();
  const [phase, setPhase] = useState<'decorate' | 'wish'>('decorate');

  const finish = () => {
    cake.ensureCandles();
    onDecorated();
    setPhase('wish');
  };

  return (
    <motion.div
      className="ivory-paper fixed inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2 } }}
      transition={{ duration: 1 }}
    >
      <LayoutGroup>
        {phase === 'decorate' ? (
          <motion.div key="decorate" layoutScroll className="h-full overflow-y-auto overflow-x-hidden overscroll-contain" exit={{ opacity: 0 }}>
            <CakeDecorator cake={cake} onFinish={finish} />
          </motion.div>
        ) : (
          <CandleWishScene key="wish" items={cake.items} onDone={onWishMade} />
        )}
      </LayoutGroup>
    </motion.div>
  );
}
