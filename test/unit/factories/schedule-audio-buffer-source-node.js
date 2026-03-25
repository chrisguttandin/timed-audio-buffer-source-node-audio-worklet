import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createScheduleAudioBufferSourceNode } from '../../../src/factories/schedule-audio-buffer-source-node';

describe('scheduleAudioBufferSourceNode', () => {
    let audioBufferSourceNode;
    let audioWorkletNode;
    let context;
    let convertToContextFrame;
    let createAudioBufferSourceNode;
    let scheduleAudioBufferSourceNode;
    let timestamp;
    let timingObject;
    let velocity;

    beforeEach(() => {
        audioBufferSourceNode = { addEventListener: vi.fn(), buffer: null, connect: vi.fn(), start: vi.fn() };
        audioWorkletNode = Symbol('audioWorkletNode');
        context = { sampleRate: 48000 };
        convertToContextFrame = vi.fn();
        createAudioBufferSourceNode = vi.fn();
        timestamp = Symbol('timestamp');
        timingObject = { query: vi.fn() };
        velocity = 3;

        scheduleAudioBufferSourceNode = createScheduleAudioBufferSourceNode(convertToContextFrame);

        convertToContextFrame.mockReturnValue(2);
        createAudioBufferSourceNode.mockReturnValue(audioBufferSourceNode);
        timingObject.query.mockReturnValue({ position: 1, timestamp, velocity });
    });

    it('should call createAudioBufferSourceNode() with the given context', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(createAudioBufferSourceNode).to.have.been.calledOnceWith(context);
    });

    it('should call query() on the given timingObject', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(timingObject.query).to.have.been.calledOnceWith();
    });

    it('should call convertToContextFrame() with the given context and the timestamp returned by timingObject.query()', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(convertToContextFrame).to.have.been.calledOnceWith(context, timestamp);
    });

    it('should set the buffer property of the AudioBufferSourceNode', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(audioBufferSourceNode.buffer).to.be.an.instanceOf(AudioBuffer);

        expect(audioBufferSourceNode.buffer.length).to.equal(3);
        expect(audioBufferSourceNode.buffer.numberOfChannels).to.equal(1);
        expect(audioBufferSourceNode.buffer.sampleRate).to.equal(context.sampleRate);

        expect(audioBufferSourceNode.buffer.getChannelData(0)).to.deep.equal(new Float32Array([1, 2, 3]));
    });

    it('should call addEventListener() on the AudioBufferSourceNode', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        const listener = audioBufferSourceNode.addEventListener.mock.calls[0][1];

        expect(listener).to.be.a('function');

        expect(audioBufferSourceNode.addEventListener).to.have.been.calledOnceWith('ended', listener, { once: true });
    });

    it('should call connect() on the AudioBufferSourceNode with the given AudioWorkletNode', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(audioBufferSourceNode.connect).to.have.been.calledOnceWith(audioWorkletNode);
    });

    it('should call start() on the AudioBufferSourceNode', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(audioBufferSourceNode.start).to.have.been.calledOnceWith();
    });

    it('should return a promise', () => {
        expect(scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject)).to.be.an.instanceOf(
            Promise
        );
    });

    it('should resolve the promise when the listener gets called', async () => {
        const onResolved = vi.fn();

        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject).then(onResolved);

        const listener = audioBufferSourceNode.addEventListener.mock.calls[0][1];

        expect(onResolved).to.have.not.been.called;

        listener();

        expect(onResolved).to.have.not.been.called;

        await Promise.resolve();

        expect(onResolved).to.have.been.calledOnceWith(undefined);
    });
});
