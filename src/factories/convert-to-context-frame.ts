import { TContext, TNativeContext } from 'standardized-audio-context';
import type { createPerformance } from './performance';

export const createConvertToContextFrame =
    (performance: ReturnType<typeof createPerformance>) => (context: TContext | TNativeContext, timestamp: number) => {
        if (performance === null) {
            throw new Error('Performance is not available.');
        }

        return Math.round((context.currentTime - performance.now() / 1000 + timestamp) * context.sampleRate);
    };
