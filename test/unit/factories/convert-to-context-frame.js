import { createConvertToContextFrame } from '../../../src/factories/convert-to-context-frame';
import { stub } from 'sinon';

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
            performance = { now: stub() };

            convertToContextFrame = createConvertToContextFrame(performance);

            performance.now.returns(40000);
        });

        it('should call performance.now()', () => {
            convertToContextFrame(context, 30);

            expect(performance.now).to.have.been.calledOnceWithExactly();
        });

        it('should convert the timestamp to a frame on the timeline of the given context', () => {
            expect(convertToContextFrame(context, 30)).to.equal(480000);
        });
    });
});
