import { beforeEach, describe, expect, it } from 'vitest';
import { spy, stub } from 'sinon';
import { createSubscribeToTimingObject } from '../../../src/factories/subscribe-to-timing-object';

describe('subscribeToTimingObject', () => {
    let audioWorkletNode;
    let context;
    let createAudioBufferSourceNode;
    let scheduleAudioBufferSourceNode;
    let subscribeToTimingObject;
    let timingObject;

    beforeEach(() => {
        audioWorkletNode = Symbol('audioWorkletNode');
        context = Symbol('context');
        createAudioBufferSourceNode = Symbol('createAudioBufferSourceNode');
        scheduleAudioBufferSourceNode = stub();
        timingObject = { addEventListener: spy(), removeEventListener: spy() };

        subscribeToTimingObject = createSubscribeToTimingObject(scheduleAudioBufferSourceNode);

        scheduleAudioBufferSourceNode.returns(Promise.resolve());
    });

    it('should call addEventListener() on the given timingObject', () => {
        subscribeToTimingObject(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        const listener = timingObject.addEventListener.getCall(0).args[1];

        expect(timingObject.addEventListener).to.have.been.calledOnceWithExactly('change', listener);
    });

    it('should return a function which calls removeEventListener() on the given timingObject', () => {
        const unsubscribe = subscribeToTimingObject(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);
        const listener = timingObject.addEventListener.getCall(0).args[1];

        unsubscribe();

        expect(timingObject.removeEventListener).to.have.been.calledOnceWithExactly('change', listener);
    });

    describe('with a single event', () => {
        let listener;

        beforeEach(() => {
            subscribeToTimingObject(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

            listener = timingObject.addEventListener.getCall(0).args[1];
        });

        it('should call scheduleAudioBufferSourceNode() with the given arguments', () => {
            listener();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledOnceWithExactly(
                audioWorkletNode,
                context,
                createAudioBufferSourceNode,
                timingObject
            );
        });
    });

    describe('with two consecutive events', () => {
        let listener;

        beforeEach(() => {
            subscribeToTimingObject(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

            listener = timingObject.addEventListener.getCall(0).args[1];
        });

        it('should call scheduleAudioBufferSourceNode() with the given arguments in sequence', async () => {
            let resolvePromise;

            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            scheduleAudioBufferSourceNode.onFirstCall().returns(promise);

            listener();
            listener();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledOnceWithExactly(
                audioWorkletNode,
                context,
                createAudioBufferSourceNode,
                timingObject
            );

            await new Promise((resolve) => {
                setTimeout(() => resolve(), 100);
            });

            resolvePromise();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledOnce;

            await Promise.resolve();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledTwice.and.calledWithExactly(
                audioWorkletNode,
                context,
                createAudioBufferSourceNode,
                timingObject
            );
        });
    });

    describe('with two sequential events', () => {
        let listener;

        beforeEach(() => {
            subscribeToTimingObject(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

            listener = timingObject.addEventListener.getCall(0).args[1];
        });

        it('should call scheduleAudioBufferSourceNode() with the given arguments in sequence', async () => {
            listener();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledOnceWithExactly(
                audioWorkletNode,
                context,
                createAudioBufferSourceNode,
                timingObject
            );

            await Promise.resolve();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledOnce;

            listener();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledTwice.and.calledWithExactly(
                audioWorkletNode,
                context,
                createAudioBufferSourceNode,
                timingObject
            );
        });
    });

    describe('with three consecutive events', () => {
        let listener;

        beforeEach(() => {
            subscribeToTimingObject(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

            listener = timingObject.addEventListener.getCall(0).args[1];
        });

        it('should call scheduleAudioBufferSourceNode() with the given arguments only twice', async () => {
            let resolveFirstPromise;
            let resolveSecondPromise;

            const firstPromise = new Promise((resolve) => {
                resolveFirstPromise = resolve;
            });
            const secondPromise = new Promise((resolve) => {
                resolveSecondPromise = resolve;
            });

            scheduleAudioBufferSourceNode.onFirstCall().returns(firstPromise);
            scheduleAudioBufferSourceNode.onSecondCall().returns(secondPromise);

            listener();
            listener();
            listener();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledOnceWithExactly(
                audioWorkletNode,
                context,
                createAudioBufferSourceNode,
                timingObject
            );

            await new Promise((resolve) => {
                setTimeout(() => resolve(), 100);
            });

            resolveFirstPromise();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledOnce;

            await Promise.resolve();

            expect(scheduleAudioBufferSourceNode).to.have.been.calledTwice.and.calledWithExactly(
                audioWorkletNode,
                context,
                createAudioBufferSourceNode,
                timingObject
            );

            resolveSecondPromise();

            await new Promise((resolve) => {
                setTimeout(() => resolve(), 100);
            });

            expect(scheduleAudioBufferSourceNode).to.have.been.calledTwice;
        });
    });
});
