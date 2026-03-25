import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createConvertToContextFrame } from '../../../src/factories/convert-to-context-frame';

describe('convertToContextFrame', () => {
    describe('without an available performance object', () => {
        let convertToContextFrame;

        beforeEach(() => {
            convertToContextFrame = createConvertToContextFrame(null);
        });

        it('should throw an error', () => {
            expect(() => convertToContextFrame({ currentTime: 20, sampleRate: 48000 }, 30)).to.throw(
                Error,
                'Performance is not available.'
            );
        });
    });

    describe('with an available performance object', () => {
        let context;
        let convertToContextFrame;
        let performance;

        beforeEach(() => {
            context = { currentTime: 20, sampleRate: 48000 };
            performance = { now: vi.fn() };

            convertToContextFrame = createConvertToContextFrame(performance);

            performance.now.mockReturnValue(40000);
        });

        it('should call performance.now()', () => {
            convertToContextFrame(context, 30);

            expect(performance.now).to.have.been.calledOnceWith();
        });

        it('should convert the timestamp to a frame on the timeline of the given context', () => {
            expect(convertToContextFrame(context, 30)).to.equal(480000);
        });
    });
});
