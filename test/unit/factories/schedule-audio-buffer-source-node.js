import { createScheduleAudioBufferSourceNode } from '../../../src/factories/schedule-audio-buffer-source-node';
import { stub } from 'sinon';

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
        audioBufferSourceNode = { addEventListener: stub(), buffer: null, connect: stub(), start: stub() };
        audioWorkletNode = Symbol('audioWorkletNode');
        context = { sampleRate: 48000 };
        convertToContextFrame = stub();
        createAudioBufferSourceNode = stub();
        timestamp = Symbol('timestamp');
        timingObject = { query: stub() };
        velocity = 3;

        scheduleAudioBufferSourceNode = createScheduleAudioBufferSourceNode(convertToContextFrame);

        convertToContextFrame.returns(2);
        createAudioBufferSourceNode.returns(audioBufferSourceNode);
        timingObject.query.returns({ position: 1, timestamp, velocity });
    });

    it('should call createAudioBufferSourceNode() with the given context', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(createAudioBufferSourceNode).to.have.been.calledOnceWithExactly(context);
    });

    it('should call query() on the given timingObject', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(timingObject.query).to.have.been.calledOnceWithExactly();
    });

    it('should call convertToContextFrame() with the given context and the timestamp returned by timingObject.query()', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(convertToContextFrame).to.have.been.calledOnceWithExactly(context, timestamp);
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

        const listener = audioBufferSourceNode.addEventListener.getCall(0).args[1];

        expect(listener).to.be.a('function');

        expect(audioBufferSourceNode.addEventListener).to.have.been.calledOnceWithExactly('ended', listener, { once: true });
    });

    it('should call connect() on the AudioBufferSourceNode with the given AudioWorkletNode', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(audioBufferSourceNode.connect).to.have.been.calledOnceWithExactly(audioWorkletNode);
    });

    it('should call start() on the AudioBufferSourceNode', () => {
        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);

        expect(audioBufferSourceNode.start).to.have.been.calledOnceWithExactly();
    });

    it('should return a promise', () => {
        expect(scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject)).to.be.an.instanceOf(
            Promise
        );
    });

    it('should resolve the promise when the listener gets called', async () => {
        const onResolved = stub();

        scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject).then(onResolved);

        const listener = audioBufferSourceNode.addEventListener.getCall(0).args[1];

        expect(onResolved).to.have.not.been.called;

        listener();

        expect(onResolved).to.have.not.been.called;

        await Promise.resolve();

        expect(onResolved).to.have.been.calledOnceWithExactly(undefined);
    });
});
